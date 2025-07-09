package com.supermercado.supermercado_backend.models.cart;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.supermercado.supermercado_backend.models.User;

@Entity
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<CartItem> cartItems = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Transient // No se mapea a la base de datos
    private BigDecimal totalAmount; // Este campo no es necesario si se calcula en el getter

    public Cart() {
        this.createdAt = LocalDateTime.now();
    }

    public Cart(User user) {
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters y Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Set<CartItem> getCartItems() {
        return cartItems;
    }

    public void setCartItems(Set<CartItem> cartItems) {
        this.cartItems = cartItems;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Método para calcular el total del carrito
    public BigDecimal getTotalAmount() {
        return cartItems.stream()
                // CORREGIDO: Usar getPriceAtAddition() de CartItem
                .map(item -> item.getPriceAtAddition().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Método de utilidad para agregar un CartItem
    public void addCartItem(CartItem item) {
        this.cartItems.add(item);
        item.setCart(this);
    }

    // Método de utilidad para remover un CartItem
    public void removeCartItem(CartItem item) {
        this.cartItems.remove(item);
        item.setCart(null);
    }
}