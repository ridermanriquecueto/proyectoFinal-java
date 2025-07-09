// src/main/resources/static/js/carrito.js

const CART_STORAGE_KEY = 'supermarket_cart';

function loadCart() {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

let cart = loadCart();

export function getCart() {
    return [...cart]; 
}

export function addItemToCart(product, quantity = 1) {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
        // Asegúrate de que el stock es un número válido y que no se excede
        // Si tienes la información del stock total del producto original, aquí podrías validarlo
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }
    saveCart(cart); 
    console.log("Producto añadido al carrito:", product.nombre, "Cantidad:", quantity);
    console.log("Estado actual del carrito (después de añadir):", cart);
    return cart;
}

export function removeItemFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart); 
    console.log("Producto eliminado del carrito. ID:", productId);
    console.log("Estado actual del carrito (después de eliminar):", cart);
    return cart;
}

export function changeItemQuantity(productId, change) {
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += change;
        if (cart[existingItemIndex].quantity <= 0) {
            cart.splice(existingItemIndex, 1);
        }
    }
    saveCart(cart); 
    console.log("Cantidad de producto cambiada. ID:", productId, "Cambio:", change);
    console.log("Estado actual del carrito (después de cambiar cantidad):", cart);
    return cart;
}

export function clearAllCart() {
    cart = [];
    localStorage.removeItem(CART_STORAGE_KEY); 
    console.log("Carrito vaciado.");
    return cart;
}

export function getCartTotalItems() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotalPrice() {
    return cart.reduce((total, item) => total + (parseFloat(item.precio) * item.quantity), 0);
}

console.log("Carrito cargado al inicio (carrito.js):", cart);