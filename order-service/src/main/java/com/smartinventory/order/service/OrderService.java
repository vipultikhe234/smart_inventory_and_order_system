package com.smartinventory.order.service;

import com.smartinventory.order.dto.request.OrderRequest;
import com.smartinventory.order.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(OrderRequest request, Long userId);
    List<OrderResponse> getOrdersByUser(Long userId);
    OrderResponse getOrderById(Long orderId);
    OrderResponse verifyPayment(String sessionId);
    List<OrderResponse> getAllOrders(com.smartinventory.order.entity.OrderStatus status);
    OrderResponse updateOrderStatus(Long orderId, com.smartinventory.order.entity.OrderStatus status);
    java.util.Map<String, Object> getOrderStats();
    java.util.List<java.util.Map<String, Object>> getSalesTrends();
}
