package com.supermercado.supermercado_backend.repositories;

import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.models.User; // Asegúrate de que User esté importado

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
    
}