// src/main/resources/static/js/auth-utils.js

export function getToken() {
    try {
        const token = localStorage.getItem('jwtToken');
        return token;
    } catch (e) {
        console.error("Error al obtener token de localStorage:", e);
        return null;
    }
}

export function getUserInfo() {
    try {
        const username = localStorage.getItem('username');
        const rolesString = localStorage.getItem('roles');
        const token = localStorage.getItem('jwtToken');

        if (username && rolesString && token) {
            const roles = JSON.parse(rolesString);
            return { username, roles, token };
        }
        return null;
    } catch (e) {
        console.error("Error al obtener información del usuario de localStorage:", e);
        return null;
    }
}

// Guarda la URL actual para redirigir después del login
export function saveRedirectUrl() {
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
}

// Limpia el almacenamiento local y redirige al login
export function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    sessionStorage.removeItem('redirectAfterLogin'); // Limpiar también la URL de redirección al salir
    window.location.href = '/login.html';
}

export function getAuthHeader() {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.token) {
        return { 'Authorization': `Bearer ${userInfo.token}` };
    }
    return {};
}

// Maneja errores de autenticación (401/403) y redirige al login
export async function handleAuthErrorFrontend(responseStatus) {
    if (responseStatus === 401 || responseStatus === 403) {
        console.error('Sesión expirada o no autorizado. Guardando URL y redirigiendo al login.');
        saveRedirectUrl(); // Guarda la URL actual antes de redirigir
        logout(); // Esto limpiará y redirigirá al login.html
        return true; // Indica que se manejó un error de autenticación
    }
    return false; // Indica que no fue un error de autenticación
}

// Muestra mensajes al usuario en el elemento con el ID especificado
export function displayMessage(message, type = 'info', targetElementId = 'message') {
    const messageDiv = document.getElementById(targetElementId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    } else {
        console.warn(`Elemento con id '${targetElementId}' no encontrado para mostrar mensajes.`);
    }
}
