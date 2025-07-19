package com.supermercado.supermercado_backend.controllers;

import com.supermercado.supermercado_backend.pedidos.Pedido;
import com.supermercado.supermercado_backend.services.PedidoService;
// import com.supermercado.supermercado_backend.payload.request.CrearPedidoRequest; // YA NO NECESITAMOS ESTO EN ESTE ENDPOINT
import com.supermercado.supermercado_backend.payload.response.MessageResponse;
import com.supermercado.supermercado_backend.security.UserDetailsImpl;
import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Usaremos esta anotación
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    // --- ENDPOINT PARA CREAR PEDIDO DESDE EL CARRITO ---
    // Este endpoint ya no necesita un @RequestBody
    @PostMapping("/finalizarCompra") // Un nombre más descriptivo
    @PreAuthorize("hasRole('USER')") // Solo usuarios autenticados
    public ResponseEntity<?> finalizarCompra(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Obtener el ID del usuario autenticado directamente
        Long userId = userDetails.getId();

        try {
            Pedido nuevoPedido = pedidoService.crearPedidoDesdeCarrito(userId); // Llamamos al nuevo método
            return new ResponseEntity<>(new MessageResponse("Pedido creado exitosamente. ID: " + nuevoPedido.getId()), HttpStatus.CREATED);
            // O puedes devolver el objeto Pedido completo si el frontend lo necesita:
            // return new ResponseEntity<>(nuevoPedido, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Errores de lógica de negocio como carrito vacío o stock insuficiente
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (RecursoNoEncontradoException e) {
            // Usuario o carrito no encontrado (aunque con @AuthenticationPrincipal es menos probable para el usuario)
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            // Cualquier otro error inesperado
            return new ResponseEntity<>(new MessageResponse("Error interno del servidor al finalizar la compra: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- MANTENEMOS TUS OTROS ENDPOINTS ---

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> getPedidosCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Pedido> pedidos = pedidoService.obtenerPedidosPorUsuario();
        return new ResponseEntity<>(pedidos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> obtenerPedidoPorId(@PathVariable Long id) {
        try {
            Pedido pedido = pedidoService.obtenerPedidoPorId(id);
            return new ResponseEntity<>(pedido, HttpStatus.OK);
        } catch (RecursoNoEncontradoException e) {
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(new MessageResponse("Error interno del servidor al obtener el pedido: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}