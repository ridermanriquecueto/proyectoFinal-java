// src/main/java/com/supermercado/supermercado_backend/repositories/CartItemRepository.java
package com.supermercado.supermercado_backend.repositories;

import com.supermercado.supermercado_backend.models.cart.Cart; // Importa la clase Cart del paquete correcto
import com.supermercado.supermercado_backend.models.cart.CartItem; // Importa la clase CartItem del paquete correcto
import com.supermercado.supermercado_backend.models.productos.Producto; // Importa la clase Producto del paquete correcto
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // La firma del método debe coincidir exactamente con el uso en CartService
    Optional<CartItem> findByCartAndProduct(Cart cart, Producto product);
}
