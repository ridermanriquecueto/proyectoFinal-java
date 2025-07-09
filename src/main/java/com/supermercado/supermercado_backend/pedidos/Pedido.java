package com.supermercado.supermercado_backend.pedidos;

import jakarta.persistence.*;
import java.math.BigDecimal; 
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.supermercado.supermercado_backend.models.User; // <<-- ¡VERIFICA ESTA RUTA DE IMPORTACIÓN!

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<LineaPedido> lineasPedido = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime fechaPedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PedidoEstado estado;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    public Pedido() {
        this.fechaPedido = LocalDateTime.now();
        this.estado = PedidoEstado.PENDIENTE;
        this.total = BigDecimal.ZERO; 
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Set<LineaPedido> getLineasPedido() { return lineasPedido; }
    public void setLineasPedido(Set<LineaPedido> lineasPedido) { this.lineasPedido = lineasPedido; }

    public LocalDateTime getFechaPedido() { return fechaPedido; }
    public void setFechaPedido(LocalDateTime fechaPedido) { this.fechaPedido = fechaPedido; }

    public PedidoEstado getEstado() { return estado; }
    public void setEstado(PedidoEstado estado) { this.estado = estado; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    // Método de utilidad para agregar una LineaPedido y mantener la relación bidireccional
    public void addLineaPedido(LineaPedido lineaPedido) {
        this.lineasPedido.add(lineaPedido);
        lineaPedido.setPedido(this);
    }
}