package com.supermercado.supermercado_backend.services.impl; // <--- ¡Importante! Si no usas 'impl', cambia a 'services'

import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;
import com.supermercado.supermercado_backend.models.productos.Producto;
import com.supermercado.supermercado_backend.repositories.ProductoRepository;
import com.supermercado.supermercado_backend.services.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service; // <--- ¡ESTE IMPORT ES CLAVE!
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service // <--- ¡ESTA ANOTACIÓN ES CLAVE!
@Transactional
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    public List<Producto> obtenerTodosLosProductos() {
        return productoRepository.findAll();
    }

    @Override
    public Optional<Producto> obtenerProductoPorId(Long id) {
        return productoRepository.findById(id);
    }

    @Override
    public List<Producto> buscarProductosPorNombre(String name) {
        // Asegúrate de que tu ProductoRepository tenga este método definido
        // ej: List<Producto> findByNombreContainingIgnoreCase(String name);
        return productoRepository.findByNombreContainingIgnoreCase(name);
    }

    @Override
    public Producto guardarProducto(Producto producto) {
        if (producto.getPrecio() == null || producto.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio del producto debe ser mayor que cero.");
        }
        if (producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo.");
        }
        return productoRepository.save(producto);
    }

    @Override
    public Producto actualizarProducto(Long id, Producto detallesProducto) {
        Producto productoExistente = productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + id));

        productoExistente.setNombre(detallesProducto.getNombre());
        productoExistente.setDescripcion(detallesProducto.getDescripcion());
        productoExistente.setPrecio(detallesProducto.getPrecio());
        productoExistente.setCategoria(detallesProducto.getCategoria());
        productoExistente.setImagen(detallesProducto.getImagen());
        productoExistente.setStock(detallesProducto.getStock());

        if (productoExistente.getPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio del producto actualizado debe ser mayor que cero.");
        }
        if (productoExistente.getStock() < 0) {
            throw new IllegalArgumentException("El stock actualizado no puede ser negativo.");
        }

        return productoRepository.save(productoExistente);
    }

    @Override
    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + id));
        productoRepository.delete(producto);
    }
}