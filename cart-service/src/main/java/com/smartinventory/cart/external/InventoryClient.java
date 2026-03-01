package com.smartinventory.cart.external;

import com.smartinventory.cart.dto.response.InventoryResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service", url = "http://localhost:8084", path = "/api/v1/inventory")
public interface InventoryClient {
    @GetMapping("/{productId}")
    InventoryResponse checkStock(@PathVariable("productId") Long productId);
}
