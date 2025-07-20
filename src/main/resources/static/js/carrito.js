    // src/main/resources/static/js/carrito.js

    import { getAuthHeader, handleAuthErrorFrontend, getUserInfo, logout, displayMessage } from './auth-utils.js';

    document.addEventListener('DOMContentLoaded', async () => {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalSpan = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const checkoutButton = document.getElementById('checkout-button');
        const clearCartButton = document.getElementById('clear-cart-button');
        const continueShoppingButton = document.getElementById('continue-shopping-button');

        const API_CART_URL = '/api/cart';
        const API_PEDIDOS_FINALIZAR_COMPRA_URL = '/api/pedidos/finalizarCompra';

        // Función para cargar el carrito del usuario desde el backend
        async function loadCart() {
            console.log('Iniciando carga del carrito...');
            cartItemsContainer.innerHTML = '<p>Cargando carrito...</p>';
            cartTotalSpan.textContent = '0.00';
            emptyCartMessage.style.display = 'none';
            checkoutButton.disabled = true;
            clearCartButton.disabled = true;

            const authHeader = getAuthHeader();
            if (Object.keys(authHeader).length === 0) {
                // Si no hay token de autenticación, el usuario no está logueado.
                // El backend devolverá un carrito vacío para usuarios no autenticados en el endpoint GET /api/cart
                // o redirigirá si intenta una acción que requiere autenticación (POST/PUT/DELETE).
                // Aquí, simplemente mostramos el mensaje de que deben iniciar sesión.
                displayMessage('No estás autenticado. Por favor, inicia sesión para ver y gestionar tu carrito.', 'info');
                // No forzamos redirección aquí para que puedan ver el carrito vacío si lo desean.
            }

            try {
                const response = await fetch(API_CART_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeader // Incluye el token si existe
                    }
                });

                if (response.ok) {
                    const cartData = await response.json();
                    console.log('Datos del carrito recibidos del backend:', cartData); // LOG PRINCIPAL
                    renderCart(cartData);
                } else {
                    // Si el error es 401/403, handleAuthErrorFrontend redirigirá
                    if (!await handleAuthErrorFrontend(response.status)) {
                        const errorText = await response.text();
                        let errorMessage = `Error al cargar el carrito: ${response.statusText}`;
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMessage = `Error al cargar el carrito: ${errorData.message || errorData.error || response.statusText}`;
                        } catch (e) {
                            errorMessage = `Error al cargar el carrito: ${errorText || response.statusText}`;
                        }
                        displayMessage(errorMessage, 'error');
                        cartItemsContainer.innerHTML = `<p class="error">${errorMessage}</p>`;
                        console.error('Respuesta de error del backend al cargar carrito:', response.status, errorText);
                    }
                }
            } catch (error) {
                console.error('Error de red al cargar el carrito:', error);
                displayMessage('Error de conexión al servidor al cargar el carrito.', 'error');
                cartItemsContainer.innerHTML = '<p class="error">No se pudo conectar al servidor para cargar el carrito.</p>';
            }
        }

        // Función para renderizar el contenido del carrito en el HTML
        function renderCart(cartData) {
            console.log('Iniciando renderizado del carrito con datos:', cartData); // LOG
            cartItemsContainer.innerHTML = ''; // Limpiar el contenedor actual

            if (!cartData || !cartData.items || cartData.items.length === 0) {
                console.log('Carrito vacío o datos no válidos.'); // LOG
                emptyCartMessage.style.display = 'block';
                checkoutButton.disabled = true;
                clearCartButton.disabled = true;
                cartTotalSpan.textContent = '0.00';
                return;
            }

            emptyCartMessage.style.display = 'none';
            checkoutButton.disabled = false;
            clearCartButton.disabled = false;

            cartData.items.forEach(item => {
                console.log('Procesando ítem del carrito:', item); // LOG
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                
                // Asegúrate de que item.priceAtAddToCart y item.subtotal sean números antes de toFixed
                const price = typeof item.priceAtAddToCart === 'number' ? item.priceAtAddToCart : parseFloat(item.priceAtAddToCart);
                const subtotal = typeof item.subtotal === 'number' ? item.subtotal : parseFloat(item.subtotal);

                itemElement.innerHTML = `
                    <img src="${item.productImage || 'https://placehold.co/80x80?text=No+Img'}" alt="${item.productName}" class="item-image">
                    <div class="item-details">
                        <span class="item-name">${item.productName}</span>
                        <span class="item-price">$${price.toFixed(2)} c/u</span>
                    </div>
                    <div class="item-quantity-controls">
                        <button class="quantity-btn decrease-quantity" data-product-id="${item.productId}" data-current-quantity="${item.quantity}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-product-id="${item.productId}" data-current-quantity="${item.quantity}">+</button>
                    </div>
                    <span class="item-subtotal">$${subtotal.toFixed(2)}</span>
                    <button class="remove-item-btn" data-product-id="${item.productId}"><i class="fas fa-trash-alt"></i></button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });

            // Asegúrate de que cartData.total sea un número antes de toFixed
            const total = typeof cartData.total === 'number' ? cartData.total : parseFloat(cartData.total);
            cartTotalSpan.textContent = total.toFixed(2);
            console.log('Total del carrito actualizado:', total.toFixed(2)); // LOG

            // Añadir event listeners a los botones de cantidad y eliminar
            cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const productId = e.currentTarget.dataset.productId;
                    const currentQuantity = parseInt(e.currentTarget.dataset.currentQuantity);
                    await updateCartItemQuantity(productId, currentQuantity - 1);
                });
            });

            cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const productId = e.currentTarget.dataset.productId;
                    const currentQuantity = parseInt(e.currentTarget.dataset.currentQuantity);
                    await updateCartItemQuantity(productId, currentQuantity + 1);
                });
            });

            cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const productId = e.currentTarget.dataset.productId;
                    // Usar un modal en lugar de confirm si es posible en el futuro
                    if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
                        await removeProductFromCart(productId);
                    }
                });
            });
        }

        // Función para actualizar la cantidad de un ítem en el carrito
        async function updateCartItemQuantity(productId, newQuantity) {
            const authHeader = getAuthHeader();
            if (Object.keys(authHeader).length === 0) {
                displayMessage('Debes iniciar sesión para modificar el carrito.', 'error');
                handleAuthErrorFrontend(401); // Esto redirigirá al login
                return;
            }

            try {
                const response = await fetch(`${API_CART_URL}/update-quantity?productId=${productId}&newQuantity=${newQuantity}`, {
                    method: 'PUT',
                    headers: authHeader
                });

                if (response.ok) {
                    displayMessage('Cantidad actualizada.', 'success');
                    loadCart(); // Recargar el carrito para reflejar los cambios
                } else {
                    if (!await handleAuthErrorFrontend(response.status)) {
                        const errorText = await response.text();
                        let errorMessage = `Error al actualizar cantidad: ${response.statusText}`;
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMessage = `Error al actualizar cantidad: ${errorData.message || errorData.error || response.statusText}`;
                        } catch (e) {
                            errorMessage = `Error al actualizar cantidad: ${errorText || response.statusText}`;
                        }
                        displayMessage(errorMessage, 'error');
                    }
                }
            } catch (error) {
                console.error('Error de red al actualizar cantidad:', error);
                displayMessage('Error de conexión al servidor.', 'error');
            }
        }

        // Función para eliminar un producto del carrito
        async function removeProductFromCart(productId) {
            const authHeader = getAuthHeader();
            if (Object.keys(authHeader).length === 0) {
                displayMessage('Debes iniciar sesión para modificar el carrito.', 'error');
                handleAuthErrorFrontend(401);
                return;
            }

            try {
                const response = await fetch(`${API_CART_URL}/remove?productId=${productId}`, {
                    method: 'DELETE',
                    headers: authHeader
                });

                if (response.ok) {
                    displayMessage('Producto eliminado del carrito.', 'success');
                    loadCart(); // Recargar el carrito para reflejar los cambios
                } else {
                    if (!await handleAuthErrorFrontend(response.status)) {
                        const errorText = await response.text();
                        let errorMessage = `Error al eliminar producto: ${response.statusText}`;
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMessage = `Error al eliminar producto: ${errorData.message || errorData.error || response.statusText}`;
                        } catch (e) {
                            errorMessage = `Error al eliminar producto: ${errorText || response.statusText}`;
                        }
                        displayMessage(errorMessage, 'error');
                    }
                }
            } catch (error) {
                console.error('Error de red al eliminar producto:', error);
                displayMessage('Error de conexión al servidor.', 'error');
            }
        }

        // Función para vaciar el carrito
        async function clearCart() {
            if (!confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
                return;
            }

            const authHeader = getAuthHeader();
            if (Object.keys(authHeader).length === 0) {
                displayMessage('Debes iniciar sesión para vaciar el carrito.', 'error');
                handleAuthErrorFrontend(401);
                return;
            }

            try {
                const response = await fetch(`${API_CART_URL}/clear`, {
                    method: 'DELETE',
                    headers: authHeader
                });

                if (response.ok) {
                    displayMessage('Carrito vaciado exitosamente.', 'success');
                    loadCart(); // Recargar el carrito para reflejar los cambios
                } else {
                    if (!await handleAuthErrorFrontend(response.status)) {
                        const errorText = await response.text();
                        let errorMessage = `Error al vaciar el carrito: ${response.statusText}`;
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMessage = `Error al vaciar el carrito: ${errorData.message || errorData.error || response.statusText}`;
                        } catch (e) {
                            errorMessage = `Error al vaciar el carrito: ${errorText || response.statusText}`;
                        }
                        displayMessage(errorMessage, 'error');
                    }
                }
            } catch (error) {
                console.error('Error de red al vaciar el carrito:', error);
                displayMessage('Error de conexión al servidor.', 'error');
            }
        }

        // Función para finalizar la compra
        async function finalizePurchase() {
            const authHeader = getAuthHeader();
            if (Object.keys(authHeader).length === 0) {
                displayMessage('Debes iniciar sesión para finalizar la compra.', 'error');
                handleAuthErrorFrontend(401);
                return;
            }

            // Verificar el carrito antes de finalizar la compra
            const currentCartResponse = await fetch(API_CART_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                }
            });

            if (!currentCartResponse.ok) {
                displayMessage('No se pudo verificar el contenido del carrito. Intenta de nuevo.', 'error');
                return;
            }
            const currentCartData = await currentCartResponse.json();
            if (!currentCartData || !currentCartData.items || currentCartData.items.length === 0) {
                displayMessage('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'warning');
                return;
            }

            if (!confirm('¿Estás seguro de que quieres finalizar la compra?')) {
                return;
            }

            try {
                const response = await fetch(API_PEDIDOS_FINALIZAR_COMPRA_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeader
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    displayMessage(result.message || '¡Compra finalizada exitosamente!', 'success');
                    loadCart(); // Recargar el carrito para que se muestre vacío
                } else {
                    if (!await handleAuthErrorFrontend(response.status)) {
                        const errorText = await response.text();
                        let errorMessage = `Error al finalizar la compra: ${response.statusText}`;
                        try {
                            const errorData = JSON.parse(errorText);
                            errorMessage = `Error al finalizar la compra: ${errorData.message || errorData.error || response.statusText}`;
                        } catch (e) {
                            errorMessage = `Error al finalizar la compra: ${errorText || response.statusText}`;
                        }
                        displayMessage(errorMessage, 'error');
                    }
                }
            } catch (error) {
                console.error('Error de red al finalizar la compra:', error);
                displayMessage('Error de conexión al servidor al finalizar la compra.', 'error');
            }
        }

        // Asignar event listeners a los botones
        if (clearCartButton) {
            clearCartButton.addEventListener('click', clearCart);
        }
        if (continueShoppingButton) {
            continueShoppingButton.addEventListener('click', () => {
                window.location.href = '/pages/catalogo.html';
            });
        }
        if (checkoutButton) {
            checkoutButton.addEventListener('click', finalizePurchase);
        }

        // Cargar el carrito al iniciar la página
        loadCart();
    });
    