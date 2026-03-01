package com.smartinventory.inventory.repository;

import com.smartinventory.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);

    @Query(value = "SELECT COUNT(p.id) FROM products p LEFT JOIN inventory i ON p.id = i.product_id WHERE i.quantity IS NULL OR i.quantity < :threshold", nativeQuery = true)
    long countLowStockProducts(@Param("threshold") int threshold);
}
