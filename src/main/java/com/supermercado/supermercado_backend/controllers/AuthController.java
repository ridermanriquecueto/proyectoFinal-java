package com.supermercado.supermercado_backend.controllers;

import com.supermercado.supermercado_backend.models.Role;
import com.supermercado.supermercado_backend.models.ERole;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.payload.request.LoginRequest;
import com.supermercado.supermercado_backend.payload.request.SignupRequest;
import com.supermercado.supermercado_backend.payload.response.JwtResponse;
import com.supermercado.supermercado_backend.payload.response.MessageResponse;
import com.supermercado.supermercado_backend.repositories.RoleRepository;
import com.supermercado.supermercado_backend.repositories.UserRepository;
import com.supermercado.supermercado_backend.security.JwtCore;
import com.supermercado.supermercado_backend.security.UserDetailsImpl;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // Importa HttpStatus
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException; // Importa BadCredentialsException
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
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtCore jwtCore;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtCore.generateJwtToken(authentication); // Tu método generateJwtToken puede recibir Authentication o UserDetailsImpl

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(jwt,
                                                     userDetails.getId(),
                                                     userDetails.getUsername(),
                                                     userDetails.getEmail(),
                                                     roles));
        } catch (BadCredentialsException e) {
            // Este es el error más común para credenciales inválidas (usuario/contraseña incorrectos)
            System.err.println("Error de credenciales: " + e.getMessage()); // Loguea el error en la consola del backend
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: Usuario o contraseña incorrectos."));
        } catch (Exception e) {
            // Captura cualquier otra excepción que pueda ocurrir durante el proceso de autenticación o JWT
            System.err.println("Error en el proceso de autenticación: " + e.getMessage()); // Loguea el error
            // Puedes devolver un 500 Internal Server Error o un 401 Unauthorized más genérico
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: No se pudo autenticar. Verifique sus credenciales."));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {

        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: ¡El nombre de usuario ya está en uso!"));
        }

        if (signupRequest.getEmail() != null && userRepository.existsByEmail(signupRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: ¡El Email ya está en uso!"));
        }

        User user = new User(signupRequest.getUsername(),
                              signupRequest.getEmail(),
                              passwordEncoder.encode(signupRequest.getPassword()));

        Set<String> strRoles = signupRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Rol de USUARIO no encontrado."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Rol de ADMINISTRADOR no encontrado."));
                        roles.add(adminRole);
                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Rol de MODERADOR no encontrado."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Rol de USUARIO no encontrado."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Usuario registrado exitosamente!"));
    }
}