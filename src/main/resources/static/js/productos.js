document.addEventListener('DOMContentLoaded', () => {
    // === 1. Referencias a elementos del DOM ===
    // Elementos del menú de operaciones (los botones visuales)
    const operationButtons = document.querySelectorAll('.operations-menu-grid .operation-button');
    // Contenedores principales para mostrar el contenido
    const productsListContainer = document.getElementById('products-list-container');
    const productFormContainer = document.getElementById('product-form-container');
    const productDetailView = document.getElementById('product-detail-view');
    // Contenedor para mensajes al usuario
    const productMessageDiv = document.getElementById('productMessage');

    // Elementos para la búsqueda por nombre (si los tienes en productos.html)
    const searchProductNameInput = document.getElementById('searchProductName');
    const searchProductByNameBtn = document.getElementById('searchProductByNameBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    // URL base de tu API de productos en Spring Boot
    const API_BASE_URL = 'http://localhost:8080/api/productos'; // Confirma que esta es la URL correcta de tu backend

    // Función para obtener el token JWT del localStorage
    function getAuthHeader() {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            return { 'Authorization': `Bearer ${accessToken}` };
        }
        return {}; // Retorna un objeto vacío si no hay token
    }

    // Función para manejar errores de autenticación/autorización
    function handleAuthError(status) {
        if (status === 401 || status === 403) {
            displayMessage('Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.', 'error');
            // Opcional: Limpiar el token y redirigir al login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            localStorage.removeItem('roles');
            setTimeout(() => {
                window.location.href = '/pages/login.html'; // Asegúrate de que esta sea la ruta correcta a tu página de login
            }, 1500);
        }
    }

    // === 2. Funciones de Utilidad ===

    // Función para mostrar mensajes (ya la tenías, ligeramente mejorada)
    function displayMessage(message, type) {
        productMessageDiv.textContent = message;
        productMessageDiv.className = `message ${type}`;
        setTimeout(() => {
            productMessageDiv.textContent = '';
            productMessageDiv.className = 'message';
        }, 5000); // El mensaje desaparece después de 5 segundos
    }

    // Función para ocultar todas las áreas de contenido antes de mostrar una nueva
    function hideAllContentAreas() {
        productsListContainer.style.display = 'none';
        productFormContainer.style.display = 'none';
        productDetailView.style.display = 'none';
    }

    // Función para limpiar el contenido dinámico y mensajes
    function clearProductContent() {
        hideAllContentAreas(); // Oculta todas las secciones
        productMessageDiv.textContent = '';
        productMessageDiv.className = 'message';
    }

    // === 3. Manejo de Operaciones (Ahora con los botones visuales) ===

    // Asignar manejadores de eventos a los botones de operación
    operationButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const operation = button.dataset.operation; // Obtiene el valor 'add', 'list', etc.
            clearProductContent(); // Limpia antes de cada operación

            switch (operation) {
                case 'add':
                    renderAddEditForm(); // Muestra el formulario para agregar
                    productFormContainer.style.display = 'block';
                    break;
                case 'list':
                    productsListContainer.style.display = 'block';
                    await listAllProducts(); // Llama a la función para cargar y mostrar productos
                    break;
                case 'search': // Renombrado de 'findById' a 'search' para el botón
                    productDetailView.style.display = 'block';
                    const searchId = prompt('Introduce el ID del producto a buscar:');
                    if (searchId) {
                        await searchProductById(searchId); // Pasa el ID directamente
                    } else {
                        productDetailView.innerHTML = '<p class="warning">Búsqueda de producto cancelada.</p>';
                    }
                    break;
                case 'update': // Botón para iniciar actualización (pedir ID)
                    productFormContainer.style.display = 'block';
                    const updateId = prompt('Introduce el ID del producto a actualizar:');
                    if (updateId) {
                        await fetchProductForUpdate(updateId); // Carga los datos en el formulario
                    } else {
                        productFormContainer.innerHTML = '<p class="warning">Actualización de producto cancelada.</p>';
                    }
                    break;
                case 'delete': // Botón para iniciar eliminación (pedir ID)
                    const deleteId = prompt('Introduce el ID del producto a eliminar:');
                    if (deleteId && confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${deleteId}?`)) {
                        await deleteProduct(deleteId); // Pasa el ID directamente
                    } else {
                        displayMessage('Eliminación de producto cancelada.', 'warning');
                    }
                    break;
                case 'back': // Para volver al menú principal
                    window.location.href = 'index.html'; // Asegúrate que esta ruta es correcta
                    break;
                default:
                    displayMessage('Operación no reconocida.', 'error');
                    break;
            }
        });
    });

    // === 4. Funciones para renderizar formularios/vistas (Adaptadas de tus funciones showXyzForm) ===

    // Función unificada para renderizar el formulario de Añadir/Editar
    function renderAddEditForm(product = null) {
        productFormContainer.innerHTML = `
            <div class="form-section">
                <h2>${product ? 'Actualizar Producto' : 'Agregar Nuevo Producto'}</h2>
                <div class="form-group">
                    ${product ? `<label for="productId">ID:</label><input type="text" id="productId" value="${product.id}" readonly>` : ''}
                </div>
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" value="${product ? product.nombre : ''}" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion">${product ? product.descripcion : ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" step="0.01" min="0" value="${product ? product.precio : ''}" required>
                </div>
                <div class="form-group">
                    <label for="categoria">Categoría:</label>
                    <input type="text" id="categoria" value="${product ? (product.categoria ? product.categoria.nombre : '') : ''}" required>
                </div>
                <div class="form-group">
                    <label for="imagen">URL Imagen:</label>
                    <input type="text" id="imagen" value="${product ? product.imagen : ''}">
                </div>
                <div class="form-group">
                    <label for="stock">Stock:</label>
                    <input type="number" id="stock" min="0" value="${product ? product.stock : ''}" required>
                </div>
                <button id="submitProductForm" class="action-button">${product ? 'Actualizar' : 'Agregar'} Producto</button>
                <button type="button" id="cancelFormBtn" class="cancel-button">Cancelar</button>
            </div>
        `;
        
        // Event listeners para el formulario
        document.getElementById('submitProductForm').addEventListener('click', async () => {
            const id = product ? parseInt(document.getElementById('productId').value) : null;
            const nombre = document.getElementById('nombre').value;
            const descripcion = document.getElementById('descripcion').value;
            const precio = parseFloat(document.getElementById('precio').value);
            const categoriaNombre = document.getElementById('categoria').value; // Asumimos que la categoría es por nombre
            const imagen = document.getElementById('imagen').value;
            const stock = parseInt(document.getElementById('stock').value);

            if (!nombre || isNaN(precio) || precio < 0 || !categoriaNombre || isNaN(stock) || stock < 0) {
                displayMessage('Por favor, completa todos los campos obligatorios y asegúrate de que precio y stock sean valores válidos.', 'error');
                return;
            }

            // Aquí debes decidir cómo maneja tu backend la categoría.
            // Si tu backend espera un objeto Categoria con solo el nombre, o un ID.
            // Por ahora, asumimos que espera un objeto { nombre: "Categoria" }
            const productData = {
                id: id,
                nombre,
                descripcion,
                precio,
                categoria: { nombre: categoriaNombre }, // Adaptado a un objeto categoría con nombre
                imagen,
                stock
            };

            if (product) {
                await updateProduct(productData); // Llama a la función de actualización
            } else {
                await addProduct(productData); // Llama a la función de agregar
            }
        });

        document.getElementById('cancelFormBtn').addEventListener('click', () => {
            clearProductContent();
            productsListContainer.style.display = 'block';
            listAllProducts(); // Volver al listado
        });
    }

    // Función para renderizar la tabla de productos (similar a la que ya teníamos, pero dentro de productos.js)
    function renderProductsTable(products) {
        if (products.length === 0) {
            productsListContainer.innerHTML = '<p>No hay productos registrados en el sistema.</p>';
            return;
        }

        let tableHtml = `
            <h2>Listado de Productos</h2>
            <div class="table-responsive">
                <table class="product-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        products.forEach(product => {
            tableHtml += `
                <tr>
                    <td data-label="ID">${product.id}</td>
                    <td data-label="Nombre">${product.nombre}</td>
                    <td data-label="Precio">$${product.precio ? product.precio.toFixed(2) : '0.00'}</td>
                    <td data-label="Stock">${product.stock || 0}</td>
                    <td data-label="Categoría">${product.categoria ? product.categoria.nombre : 'N/A'}</td>
                    <td data-label="Acciones" class="product-actions">
                        <button class="action-button small view-btn" data-id="${product.id}"><i class="fas fa-eye"></i> Ver</button>
                        <button class="action-button small edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i> Editar</button>
                        <button class="cancel-button small delete-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                    </td>
                </tr>
            `;
        });
        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;
        productsListContainer.innerHTML = tableHtml;

        // AñadirEventListeners a los botones de acción de la tabla
        productsListContainer.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                clearProductContent();
                productDetailView.style.display = 'block';
                await searchProductById(e.currentTarget.dataset.id);
            });
        });
        productsListContainer.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                clearProductContent();
                productFormContainer.style.display = 'block';
                await fetchProductForUpdate(e.currentTarget.dataset.id);
            });
        });
        productsListContainer.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                if (confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${e.currentTarget.dataset.id}?`)) {
                    await deleteProduct(e.currentTarget.dataset.id);
                }
            });
        });
    }

    // Función para mostrar los detalles de un solo producto
    function displayProductDetail(product) {
        productDetailView.innerHTML = `
            <div class="product-detail-card">
                <h2>Detalles del Producto</h2>
                <p><strong>ID:</strong> ${product.id}</p>
                <p><strong>Nombre:</strong> ${product.nombre}</p>
                <p><strong>Descripción:</strong> ${product.descripcion || 'N/A'}</p>
                <p><strong>Precio:</strong> $${product.precio ? product.precio.toFixed(2) : '0.00'}</p>
                <p><strong>Stock:</strong> ${product.stock || 0}</p>
                <p><strong>Categoría:</strong> ${product.categoria ? product.categoria.nombre : 'N/A'}</p>
                <p><strong>Imagen:</strong> <a href="${product.imagen || '#'}" target="_blank">${product.imagen || 'N/A'}</a></p>
                <button type="button" id="backToListBtn" class="secondary-button" style="background-color: var(--secondary-color); margin-top: 20px;">Volver al Listado</button>
            </div>
        `;
        document.getElementById('backToListBtn').addEventListener('click', () => {
            clearProductContent();
            productsListContainer.style.display = 'block';
            listAllProducts();
        });
    }

    // === 5. Funciones de Interacción con el Backend (Fetch API) ===

    // A) Agregar Producto (adaptado de tu función)
    async function addProduct(productData) {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader() // AÑADIDO: Incluir el token JWT
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const newProduct = await response.json();
                displayMessage(`Producto '${newProduct.nombre}' agregado con éxito. ID: ${newProduct.id}`, 'success');
                clearProductContent();
                productsListContainer.style.display = 'block'; // Volver al listado
                await listAllProducts(); // Recargar la lista
            } else {
                handleAuthError(response.status); // Manejar errores de autenticación
                const errorData = await response.json();
                displayMessage(`Error al agregar producto: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error de red al agregar producto:', error);
            displayMessage('Error de conexión al servidor.', 'error');
        }
    }

    // B) Listar Todos los Productos (adaptado de tu función, con búsqueda por nombre opcional)
    async function listAllProducts(searchName = '') {
        productsListContainer.innerHTML = '<p>Cargando productos...</p>'; // Muestra mensaje de carga
        try {
            let url = API_BASE_URL;
            if (searchName) {
                url = `${API_BASE_URL}/search?name=${encodeURIComponent(searchName)}`; // Ajusta si tu endpoint es diferente
            }
            // NO se envía el token aquí porque GET /api/productos es público (según SecurityConfig)
            const response = await fetch(url); 

            if (response.ok) {
                const products = await response.json();
                renderProductsTable(products); // Renderiza la tabla
            } else {
                handleAuthError(response.status); // Aunque GET es público, es bueno tener el manejo
                if (response.status === 404 && searchName) {
                    productsListContainer.innerHTML = '<p class="warning">No se encontraron productos con ese nombre.</p>';
                    displayMessage('No se encontraron productos con el nombre especificado.', 'warning');
                    return;
                }
                const errorData = await response.json();
                displayMessage(`Error al listar productos: ${errorData.message || response.statusText}`, 'error');
                productsListContainer.innerHTML = '<p class="error">Error al cargar productos.</p>';
            }
        } catch (error) {
            console.error('Error de red al listar productos:', error);
            displayMessage('Error de conexión al servidor.', 'error');
            productsListContainer.innerHTML = '<p class="error">No se pudo conectar al servidor para cargar productos.</p>';
        }
    }

    // C) Buscar Producto por ID (adaptado de tu función)
    async function searchProductById(id) {
        productDetailView.innerHTML = '<p>Buscando producto...</p>';
        const productId = parseInt(id); // Asegura que sea un número

        if (isNaN(productId) || productId < 1) {
            displayMessage('Por favor, introduce un ID válido para buscar.', 'error');
            productDetailView.innerHTML = ''; // Limpiar si no es válido
            return;
        }

        try {
            // NO se envía el token aquí porque GET /api/productos/{id} es público (según SecurityConfig)
            const response = await fetch(`${API_BASE_URL}/${productId}`); 

            if (response.ok) {
                const product = await response.json();
                displayProductDetail(product); // Usa la nueva función de detalle
                displayMessage(`Producto con ID ${productId} encontrado.`, 'success');
            } else if (response.status === 404) {
                displayMessage(`Producto con ID ${productId} no encontrado.`, 'error');
                productDetailView.innerHTML = '<p class="error">Producto no encontrado con el ID proporcionado.</p>';
            } else {
                handleAuthError(response.status); // Aunque GET es público, es bueno tener el manejo
                const errorData = await response.json();
                displayMessage(`Error al buscar producto: ${errorData.message || response.statusText}`, 'error');
                productDetailView.innerHTML = '';
            }
        } catch (error) {
            console.error('Error de red al buscar producto:', error);
            displayMessage('Error de conexión al servidor.', 'error');
            productDetailView.innerHTML = '';
        }
    }

    // D) Cargar Producto para Actualizar (Nueva función para rellenar el formulario de edición)
    async function fetchProductForUpdate(id) {
        const productId = parseInt(id);
        if (isNaN(productId) || productId < 1) {
            displayMessage('ID de producto no válido para actualizar.', 'error');
            clearProductContent();
            productsListContainer.style.display = 'block';
            await listAllProducts();
            return;
        }

        try {
            // Se envía el token aquí porque esta función precede a un PUT que lo requiere
            const response = await fetch(`${API_BASE_URL}/${productId}`, {
                headers: getAuthHeader() // AÑADIDO: Incluir el token JWT
            });
            if (response.ok) {
                const product = await response.json();
                renderAddEditForm(product); // Rellena el formulario con los datos del producto
                productFormContainer.style.display = 'block';
                displayMessage(`Cargado producto ID ${productId} para edición.`, 'info');
            } else if (response.status === 404) {
                displayMessage(`Producto con ID ${productId} no encontrado para actualizar.`, 'error');
                clearProductContent();
                productsListContainer.style.display = 'block';
                await listAllProducts();
            } else {
                handleAuthError(response.status); // Manejar errores de autenticación
                const errorData = await response.json();
                displayMessage(`Error al cargar producto para actualizar: ${errorData.message || response.statusText}`, 'error');
                clearProductContent();
            }
        } catch (error) {
            console.error('Error de red al cargar producto para actualización:', error);
            displayMessage('Error de conexión al servidor.', 'error');
            clearProductContent();
        }
    }

    // D) Actualizar Producto (adaptado de tu función)
    async function updateProduct(productData) {
        if (isNaN(productData.id) || productData.id < 1) {
            displayMessage('ID de producto no válido para actualización.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${productData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader() // AÑADIDO: Incluir el token JWT
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                displayMessage(`Producto con ID ${updatedProduct.id} ('${updatedProduct.nombre}') actualizado con éxito.`, 'success');
                clearProductContent();
                productsListContainer.style.display = 'block'; // Volver al listado
                await listAllProducts(); // Recargar la lista
            } else {
                handleAuthError(response.status); // Manejar errores de autenticación
                const errorData = await response.json();
                displayMessage(`Error al actualizar producto: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error de red al actualizar producto:', error);
            displayMessage('Error de conexión al servidor.', 'error');
        }
    }

    // E) Eliminar Producto (adaptado de tu función)
    async function deleteProduct(id) {
        const productId = parseInt(id);
        if (isNaN(productId) || productId < 1) {
            displayMessage('ID de producto no válido para eliminar.', 'error');
            return;
        }

        if (!confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${productId}? Esta acción es irreversible.`)) {
            displayMessage('Eliminación cancelada.', 'info');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${productId}`, {
                method: 'DELETE',
                headers: getAuthHeader() // AÑADIDO: Incluir el token JWT
            });

            if (response.ok || response.status === 204) {
                displayMessage(`Producto con ID ${productId} eliminado con éxito.`, 'success');
                clearProductContent();
                productsListContainer.style.display = 'block'; // Volver al listado
                await listAllProducts(); // Recargar la lista
            } else {
                handleAuthError(response.status); // Manejar errores de autenticación
                const errorText = await response.text(); // A veces el error no es JSON
                displayMessage(`Error al eliminar producto: ${errorText || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Error de red al eliminar producto:', error);
            displayMessage('Error de conexión al servidor.', 'error');
        }
    }

    // === 6. Funcionalidad de Búsqueda por Nombre (Si aplica a tu HTML) ===
    if (searchProductByNameInput && searchProductByNameBtn) { // Verificar si los elementos existen
        searchProductByNameBtn.addEventListener('click', () => {
            const name = searchProductNameInput.value.trim();
            clearProductContent();
            productsListContainer.style.display = 'block';
            listAllProducts(name); // Llama a listAllProducts con el nombre para filtrar
        });
    }

    if (clearSearchBtn && searchProductNameInput) { // Verificar si los elementos existen
        clearSearchBtn.addEventListener('click', () => {
            searchProductNameInput.value = '';
            clearProductContent();
            productsListContainer.style.display = 'block';
            listAllProducts(); // Recarga todos los productos
            displayMessage('Búsqueda limpiada, mostrando todos los productos.', 'info');
        });
    }


    // === 7. Inicialización: Cargar la lista de productos al cargar la página ===
    productsListContainer.style.display = 'block'; // Muestra el contenedor de la lista por defecto
    listAllProducts(); // Carga la lista inicial al cargar productos.html
});