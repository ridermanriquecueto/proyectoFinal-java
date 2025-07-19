package com.supermercado.supermercado_backend;

import com.supermercado.supermercado_backend.models.Role;
import com.supermercado.supermercado_backend.models.ERole;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.repositories.RoleRepository;
import com.supermercado.supermercado_backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class SupermercadoBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SupermercadoBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Crear Roles si no existen
            if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_USER));
                System.out.println("Rol ROLE_USER creado.");
            }
            if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_ADMIN));
                System.out.println("Rol ROLE_ADMIN creado.");
            }
            if (roleRepository.findByName(ERole.ROLE_MODERATOR).isEmpty()) {
                roleRepository.save(new Role(ERole.ROLE_MODERATOR));
                System.out.println("Rol ROLE_MODERATOR creado.");
            }

            // 2. Crear un usuario ADMINISTRADOR "rider" si no existe
            String adminUsername = "rider";
            String adminPassword = "123456"; // ¡Recuerda que esto se hashea!
            String adminEmail = "rider@super.com";

            if (userRepository.findByUsername(adminUsername).isEmpty()) {
                User adminUser = new User(adminUsername, adminEmail, passwordEncoder.encode(adminPassword));

                Set<Role> roles = new HashSet<>();
                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                        .orElseThrow(() -> new RuntimeException("Error: Rol 'ROLE_ADMIN' no encontrado en la base de datos. ¡Asegúrate de que se cree primero!"));
                roles.add(adminRole);

                adminUser.setRoles(roles);
                userRepository.save(adminUser);

                System.out.println("------------------------------------------------------------------");
                System.out.println("¡Usuario '" + adminUsername + "' (ADMIN) creado con contraseña '" + adminPassword + "'!");
                System.out.println("------------------------------------------------------------------");
            } else {
                System.out.println("------------------------------------------------------------------");
                System.out.println("El usuario '" + adminUsername + "' (ADMIN) ya existe. No se creó de nuevo.");
                System.out.println("------------------------------------------------------------------");
            }
        };
    }
}