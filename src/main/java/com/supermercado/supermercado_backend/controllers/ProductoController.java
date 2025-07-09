package com.supermercado.supermercado_backend.controllers;

import com.supermercado.supermercado_backend.services.ProductoService;
import com.supermercado.supermercado_backend.payload.response.MessageResponse; // Import MessageResponse
import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException; // Import RecursoNoEncontradoException
import com.supermercado.supermercado_backend.models.productos.Producto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // Endpoint para obtener todos los productos
    @GetMapping
    public ResponseEntity<List<Producto>> obtenerTodosLosProductos() {
        List<Producto> productos = productoService.obtenerTodosLosProductos(); // <-- CORRECCIÓN AQUÍ
        return ResponseEntity.ok(productos);
    }

    // Endpoint para obtener un producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long id) { // <-- ID es Long
        Producto producto = productoService.obtenerProductoPorId(id); // <-- CORRECCIÓN AQUÍ
        return ResponseEntity.ok(producto);
    }

    // Endpoint para crear un nuevo producto (requiere rol de ADMIN)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Solo administradores pueden crear productos
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        try {
            Producto nuevoProducto = productoService.guardarProducto(producto); // <-- CORRECCIÓN AQUÍ (metodo guardarProducto)
            return ResponseEntity.status(201).body(nuevoProducto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // Endpoint para actualizar un producto existente (requiere rol de ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo administradores pueden actualizar productos
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, // <-- ID es Long
                                                @RequestBody Producto detallesProducto) {
        try {
            Producto productoActualizado = productoService.actualizarProducto(id, detallesProducto); // <-- CORRECCIÓN AQUÍ
            return ResponseEntity.ok(productoActualizado);
        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // Endpoint para eliminar un producto (requiere rol de ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo administradores pueden eliminar productos
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) { // <-- ID es Long
        try {
            productoService.eliminarProducto(id); // <-- CORRECCIÓN AQUÍ
            return ResponseEntity.ok(new MessageResponse("Producto eliminado con éxito."));
        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        }
    }
}