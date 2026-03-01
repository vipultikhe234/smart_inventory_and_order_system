package com.smartinventory.inventory.service.impl;

import com.smartinventory.inventory.dto.request.InventoryRequest;
import com.smartinventory.inventory.dto.response.InventoryResponse;
import com.smartinventory.inventory.entity.Inventory;
import com.smartinventory.inventory.entity.InventoryStatus;
import com.smartinventory.inventory.event.OrderPlacedEvent;
import com.smartinventory.inventory.event.ProductCreatedEvent;
import com.smartinventory.inventory.exception.ResourceNotFoundException;
import com.smartinventory.inventory.mapper.InventoryMapper;
import com.smartinventory.inventory.repository.InventoryRepository;
import com.smartinventory.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    @Transactional
    public InventoryResponse addOrUpdateStock(InventoryRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElse(Inventory.builder()
                        .productId(request.getProductId())
                        .quantity(0)
                        .status(InventoryStatus.ACTIVE)
                        .build());

        if (request.getQuantity() != null) {
            inventory.setQuantity(request.getQuantity());
        }
        
        if (request.getStatus() != null) {
            inventory.setStatus(request.getStatus());
        }

        inventory = inventoryRepository.save(inventory);
        return inventoryMapper.toResponse(inventory);
    }

    @Override
    @Transactional
    public InventoryResponse updateStatus(Long productId, InventoryStatus status) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No inventory found for Product ID: " + productId));
        inventory.setStatus(status);
        return inventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryResponse checkStock(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .map(inventoryMapper::toResponse)
                .orElseGet(() -> InventoryResponse.builder()
                        .productId(productId)
                        .quantity(0)
                        .status(InventoryStatus.ACTIVE)
                        .build());
    }

    @Override
    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(inventoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deductStock(Long productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No inventory found for Product ID: " + productId));

        if (inventory.getQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for Product ID: " + productId);
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);
    }

    @KafkaListener(topics = "product-created-events", groupId = "inventory-group")
    @Transactional
    public void handleProductCreatedEvent(ProductCreatedEvent event) {
        log.info("Received ProductCreatedEvent for ID: {}", event.getProductId());
        if (!inventoryRepository.findByProductId(event.getProductId()).isPresent()) {
            Inventory inventory = Inventory.builder()
                    .productId(event.getProductId())
                    .quantity(0)
                    .status(InventoryStatus.ACTIVE)
                    .build();
            inventoryRepository.save(inventory);
            log.info("Initialized inventory for product: {}", event.getName());
        }
    }

    @KafkaListener(topics = "order-created-events", groupId = "inventory-group")
    @Transactional
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {
        log.info("Received OrderPlacedEvent for order ID: {}", event.getOrderId());
        try {
            for (var item : event.getItems()) {
                deductStock(item.getProductId(), item.getQuantity());
                log.info("Deducted {} items for product ID: {}", item.getQuantity(), item.getProductId());
            }
        } catch (Exception e) {
            log.error("Failed to process inventory for order ID: {}", event.getOrderId(), e);
        }
    }
    @Override
    public long getLowStockCount(int threshold) {
        return inventoryRepository.countLowStockProducts(threshold);
    }
}
