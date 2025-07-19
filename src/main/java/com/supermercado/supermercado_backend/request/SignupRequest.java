package com.supermercado.supermercado_backend.payload.request;

import java.util.Set;

import jakarta.validation.constraints.*; // Mantén esta importación si usas otras validaciones

public class SignupRequest {
    @NotBlank(message = "El nombre de usuario es obligatorio.")
    @Size(min = 3, max = 20, message = "El nombre de usuario debe tener entre 3 y 20 caracteres.")
    private String username;

    // --- ¡CAMBIOS AQUÍ! ---
    // Eliminamos las anotaciones de validación para hacer el email opcional
    private String email; // Ahora es opcional

    private Set<String> role;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, max = 40, message = "La contraseña debe tener entre 6 y 40 caracteres.")
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // --- ¡Mantenemos getters y setters para 'email' si es opcional! ---
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getRole() {
        return this.role;
    }

    public void setRole(Set<String> role) {
        this.role = role;
    }
}