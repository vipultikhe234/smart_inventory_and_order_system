package com.smartinventory.order.repository;

import com.smartinventory.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    java.util.Optional<Order> findByStripeSessionId(String stripeSessionId);
    List<Order> findByStatus(com.smartinventory.order.entity.OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status NOT IN (com.smartinventory.order.entity.OrderStatus.PENDING, com.smartinventory.order.entity.OrderStatus.CANCELLED)")
    long countConfirmedOrders();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status NOT IN (com.smartinventory.order.entity.OrderStatus.PENDING, com.smartinventory.order.entity.OrderStatus.CANCELLED)")
    BigDecimal sumTotalRevenue();
}
