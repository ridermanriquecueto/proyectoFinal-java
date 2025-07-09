// src/main/resources/static/js/pedidos-view.js

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const orderIdInput = document.getElementById('order-id-input');
    const searchOrderBtn = document.getElementById('search-order-btn');
    const listAllOrdersBtn = document.getElementById('list-all-orders-btn');
    const ordersDisplayArea = document.getElementById('orders-display-area');
    const orderMessageDiv = document.getElementById('order-message');

    // URL base de tu API de Spring Boot
    const API_BASE_URL = 'http://localhost:8080/api/pedidos'; // ¡Asegúrate de que esta sea la URL correcta!

    /**
     * Función auxiliar para mostrar mensajes de estado al usuario.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - Tipo de mensaje ('info', 'success', 'warning', 'danger').
     */
    function showMessage(message, type = 'info') {
        orderMessageDiv.textContent = message;
        orderMessageDiv.className = `message ${type}`; // Aplica clases CSS para estilo
        orderMessageDiv.style.display = 'block';
    }

    /**
     * Función auxiliar para limpiar el contenido principal y los mensajes.
     */
    function clearContentAndMessages() {
        ordersDisplayArea.innerHTML = ''; // Limpia pedidos/detalles anteriores
        orderMessageDiv.textContent = '';
        orderMessageDiv.style.display = 'none';
        orderMessageDiv.className = 'message';
    }

    /**
     * Renderiza los detalles completos de un único pedido.
     * @param {Object} order - Objeto del pedido con sus ítems.
     */
    function renderOrderDetails(order) {
        clearContentAndMessages(); // Limpia el área antes de renderizar

        // Asegúrate de que order.items sea un array, o un array vacío si no existe
        const orderItems = Array.isArray(order.items) ? order.items : [];

        ordersDisplayArea.innerHTML = `
            <div class="order-details-card">
                <h3>Detalles del Pedido #${order.id}</h3>
                <p><strong>Fecha:</strong> ${new Date(order.fechaCreacion).toLocaleString()}</p>
                <p><strong>Total:</strong> $${parseFloat(order.total).toFixed(2)}</p>
                <p><strong>Estado:</strong> <span class="status ${order.estado}">${order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}</span></p>
                
                <div class="order-items-list">
                    <h4>Productos:</h4>
                    <ul>
                        ${orderItems.length > 0 ? orderItems.map(item => `
                            <li>
                                <img src="${item.producto && item.producto.imageUrl ? item.producto.imageUrl : 'https://via.placeholder.com/50x50?text=No+Image'}" alt="${item.producto ? item.producto.nombre : 'Producto'}" class="order-item-image">
                                <div class="item-details">
                                    <span>${item.producto ? item.producto.nombre : 'Producto Desconocido'}</span>
                                    <span> (x${item.cantidad})</span>
                                </div>
                                <span class="item-price">$${parseFloat(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                            </li>
                        `).join('') : '<li>No hay productos en este pedido.</li>'}
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza una lista de pedidos en formato de tarjetas de resumen.
     * @param {Array} orders - Lista de objetos de pedido (resumen).
     */
    function renderOrderList(orders) {
        clearContentAndMessages(); // Limpia el área antes de renderizar

        if (orders.length === 0) {
            ordersDisplayArea.innerHTML = '<p class="message warning">No se encontraron pedidos.</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('order-history-card'); // Clase para las tarjetas de resumen

            orderCard.innerHTML = `
                <div class="order-history-summary">
                    <h3>Pedido #${order.id}</h3>
                    <span class="status ${order.estado}">${order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}</span>
                </div>
                <div class="order-history-details">
                    <p>Fecha: ${new Date(order.fechaCreacion).toLocaleDateString()}</p>
                </div>
                <div class="order-history-total">
                    Total: $${parseFloat(order.total).toFixed(2)}
                </div>
            `;
            // Añade un evento click a cada tarjeta para ver los detalles
            orderCard.addEventListener('click', () => {
                // Redirige a la misma página, pero con el ID del pedido en la URL
                window.location.href = `pedidos.html?orderId=${order.id}`;
            });

            ordersDisplayArea.appendChild(orderCard);
        });
    }

    /**
     * Obtiene un pedido específico por ID o todos los pedidos desde la API.
     * @param {string | null} orderId - El ID del pedido a buscar, o null para obtener todos.
     */
    async function fetchOrders(orderId = null) {
        clearContentAndMessages();
        ordersDisplayArea.innerHTML = '<p style="text-align: center; color: #555;">Cargando pedidos...</p>';

        let url = API_BASE_URL;
        if (orderId) {
            if (isNaN(orderId)) { // Valida que el ID sea numérico
                showMessage('Por favor, ingrese un ID de pedido válido (solo números).', 'error');
                ordersDisplayArea.innerHTML = ''; // Limpia el mensaje de carga
                return;
            }
            url = `${API_BASE_URL}/${orderId}`; // Endpoint para un solo pedido
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404 && orderId) {
                    showMessage(`Pedido con ID ${orderId} no encontrado.`, 'error');
                } else {
                    throw new Error(`Error al cargar pedidos: ${response.statusText} (${response.status})`);
                }
                ordersDisplayArea.innerHTML = ''; // Limpia el mensaje de carga en caso de error
                return;
            }

            const data = await response.json();
            console.log("Datos recibidos:", data); // Para depuración

            if (orderId) {
                // Si se buscó un solo pedido
                if (data) { // Asegura que los datos no sean nulos/indefinidos
                    renderOrderDetails(data);
                    showMessage(`Pedido #${data.id} cargado exitosamente.`, 'success');
                } else {
                    showMessage(`No se encontró el pedido con ID: ${orderId}.`, 'warning');
                }
            } else {
                // Si se listaron todos los pedidos
                if (Array.isArray(data) && data.length > 0) {
                    renderOrderList(data);
                    showMessage(`Se cargaron ${data.length} pedidos.`, 'success');
                } else {
                    ordersDisplayArea.innerHTML = '<p class="message info">No hay pedidos registrados.</p>';
                    showMessage('No hay pedidos registrados.', 'info');
                }
            }

        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            showMessage('Error al cargar los pedidos. Por favor, intente de nuevo más tarde.', 'danger');
            ordersDisplayArea.innerHTML = ''; // Limpia el mensaje de carga en caso de error
        }
    }

    // --- Listeners de Eventos ---
    searchOrderBtn.addEventListener('click', () => {
        const orderId = orderIdInput.value.trim();
        fetchOrders(orderId);
    });

    listAllOrdersBtn.addEventListener('click', () => {
        fetchOrders(); // Llama sin ID para listar todos los pedidos
    });

    // Carga inicial al cargar la página (si hay un orderId en la URL)
    const urlParams = new URLSearchParams(window.location.search);
    const initialOrderId = urlParams.get('orderId');
    if (initialOrderId) {
        orderIdInput.value = initialOrderId; // Rellena el input si viene de un click
        fetchOrders(initialOrderId);
    } else {
        // Muestra el mensaje inicial si no hay un ID en la URL al cargar la página
        ordersDisplayArea.innerHTML = '<p class="initial-message">Usa las opciones de arriba para ver tus pedidos.</p>';
        // Opcional: Para cargar todos los pedidos por defecto al abrir la página, descomenta la siguiente línea:
        // fetchOrders(); 
    }
});