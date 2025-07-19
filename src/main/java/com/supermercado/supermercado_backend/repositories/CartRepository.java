package com.supermercado.supermercado_backend.repositories;

import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.models.User;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
    
}