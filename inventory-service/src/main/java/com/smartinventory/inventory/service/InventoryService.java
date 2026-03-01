package com.smartinventory.inventory.service;

import com.smartinventory.inventory.dto.request.InventoryRequest;
import com.smartinventory.inventory.dto.response.InventoryResponse;

import com.smartinventory.inventory.entity.InventoryStatus;

import java.util.List;

public interface InventoryService {
    InventoryResponse addOrUpdateStock(InventoryRequest request);
    InventoryResponse checkStock(Long productId);
    List<InventoryResponse> getAllInventory();
    InventoryResponse updateStatus(Long productId, InventoryStatus status);
    void deductStock(Long productId, Integer quantity);
    long getLowStockCount(int threshold);
}
