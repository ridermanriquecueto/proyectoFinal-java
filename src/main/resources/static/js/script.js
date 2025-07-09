document.addEventListener('DOMContentLoaded', () => {
    const menuButtons = document.querySelectorAll('.main-menu-grid .menu-item'); // Selecciona todos los botones del menú
    const messageDiv = document.getElementById('message'); // Para mostrar mensajes

    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const option = parseInt(button.dataset.option); // Obtiene el valor de 'data-option'

            messageDiv.textContent = ''; // Limpia mensajes anteriores
            messageDiv.className = 'message'; // Resetea las clases del mensaje

            switch (option) {
                case 1: // Productos
                    console.log('Redirigiendo a Productos...');
                    window.location.href = 'pages/productos.html'; // ¡CORREGIDO!
                    break;
                case 2: // Categorías
                    // Opción A: Redirigir a una página de categorías si la creas y está en 'pages'
                    // Si tienes un archivo 'categorias.html' en la carpeta 'pages':
                    // window.location.href = 'pages/categorias.html'; // Ejemplo: ¡CORREGIDO!
                    // Opción B: Mantener el mensaje si aún está en desarrollo
                    console.log('Funcionalidad de Categorías en desarrollo.');
                    messageDiv.textContent = 'Gestión de Categorías: Funcionalidad en desarrollo.';
                    messageDiv.className = 'message warning';
                    break;
                case 3: // Carrito
                    console.log('Redirigiendo a Carrito...');
                    // Si 'catalogo.html' está en la raíz de static (no en 'pages') y quieres abrir el carrito ahí.
                    // Si 'carrito.html' es una página separada en 'pages', usa 'pages/carrito.html'
                    window.location.href = 'pages/carrito.html'; // ¡CORREGIDO! Asumiendo que carrito.html está en 'pages'
                    break;
                case 4: // Pedido
                    console.log('Redirigiendo a Pedido...');
                    messageDiv.textContent = 'Redirigiendo a la página para realizar un Pedido...';
                    messageDiv.className = 'message success';
                    setTimeout(() => {
                        window.location.href = 'pages/pedidos.html'; // ¡CORREGIDO! (tu archivo es 'pedidos.html', no 'pedido.html')
                    }, 500); // Pequeño retraso para que el usuario lea el mensaje
                    break;
                case 5: // Historial de Pedidos
                    console.log('Redirigiendo a Historial de Pedidos...');
                    window.location.href = 'pages/historial-pedidos.html'; // ¡CORREGIDO! (tu archivo es 'historial-pedidos.html', no 'historial-pedido.html')
                    break;
                case 6: // Administración
                    // Opción A: Redirigir a una página de administración
                    console.log('Redirigiendo a Administración...');
                    window.location.href = 'pages/admin.html'; // ¡CORREGIDO!
                    break;
                case 7: // Salir
                    console.log('Saliendo del sistema.');
                    messageDiv.textContent = 'Saliendo... ¡Hasta pronto!';
                    messageDiv.className = 'message success';
                    setTimeout(() => {
                        alert('Gracias por usar el sistema. Cierre la pestaña del navegador.');
                        // En aplicaciones web, no es común cerrar la ventana directamente.
                        // Podrías redirigir a una página de "gracias" o a la pantalla de login.
                    }, 1000);
                    break;
                default:
                    console.log('Opción no reconocida.');
                    messageDiv.textContent = 'Opción no válida. Por favor, selecciona una acción del menú.';
                    messageDiv.className = 'message error';
            }
        });
    });
});