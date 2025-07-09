// Archivo: src/main/java/com/supermercado/supermercado_backend/repositories/CartItemRepository.java

package com.supermercado.supermercado_backend.repositories;

import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.models.cart.CartItem;
import com.supermercado.supermercado_backend.models.productos.Producto; // Asegúrate de que Producto esté importado

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // ESTA LÍNEA ES LA CLAVE. DEBE DECIR 'Producto' (con 'o' al final)
    Optional<CartItem> findByCartAndProducto(Cart cart, Producto producto);
}