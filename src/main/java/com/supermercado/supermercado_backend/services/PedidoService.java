// src/main/java/com/supermercado/supermercado_backend/services/PedidoService.java
package com.supermercado.supermercado_backend.services;

import com.supermercado.supermercado_backend.excepciones.RecursoNoEncontradoException;
import com.supermercado.supermercado_backend.models.User;
import com.supermercado.supermercado_backend.models.cart.Cart;
import com.supermercado.supermercado_backend.models.cart.CartItem;
import com.supermercado.supermercado_backend.models.productos.Producto;
import com.supermercado.supermercado_backend.pedidos.LineaPedido;
import com.supermercado.supermercado_backend.pedidos.Pedido;
import com.supermercado.supermercado_backend.pedidos.PedidoEstado;
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
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + userId));

        Cart cart = cartRepository.findByUser(user)
            .orElseThrow(() -> new RecursoNoEncontradoException("Carrito no encontrado para el usuario: " + user.getUsername()));

        Set<CartItem> cartItems = cart.getItems();
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("El carrito del usuario está vacío. No se puede crear un pedido.");
        }

        Pedido pedido = new Pedido();
        pedido.setUser(user);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado(PedidoEstado.PENDIENTE);
        pedido.setTotal(BigDecimal.ZERO);

        BigDecimal totalDelPedido = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Producto producto = cartItem.getProduct(); // Correcto: getProduct() de CartItem
            int cantidadEnCarrito = cartItem.getQuantity();

            if (cantidadEnCarrito <= 0) {
                throw new IllegalArgumentException("Cantidad inválida en el carrito para el producto: " + producto.getNombre()); // Correcto: getNombre() de Producto
            }

            // Obtener el producto actualizado de la base de datos para asegurar el stock y precio más recientes
            Producto productoActualizado = productoRepository.findById(producto.getId()) // Correcto: getId() de Producto
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado (ID: " + producto.getId() + ") durante la creación del pedido.")); // Correcto: getId() de Producto

            if (productoActualizado.getStock() < cantidadEnCarrito) { // Correcto: getStock() de Producto
                throw new IllegalArgumentException("Stock insuficiente para el producto: " + productoActualizado.getNombre() + ". Stock disponible: " + productoActualizado.getStock()); // Correcto: getNombre(), getStock() de Producto
            }

            BigDecimal precioUnitarioAlMomentoDeLaCompra = productoActualizado.getPrecio(); // Correcto: getPrecio() de Producto
            LineaPedido linea = new LineaPedido(pedido, productoActualizado, cantidadEnCarrito, precioUnitarioAlMomentoDeLaCompra);
            pedido.addLineaPedido(linea);

            totalDelPedido = totalDelPedido.add(linea.getSubtotal());

            productoActualizado.setStock(productoActualizado.getStock() - cantidadEnCarrito); // Correcto: getStock() de Producto
            productoRepository.save(productoActualizado);
        }

        pedido.setTotal(totalDelPedido);
        Pedido nuevoPedido = pedidoRepository.save(pedido);

        cartItemRepository.deleteAll(cartItems);
        cart.getItems().clear();
        cartRepository.save(cart);

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
