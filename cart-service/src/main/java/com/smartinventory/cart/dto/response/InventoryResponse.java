package com.smartinventory.cart.dto.response;

public record InventoryResponse(
    Long id,
    Long productId,
    Integer quantity,
    String status
) {}
