// src/main/java/com/supermercado/supermercado_backend/models/cart/Cart.java
package com.supermercado.supermercado_backend.models.cart;

import jakarta.persistence.*;
import com.supermercado.supermercado_backend.models.User;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "carts")
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CartItem> items = new HashSet<>();

    public Cart() {
    }

    public Cart(User user) {
        this.user = user;
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

    public Set<CartItem> getItems() { // Este es el método correcto
        return items;
    }

    public void setItems(Set<CartItem> items) {
        this.items = items;
    }

    public void addItem(CartItem item) { // Método para añadir un ítem
        this.items.add(item);
        item.setCart(this);
    }

    public void removeItem(CartItem item) { // Método para eliminar un ítem
        this.items.remove(item);
        item.setCart(null);
    }

    @Transient
    public BigDecimal getTotal() {
        return items.stream()
                .map(item -> item.getPriceAtAddToCart().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
