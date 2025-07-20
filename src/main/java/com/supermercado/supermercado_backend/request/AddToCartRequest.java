// src/main/java/com/supermercado/supermercado_backend/payload/request/AddToCartRequest.java
package com.supermercado.supermercado_backend.payload.request; // ¡ASEGÚRATE DE QUE ESTE PAQUETE SEA CORRECTO!

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AddToCartRequest {
    @NotNull(message = "Product ID cannot be null")
    private Long productId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
