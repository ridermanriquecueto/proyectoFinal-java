package com.supermercado.supermercado_backend.models.productos;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Data // De Lombok, para generar getters, setters, etc.
@NoArgsConstructor // De Lombok, para constructor sin argumentos
@AllArgsConstructor // De Lombok, para constructor con todos los argumentos
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // El ID de Producto es Long (se mapea a BIGINT en MySQL)

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(length = 50)
    private String categoria;

    @Column(length = 255)
    private String imagen;

    @Column(nullable = false)
    private int stock;
}