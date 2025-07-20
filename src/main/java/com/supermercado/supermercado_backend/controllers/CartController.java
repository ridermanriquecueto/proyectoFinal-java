package com.supermercado.supermercado_backend.controllers;

import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.models.cart.CartItem;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.payload.request.AddToCartRequest;
import com.supermercado.supermercado_backend.security.UserDetailsImpl;
import com.supermercado.supermercado_backend.services.CartService;
import com.supermercado.supermercado_backend.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.HashSet;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"null", "http://localhost", "http://127.0.0.1"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    // Método auxiliar para obtener el usuario autenticado
    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Verifica si el principal es UserDetailsImpl (usuario logueado) y no "anonymousUser"
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new IllegalStateException("Usuario no autenticado o principal no es UserDetailsImpl.");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado en la base de datos."));
    }

    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            User currentUser = null;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !(authentication.getPrincipal() instanceof String)) {
                 UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                 currentUser = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            }
            
            Cart cart;
            if (currentUser != null) {
                cart = cartService.getOrCreateCart(currentUser);
            } else {
                // Si no hay usuario autenticado, devuelve un carrito vacío para la respuesta
                cart = new Cart(); 
                cart.setItems(new HashSet<>());
            }

            Map<String, Object> cartResponse = new HashMap<>();
            cartResponse.put("id", cart.getId());
            cartResponse.put("userId", cart.getUser() != null ? cart.getUser().getId() : null);
            cartResponse.put("username", cart.getUser() != null ? cart.getUser().getUsername() : null);
            cartResponse.put("total", cart.getTotal());
            cartResponse.put("items", cart.getItems().stream().map(item -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("productId", item.getProduct().getId());
                itemMap.put("productName", item.getProduct().getNombre());
                itemMap.put("productImage", item.getProduct().getImagen());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("priceAtAddToCart", item.getPriceAtAddToCart());
                itemMap.put("subtotal", item.getPriceAtAddToCart().multiply(BigDecimal.valueOf(item.getQuantity())));
                return itemMap;
            }).collect(Collectors.toList()));

            return ResponseEntity.ok(cartResponse);

        } catch (Exception e) {
            // Captura cualquier excepción genérica y devuelve un error 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener el carrito: " + e.getMessage());
        }
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> addProductToCart(@Valid @RequestBody AddToCartRequest request) {
        try {
            User currentUser = getCurrentAuthenticatedUser(); // Este método ya lanza IllegalStateException
            CartItem cartItem = cartService.addProductToCart(currentUser, request.getProductId(), request.getQuantity());
            return ResponseEntity.status(HttpStatus.OK).body("Producto añadido/actualizado en el carrito.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) { // Captura IllegalStateException y otras excepciones aquí
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al añadir producto al carrito: " + e.getMessage());
        }
    }

    @PutMapping("/update-quantity")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProductQuantity(@RequestParam Long productId, @RequestParam int newQuantity) {
        try {
            User currentUser = getCurrentAuthenticatedUser(); // Este método ya lanza IllegalStateException
            CartItem updatedItem = cartService.updateProductQuantity(currentUser, productId, newQuantity);
            if (updatedItem == null) {
                return ResponseEntity.ok("Producto eliminado del carrito (cantidad 0).");
            }
            return ResponseEntity.ok("Cantidad del producto actualizada en el carrito.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) { // Captura IllegalStateException y otras excepciones aquí
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar cantidad del producto: " + e.getMessage());
        }
    }

    @DeleteMapping("/remove")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> removeProductFromCart(@RequestParam Long productId) {
        try {
            User currentUser = getCurrentAuthenticatedUser(); // Este método ya lanza IllegalStateException
            cartService.removeProductFromCart(currentUser, productId);
            return ResponseEntity.ok("Producto eliminado del carrito.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) { // Captura IllegalStateException y otras excepciones aquí
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar producto del carrito: " + e.getMessage());
        }
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> clearCart() {
        try {
            User currentUser = getCurrentAuthenticatedUser(); // Este método ya lanza IllegalStateException
            cartService.clearCart(currentUser);
            return ResponseEntity.ok("Carrito vaciado exitosamente.");
        } catch (Exception e) { // Captura IllegalStateException y otras excepciones aquí
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al vaciar el carrito: " + e.getMessage());
        }
    }
}
