package com.smartinventory.inventory.mapper;

import com.smartinventory.inventory.dto.request.InventoryRequest;
import com.smartinventory.inventory.dto.response.InventoryResponse;
import com.smartinventory.inventory.entity.Inventory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lastUpdated", ignore = true)
    Inventory toEntity(InventoryRequest request);

    InventoryResponse toResponse(Inventory inventory);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lastUpdated", ignore = true)
    void updateEntityFromRequest(InventoryRequest request, @MappingTarget Inventory inventory);
}
