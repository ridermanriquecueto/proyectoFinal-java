// src/main/resources/static/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                loginMessage.textContent = 'Por favor ingresa usuario y contraseña.';
                loginMessage.style.color = 'red';
                return;
            }

            submitBtn.disabled = true;
            loginMessage.textContent = 'Iniciando sesión...';
            loginMessage.style.color = 'black';

            try {
                const response = await fetch('/api/auth/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // === ¡CORRECCIÓN FINAL AQUÍ! ===
                    // Ahora sabemos que el backend envía el token en 'accessToken'.
                    if (data.accessToken) { // Verificamos que 'accessToken' exista
                        localStorage.setItem('jwtToken', data.accessToken); // <-- ¡Cambio aquí!
                        localStorage.setItem('roles', JSON.stringify(data.roles));
                        localStorage.setItem('username', data.username);
                        
                        // Redirige al usuario a la página de productos después del login exitoso.
                        // Asegúrate de que esta ruta sea correcta para tu proyecto.
                        window.location.href = '/pages/productos.html';
                    } else {
                        // Este mensaje ahora debería ser muy poco probable si el backend responde con 200 OK
                        loginMessage.textContent = 'Error: No se recibió accessToken del servidor en la respuesta exitosa.';
                        loginMessage.style.color = 'red';
                    }
                } else {
                    loginMessage.textContent = data.message || 'Error de autenticación. Verifica tus credenciales.';
                    loginMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Error durante el inicio de sesión:', error);
                loginMessage.textContent = 'Hubo un problema al intentar iniciar sesión. Inténtalo de nuevo.';
                loginMessage.style.color = 'red';
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
});
