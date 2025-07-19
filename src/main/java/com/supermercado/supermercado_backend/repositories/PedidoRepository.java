package com.supermercado.supermercado_backend.repositories;

import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.pedidos.Pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; 

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> { 
    List<Pedido> findByUser(User user);
}