package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;
import com.supermercado.supermercado_backend.models.productos.Producto;
import com.supermercado.supermercado_backend.repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal; // Importa BigDecimal
import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> obtenerTodosLosProductos() {
        return productoRepository.findAll();
    }

    public Producto obtenerProductoPorId(Long id) { // <-- ID es Long
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + id));
    }

    public Producto guardarProducto(Producto producto) {
        // Validaciones o lógica de negocio aquí
        if (producto.getPrecio() == null || producto.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio del producto debe ser mayor que cero.");
        }
        // Para stock, ya que es 'int', no puede ser null. Solo validamos que no sea negativo.
        if (producto.getStock() < 0) { // <-- Corrección si la línea 59 se refería a una comparación con null
            throw new IllegalArgumentException("El stock no puede ser negativo.");
        }
        return productoRepository.save(producto);
    }

    public Producto actualizarProducto(Long id, Producto detallesProducto) { // <-- ID es Long
        Producto producto = obtenerProductoPorId(id); // Usa el método que retorna Long

        producto.setNombre(detallesProducto.getNombre());
        producto.setDescripcion(detallesProducto.getDescripcion());
        producto.setPrecio(detallesProducto.getPrecio());
        producto.setCategoria(detallesProducto.getCategoria());
        producto.setImagen(detallesProducto.getImagen());
        producto.setStock(detallesProducto.getStock());

        // Validaciones adicionales después de actualizar
        if (producto.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio del producto actualizado debe ser mayor que cero.");
        }
        // Para stock, ya que es 'int', no puede ser null. Solo validamos que no sea negativo.
        if (producto.getStock() < 0) { // <-- Corrección si la línea 83 se refería a una comparación con null
            throw new IllegalArgumentException("El stock actualizado no puede ser negativo.");
        }

        return productoRepository.save(producto);
    }

    public void eliminarProducto(Long id) { // <-- ID es Long
        Producto producto = obtenerProductoPorId(id); // Usa el método que retorna Long
        productoRepository.delete(producto);
    }
}