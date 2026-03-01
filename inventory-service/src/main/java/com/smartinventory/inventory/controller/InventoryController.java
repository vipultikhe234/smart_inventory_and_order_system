package com.smartinventory.inventory.controller;

import com.smartinventory.inventory.dto.request.InventoryRequest;
import com.smartinventory.inventory.dto.response.InventoryResponse;
import com.smartinventory.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartinventory.inventory.entity.InventoryStatus;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/update")
    public ResponseEntity<InventoryResponse> updateStock(
            @RequestHeader("X-Auth-Roles") String roles,
            @RequestBody InventoryRequest request) {

        if (!roles.contains("ROLE_ADMIN") && !roles.contains("ROLE_MANAGER")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(inventoryService.addOrUpdateStock(request));
    }

    @PutMapping("/{productId}/status")
    public ResponseEntity<InventoryResponse> updateStatus(
            @RequestHeader("X-Auth-Roles") String roles,
            @PathVariable("productId") Long productId,
            @RequestParam("status") InventoryStatus status) {

        if (!roles.contains("ROLE_ADMIN") && !roles.contains("ROLE_MANAGER")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(inventoryService.updateStatus(productId, status));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> checkStock(@PathVariable("productId") Long productId) {
        return ResponseEntity.ok(inventoryService.checkStock(productId));
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }
    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getInventoryStats() {
        return ResponseEntity.ok(java.util.Map.of("lowStockCount", inventoryService.getLowStockCount(10)));
    }
}
