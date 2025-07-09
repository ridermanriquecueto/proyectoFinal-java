// src/main/resources/static/js/catalogo.js

// Importa las funciones necesarias desde carrito.js
import { addItemToCart, getCartTotalItems } from './carrito.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const messageDiv = document.getElementById('message'); 
    const cartCountSpan = document.getElementById('cart-count-catalog'); 

    function showMessage(msg, type = 'success') {
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000); 
        } else {
            console.warn("Elemento con id 'message' no encontrado en catalogo.html para mostrar mensajes.");
        }
    }

    // Función para actualizar el contador del carrito en el header del catálogo
    function updateCartCounter() {
        const totalItems = getCartTotalItems(); 
        if (cartCountSpan) {
            cartCountSpan.textContent = totalItems;
        } else {
            console.warn("Elemento con id 'cart-count-catalog' no encontrado en catalogo.html.");
        }
    }

    async function fetchProducts() {
        try {
            const response = await fetch('/api/productos'); 
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Endpoint /api/productos no encontrado. Asegúrate de que tu backend esté corriendo y la URL sea correcta.');
                }
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }
            const products = await response.json();
            console.log('Productos obtenidos de la API:', products); 
            renderProducts(products);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            productsContainer.innerHTML = '<p class="error-message">Error al cargar los productos. Por favor, intenta de nuevo más tarde o verifica la conexión con el servidor.</p>';
            showMessage(`Error: ${error.message}`, 'warning');
        }
    }

    function renderProducts(products) {
        productsContainer.innerHTML = ''; 
        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles en este momento.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const imageUrl = product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : 'https://via.placeholder.com/150x150?text=No+Image';

            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.nombre}" class="product-image">
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-description">${product.descripcion || 'Sin descripción'}</p>
                <p class="product-price">$${parseFloat(product.precio).toFixed(2)}</p>
                <p class="product-stock">Stock: ${product.stock}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}"
                        data-product-name="${product.nombre}"
                        data-product-price="${product.precio}"
                        data-product-stock="${product.stock}"
                        data-product-image="${product.imageUrl || ''}">
                    Agregar al Carrito
                </button>
            `;
            productsContainer.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const productName = event.target.dataset.productName;
                const productPrice = parseFloat(event.target.dataset.productPrice);
                const productStock = parseInt(event.target.dataset.productStock);
                const productImage = event.target.dataset.productImage; 

                if (productStock <= 0) {
                    showMessage('Producto sin stock disponible.', 'warning');
                    return;
                }

                addItemToCart({
                    id: productId,
                    nombre: productName,
                    precio: productPrice,
                    stock: productStock,
                    imageUrl: productImage
                }, 1); 

                showMessage(`${productName} se agregó al carrito.`);
                updateCartCounter(); // ¡Actualiza el contador del carrito en el header del catálogo!
            });
        });
    }

    // --- Inicialización al cargar la página ---
    fetchProducts();
    updateCartCounter(); // Actualiza el contador del carrito al cargar la página por primera vez
});