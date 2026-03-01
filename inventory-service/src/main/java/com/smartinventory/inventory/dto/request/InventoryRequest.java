package com.smartinventory.inventory.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.smartinventory.inventory.entity.InventoryStatus;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryRequest {
    private Long productId;
    private Integer quantity;
    private InventoryStatus status;
}
