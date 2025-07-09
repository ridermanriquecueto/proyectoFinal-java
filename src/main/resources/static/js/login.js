// Ejemplo conceptual de login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm'); // Asume que tu formulario tiene id="loginForm"
    const usernameInput = document.getElementById('username'); // Asume id="username" para el campo usuario
    const passwordInput = document.getElementById('password'); // Asume id="password" para el campo contraseña
    const loginMessage = document.getElementById('login-message'); // Un elemento para mostrar mensajes al usuario

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evita el envío tradicional del formulario

            const username = usernameInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/auth/signin', { // Asegúrate que esta URL sea la correcta
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // ¡PASO CLAVE! Guardar el token JWT
                    localStorage.setItem('jwtToken', data.token); // Asume que el backend devuelve un campo 'token'
                    localStorage.setItem('roles', JSON.stringify(data.roles)); // Opcional: guardar roles
                    localStorage.setItem('username', data.username); // Opcional: guardar username

                    // Redirigir al usuario al panel de administración
                    window.location.href = '/pages/admin.html'; // O la ruta correcta a tu admin.html

                } else {
                    // Manejar errores de autenticación (ej. credenciales inválidas)
                    loginMessage.textContent = data.message || 'Error de autenticación. Verifica tus credenciales.';
                    loginMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Error durante el inicio de sesión:', error);
                loginMessage.textContent = 'Hubo un problema al intentar iniciar sesión. Inténtalo de nuevo.';
                loginMessage.style.color = 'red';
            }
        });
    }
});