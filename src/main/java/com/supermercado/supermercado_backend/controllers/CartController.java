package com.supermercado.supermercado_backend.controllers;

import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.payload.response.MessageResponse;
// import com.supermercado.supermercado_backend.payload.request.CartItemRequest; // ¡ELIMINADA ESTA LÍNEA!
import com.supermercado.supermercado_backend.security.UserDetailsImpl;
import com.supermercado.supermercado_backend.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // Endpoint para agregar un producto al carrito
    @PostMapping("/add")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')") // Solo usuarios autenticados pueden agregar
    public ResponseEntity<?> addProductToCart(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                              @RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf(payload.get("productId").toString());
        int quantity = Integer.parseInt(payload.get("quantity").toString());

        try {
            // El servicio obtiene el userId del contexto de seguridad internamente
            Cart updatedCart = cartService.addProductToCart(productId, quantity);
            return ResponseEntity.ok(updatedCart); // Retorna el carrito actualizado
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        }
    }

    // Endpoint para actualizar la cantidad de un producto en el carrito
    @PutMapping("/update-quantity")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProductQuantity(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                   @RequestBody Map<String, Object> payload) {
        Long productId = Long.valueOf(payload.get("productId").toString());
        int newQuantity = Integer.parseInt(payload.get("quantity").toString());

        try {
            // El servicio obtiene el userId del contexto de seguridad internamente
            Cart updatedCart = cartService.updateProductQuantity(productId, newQuantity);
            return ResponseEntity.ok(updatedCart);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        }
    }

    // Endpoint para eliminar un producto del carrito
    @DeleteMapping("/remove/{productId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> removeProductFromCart(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                   @PathVariable Long productId) {
        try {
            // El servicio obtiene el userId del contexto de seguridad internamente
            Cart updatedCart = cartService.removeProductFromCart(productId);
            return ResponseEntity.ok(updatedCart);
        } catch (RecursoNoEncontradoException e) {
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        }
    }

    // Endpoint para obtener el carrito del usuario autenticado
    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Llama al método del servicio que obtiene el carrito para el usuario actual
        Cart cart = cartService.getCartContentsForCurrentUser();
        if (cart != null) {
            return ResponseEntity.ok(cart);
        } else {
            return ResponseEntity.status(404).body(new MessageResponse("Carrito no encontrado para el usuario."));
        }
    }

    // Endpoint para vaciar el carrito
    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Llama al método del servicio que vacía el carrito para el usuario actual
        cartService.clearCartForCurrentUser();
        return ResponseEntity.ok(new MessageResponse("Carrito vaciado con éxito."));
    }
    
    // El método PostMapping("/add") duplicado que causaba conflicto fue eliminado.
    // Si necesitas un endpoint que use CartItemRequest directamente, se puede refactorizar
    // el método existente o crear uno nuevo con un Path diferente.
}