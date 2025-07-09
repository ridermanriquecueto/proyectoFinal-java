// E:\supermercado-backend\supermercado-backend\src\main\java\com\supermercado\supermercado_backend\payload\request\CartItemRequest.java

package com.supermercado.supermercado_backend.request;

public class CartItemRequest {
    private Long productId;
    private Integer quantity;

    // Constructor vacío
    public CartItemRequest() {}

    // Constructor con parámetros
    public CartItemRequest(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    // Getters y Setters
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