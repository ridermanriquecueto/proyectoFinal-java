
package com.supermercado.supermercado_backend.models.productos;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal; // Importa BigDecimal

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // <-- Confirmed: This should be 'id' of type Long

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2) // Añade precision y scale para BigDecimal
    private BigDecimal precio; // <-- Confirmed: This should be BigDecimal

    @Column(length = 50)
    private String categoria;

    @Column(length = 255)
    private String imagen;

    @Column(nullable = false)
    private int stock;
}