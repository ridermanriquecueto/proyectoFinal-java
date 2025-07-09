document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos las referencias a los elementos HTML donde mostraremos los pedidos
    const ordersHistoryContainer = document.getElementById('orders-history-container');
    const emptyOrdersHistoryMessage = document.getElementById('empty-orders-history-message');

    /**
     * Función asíncrona para obtener el historial de pedidos.
     * En una aplicación real, esto haría una llamada a tu API REST de Spring Boot.
     */
    async function fetchOrderHistory() {
        // --- INICIO: CÓDIGO PARA CONEXIÓN REAL CON TU BACKEND ---
        // Descomenta y ajusta esta sección cuando tengas tu endpoint RESTful.
        // Reemplaza '/api/historial-pedidos' con la URL real de tu API.
        // try {
        //     const response = await fetch('/api/historial-pedidos'); 
        //     if (!response.ok) {
        //         // Manejo de errores si la respuesta no es exitosa (ej. 404, 500)
        //         const errorText = await response.text();
        //         throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        //     }
        //     const data = await response.json(); // Parsea la respuesta JSON
        //     return data;
        // } catch (error) {
        //     console.error('Error al obtener el historial de pedidos:', error);
        //     // Podrías mostrar un mensaje al usuario aquí
        //     return []; // Retornar un array vacío para que no falle la renderización
        // }
        // --- FIN: CÓDIGO PARA CONEXIÓN REAL CON TU BACKEND ---


        // --- INICIO: DATOS SIMULADOS (PARA DESARROLLO FRONTEND) ---
        // Este bloque se usa SOLO para que el frontend funcione sin el backend aún.
        // DEBES ELIMINAR O COMENTAR ESTE BLOQUE cuando conectes con tu backend real.
        console.log("Cargando datos simulados para historial de pedidos...");
        return [
            {
                id: 'PEDIDO-001-XYZ789',
                date: '2024-06-25',
                status: 'entregado',
                total: 55.75,
            },
            {
                id: 'PEDIDO-002-ABC123',
                date: '2024-06-20',
                status: 'enviado',
                total: 30.20,
            },
            {
                id: 'PEDIDO-003-JKL456',
                date: '2024-06-18',
                status: 'pendiente',
                total: 12.00,
            },
            {
                id: 'PEDIDO-004-MNO001',
                date: '2024-06-15',
                status: 'cancelado',
                total: 8.50,
            }
        ];
        // --- FIN: DATOS SIMULADOS ---
    }

    /**
     * Función para renderizar los pedidos obtenidos en la interfaz de usuario.
     */
    async function renderOrderHistory() {
        const orders = await fetchOrderHistory(); // Obtenemos los pedidos

        // Si no hay pedidos, mostramos el mensaje correspondiente
        if (orders.length === 0) {
            emptyOrdersHistoryMessage.style.display = 'block';
            ordersHistoryContainer.innerHTML = ''; // Asegurarse de que no haya nada viejo
            return;
        } else {
            emptyOrdersHistoryMessage.style.display = 'none'; // Ocultar el mensaje si hay pedidos
        }

        ordersHistoryContainer.innerHTML = ''; // Limpiamos el contenedor antes de añadir nuevos pedidos

        // Iteramos sobre cada pedido y creamos su tarjeta HTML
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.classList.add('order-history-card');
            // Guardamos el ID del pedido en un atributo de datos para usarlo al hacer clic
            orderCard.setAttribute('data-order-id', order.id); 

            // Construimos el HTML de la tarjeta de pedido
            orderCard.innerHTML = `
                <div class="order-history-summary">
                    <h3>Pedido #${order.id}</h3>
                    <span class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
                <div class="order-history-details">
                    <p>Fecha: ${order.date}</p>
                </div>
                <div class="order-history-total">
                    Total: $${order.total.toFixed(2)}
                </div>
            `;
            ordersHistoryContainer.appendChild(orderCard);

            // Añadimos un evento de clic a cada tarjeta de pedido
            // Esto permite al usuario ir a la página de detalles del pedido específico.
            orderCard.addEventListener('click', () => {
                // Redirigimos a pedidos.html pasando el ID del pedido como un parámetro de URL
                // Tu archivo pedidos.js (el de los detalles de un único pedido)
                // deberá leer este parámetro 'orderId' para cargar los datos correctos.
                console.log(`Navegando a detalles del Pedido #${order.id}`);
                window.location.href = `pedidos.html?orderId=${order.id}`; 
            });
        });
    }

    // Ejecutamos la función para renderizar el historial de pedidos
    // una vez que todo el DOM de la página ha sido cargado.
    renderOrderHistory();
});