// src/main/java/com/supermercado/supermercado_backend/services/CartService.java
package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.models.cart.CartItem;
import com.supermercado.supermercado_backend.models.productos.Producto;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.repositories.CartItemRepository;
import com.supermercado.supermercado_backend.repositories.CartRepository;
import com.supermercado.supermercado_backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart(user);
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public CartItem addProductToCart(User user, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que cero.");
        }

        Cart cart = getOrCreateCart(user);

        Producto product = productoRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productId));

        if (product.getStock() < quantity) {
            throw new IllegalArgumentException("No hay suficiente stock para el producto " + product.getNombre() + ". Stock disponible: " + product.getStock());
        }

        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndProduct(cart, product);

        CartItem cartItem;
        if (existingCartItem.isPresent()) {
            cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            cartItem = new CartItem(cart, product, quantity, product.getPrecio());
            cart.addItem(cartItem);
        }
        cartRepository.save(cart);
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public CartItem updateProductQuantity(User user, Long productId, int newQuantity) {
        Cart cart = getOrCreateCart(user);
        Producto product = productoRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productId));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado en el carrito."));

        if (newQuantity > 0 && product.getStock() < newQuantity) {
            throw new IllegalArgumentException("No hay suficiente stock para el producto " + product.getNombre() + ". Stock disponible: " + product.getStock());
        }

        if (newQuantity <= 0) {
            removeProductFromCart(user, productId);
            return null;
        } else {
            cartItem.setQuantity(newQuantity);
            cartRepository.save(cart);
            return cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void removeProductFromCart(User user, Long productId) {
        Cart cart = getOrCreateCart(user);
        Producto product = productoRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productId));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado en el carrito."));

        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Transactional(readOnly = true)
    public Optional<Cart> getCartByUser(User user) {
        return cartRepository.findByUser(user);
    }
}
