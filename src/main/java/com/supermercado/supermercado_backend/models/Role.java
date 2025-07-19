package com.supermercado.supermercado_backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ERole name; // Asegúrate de que sea ERole

    public Role() {
    }

    public Role(ERole name) { // Asegúrate de que sea ERole
        this.name = name;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ERole getName() { // Asegúrate de que sea ERole
        return name;
    }

    public void setName(ERole name) { // Asegúrate de que sea ERole
        this.name = name;
    }
}