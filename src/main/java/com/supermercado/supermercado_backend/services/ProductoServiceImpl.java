// src/main/java/com/supermercado/supermercado_backend/services/ProductoServiceImpl.java
package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;
import com.supermercado.supermercado_backend.models.productos.Producto;
import com.supermercado.supermercado_backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Producto> getProductoById(Long id) {
        return productoRepository.findById(id);
    }

    @Override
    @Transactional
    public Producto createProducto(Producto producto) {
        if (producto.getPrecio().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo.");
        }
        if (producto.getStock() == null || producto.getStock() < 0) { // Asegúrate de que stock no sea null
            throw new IllegalArgumentException("El stock no puede ser negativo o nulo.");
        }
        return productoRepository.save(producto);
    }

    @Override
    @Transactional
    public Producto updateProducto(Long id, Producto detallesProducto) {
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + id));

        if (detallesProducto.getNombre() != null && !detallesProducto.getNombre().isEmpty()) {
            productoExistente.setNombre(detallesProducto.getNombre());
        }
        if (detallesProducto.getDescripcion() != null && !detallesProducto.getDescripcion().isEmpty()) {
            productoExistente.setDescripcion(detallesProducto.getDescripcion());
        }
        if (detallesProducto.getPrecio() != null && detallesProducto.getPrecio().compareTo(BigDecimal.ZERO) >= 0) {
            productoExistente.setPrecio(detallesProducto.getPrecio());
        }
        if (detallesProducto.getCategoria() != null && !detallesProducto.getCategoria().isEmpty()) {
            productoExistente.setCategoria(detallesProducto.getCategoria());
        }
        if (detallesProducto.getImagen() != null && !detallesProducto.getImagen().isEmpty()) {
            productoExistente.setImagen(detallesProducto.getImagen());
        }
        // Corrección para el error "bad operand types for binary operator '!='"
        // Ahora detallesProducto.getStock() es Integer, así que podemos comparar con null
        if (detallesProducto.getStock() != null && detallesProducto.getStock() >= 0) {
            productoExistente.setStock(detallesProducto.getStock());
        } else if (detallesProducto.getStock() == null) {
            // Si el stock viene como null en la actualización, puedes decidir no actualizarlo
            // o establecerlo a un valor predeterminado (ej. 0). Por ahora, no se actualiza.
            System.out.println("Advertencia: El stock proporcionado para la actualización es nulo. No se actualizará el stock existente.");
        }

        return productoRepository.save(productoExistente);
    }

    @Override
    @Transactional
    public void deleteProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + id));
        productoRepository.delete(producto);
    }
}
