// src/main/resources/static/js/auth-utils.js

export function getToken() {
    try {
        // Asume que el token JWT se guarda directamente como 'jwtToken'
        const token = localStorage.getItem('jwtToken');
        return token; // Retorna el token directamente, o null si no existe
    } catch (e) {
        console.error("Error al obtener token de localStorage:", e);
        return null;
    }
}

// Opcional: una función para cerrar sesión que también limpia el token
export function logout() {
    localStorage.removeItem('jwtToken'); // Limpiar el token JWT
    localStorage.removeItem('username'); // Limpiar el nombre de usuario si lo guardas
    localStorage.removeItem('roles');    // Limpiar los roles si los guardas
    // Redirigir a la página de login (la correcta, sin '/pages')
    window.location.href = '/login.html'; 
}