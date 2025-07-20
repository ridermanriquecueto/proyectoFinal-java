// src/main/java/com/supermercado/supermercado_backend/models/cart/CartItem.java
package com.supermercado.supermercado_backend.models.cart;

import jakarta.persistence.*;
import com.supermercado.supermercado_backend.models.productos.Producto;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonIgnore // Rompe el ciclo de serialización con Cart
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Producto product; // Nombre de variable 'product' para consistencia

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtAddToCart;

    public CartItem() {
    }

    public CartItem(Cart cart, Producto product, Integer quantity, BigDecimal priceAtAddToCart) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.priceAtAddToCart = priceAtAddToCart;
    }

    // --- Getters y Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    // Asegúrate de que el getter sea getProduct()
    public Producto getProduct() { 
        return product;
    }

    // Asegúrate de que el setter sea setProduct()
    public void setProduct(Producto product) { 
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceAtAddToCart() {
        return priceAtAddToCart;
    }

    public void setPriceAtAddToCart(BigDecimal priceAtAddToCart) {
        this.priceAtAddToCart = priceAtAddToCart;
    }
}
