// src/main/resources/static/js/carrito-view.js

// Importa TODAS las funciones de gestión del carrito desde el archivo central 'carrito.js'
import {
    getCart,            
    removeItemFromCart, 
    changeItemQuantity, 
    clearAllCart,       
    getCartTotalItems,  
    getCartTotalPrice   
}
from './carrito.js'; 

document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a los elementos del DOM en carrito.html ---
    const cartItemsContainer = document.getElementById('cart-items-container-page');
    const cartTotalSpan = document.getElementById('cart-total-page');
    const continueShoppingButton = document.getElementById('continue-shopping-button');
    const clearCartButton = document.getElementById('clear-cart-button-page');
    const checkoutButton = document.getElementById('checkout-button-page');

    // Muestra un mensaje temporal en la consola para saber que el script se está ejecutando
    console.log("carrito-view.js cargado y DOMContentLoaded disparado.");

    /**
     * Renderiza los ítems del carrito en la página y actualiza el total.
     * Esta función es la "vista" del carrito en carrito.html.
     */
    function renderCartPageItems() {
        const currentCart = getCart(); // Obtiene el carrito actual del localStorage
        console.log("Carrito actual desde localStorage (en carrito-view.js):", currentCart); // Log para depuración
        
        // Verifica si el contenedor existe antes de manipularlo
        if (!cartItemsContainer) {
            console.error("Error: Elemento con ID 'cart-items-container-page' no encontrado en el DOM.");
            return; 
        }

        cartItemsContainer.innerHTML = ''; // Limpia el contenido actual del contenedor

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

        // Actualiza el monto total del carrito
        if (cartTotalSpan) {
            cartTotalSpan.textContent = getCartTotalPrice().toFixed(2);
        } else {
            console.error("Error: Elemento con ID 'cart-total-page' no encontrado en el DOM.");
        }


        // Adjuntar event listeners para los botones de cantidad y eliminar
        // Solo si hay ítems para prevenir errores si el carrito está vacío al inicio
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

    // --- Event Listeners para los botones de la página del Carrito ---
    // Verificar si los botones existen antes de añadir listeners
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

    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (getCartTotalItems() === 0) { 
                alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
                return;
            }
            alert('¡Compra finalizada! Esto enviaría el pedido a tu backend.');
            console.log('Productos a comprar:', getCart()); 

            clearAllCart(); 
            renderCartPageItems(); 
        });
    }

    // --- Inicialización al cargar la página ---
    renderCartPageItems(); // ¡Esta función se llama al cargar la página!
});