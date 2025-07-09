package com.supermercado.supermercado_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.supermercado.supermercado_backend.models.productos.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> { // <--- ¡Confirma que es LONG!
    // Puedes añadir métodos de consulta personalizados aquí si los necesitas
}