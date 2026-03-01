package com.smartinventory.cart.service;

import com.smartinventory.cart.dto.request.AddToCartRequest;
import com.smartinventory.cart.dto.response.CartItemResponse;
import com.smartinventory.cart.dto.response.CartResponse;
import com.smartinventory.cart.dto.response.InventoryResponse;
import com.smartinventory.cart.dto.response.ProductResponse;
import com.smartinventory.cart.entity.Cart;
import com.smartinventory.cart.entity.CartItem;
import com.smartinventory.cart.exception.OutOfStockException;
import com.smartinventory.cart.exception.ResourceNotFoundException;
import com.smartinventory.cart.external.InventoryClient;
import com.smartinventory.cart.external.ProductClient;
import com.smartinventory.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;
    private static final BigDecimal TAX_RATE = new BigDecimal("0.18");

    @Transactional
    @CachePut(value = "carts", key = "#p0")
    public CartResponse addItem(String userId, AddToCartRequest request) {
        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> createDefaultCart(userId));
        
        ProductResponse product = productClient.getProductById(request.productId());
        InventoryResponse inventory = inventoryClient.checkStock(request.productId());
        
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(request.productId())).findFirst();

        int desiredQuantity = existingItemOpt.map(item -> item.getQuantity() + request.quantity())
                                             .orElse(request.quantity());

        if (inventory.quantity() < desiredQuantity) {
            throw new OutOfStockException("Only " + inventory.quantity() + " items available.");
        }

        CartItem item = existingItemOpt.orElse(new CartItem());
        item.setProductId(product.id());
        item.setProductName(product.name());
        item.setPrice(product.price());
        item.setQuantity(desiredQuantity);
        item.setItemTotal(product.price().multiply(BigDecimal.valueOf(desiredQuantity)));
        cart.addOrUpdateItem(item);

        return processAndSaveCart(cart);
    }

    @Transactional
    @CachePut(value = "carts", key = "#p0")
    public CartResponse incrementItem(String userId, Long productId) {
        Cart cart = getCartOrThrow(userId);
        CartItem item = cart.getItems().stream()
            .filter(i -> i.getProductId().equals(productId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        InventoryResponse inventory = inventoryClient.checkStock(productId);
        int desiredQuantity = item.getQuantity() + 1;

        if (inventory.quantity() < desiredQuantity) {
             throw new OutOfStockException("Only " + inventory.quantity() + " items available.");
        }

        item.setQuantity(desiredQuantity);
        item.setItemTotal(item.getPrice().multiply(BigDecimal.valueOf(desiredQuantity)));
        
        return processAndSaveCart(cart);
    }

    @Transactional
    @CachePut(value = "carts", key = "#p0")
    public CartResponse decrementItem(String userId, Long productId) {
        Cart cart = getCartOrThrow(userId);
        CartItem item = cart.getItems().stream()
            .filter(i -> i.getProductId().equals(productId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        if (item.getQuantity() <= 1) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(item.getQuantity() - 1);
            item.setItemTotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        if(cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
            return emptyCartResponse(userId);
        }
        return processAndSaveCart(cart);
    }

    @Transactional
    @CachePut(value = "carts", key = "#p0")
    public CartResponse removeItem(String userId, Long productId) {
        Cart cart = getCartOrThrow(userId);
        CartItem item = cart.getItems().stream()
            .filter(i -> i.getProductId().equals(productId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));
            
        cart.getItems().remove(item);
        
        if(cart.getItems().isEmpty()) {
            cartRepository.delete(cart);
            return emptyCartResponse(userId);
        }

        return processAndSaveCart(cart);
    }

    @Transactional
    @CacheEvict(value = "carts", key = "#p0")
    public void emptyCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cartRepository::delete);
    }

    @Cacheable(value = "carts", key = "#p0", unless="#result == null")
    public CartResponse getCart(String userId) {
        return cartRepository.findByUserId(userId)
                .map(this::mapToResponse)
                .orElse(emptyCartResponse(userId));
    }

    private Cart createDefaultCart(String userId) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        return cart;
    }

    private CartResponse processAndSaveCart(Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        cart.setSubtotal(subtotal);
        cart.setTax(subtotal.multiply(TAX_RATE));
        cart.setTotalAmount(cart.getSubtotal().add(cart.getTax()));
        cart.setTotalItems(cart.getItems().stream().mapToInt(CartItem::getQuantity).sum());
        
        Cart savedCart = cartRepository.save(cart);
        return mapToResponse(savedCart);
    }
    
    private Cart getCartOrThrow(String userId) {
        return cartRepository.findByUserId(userId).orElseThrow(
            () -> new ResourceNotFoundException("Cart not found")
        );
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
            .map(item -> new CartItemResponse(
                item.getProductId(),
                item.getProductName(),
                item.getPrice(),
                item.getQuantity(),
                item.getItemTotal()
            )).collect(Collectors.toList());

        return new CartResponse(
            cart.getId(),
            cart.getUserId(),
            items,
            cart.getSubtotal(),
            cart.getTax(),
            cart.getTotalAmount(),
            cart.getTotalItems()
        );
    }

    private CartResponse emptyCartResponse(String userId) {
        return new CartResponse(
            null,
            userId,
            List.of(),
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            0
        );
    }
}
