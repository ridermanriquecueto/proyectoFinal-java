// src/main/resources/static/js/carrito-view.js

import {
    getCart,
    removeItemFromCart,
    changeItemQuantity,
    clearAllCart,
    getCartTotalItems,
    getCartTotalPrice
} from './carrito.js';

// Importa la función para obtener el JWT.
// Asegúrate de que la ruta sea correcta según donde tengas tu archivo auth-utils.js o similar.
import { getToken } from './auth-utils.js'; // O './login.js' si la tienes allí

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container-page');
    const cartTotalSpan = document.getElementById('cart-total-page');
    const continueShoppingButton = document.getElementById('continue-shopping-button');
    const clearCartButton = document.getElementById('clear-cart-button-page');
    const checkoutButton = document.getElementById('checkout-button-page');
    import { getToken } from './../utils/auth-utils.js';

    console.log("carrito-view.js cargado y DOMContentLoaded disparado.");

    /**
     * Renderiza los ítems del carrito en la página y actualiza el total.
     */
    function renderCartPageItems() {
        const currentCart = getCart(); // Este getCart() sigue siendo del localStorage para el "mostrar inmediato"
        console.log("Carrito actual desde localStorage (en carrito-view.js):", currentCart);

        if (!cartItemsContainer) {
            console.error("Error: Elemento con ID 'cart-items-container-page' no encontrado en el DOM.");
            return;
        }

        cartItemsContainer.innerHTML = '';

        if (currentCart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: #555;">Tu carrito está vacío.</p>';
        } else {
            currentCart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${item.imageUrl || 'http://via.placeholder.com/100x100?text=No+Image'}" alt="${item.nombre}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4>${item.nombre}</h4>
                        <p>$${parseFloat(item.precio).toFixed(2)} c/u</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn decrease" data-product-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-product-id="${item.id}">+</button>
                        <button class="remove-from-cart-btn" data-product-id="${item.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        if (cartTotalSpan) {
            cartTotalSpan.textContent = getCartTotalPrice().toFixed(2);
        } else {
            console.error("Error: Elemento con ID 'cart-total-page' no encontrado en el DOM.");
        }

        if (currentCart.length > 0) {
            document.querySelectorAll('.cart-item-actions .decrease').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = event.target.dataset.productId;
                    changeItemQuantity(productId, -1);
                    renderCartPageItems();
                });
            });

            document.querySelectorAll('.cart-item-actions .increase').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = event.target.dataset.productId;
                    changeItemQuantity(productId, 1);
                    renderCartPageItems();
                });
            });

            document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = event.currentTarget.dataset.productId;
                    removeItemFromCart(productId);
                    renderCartPageItems();
                });
            });
        }
    }

    if (continueShoppingButton) {
        continueShoppingButton.addEventListener('click', () => {
            window.location.href = 'catalogo.html';
        });
    }

    if (clearCartButton) {
        clearCartButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
                clearAllCart();
                renderCartPageItems();
                alert('El carrito ha sido vaciado.');
            }
        });
    }

    // --- Lógica actualizada para el botón "Finalizar Compra" ---
    if (checkoutButton) {
        checkoutButton.addEventListener('click', async () => {
            const currentCart = getCart(); // Obtener el carrito actual desde localStorage

            if (currentCart.length === 0) {
                alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
                return;
            }

            const token = getToken(); // Obtener el token JWT del localStorage
            if (!token) {
                alert('Debes iniciar sesión para finalizar la compra.');
                window.location.href = 'login.html'; // Redirigir al login si no hay token
                return;
            }

            try {
                // Realizar la petición POST al nuevo endpoint del backend
                const response = await fetch('http://localhost:8080/api/pedidos/finalizarCompra', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Incluir el token JWT en el header de autorización
                    }
                    // IMPORTANTE: No se envía un 'body' aquí. El backend lee el carrito del usuario desde la base de datos.
                });

                if (response.ok) {
                    const result = await response.json(); // Leer la respuesta JSON del backend
                    alert(result.message || '¡Compra finalizada exitosamente!');
                    clearAllCart(); // Vaciar el carrito en el frontend SOLO después de confirmar éxito en el backend
                    renderCartPageItems(); // Volver a renderizar el carrito, que ahora estará vacío
                    window.location.href = 'historial-pedidos.html'; // Redirigir al usuario a su historial de pedidos
                } else {
                    const errorData = await response.json(); // Intentar leer el mensaje de error del backend
                    alert(`Error al finalizar la compra: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error al enviar el pedido:', error);
                alert('Hubo un problema de conexión o un error inesperado al intentar finalizar la compra. Por favor, inténtalo de nuevo.');
            }
        });
    }

    // Renderiza los ítems del carrito cuando la página carga por primera vez
    renderCartPageItems();
});