package com.smartinventory.cart.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
    Long productId,
    String productName,
    BigDecimal price,
    int quantity,
    BigDecimal itemTotal
) {}
