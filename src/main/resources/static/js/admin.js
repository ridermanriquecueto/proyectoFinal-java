// src/main/resources/static/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del formulario de producto ---
    const productForm = document.getElementById('productForm');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productDescriptionInput = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productStockInput = document.getElementById('product-stock');
    const productCategoryInput = document.getElementById('product-category');
    const productImageInput = document.getElementById('product-image');
    const submitButton = document.getElementById('submit-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    const formTitle = document.getElementById('form-title');

    // --- Referencias a elementos de la tabla de productos ---
    const productsTableBody = document.getElementById('products-table-body');
    const emptyProductsMessage = document.getElementById('empty-products-message');
    
    // --- Elemento para mostrar mensajes de estado ---
    const adminMessage = document.createElement('div');
    adminMessage.id = 'admin-status-message';
    adminMessage.style.cssText = 'padding: 10px; margin-bottom: 20px; border-radius: 5px; text-align: center; display: none;';
    productForm.before(adminMessage); // Añade el div de mensajes antes del formulario

    // --- Referencias para la navegación entre secciones ---
    const showProductsBtn = document.getElementById('showProductsBtn');
    const showOrdersBtn = document.getElementById('showOrdersBtn');
    const productsManagementSection = document.getElementById('products-management');
    const ordersManagementSection = document.getElementById('orders-management');

    let editingProductId = null; // Para saber si estamos editando o añadiendo

    // --- URL de la API para Productos (Debe coincidir con tu @RequestMapping en ProductoController) ---
    const API_PRODUCTS_URL = '/api/productos'; 

    // --- Funciones de Utilidad ---
    /**
     * Muestra un mensaje de estado al usuario.
     * @param {string} message - El mensaje a mostrar.
     * @param {'success' | 'danger' | 'warning' | 'info'} type - Tipo de mensaje para estilos.
     */
    function showStatusMessage(message, type = 'info') {
        adminMessage.textContent = message;
        adminMessage.style.display = 'block';
        // Estilos básicos según el tipo de mensaje
        if (type === 'success') {
            adminMessage.style.backgroundColor = '#d4edda';
            adminMessage.style.color = '#155724';
        } else if (type === 'danger') {
            adminMessage.style.backgroundColor = '#f8d7da';
            adminMessage.style.color = '#721c24';
        } else if (type === 'warning') {
            adminMessage.style.backgroundColor = '#fff3cd';
            adminMessage.style.color = '#856404';
        } else { // info (por defecto)
            adminMessage.style.backgroundColor = '#d1ecf1';
            adminMessage.style.color = '#0c5460';
        }
        setTimeout(() => {
            adminMessage.style.display = 'none';
        }, 5000); // Ocultar después de 5 segundos
    }

    // Limpia el formulario y resetea el estado de edición
    function resetForm() {
        productForm.reset(); 
        productIdInput.value = ''; 
        editingProductId = null; 
        formTitle.textContent = 'Agregar Nuevo Producto';
        submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
        submitButton.classList.remove('edit-mode');
        cancelEditButton.style.display = 'none';
    }

    // --- Lógica de Navegación entre Secciones ---
    showProductsBtn.addEventListener('click', () => {
        productsManagementSection.style.display = 'block';
        ordersManagementSection.style.display = 'none';
        showProductsBtn.classList.add('active');
        showOrdersBtn.classList.remove('active');
        loadProducts(); // Recarga los productos al cambiar a esta pestaña
    });

    showOrdersBtn.addEventListener('click', () => {
        productsManagementSection.style.display = 'none';
        ordersManagementSection.style.display = 'block';
        showOrdersBtn.classList.add('active');
        showProductsBtn.classList.remove('active');
        showStatusMessage('La gestión de pedidos aún está en desarrollo.', 'info');
        // Aquí podrías llamar a una función para renderizar pedidos si la tuvieras:
        // renderOrders(); 
    });

    // --- Funciones CRUD para Productos (Conexión real con Backend) ---

    /**
     * Obtiene todos los productos del backend.
     * @returns {Promise<Array>} Una promesa que resuelve con un array de productos.
     */
    async function fetchProducts() {
        try {
            const response = await fetch(API_PRODUCTS_URL); // Petición GET a /api/productos
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Status: ${response.status} - ${errorText}`);
            }
            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            showStatusMessage(`Error al cargar productos: ${error.message}`, 'danger');
            return []; // Devuelve un array vacío en caso de error
        }
    }

    /**
     * Carga y renderiza los productos en la tabla de administración.
     */
    async function loadProducts() { 
        productsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Cargando productos...</td></tr>';
        emptyProductsMessage.style.display = 'none'; 

        const products = await fetchProducts();
        productsTableBody.innerHTML = ''; 

        if (products.length === 0) {
            emptyProductsMessage.style.display = 'block';
            return;
        } else {
            emptyProductsMessage.style.display = 'none';
        }

        products.forEach(product => {
            const row = productsTableBody.insertRow();
            row.setAttribute('data-id', product.id);
            row.innerHTML = `
                <td><img src="${product.imagenUrl || 'https://via.placeholder.com/60x60?text=No+Img'}" alt="${product.nombre}" onerror="this.onerror=null;this.src='https://via.placeholder.com/60x60?text=No+Img';"></td>
                <td>${product.id}</td>
                <td>${product.nombre}</td>
                <td>$${product.precio ? product.precio.toFixed(2) : '0.00'}</td>
                <td>${product.stock}</td>
                <td>${product.categoria || 'N/A'}</td>
                <td>
                    <div class="actions">
                        <button class="edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i> Editar</button>
                        <button class="delete-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                    </div>
                </td>
            `;
        });

        // Añadir listeners para los botones de editar y eliminar
        productsTableBody.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (event) => editProduct(event.currentTarget.dataset.id));
        });
        productsTableBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => deleteProduct(event.currentTarget.dataset.id));
        });
    }

    /**
     * Maneja el envío del formulario para añadir o actualizar un producto.
     */
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Mapeo de los IDs del formulario HTML a los nombres de atributos de la entidad Producto en Java
        const productData = {
            nombre: productNameInput.value,
            descripcion: productDescriptionInput.value,
            precio: parseFloat(productPriceInput.value),
            stock: parseInt(productStockInput.value, 10),
            categoria: productCategoryInput.value,
            imagenUrl: productImageInput.value
        };

        let method = 'POST';
        let url = API_PRODUCTS_URL;
        let successMsg = 'Producto añadido con éxito!';
        let errorMsg = 'Error al añadir producto.';

        if (editingProductId) { 
            method = 'PUT';
            url = `${API_PRODUCTS_URL}/${editingProductId}`;
            successMsg = 'Producto actualizado con éxito!';
            errorMsg = 'Error al actualizar producto.';
        }

        // --- Obtener el token JWT del almacenamiento local ---
        const token = localStorage.getItem('jwtToken'); 
        if (!token) {
            showStatusMessage('No estás autenticado. Por favor, inicia sesión para realizar esta acción.', 'danger');
            // Opcional: Podrías redirigir al usuario a la página de login aquí
            // window.location.href = '/pages/login.html'; 
            return; // Detiene la ejecución si no hay token
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ¡Aquí se envía el token JWT!
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                // const result = await response.json(); // Si tu backend devuelve el objeto guardado
                showStatusMessage(successMsg, 'success');
                resetForm();
                loadProducts();
            } else if (response.status === 401) {
                showStatusMessage('No autorizado. Tu sesión puede haber expirado. Por favor, inicia sesión de nuevo.', 'danger');
                // Opcional: Redirigir a la página de login si la sesión expiró
                // window.location.href = '/pages/login.html'; 
            }
            else {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Status: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error al guardar/actualizar producto:', error);
            showStatusMessage(`${errorMsg} ${error.message}`, 'danger');
        }
    });

    /**
     * Carga los datos de un producto en el formulario para su edición.
     * @param {string} id - El ID del producto a editar.
     */
    async function editProduct(id) {
        try {
            const response = await fetch(`${API_PRODUCTS_URL}/${id}`); // Petición GET para obtener un solo producto
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Status: ${response.status} - ${errorText}`);
            }
            const productToEdit = await response.json();
            
            productIdInput.value = productToEdit.id;
            productNameInput.value = productToEdit.nombre;
            productDescriptionInput.value = productToEdit.descripcion;
            productPriceInput.value = productToEdit.precio;
            productStockInput.value = productToEdit.stock;
            productCategoryInput.value = productToEdit.categoria || '';
            productImageInput.value = productToEdit.imagenUrl || '';

            editingProductId = id; 
            formTitle.textContent = 'Editar Producto';
            submitButton.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
            submitButton.classList.add('edit-mode');
            cancelEditButton.style.display = 'inline-block';
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazarse al formulario para editar
        } catch (error) {
            console.error('Error al cargar producto para edición:', error);
            showStatusMessage(`No se pudo cargar el producto para editar: ${error.message}`, 'danger');
        }
    }

    /**
     * Elimina un producto de la base de datos.
     * @param {string} id - El ID del producto a eliminar.
     */
    async function deleteProduct(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
            return; 
        }

        // --- Obtener el token JWT del almacenamiento local ---
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            showStatusMessage('No estás autenticado. Por favor, inicia sesión para realizar esta acción.', 'danger');
            // Opcional: Redirigir a la página de login
            // window.location.href = '/pages/login.html'; 
            return; // Detiene la ejecución si no hay token
        }

        try {
            const response = await fetch(`${API_PRODUCTS_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // ¡Aquí se envía el token JWT!
                }
            });

            if (response.ok) {
                showStatusMessage('Producto eliminado con éxito!', 'success');
                loadProducts(); 
                resetForm(); 
            } else if (response.status === 401) {
                showStatusMessage('No autorizado. Tu sesión puede haber expirado. Por favor, inicia sesión de nuevo.', 'danger');
                // Opcional: Redirigir a la página de login
                // window.location.href = '/pages/login.html';
            } else if (response.status === 404) {
                showStatusMessage('El producto no fue encontrado o ya fue eliminado.', 'warning');
            } else {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Status: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            showStatusMessage(`Error al eliminar producto: ${error.message}`, 'danger');
        }
    }

    // --- Listeners de Eventos Iniciales ---
    cancelEditButton.addEventListener('click', resetForm);

    // Carga inicial: Renderiza los productos al cargar la página (la sección de productos es la predeterminada)
    loadProducts();
});