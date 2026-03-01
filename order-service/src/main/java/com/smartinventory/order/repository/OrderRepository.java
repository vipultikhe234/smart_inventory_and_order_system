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

    @Query(value = "SELECT DATE(created_at) as date, SUM(total_amount) as total FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status NOT IN ('PENDING', 'CANCELLED') GROUP BY DATE(created_at) ORDER BY date ASC", nativeQuery = true)
    List<Object[]> getSalesTrends();
}
