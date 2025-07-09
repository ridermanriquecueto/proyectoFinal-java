package com.supermercado.supermercado_backend.config;

import com.supermercado.supermercado_backend.security.AuthEntryPointJwt;
import com.supermercado.supermercado_backend.security.AuthTokenFilter;
import com.supermercado.supermercado_backend.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableMethodSecurity // Permite usar anotaciones de seguridad como @PreAuthorize
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService; // Servicio para cargar los detalles del usuario

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler; // Manejador de errores de autenticación

    // Bean para el filtro JWT que procesa el token en cada petición
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    // Proveedor de autenticación que usa el UserDetailsService y el PasswordEncoder
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Gestor de autenticación para procesar las solicitudes de login
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Codificador de contraseñas (BCrypt es una buena elección)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CONFIGURACIÓN PRINCIPAL DE LA CADENA DE FILTROS DE SEGURIDAD
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable) // Deshabilita CSRF para APIs REST sin estado
            // Configuración del manejador de excepciones para solicitudes no autorizadas
            .exceptionHandling(exception -> {
                if (unauthorizedHandler != null) {
                    exception.authenticationEntryPoint(unauthorizedHandler);
                }
            })
            // Configura la gestión de sesiones como sin estado (stateless) para JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Configura las reglas de autorización para las solicitudes HTTP
            .authorizeHttpRequests(auth -> auth
                // 1. Permitir acceso público a las rutas de autenticación (login, registro).
                .requestMatchers("/api/auth/**").permitAll()

                // 2. Permitir acceso público a todos los recursos estáticos y páginas principales.
                // Ajusta estas rutas según la ubicación de tus archivos estáticos.
                // Si tus HTML están DIRECTAMENTE en src/main/resources/static:
                // .requestMatchers("/", "/index.html", "/login.html", "/admin.html",
                //                  "/catalogo.html", "/carrito.html", "/contacto.html",
                //                  "/css/**", "/js/**", "/img/**", "/favicon.ico",
                //                  "/error").permitAll()

                // Si tus HTML están en src/main/resources/static/pages: (Descomenta esta línea y comenta la de arriba si es tu caso)
                .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/img/**", "/favicon.ico", "/error").permitAll()
                .requestMatchers("/pages/**").permitAll() // Esto permite acceso a /pages/login.html, /pages/admin.html, etc.

                // 3. Reglas específicas para la API de productos:
                // GET de productos (obtener lista o por ID) es público para el catálogo.
                .requestMatchers(HttpMethod.GET, "/api/productos", "/api/productos/**").permitAll()
                // POST, PUT, DELETE de productos requieren autenticación (para administradores).
                .requestMatchers(HttpMethod.POST, "/api/productos").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").authenticated()

                // 4. Reglas específicas para la API de pedidos:
                // POST de pedidos (hacer un pedido) requiere autenticación.
                .requestMatchers(HttpMethod.POST, "/api/pedidos").authenticated()
                // GET y PUT de pedidos también requieren autenticación.
                .requestMatchers(HttpMethod.GET, "/api/pedidos", "/api/pedidos/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/pedidos/**").authenticated()

                // 5. Cualquier otra solicitud que no haya sido específicamente permitida
                // en las reglas anteriores, REQUERIRÁ autenticación. Esta debe ser la ÚLTIMA regla.
                .anyRequest().authenticated()
            );

        // Añade el proveedor de autenticación
        http.authenticationProvider(authenticationProvider());
        // Añade el filtro JWT antes del filtro de autenticación de usuario/contraseña estándar de Spring Security
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build(); // Construye y devuelve la cadena de filtros de seguridad
    }
}