package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;
import com.supermercado.supermercado_backend.models.User; // <<-- ¡VERIFICA ESTA RUTA DE IMPORTACIÓN!
import com.supermercado.supermercado_backend.models.productos.Producto; // <<-- ¡VERIFICA ESTA RUTA DE IMPORTACIÓN!
import com.supermercado.supermercado_backend.pedidos.LineaPedido;
import com.supermercado.supermercado_backend.pedidos.Pedido;
import com.supermercado.supermercado_backend.pedidos.PedidoEstado;
import com.supermercado.supermercado_backend.payload.request.CrearPedidoRequest; // ¡Importante: Nuevo DTO!
import com.supermercado.supermercado_backend.repositories.LineaPedidoRepository;
import com.supermercado.supermercado_backend.repositories.PedidoRepository;
import com.supermercado.supermercado_backend.repositories.ProductoRepository;
import com.supermercado.supermercado_backend.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private LineaPedidoRepository lineaPedidoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Transactional // Esto asegura que si algo falla, todos los cambios se deshacen (rollback)
    public Pedido crearPedido(CrearPedidoRequest crearPedidoRequest) { // <<-- ¡CAMBIO IMPORTANTE EN LOS PARÁMETROS!
        // 1. Obtener el usuario autenticado (el que está logueado y haciendo el pedido)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // Obtiene el nombre de usuario (ej: "juan.perez")
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario autenticado no encontrado: " + username));

        // 2. Crear un nuevo objeto Pedido
        Pedido pedido = new Pedido();
        pedido.setUser(user); // Asigna el usuario al pedido
        pedido.setFechaPedido(LocalDateTime.now()); // Establece la fecha y hora actual
        pedido.setEstado(PedidoEstado.PENDIENTE); // El pedido inicia en estado PENDIENTE
        pedido.setTotal(BigDecimal.ZERO); // Inicializa el total en cero, se calculará más abajo

        BigDecimal totalDelPedido = BigDecimal.ZERO; // Variable para ir sumando el total

        // 3. Recorrer cada "ítem" (producto y cantidad) que viene en la solicitud del frontend
        for (CrearPedidoRequest.ItemPedidoRequest itemRequest : crearPedidoRequest.getItems()) {
            Long productoId = itemRequest.getProductoId();
            Integer cantidad = itemRequest.getCantidad();

            // Validaciones
            if (cantidad == null || cantidad <= 0) {
                throw new IllegalArgumentException("La cantidad para el producto con ID " + productoId + " debe ser mayor a cero.");
            }

            // Buscar el producto en la base de datos
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con ID: " + productoId));

            // Validar stock disponible
            if (producto.getStock() < cantidad) {
                throw new IllegalArgumentException("Stock insuficiente para el producto: " + producto.getNombre() + ". Stock disponible: " + producto.getStock());
            }

            // Obtener el precio actual del producto (usando BigDecimal para precisión en dinero)
            BigDecimal precioUnitario = producto.getPrecio();
            
            // Crear una nueva LineaPedido para este producto
            LineaPedido linea = new LineaPedido(pedido, producto, cantidad, precioUnitario);
            // El subtotal de 'linea' se calculará automáticamente debido al método @PrePersist en LineaPedido.java

            // Agregar la línea de pedido al conjunto de líneas del pedido principal
            pedido.addLineaPedido(linea); 
            
            // Sumar el subtotal de esta línea al total general del pedido
            totalDelPedido = totalDelPedido.add(linea.getSubtotal());

            // Disminuir el stock del producto en la base de datos
            producto.setStock(producto.getStock() - cantidad);
            productoRepository.save(producto); // Guarda el producto con el stock actualizado
        }

        // 4. Asignar el total calculado al pedido principal
        pedido.setTotal(totalDelPedido);

        // 5. Guardar el Pedido completo en la base de datos.
        // Gracias a CascadeType.ALL en Pedido.java, las LineaPedido asociadas también se guardarán.
        return pedidoRepository.save(pedido);
    }

    // --- Métodos de consulta de pedidos ---

    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorUsuario() { // Obtiene los pedidos del usuario autenticado
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con username: " + username));
        return pedidoRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Pedido obtenerPedidoPorId(Long pedidoId) { // Obtiene un pedido por su ID
        return pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado con ID: " + pedidoId));
    }

    // Puedes añadir aquí más métodos si los necesitas, como actualizarEstadoPedido, cancelarPedido, etc.
}