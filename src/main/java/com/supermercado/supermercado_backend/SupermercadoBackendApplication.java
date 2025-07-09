package com.supermercado.supermercado_backend;

import com.supermercado.supermercado_backend.models.Role;
import com.supermercado.supermercado_backend.models.RoleName;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.repositories.RoleRepository;
import com.supermercado.supermercado_backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder; // Necesitas esta importación

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class SupermercadoBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SupermercadoBackendApplication.class, args);
    }

    // --- INICIO CÓDIGO PARA CREAR USUARIO DE PRUEBA (¡QUITAR DESPUÉS DE LA PRIMERA EJECUCIÓN!) ---
    @Bean
    CommandLineRunner initData(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Asegúrate de que los roles existan
            if (roleRepository.findByName(RoleName.ROLE_USER).isEmpty()) {
                roleRepository.save(new Role(RoleName.ROLE_USER));
            }
            if (roleRepository.findByName(RoleName.ROLE_ADMIN).isEmpty()) {
                roleRepository.save(new Role(RoleName.ROLE_ADMIN));
            }
            // Agrega otros roles si los necesitas, ej: ROLE_MODERATOR

            // Crea un usuario de prueba si no existe
            if (userRepository.findByUsername("testuser").isEmpty()) { // Cambié a 'testuser' para evitar conflictos
                User testUser = new User("testuser", "test@super.com", passwordEncoder.encode("testpassword")); // Usuario: testuser, Contraseña: testpassword

                Set<Role> roles = new HashSet<>();
                Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role USER not found."));
                roles.add(userRole);
                testUser.setRoles(roles);
                userRepository.save(testUser);
                System.out.println("------------------------------------------------------------------");
                System.out.println("Usuario 'testuser' creado con contraseña 'testpassword'");
                System.out.println("------------------------------------------------------------------");
            }
        };
    }
    // --- FIN CÓDIGO PARA CREAR USUARIO DE PRUEBA ---
}