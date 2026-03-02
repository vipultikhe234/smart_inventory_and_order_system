package com.smartinventory.order.service.impl;

import com.smartinventory.order.dto.request.OrderRequest;
import com.smartinventory.order.dto.response.OrderItemResponse;
import com.smartinventory.order.dto.response.OrderResponse;
import com.smartinventory.order.entity.OrderItem;
import com.smartinventory.order.entity.OrderStatus;
import com.smartinventory.order.event.OrderItemEvent;
import com.smartinventory.order.event.OrderPlacedEvent;
import com.smartinventory.order.mapper.OrderMapper;
import com.smartinventory.order.repository.OrderRepository;
import com.smartinventory.order.service.OrderService;
import com.smartinventory.order.constant.AppConstants;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final RestTemplate restTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Stripe configuration loaded from AppConstants for security and flexibility
    private final String stripeSecretKey = AppConstants.STRIPE_SECRET_KEY;
    private final String clientUrl = AppConstants.STRIPE_CLIENT_URL;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request, Long userId) {
        com.smartinventory.order.entity.Order order = com.smartinventory.order.entity.Order.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for (var itemReq : request.getItems()) {
            Map<String, Object> productResponse = restTemplate.getForObject(
                    "http://localhost:8082/api/v1/products/" + itemReq.getProductId(), Map.class);
            
            if (productResponse == null) {
                throw new IllegalArgumentException("Product not found");
            }

            BigDecimal price = new BigDecimal(productResponse.get("price").toString());
            String productName = productResponse.get("name").toString();

            OrderItem orderItem = OrderItem.builder()
                    .productId(itemReq.getProductId())
                    .quantity(itemReq.getQuantity())
                    .price(price)
                    .build();

            order.addItem(orderItem);
            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(itemReq.getQuantity())));

            // Stripe Line Item
            lineItems.add(SessionCreateParams.LineItem.builder()
                    .setQuantity((long) itemReq.getQuantity())
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("usd")
                            .setUnitAmount(price.multiply(new BigDecimal("100")).longValue()) // In cents
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(productName)
                                    .build())
                            .build())
                    .build());
        }

        order.setTotalAmount(totalAmount);

        // Create Stripe Checkout Session
        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(clientUrl + "/orders?status=paid&session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(clientUrl + "/cart")
                    .addAllLineItem(lineItems)
                    .build();

            Session session = Session.create(params);
            order.setStripeSessionId(session.getId());
            
            order = orderRepository.save(order);
            
            OrderResponse response = orderMapper.toResponse(order);
            response.setStripeSessionUrl(session.getUrl());
            return response;
            
        } catch (Exception e) {
            log.error("Stripe session creation failed", e);
            throw new RuntimeException("Error creating Stripe session: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public OrderResponse verifyPayment(String sessionId) {
        com.smartinventory.order.entity.Order order = orderRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Order not found with stripe session id: " + sessionId));

        try {
            Session session = Session.retrieve(sessionId);
            String paymentStatus = session.getPaymentStatus();
            
            log.info("Checking stripe session status: " + paymentStatus);

            if ("paid".equalsIgnoreCase(paymentStatus)) {
                order.setStatus(OrderStatus.PAID);
                order.setStripePaymentIntentId(session.getPaymentIntent());
                order = orderRepository.save(order);

                // Publish Event to Kafka AFTER successful payment confirm
                List<OrderItemEvent> eventItems = order.getItems().stream()
                        .map(i -> new OrderItemEvent(i.getProductId(), i.getQuantity()))
                        .collect(Collectors.toList());

                OrderPlacedEvent event = new OrderPlacedEvent(order.getId(), String.valueOf(order.getUserId()), eventItems);
                
                // Fire and forget Kafka event to avoid blocking transaction if Broker is offline
                final Long orderId = order.getId();
                new Thread(() -> {
                    try {
                        kafkaTemplate.send("order-created-events", String.valueOf(orderId), event);
                    } catch (Exception e) {
                        log.error("Failed to send Kafka order-created-event", e);
                    }
                }).start();

                return orderMapper.toResponse(order);
            } else {
                throw new RuntimeException("Payment not completed for session: " + sessionId);
            }
        } catch (Exception e) {
            log.error("Payment verification failed", e);
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    @Override
    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .filter(order -> order.getStatus() != OrderStatus.PENDING)
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .map(orderMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(OrderStatus status) {
        log.info("Fetching orders with status filter: {}", status);
        List<com.smartinventory.order.entity.Order> orders;
        
        if (status != null && !status.name().equals("ALL")) {
            orders = orderRepository.findByStatus(status);
        } else {
            orders = orderRepository.findAll();
        }
        
        return orders.stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .map(order -> {
                    OrderResponse response = orderMapper.toResponse(order);
                    // Explicitly map items if needed to avoid lazy loading issues
                    if (order.getItems() != null) {
                        response.setItems(order.getItems().stream()
                            .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .build())
                            .collect(Collectors.toList()));
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        com.smartinventory.order.entity.Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status);
        return orderMapper.toResponse(orderRepository.save(order));
    }
    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getOrderStats() {
        long totalOrders = orderRepository.countConfirmedOrders();
        java.math.BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = java.math.BigDecimal.ZERO;
        
        return java.util.Map.of(
            "totalOrders", totalOrders,
            "totalRevenue", totalRevenue
        );
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getSalesTrends() {
        return orderRepository.getSalesTrends().stream()
                .map(row -> java.util.Map.of(
                    "date", row[0].toString(),
                    "total", row[1]
                )).collect(Collectors.toList());
    }
}
