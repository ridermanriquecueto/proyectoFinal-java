package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.models.productos.Producto;
import java.util.List;
import java.util.Optional;

public interface ProductoService { // Esto es correcto, es una interfaz

    List<Producto> obtenerTodosLosProductos();
    Optional<Producto> obtenerProductoPorId(Long id);
    List<Producto> buscarProductosPorNombre(String name);
    Producto guardarProducto(Producto producto);
    Producto actualizarProducto(Long id, Producto producto);
    void eliminarProducto(Long id);
}