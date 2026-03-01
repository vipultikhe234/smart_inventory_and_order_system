package com.smartinventory.order.controller;

import com.smartinventory.order.dto.request.OrderRequest;
import com.smartinventory.order.dto.response.OrderResponse;
import com.smartinventory.order.entity.OrderStatus;
import com.smartinventory.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @RequestHeader("X-Auth-UserId") Long userId, 
            @RequestBody OrderRequest request) {
        return new ResponseEntity<>(orderService.placeOrder(request, userId), HttpStatus.CREATED);
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @RequestHeader("X-Auth-UserId") Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping("/verify")
    public ResponseEntity<OrderResponse> verifyPayment(
            @RequestParam("sessionId") String sessionId) {
        return ResponseEntity.ok(orderService.verifyPayment(sessionId));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders(
            @RequestParam(value = "status", required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.getAllOrders(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getOrderStats() {
        return ResponseEntity.ok(orderService.getOrderStats());
    }

    @GetMapping("/trends")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getSalesTrends() {
        return ResponseEntity.ok(orderService.getSalesTrends());
    }
}
