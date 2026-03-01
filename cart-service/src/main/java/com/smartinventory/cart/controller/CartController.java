package com.smartinventory.cart.controller;

import com.smartinventory.cart.dto.request.AddToCartRequest;
import com.smartinventory.cart.dto.response.CartResponse;
import com.smartinventory.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addItem(
            @RequestHeader("X-Auth-Username") String userId, 
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    @PutMapping("/increment/{productId}")
    public ResponseEntity<CartResponse> incrementItem(
            @RequestHeader("X-Auth-Username") String userId, 
            @PathVariable("productId") Long productId) {
        return ResponseEntity.ok(cartService.incrementItem(userId, productId));
    }

    @PutMapping("/decrement/{productId}")
    public ResponseEntity<CartResponse> decrementItem(
            @RequestHeader("X-Auth-Username") String userId, 
            @PathVariable("productId") Long productId) {
        return ResponseEntity.ok(cartService.decrementItem(userId, productId));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<CartResponse> removeItem(
            @RequestHeader("X-Auth-Username") String userId, 
            @PathVariable("productId") Long productId) {
        return ResponseEntity.ok(cartService.removeItem(userId, productId));
    }

    @DeleteMapping("/empty")
    public ResponseEntity<Void> emptyCart(@RequestHeader("X-Auth-Username") String userId) {
        cartService.emptyCart(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestHeader("X-Auth-Username") String userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }
}
