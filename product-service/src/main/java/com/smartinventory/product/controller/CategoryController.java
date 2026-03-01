package com.smartinventory.product.controller;

import com.smartinventory.product.dto.request.CategoryRequest;
import com.smartinventory.product.dto.response.CategoryResponse;
import com.smartinventory.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestHeader("X-Auth-Roles") String roles,
            @RequestBody CategoryRequest request) {
        
        // Basic Role Check. Realistically this could be handled by a custom annotation or Interceptor.
        if (!roles.contains("ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        
        return new ResponseEntity<>(categoryService.createCategory(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @RequestHeader("X-Auth-Roles") String roles,
            @PathVariable("id") Long id, 
            @RequestBody CategoryRequest request) {
            
        if (!roles.contains("ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @RequestHeader("X-Auth-Roles") String roles,
            @PathVariable("id") Long id) {
            
        if (!roles.contains("ROLE_ADMIN")) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
