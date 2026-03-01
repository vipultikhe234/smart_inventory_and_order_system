package com.smartinventory.cart.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(
    UUID id,
    String userId,
    List<CartItemResponse> items,
    BigDecimal subtotal,
    BigDecimal tax,
    BigDecimal totalAmount,
    int totalItems
) {}
