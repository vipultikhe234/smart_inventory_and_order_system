package com.smartinventory.product.service;

import com.smartinventory.product.dto.request.ProductRequest;
import com.smartinventory.product.dto.response.ProductResponse;
import org.springframework.data.domain.Page;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    ProductResponse getProductById(Long id);
    Page<ProductResponse> getAllProducts(int page, int size);
    Page<ProductResponse> getProductsByCategory(Long categoryId, int page, int size);
    void deleteProduct(Long id);
}
