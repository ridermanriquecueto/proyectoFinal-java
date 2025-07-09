package com.supermercado.supermercado_backend.controllers;

import com.supermercado.supermercado_backend.pedidos.Pedido;
import com.supermercado.supermercado_backend.services.PedidoService;
import com.supermercado.supermercado_backend.payload.request.CrearPedidoRequest; // ¡Importa el DTO de request!
import com.supermercado.supermercado_backend.payload.response.MessageResponse;
import com.supermercado.supermercado_backend.security.UserDetailsImpl; // Para obtener el usuario autenticado
import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException; // Asegúrate de importar tu excepción

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Para inyectar UserDetailsImpl
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos") // La URL base para todos los endpoints de este controlador será /api/pedidos
@CrossOrigin(origins = "*", maxAge = 3600) // Configuración de CORS para permitir peticiones desde cualquier origen
public class PedidoController {

    @Autowired
    private PedidoService pedidoService; // Inyecta el servicio de pedidos

    /**
     * Endpoint para crear un nuevo pedido.
     * Solo los usuarios con el rol 'USER' pueden acceder a este endpoint.
     * La información del pedido se envía en el cuerpo de la solicitud (RequestBody) usando el DTO CrearPedidoRequest.
     */
    @PostMapping // Corresponde a un POST en /api/pedidos
    @PreAuthorize("hasRole('USER')") // Solo usuarios autenticados con rol USER
    public ResponseEntity<?> crearPedido(@AuthenticationPrincipal UserDetailsImpl userDetails, // Obtiene los detalles del usuario logueado
                                         @RequestBody CrearPedidoRequest crearPedidoRequest) { // Recibe el DTO con los ítems del pedido
        try {
            // El servicio ahora se encarga de obtener el usuario del contexto de seguridad,
            // por lo que no necesitamos pasar userDetails.getId() aquí.
            Pedido nuevoPedido = pedidoService.crearPedido(crearPedidoRequest);
            // Si el pedido se crea exitosamente, retorna el pedido creado y un estado 201 CREATED
            return new ResponseEntity<>(nuevoPedido, HttpStatus.CREATED); 
        } catch (IllegalArgumentException e) {
            // Captura errores de validación de negocio (ej. stock insuficiente, cantidad inválida)
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST); // Retorna 400 Bad Request
        } catch (RecursoNoEncontradoException e) {
            // Captura si un producto o el usuario autenticado no se encuentra
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.NOT_FOUND); // Retorna 404 Not Found
        } catch (Exception e) {
            // Captura cualquier otra excepción inesperada
            return new ResponseEntity<>(new MessageResponse("Error interno del servidor al crear el pedido: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR); // Retorna 500 Internal Server Error
        }
    }

    /**
     * Endpoint para obtener todos los pedidos del usuario actualmente autenticado.
     * Acceso permitido a usuarios con rol 'USER' o 'ADMIN'.
     */
    @GetMapping("/me") // Corresponde a un GET en /api/pedidos/me
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> getPedidosCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        // El servicio ya obtiene el usuario del contexto de seguridad.
        List<Pedido> pedidos = pedidoService.obtenerPedidosPorUsuario();
        return new ResponseEntity<>(pedidos, HttpStatus.OK); // Retorna la lista de pedidos y un estado 200 OK
    }

    /**
     * Endpoint para obtener un pedido específico por su ID.
     * Acceso permitido a usuarios con rol 'USER' o 'ADMIN'.
     * Podrías añadir lógica adicional para que un USER solo vea sus propios pedidos.
     */
    @GetMapping("/{id}") // Corresponde a un GET en /api/pedidos/{id_del_pedido}
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> obtenerPedidoPorId(@PathVariable Long id) { // El ID del pedido viene en la URL
        try {
            Pedido pedido = pedidoService.obtenerPedidoPorId(id);
            // Aquí podrías agregar una verificación de seguridad:
            // if (userDetails != null && userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) && !pedido.getUser().getId().equals(userDetails.getId())) {
            //    return new ResponseEntity<>(new MessageResponse("No tienes permiso para ver este pedido."), HttpStatus.FORBIDDEN);
            // }
            return new ResponseEntity<>(pedido, HttpStatus.OK);
        } catch (RecursoNoEncontradoException e) {
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
             return new ResponseEntity<>(new MessageResponse("Error interno del servidor al obtener el pedido: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Otros endpoints que podrías añadir en el futuro (descomentar y completar en PedidoService si los necesitas) ---

    // Para que un ADMIN pueda ver TODOS los pedidos del sistema
    /*
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        List<Pedido> pedidos = pedidoService.obtenerTodosLosPedidos(); // Necesitas implementar este método en PedidoService
        return new ResponseEntity<>(pedidos, HttpStatus.OK);
    }
    */

    // Para que un ADMIN actualice el estado de un pedido (ej. de PENDIENTE a ENVIADO)
    /*
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePedidoEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            PedidoEstado nuevoEstado = PedidoEstado.valueOf(body.get("estado").toUpperCase());
            Pedido updatedPedido = pedidoService.actualizarEstadoPedido(id, nuevoEstado); // Necesitas implementar este método
            return new ResponseEntity<>(updatedPedido, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new MessageResponse("Estado de pedido inválido: " + e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (RecursoNoEncontradoException e) {
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }
    */

    // Para que un usuario (o ADMIN) cancele un pedido
    /*
    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelarPedido(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Pedido pedidoCancelado = pedidoService.cancelarPedido(id, userDetails.getId()); // Necesitas implementar este método
            return new ResponseEntity<>(pedidoCancelado, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (RecursoNoEncontradoException e) {
            return new ResponseEntity<>(new MessageResponse(e.getMessage()), HttpStatus.NOT_FOUND);
        }
    }
    */
}