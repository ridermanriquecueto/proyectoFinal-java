package com.supermercado.supermercado_backend.repositories;

import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.pedidos.Pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Importa List

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> { // <--- ¡Confirma que es LONG!
    List<Pedido> findByUser(User user); // <--- ¡Añade/Confirma este método!
    // Si tienes otros métodos findBy, asegúrate de que usen Long si esperan IDs.
}