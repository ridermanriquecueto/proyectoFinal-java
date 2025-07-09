package com.supermercado.supermercado_backend.payload.request;

import java.util.Set;

import jakarta.validation.constraints.*; 
import com.supermercado.supermercado_backend.payload.request.SignupRequest;

public class SignupRequest {
    @NotBlank(message = "El nombre de usuario es obligatorio.")
    @Size(min = 3, max = 20, message = "El nombre de usuario debe tener entre 3 y 20 caracteres.")
    private String username;

    @NotBlank(message = "El email es obligatorio.")
    @Size(max = 50, message = "El email no puede exceder los 50 caracteres.")
    @Email(message = "Debe ser un formato de email válido.")
    private String email;

    private Set<String> role; // Puede ser un conjunto de roles como ["admin", "user"]

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, max = 40, message = "La contraseña debe tener entre 6 y 40 caracteres.")
    private String password;

    // Getters y Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

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