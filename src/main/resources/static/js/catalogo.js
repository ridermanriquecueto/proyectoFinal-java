// src/main/resources/static/js/catalogo.js

// Importar funciones de auth-utils.js
import { getAuthHeader, handleAuthErrorFrontend, displayMessage } from './auth-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('products-container');
    const cartCountSpan = document.getElementById('cart-count-catalog'); // Contador de ítems en el carrito
    const cartButton = document.getElementById('cart-button'); // Botón para ir al carrito
    const backToMenuButton = document.getElementById('back-to-menu-button'); // Botón para volver al menú principal

    const API_PRODUCTS_URL = '/api/productos'; // Endpoint de tu backend para productos
    const API_CART_ADD_URL = '/api/cart/add'; // Endpoint para añadir al carrito
    const API_CART_GET_URL = '/api/cart'; // Endpoint para obtener el carrito (para el contador)

    // Función para actualizar el contador de ítems del carrito en el header
    async function updateCartCounter() {
        const authHeader = getAuthHeader();
        if (Object.keys(authHeader).length === 0) {
            cartCountSpan.textContent = '0'; // Si no hay token, el carrito está vacío
            return;
        }

        try {
            const response = await fetch(API_CART_GET_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                }
            });

            if (response.ok) {
                const cartData = await response.json();
                // Sumar las cantidades de todos los ítems en el carrito
                const totalItems = cartData.items ? cartData.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                cartCountSpan.textContent = totalItems;
            } else {
                // No mostrar un error grande si solo falla el contador, pero loguear
                console.error('Error al cargar el contador del carrito:', response.status, response.statusText);
                cartCountSpan.textContent = '0';
            }
        } catch (error) {
            console.error('Error de red al cargar el contador del carrito:', error);
            cartCountSpan.textContent = '0';
        }
    }

    // Función para cargar los productos del catálogo
    async function loadProducts() {
        productsContainer.innerHTML = '<p style="text-align: center; color: var(--secondary-color);">Cargando productos...</p>';
        const authHeader = getAuthHeader(); // Obtener el token para la autorización
        console.log('Auth Header para cargar productos:', authHeader); // <-- LOG AÑADIDO: Verifica si el token se está enviando

        try {
            const response = await fetch(API_PRODUCTS_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader // Incluir el token JWT en la petición
                }
            });

            if (response.ok) {
                const products = await response.json();
                console.log('Productos obtenidos de la API:', products);
                renderProducts(products);
            } else {
                // Si hay un error de autenticación, handleAuthErrorFrontend se encargará de guardar la URL y redirigir
                if (!await handleAuthErrorFrontend(response.status)) {
                    // Mejorar el parseo de errores para mensajes más claros
                    const errorText = await response.text();
                    let errorMessage = `Error al cargar productos: ${response.statusText}`;
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = `Error al cargar productos: ${errorData.message || errorData.error || response.statusText}`;
                    } catch (e) {
                        errorMessage = `Error al cargar productos: ${errorText || response.statusText}`;
                    }
                    displayMessage(errorMessage, 'error');
                    productsContainer.innerHTML = `<p class="error-message">${errorMessage}</p>`; // Mostrar el error en la página
                }
            }
        } catch (error) {
            console.error('Error de red al obtener productos:', error);
            displayMessage('Error de conexión al servidor al cargar el catálogo.', 'error');
            productsContainer.innerHTML = '<p class="error-message">No se pudo conectar al servidor para cargar productos.</p>';
        }
    }

    // Función para renderizar los productos en el catálogo
    function renderProducts(products) {
        productsContainer.innerHTML = ''; // Limpiar el contenedor actual

        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles en este momento.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const imageUrl = product.imagen && product.imagen.startsWith('http') ? product.imagen : 'https://placehold.co/150x150?text=No+Image';

            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.nombre}" class="product-image">
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-description">${product.descripcion || 'Sin descripción'}</p>
                <p class="product-price">$${product.precio ? parseFloat(product.precio).toFixed(2) : '0.00'}</p>
                <p class="product-stock">Stock: ${product.stock || 0}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}" data-product-stock="${product.stock || 0}" ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock > 0 ? '<i class="fas fa-cart-plus"></i> Añadir al Carrito' : 'Sin Stock'}
                </button>
            `;
            productsContainer.appendChild(productCard);
        });

        // Añadir event listeners a los botones "Añadir al Carrito"
        productsContainer.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.currentTarget.dataset.productId;
                const productStock = parseInt(event.currentTarget.dataset.productStock);

                if (productStock <= 0) {
                    displayMessage('Producto sin stock disponible.', 'warning');
                    return;
                }

                await addProductToCart(productId, 1); // Añadir 1 unidad por defecto
            });
        });
    }

    // Función para añadir un producto al carrito (llama al backend)
    async function addProductToCart(productId, quantity) {
        const authHeader = getAuthHeader();
        if (Object.keys(authHeader).length === 0) {
            displayMessage('Debes iniciar sesión para añadir productos al carrito.', 'error');
            handleAuthErrorFrontend(401); // Forzar el manejo de error de autenticación
            return;
        }

        try {
            const response = await fetch(API_CART_ADD_URL, { // URL sin query params
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indicar que el body es JSON
                    ...authHeader
                },
                body: JSON.stringify({ // Enviar el body como JSON
                    productId: parseInt(productId), // Asegurar que sea número
                    quantity: quantity
                })
            });

            if (response.ok) {
                displayMessage('Producto añadido al carrito!', 'success');
                updateCartCounter(); // Actualizar el contador del carrito en el header
            } else {
                // Si hay un error de autenticación, handleAuthErrorFrontend se encargará
                if (!await handleAuthErrorFrontend(response.status)) {
                    const errorText = await response.text(); // Obtener el texto de la respuesta
                    let errorMessage = `Error al añadir al carrito: ${response.statusText}`;
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = `Error al añadir al carrito: ${errorData.message || errorData.error || response.statusText}`;
                    } catch (e) {
                        errorMessage = `Error al añadir al carrito: ${errorText || response.statusText}`;
                    }
                    displayMessage(errorMessage, 'error');
                }
            }
        } catch (error) {
            console.error('Error de red al añadir al carrito:', error);
            displayMessage('Error de conexión al servidor al añadir al carrito.', 'error');
        }
    }

    // Event Listeners para los botones de navegación
    if (cartButton) {
        cartButton.addEventListener('click', () => {
            window.location.href = '/pages/carrito.html';
        });
    }

    if (backToMenuButton) {
        backToMenuButton.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }

    // Inicialización: Cargar productos y actualizar contador al cargar la página
    loadProducts();
    updateCartCounter();
});
