// src/main/java/com/supermercado/supermercado_backend/services/ProductoService.java
package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.models.productos.Producto;

import java.util.List;
import java.util.Optional;

public interface ProductoService {
    List<Producto> getAllProductos();
    Optional<Producto> getProductoById(Long id);
    Producto createProducto(Producto producto);
    Producto updateProducto(Long id, Producto productoDetails);
    void deleteProducto(Long id);
}
