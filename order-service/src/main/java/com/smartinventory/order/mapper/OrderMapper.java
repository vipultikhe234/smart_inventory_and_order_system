package com.smartinventory.order.mapper;

import com.smartinventory.order.dto.response.OrderItemResponse;
import com.smartinventory.order.dto.response.OrderResponse;
import com.smartinventory.order.entity.Order;
import com.smartinventory.order.entity.OrderItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderResponse toResponse(Order order);
    OrderItemResponse toResponse(OrderItem orderItem);
}
