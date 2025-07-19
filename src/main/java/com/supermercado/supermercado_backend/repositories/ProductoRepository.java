package com.supermercado.supermercado_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.supermercado.supermercado_backend.models.productos.Producto;
import java.util.List; // <--- ¡Asegúrate de que esta línea esté presente!

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}