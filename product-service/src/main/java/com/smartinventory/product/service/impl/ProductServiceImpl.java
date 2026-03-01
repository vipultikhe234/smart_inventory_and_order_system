package com.smartinventory.product.service.impl;

import com.smartinventory.product.dto.request.ProductRequest;
import com.smartinventory.product.dto.response.ProductResponse;
import com.smartinventory.product.entity.Category;
import com.smartinventory.product.entity.Product;
import com.smartinventory.product.exception.ResourceNotFoundException;
import com.smartinventory.product.event.ProductCreatedEvent;
import com.smartinventory.product.mapper.ProductMapper;
import com.smartinventory.product.repository.CategoryRepository;
import com.smartinventory.product.repository.ProductRepository;
import com.smartinventory.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final KafkaTemplate<String, ProductCreatedEvent> kafkaTemplate;

    @Override
    @Transactional
    @CacheEvict(value = {"products", "productsByCategory"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = productMapper.toEntity(request);
        product.setCategory(category);
        
        product = productRepository.save(product);
        
        // Publish event for inventory-service (Async to avoid blocking the main thread if Kafka is down)
        final Product savedProduct = product;
        CompletableFuture.runAsync(() -> {
            try {
                ProductCreatedEvent event = ProductCreatedEvent.builder()
                        .productId(savedProduct.getId())
                        .name(savedProduct.getName())
                        .build();
                kafkaTemplate.send("product-created-events", event);
                log.info("Successfully initiated ProductCreatedEvent for ID: {}", savedProduct.getId());
            } catch (Exception e) {
                log.error("Failed to publish ProductCreatedEvent for ID: {}", savedProduct.getId(), e);
            }
        });

        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "productsByCategory"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        productMapper.updateEntityFromRequest(request, product);
        product.setCategory(category);

        product = productRepository.save(product);
        return productMapper.toResponse(product);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toResponse(product);
    }

    @Override
    @Cacheable(value = "products", key = "#page + '-' + #size")
    public Page<ProductResponse> getAllProducts(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size))
                .map(productMapper::toResponse);
    }

    @Override
    @Cacheable(value = "productsByCategory", key = "#categoryId + '-' + #page + '-' + #size")
    public Page<ProductResponse> getProductsByCategory(Long categoryId, int page, int size) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found");
        }
        return productRepository.findByCategoryId(categoryId, PageRequest.of(page, size))
                .map(productMapper::toResponse);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"products", "productsByCategory"}, allEntries = true)
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }
}
