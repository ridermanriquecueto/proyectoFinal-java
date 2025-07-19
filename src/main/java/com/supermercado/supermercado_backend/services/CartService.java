package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;
import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.models.cart.CartItem;
import com.supermercado.supermercado_backend.models.productos.Producto;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.repositories.CartItemRepository;
import com.supermercado.supermercado_backend.repositories.CartRepository;
import com.supermercado.supermercado_backend.repositories.ProductoRepository;
import com.supermercado.supermercado_backend.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductoRepository productoRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con username: " + username));
    }

    @Transactional
    public Cart getOrCreateCartForCurrentUser() {
        User user = getAuthenticatedUser();
        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(new Cart(user)));
    }

    @Transactional
    public Cart addProductToCart(Long productId, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor que cero.");
        }

        Cart cart = getOrCreateCartForCurrentUser();

        Producto producto = productoRepository.findById(productId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + productId));

        if (producto.getStock() < quantity) {
            throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre());
        }

        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndProducto(cart, producto);

        if (existingCartItem.isPresent()) {
            CartItem item = existingCartItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            item.setUpdatedAt(LocalDateTime.now());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem(cart, producto, quantity, producto.getPrecio());
            cart.addCartItem(newItem);
            cartItemRepository.save(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateProductQuantity(Long productId, int newQuantity) {
        if (newQuantity <= 0) {
            return removeProductFromCart(productId);
        }

        Cart cart = getOrCreateCartForCurrentUser();

        Producto producto = productoRepository.findById(productId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + productId));

        CartItem item = cartItemRepository.findByCartAndProducto(cart, producto)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado en el carrito con ID: " + productId));

        if (producto.getStock() < newQuantity) {
            throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre() +
                    " (Disponible: " + producto.getStock() + ")");
        }

        item.setQuantity(newQuantity);
        item.setUpdatedAt(LocalDateTime.now());
        cartItemRepository.save(item);

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeProductFromCart(Long productId) {
        Cart cart = getOrCreateCartForCurrentUser();

        Producto producto = productoRepository.findById(productId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + productId));

        CartItem item = cartItemRepository.findByCartAndProducto(cart, producto)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado en el carrito con ID: " + productId));

        cart.removeCartItem(item);
        cartItemRepository.delete(item);

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    @Transactional(readOnly = true)
    public Cart getCartContentsForCurrentUser() {
        User user = getAuthenticatedUser();
        return cartRepository.findByUser(user).orElse(null);
    }

    @Transactional
    public void clearCartForCurrentUser() {
        Cart cart = getOrCreateCartForCurrentUser();

        if (!cart.getCartItems().isEmpty()) {
            cartItemRepository.deleteAll(cart.getCartItems());
            cart.getCartItems().clear();
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        }
    }
}
