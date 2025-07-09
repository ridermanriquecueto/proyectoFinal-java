package com.supermercado.supermercado_backend.controllers;


import com.supermercado.supermercado_backend.models.Role;
import com.supermercado.supermercado_backend.models.RoleName;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.payload.request.LoginRequest;
import com.supermercado.supermercado_backend.payload.request.SignupRequest;
import com.supermercado.supermercado_backend.payload.response.JwtResponse;
import com.supermercado.supermercado_backend.payload.response.MessageResponse;
import com.supermercado.supermercado_backend.repositories.RoleRepository;
import com.supermercado.supermercado_backend.repositories.UserRepository;
import com.supermercado.supermercado_backend.security.JwtCore;
import com.supermercado.supermercado_backend.security.UserDetailsImpl;

import jakarta.validation.Valid; // Asegúrate de tener la dependencia para Jakarta Validation (Hibernate Validator)

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"null", "http://localhost", "http://127.0.0.1"}, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder; // Cambié a 'passwordEncoder' para ser más consistente con el nombre del bean

    @Autowired
    JwtCore jwtCore; // Tu clase para JWT (generar token)

    // --- Endpoint para Iniciar Sesión (LOGIN) ---
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Usa @Valid para validar los campos del DTO (ej. @NotBlank)

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtCore.generateJwtToken(authentication); // Genera el JWT

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Devuelve el token JWT y la información del usuario
        return ResponseEntity.ok(new JwtResponse(jwt,
                                                 userDetails.getId(),
                                                 userDetails.getUsername(),
                                                 userDetails.getEmail(),
                                                 roles));
    }

    // --- Endpoint para Registrar un Nuevo Usuario (SIGNUP) ---
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        // Usa @Valid para validar los campos del DTO (ej. @NotBlank, @Size, @Email)

        // Verifica si el nombre de usuario ya existe
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: ¡El nombre de usuario ya está en uso!"));
        }

        // Verifica si el email ya existe
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: ¡El Email ya está en uso!"));
        }

        // Crea el nuevo usuario y encripta la contraseña
        User user = new User(signupRequest.getUsername(),
                             signupRequest.getEmail(),
                             passwordEncoder.encode(signupRequest.getPassword()));

        Set<String> strRoles = signupRequest.getRole(); // Obtiene los roles como String (ej. "admin")
        Set<Role> roles = new HashSet<>();

        // Asigna los roles al usuario
        if (strRoles == null) {
            // Si no se especifica rol, asigna el rol por defecto (USER)
            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Rol de USUARIO no encontrado."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Rol de ADMINISTRADOR no encontrado."));
                        roles.add(adminRole);
                        break;
                    case "mod": // 'mod' para MODERATOR
                        Role modRole = roleRepository.findByName(RoleName.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Rol de MODERADOR no encontrado."));
                        roles.add(modRole);
                        break;
                    default: // Cualquier otro caso o 'user' explícito
                        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Rol de USUARIO no encontrado."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles); // Establece los roles en el objeto User
        userRepository.save(user); // Guarda el usuario en la base de datos

        // Devuelve un mensaje de éxito
        return ResponseEntity.ok(new MessageResponse("Usuario registrado exitosamente!"));
    }
}