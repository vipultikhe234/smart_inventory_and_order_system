package com.smartinventory.cart.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductStockResponse(
    UUID id,
    String name,
    BigDecimal price,
    int stock
) {}
