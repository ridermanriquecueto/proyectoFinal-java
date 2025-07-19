// src/main/resources/static/js/productos.js

document.addEventListener('DOMContentLoaded', () => {
    // === 1. Referencias a elementos del DOM ===
    const operationButtons = document.querySelectorAll('.operations-menu-grid .operation-button');
    const productsListContainer = document.getElementById('products-list-container');
    const productFormContainer = document.getElementById('product-form-container');
    const productDetailView = document.getElementById('product-detail-view');
    const productMessageDiv = document.getElementById('productMessage'); // Para mostrar mensajes al usuario

    const searchProductNameInput = document.getElementById('searchProductName');
    const searchProductByNameBtn = document.getElementById('searchProductByNameBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    // URL base de tu API de productos en Spring Boot
    const API_BASE_URL = 'http://localhost:8080/api/productos';

    // Función para obtener el token JWT del localStorage
    function getAuthHeader() {
        const accessToken = localStorage.getItem('jwtToken');
        if (accessToken) {
            return { 'Authorization': `Bearer ${accessToken}` };
        }
        // Si no hay token, retorna un objeto vacío.
        // Las llamadas a la API protegidas fallarán, y handleAuthError lo gestionará.
        return {};
    }

    // Función para manejar errores de autenticación/autorización (401, 403)
    async function handleAuthError(responseStatus) {
        if (responseStatus === 401 || responseStatus === 403) {
            displayMessage('Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.', 'error');
            // Limpiar almacenamiento local y redirigir al login
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');
            localStorage.removeItem('roles');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return true; // Indica que se manejó un error de autenticación
        }
        return false; // Indica que no fue un error de autenticación
    }

    // === 2. Funciones de Utilidad ===
    function displayMessage(message, type) {
        productMessageDiv.textContent = message;
        productMessageDiv.className = `message ${type}`;
        // Limpiar el mensaje después de un tiempo
        setTimeout(() => {
            productMessageDiv.textContent = '';
            productMessageDiv.className = 'message';
        }, 5000);
    }

    function hideAllContentAreas() {
        productsListContainer.style.display = 'none';
        productFormContainer.style.display = 'none';
        productDetailView.style.display = 'none';
    }

    function clearProductContent() {
        hideAllContentAreas();
        productMessageDiv.textContent = '';
        productMessageDiv.className = 'message';
    }

    // === 3. Manejo de Operaciones (botones visuales del menú) ===
    operationButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const operation = button.dataset.operation;
            clearProductContent(); // Limpia y oculta áreas al iniciar una nueva operación

            switch (operation) {
                case 'add':
                    renderAddEditForm(); // Renderiza formulario vacío para agregar
                    productFormContainer.style.display = 'block';
                    break;
                case 'list':
                    productsListContainer.style.display = 'block';
                    await listAllProducts(); // Muestra el listado de productos
                    break;
                case 'search':
                    // Para buscar por ID desde el menú de operaciones (el prompt)
                    productDetailView.style.display = 'block';
                    const searchId = prompt('Introduce el ID del producto a buscar:');
                    if (searchId) {
                        await searchProductById(searchId);
                    } else {
                        productDetailView.innerHTML = '<p class="warning">Búsqueda de producto por ID cancelada.</p>';
                    }
                    break;
                case 'update':
                    // Para actualizar por ID desde el menú (el prompt)
                    productFormContainer.style.display = 'block';
                    const updateId = prompt('Introduce el ID del producto a actualizar:');
                    if (updateId) {
                        await fetchProductForUpdate(updateId);
                    } else {
                        productFormContainer.innerHTML = '<p class="warning">Actualización de producto cancelada.</p>';
                    }
                    break;
                case 'delete':
                    // Para eliminar por ID desde el menú (el prompt)
                    const deleteId = prompt('Introduce el ID del producto a eliminar:');
                    if (deleteId && confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${deleteId}?`)) {
                        await deleteProduct(deleteId);
                    } else {
                        displayMessage('Eliminación de producto cancelada.', 'warning');
                    }
                    break;
                case 'back':
                    window.location.href = '/index.html'; // Redirigir al menú principal
                    break;
                default:
                    displayMessage('Operación no reconocida.', 'error');
                    break;
            }
        });
    });

    // === 4. Funciones para renderizar formularios/vistas ===

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
                    <input type="text" id="categoria" value="${product ? (product.categoria || '') : ''}" required>
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

        document.getElementById('submitProductForm').addEventListener('click', async () => {
            const id = product ? parseInt(document.getElementById('productId').value) : null;
            const nombre = document.getElementById('nombre').value.trim();
            const descripcion = document.getElementById('descripcion').value.trim();
            const precio = parseFloat(document.getElementById('precio').value);
            const categoriaNombre = document.getElementById('categoria').value.trim();
            const imagen = document.getElementById('imagen').value.trim();
            const stock = parseInt(document.getElementById('stock').value);

            if (!nombre || isNaN(precio) || precio < 0 || !categoriaNombre || isNaN(stock) || stock < 0) {
                displayMessage('Por favor, completa todos los campos obligatorios y asegúrate de que precio y stock sean valores válidos.', 'error');
                return;
            }

            const productData = {
                id: id,
                nombre,
                descripcion,
                precio,
                categoria: categoriaNombre, // Asegúrate que tu backend espera un String aquí
                imagen,
                stock
            };

            if (product) {
                await updateProduct(productData);
            } else {
                await addProduct(productData);
            }
        });

        document.getElementById('cancelFormBtn').addEventListener('click', () => {
            clearProductContent();
            productsListContainer.style.display = 'block';
            listAllProducts(); // Vuelve a listar todos los productos
        });
    }

    function renderProductsTable(products) {
        if (!products || products.length === 0) {
            productsListContainer.innerHTML = '<p class="info">No hay productos registrados en el sistema o no se encontraron resultados para su búsqueda.</p>';
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
                    <td data-label="Categoría">${product.categoria || 'N/A'}</td>
                    <td data-label="Acciones" class="product-actions">
                        <button class="action-button view-btn" data-id="${product.id}"><i class="fas fa-eye"></i> Ver</button>
                        <button class="action-button edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i> Editar</button>
                        <button class="cancel-button delete-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
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

        // Añadir event listeners a los botones de acción de la tabla
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

    function displayProductDetail(product) {
        if (!product) {
            productDetailView.innerHTML = '<p class="error">No se pudieron cargar los detalles del producto.</p>';
            return;
        }

        productDetailView.innerHTML = `
            <div class="product-detail-card">
                <h2>Detalles del Producto</h2>
                <p><strong>ID:</strong> ${product.id}</p>
                <p><strong>Nombre:</strong> ${product.nombre}</p>
                <p><strong>Descripción:</strong> ${product.descripcion || 'N/A'}</p>
                <p><strong>Precio:</strong> $${product.precio ? product.precio.toFixed(2) : '0.00'}</p>
                <p><strong>Stock:</strong> ${product.stock || 0}</p>
                <p><strong>Categoría:</strong> ${product.categoria || 'N/A'}</p>
                <p><strong>Imagen:</strong> <a href="${product.imagen || '#'}" target="_blank">${product.imagen || 'N/A'}</a></p>
                <button type="button" id="backToListBtn" class="action-button" style="margin-top: 20px;">Volver al Listado</button>
            </div>
        `;
        document.getElementById('backToListBtn').addEventListener('click', () => {
            clearProductContent();
            productsListContainer.style.display = 'block';
            listAllProducts();
        });
    }

    // === 5. Funciones de Interacción con el Backend (Fetch API) ===

    async function addProduct(productData) {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const newProduct = await response.json();
                displayMessage(`Producto '${newProduct.nombre}' agregado con éxito. ID: ${newProduct.id}`, 'success');
                clearProductContent();
                productsListContainer.style.display = 'block';
                await listAllProducts();
            } else {
                if (!await handleAuthError(response.status)) {
                    const errorData = await response.json();
                    displayMessage(`Error al agregar producto: ${errorData.message || response.statusText}`, 'error');
                }
            }
        } catch (error) {
            console.error('Error de red al agregar producto:', error);
            displayMessage('Error de conexión al servidor.', 'error');
        }
    }

    // Función principal para listar todos o buscar por nombre
    async function listAllProducts(searchName = '') {
        productsListContainer.innerHTML = '<p>Cargando productos...</p>';
        try {
            let url = API_BASE_URL;
            if (searchName) {
                // Endpoint para buscar por nombre
                url = `${API_BASE_URL}/search?name=${encodeURIComponent(searchName)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });

            if (response.ok) {
                const products = await response.json();
                renderProductsTable(products);
                if (searchName && products.length === 0) {
                     displayMessage(`No se encontraron productos con el nombre "${searchName}".`, 'warning');
                } else if (searchName && products.length > 0) {
                     displayMessage(`Mostrando ${products.length} producto(s) con el nombre "${searchName}".`, 'info');
                }
            } else {
                if (!await handleAuthError(response.status)) {
                    // Si es un 404 para búsqueda por nombre, es porque no se encontraron resultados.
                    if (response.status === 404 && searchName) {
                        productsListContainer.innerHTML = '<p class="warning">No se encontraron productos con ese nombre.</p>';
                        displayMessage(`No se encontraron productos con el nombre "${searchName}".`, 'warning');
                        return;
                    }
                    const errorData = await response.json();
                    displayMessage(`Error al listar productos: ${errorData.message || response.statusText}`, 'error');
                    productsListContainer.innerHTML = '<p class="error">Error al cargar productos.</p>';
                }
            }
        } catch (error) {
            console.error('Error de red al listar productos:', error);
            displayMessage('Error de conexión al servidor.', 'error');
            productsListContainer.innerHTML = '<p class="error">No se pudo conectar al servidor para cargar productos.</p>';
        }
    }

    async function searchProductById(id) {
        productDetailView.innerHTML = '<p>Buscando producto...</p>';
        const productId = parseInt(id);

        if (isNaN(productId) || productId < 1) {
            displayMessage('Por favor, introduce un ID válido para buscar.', 'error');
            productDetailView.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${productId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });

            if (response.ok) {
                const product = await response.json();
                displayProductDetail(product);
                displayMessage(`Producto con ID ${productId} encontrado.`, 'success');
            } else if (response.status === 404) {
                displayMessage(`Producto con ID ${productId} no encontrado.`, 'error');
                productDetailView.innerHTML = '<p class="error">Producto no encontrado con el ID proporcionado.</p>';
            } else {
                if (!await handleAuthError(response.status)) {
                    const errorData = await response.json();
                    displayMessage(`Error al buscar producto: ${errorData.message || response.statusText}`, 'error');
                    productDetailView.innerHTML = '';
                }
            }
        } catch (error) {
            console.error('Error de red al buscar producto:', error);
            displayMessage('Error de conexión al servidor.', 'error');
            productDetailView.innerHTML = '';
        }
    }

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
            const response = await fetch(`${API_BASE_URL}/${productId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                }
            });
            if (response.ok) {
                const product = await response.json();
                renderAddEditForm(product);
                productFormContainer.style.display = 'block';
                displayMessage(`Cargado producto ID ${productId} para edición.`, 'info');
            } else if (response.status === 404) {
                displayMessage(`Producto con ID ${productId} no encontrado para actualizar.`, 'error');
                clearProductContent();
                productsListContainer.style.display = 'block';
                await listAllProducts();
            } else {
                if (!await handleAuthError(response.status)) {
                    const errorData = await response.json();
                    displayMessage(`Error al cargar producto para actualizar: ${errorData.message || response.statusText}`, 'error');
                    clearProductContent();
                }
            }
        } catch (error) {
            console.error('Error de red al cargar producto para actualización:', error);
            displayMessage('Error de conexión al servidor.', 'error');
            clearProductContent();
        }
    }

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
                    ...getAuthHeader()
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                displayMessage(`Producto con ID ${updatedProduct.id} ('${updatedProduct.nombre}') actualizado con éxito.`, 'success');
                clearProductContent();
                productsListContainer.style.display = 'block';
                await listAllProducts();
            } else {
                if (!await handleAuthError(response.status)) {
                    const errorData = await response.json();
                    displayMessage(`Error al actualizar producto: ${errorData.message || response.statusText}`, 'error');
                }
            }
        } catch (error) {
            console.error('Error de red al actualizar producto:', error);
            displayMessage('Error de conexión al servidor.', 'error');
        }
    }

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
                headers: getAuthHeader()
            });

            if (response.ok || response.status === 204) { // 204 No Content es común para DELETE exitoso
                displayMessage(`Producto con ID ${productId} eliminado con éxito.`, 'success');
                clearProductContent();
                productsListContainer.style.display = 'block';
                await listAllProducts();
            } else {
                if (!await handleAuthError(response.status)) {
                    // Intentar parsear el error como JSON o texto plano
                    const errorText = await response.text();
                    try {
                        const errorData = JSON.parse(errorText);
                        displayMessage(`Error al eliminar producto: ${errorData.message || errorData.error || response.statusText}`, 'error');
                    } catch (e) {
                        displayMessage(`Error al eliminar producto: ${errorText || response.statusText}`, 'error');
                    }
                }
            }
        } catch (error) {
            console.error('Error de red al eliminar producto:', error);
            displayMessage('Error de conexión al servidor.', 'error');
        }
    }

    // === 6. Funcionalidad de Búsqueda por Nombre (ya estaba bien, solo la mantengo) ===
    if (searchProductNameInput && searchProductByNameBtn) {
        searchProductByNameBtn.addEventListener('click', () => {
            const name = searchProductNameInput.value.trim();
            clearProductContent();
            productsListContainer.style.display = 'block';
            listAllProducts(name); // Llama a listAllProducts con el nombre para filtrar
        });
    }

    if (clearSearchBtn && searchProductNameInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchProductNameInput.value = ''; // Limpia el input
            clearProductContent();
            productsListContainer.style.display = 'block';
            listAllProducts(); // Muestra todos los productos de nuevo
            displayMessage('Búsqueda limpiada, mostrando todos los productos.', 'info');
        });
    }

    // === 7. Inicialización: Cargar la lista de productos al cargar la página ===
    productsListContainer.style.display = 'block';
    listAllProducts(); // Carga la lista inicial de productos
});