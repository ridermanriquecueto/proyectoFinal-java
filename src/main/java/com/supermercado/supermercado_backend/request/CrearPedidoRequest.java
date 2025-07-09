// src/main/java/com/supermercado/supermercado_backend/payload/request/CrearPedidoRequest.java
package com.supermercado.supermercado_backend.payload.request;

import java.util.List;

public class CrearPedidoRequest {
    private List<ItemPedidoRequest> items;

    public List<ItemPedidoRequest> getItems() { return items; }
    public void setItems(List<ItemPedidoRequest> items) { this.items = items; }

    public static class ItemPedidoRequest {
        private Long productoId;
        private Integer cantidad;

        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}