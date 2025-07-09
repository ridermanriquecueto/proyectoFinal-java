package com.supermercado.supermercado_backend.repositories;

import com.supermercado.supermercado_backend.pedidos.LineaPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LineaPedidoRepository extends JpaRepository<LineaPedido, Long> {
}