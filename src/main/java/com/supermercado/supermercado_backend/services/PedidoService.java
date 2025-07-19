package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.models.cart.CartItem; // Importar CartItem
import com.supermercado.supermercado_backend.models.productos.Producto;
import com.supermercado.supermercado_backend.pedidos.LineaPedido;
import com.supermercado.supermercado_backend.pedidos.Pedido;
import com.supermercado.supermercado_backend.pedidos.PedidoEstado;
// import com.supermercado.supermercado_backend.payload.request.CrearPedidoRequest; // YA NO NECESITAMOS ESTO PARA CREAR DESDE CARRITO
import com.supermercado.supermercado_backend.repositories.CartItemRepository;
import com.supermercado.supermercado_backend.repositories.CartRepository;
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
import java.util.Set;

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

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Transactional
    public Pedido crearPedidoDesdeCarrito(Long userId) {
        // 1. Obtener el usuario
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + userId));

        // 2. Obtener el carrito del usuario
        Cart cart = cartRepository.findByUser(user)
            .orElseThrow(() -> new RecursoNoEncontradoException("Carrito no encontrado para el usuario: " + user.getUsername()));

        Set<CartItem> cartItems = cart.getCartItems();
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("El carrito del usuario está vacío. No se puede crear un pedido.");
        }

        // 3. Crear el nuevo Pedido
        Pedido pedido = new Pedido();
        pedido.setUser(user);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado(PedidoEstado.PENDIENTE);
        pedido.setTotal(BigDecimal.ZERO);

        BigDecimal totalDelPedido = BigDecimal.ZERO;

        // 4. Procesar cada ítem del carrito para crear Líneas de Pedido
        for (CartItem cartItem : cartItems) {
            // --- CAMBIO AQUÍ: USAR getProducto() EN LUGAR DE getProduct() ---
            Producto producto = cartItem.getProducto(); // <-- CORREGIDO: ahora usa el getter correcto
            int cantidadEnCarrito = cartItem.getQuantity();

            if (cantidadEnCarrito <= 0) {
                throw new IllegalArgumentException("Cantidad inválida en el carrito para el producto: " + producto.getNombre());
            }

            // 4.1. Validar Stock
            Producto productoActualizado = productoRepository.findById(producto.getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado (ID: " + producto.getId() + ") durante la creación del pedido."));

            if (productoActualizado.getStock() < cantidadEnCarrito) {
                throw new IllegalArgumentException("Stock insuficiente para el producto: " + productoActualizado.getNombre() + ". Stock disponible: " + productoActualizado.getStock());
            }

            // 4.2. Crear LineaPedido
            BigDecimal precioUnitarioAlMomentoDeLaCompra = productoActualizado.getPrecio();
            LineaPedido linea = new LineaPedido(pedido, productoActualizado, cantidadEnCarrito, precioUnitarioAlMomentoDeLaCompra);
            pedido.addLineaPedido(linea);

            // También puedes usar linea.getSubtotal() que ya calcula con precioUnitario y cantidad
            totalDelPedido = totalDelPedido.add(linea.getSubtotal());

            // 4.3. Disminuir el Stock del Producto
            productoActualizado.setStock(productoActualizado.getStock() - cantidadEnCarrito);
            productoRepository.save(productoActualizado);
        }

        // 5. Asignar el total final al pedido
        pedido.setTotal(totalDelPedido);
        // 6. Guardar el Pedido (esto también guarda las LineaPedido debido a CascadeType.ALL)
        Pedido nuevoPedido = pedidoRepository.save(pedido);

        // 7. Vaciar el carrito del usuario
        cartItemRepository.deleteAll(cartItems);

        return nuevoPedido;
    }

    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosPorUsuario() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + username));
        return pedidoRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Pedido obtenerPedidoPorId(Long pedidoId) {
        return pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado con ID: " + pedidoId));
    }
}