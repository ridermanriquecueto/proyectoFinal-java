document.addEventListener('DOMContentLoaded', () => {

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

    
    const productsTableBody = document.getElementById('products-table-body');
    const emptyProductsMessage = document.getElementById('empty-products-message');
    
  
    const adminMessage = document.createElement('div');
    adminMessage.id = 'admin-status-message';
    adminMessage.style.cssText = 'padding: 10px; margin-bottom: 20px; border-radius: 5px; text-align: center; display: none;';
    productForm.before(adminMessage); 
    const showProductsBtn = document.getElementById('showProductsBtn');
    const showOrdersBtn = document.getElementById('showOrdersBtn');
    const productsManagementSection = document.getElementById('products-management');
    const ordersManagementSection = document.getElementById('orders-management');

   
    const ordersTableBody = document.getElementById('orders-table-body');
    const emptyOrdersMessage = document.getElementById('empty-orders-message');

    let editingProductId = null; 

    -
    const API_PRODUCTS_URL = '/api/productos'; 
    const API_ORDERS_URL = '/api/pedidos'; 
    
      @param {string} message 
      @param {'success' | 'danger' | 'warning' | 'info'} type -
     
    function showStatusMessage(message, type = 'info') {
        adminMessage.textContent = message;
        adminMessage.style.display = 'block';
        if (type === 'success') {
            adminMessage.style.backgroundColor = '#d4edda';
            adminMessage.style.color = '#155724';
        } else if (type === 'danger') {
            adminMessage.style.backgroundColor = '#f8d7da';
            adminMessage.style.color = '#721c24';
        } else if (type === 'warning') {
            adminMessage.style.backgroundColor = '#fff3cd';
            adminMessage.style.color = '#856404';
        } else { 
            adminMessage.style.backgroundColor = '#d1ecf1';
            adminMessage.style.color = '#0c5460';
        }
        setTimeout(() => {
            adminMessage.style.display = 'none';
        }, 5000); 
    }

    
    function resetForm() {
        productForm.reset(); 
        productIdInput.value = ''; 
        editingProductId = null; 
        formTitle.textContent = 'Agregar Nuevo Producto';
        submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
        submitButton.classList.remove('edit-mode');
        cancelEditButton.style.display = 'none';
    }

    
    showProductsBtn.addEventListener('click', () => {
        productsManagementSection.style.display = 'block';
        ordersManagementSection.style.display = 'none';
        showProductsBtn.classList.add('active');
        showOrdersBtn.classList.remove('active');
        loadProducts();
    });

    showOrdersBtn.addEventListener('click', () => {
        productsManagementSection.style.display = 'none';
        ordersManagementSection.style.display = 'block';
        showOrdersBtn.classList.add('active');
        showProductsBtn.classList.remove('active');
        
        loadOrders(); 
    });

   


     
      @returns {Promise<Array>}
     
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
            return []; 
        }
    }

   
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
                <td><img src="${product.imagen || 'https://via.placeholder.com/60x60?text=No+Img'}" alt="${product.nombre}" onerror="this.onerror=null;this.src='https://via.placeholder.com/60x60?text=No+Img';"></td>
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

        
        const productData = {
            nombre: productNameInput.value,
            descripcion: productDescriptionInput.value,
            precio: parseFloat(productPriceInput.value),
            stock: parseInt(productStockInput.value, 10),
            categoria: productCategoryInput.value,
            imagen: productImageInput.value 
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

        
        const user = JSON.parse(localStorage.getItem('user')); 
        const token = user ? user.accessToken : null; 
        
        if (!token) {
            showStatusMessage('No estás autenticado. Por favor, inicia sesión para realizar esta acción.', 'danger');
            return; 
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                showStatusMessage(successMsg, 'success');
                resetForm();
                loadProducts();
            } else if (response.status === 401 || response.status === 403) { 
                showStatusMessage('No autorizado. Tu sesión puede haber expirado o no tienes permisos (rol ADMIN).', 'danger');
            } else {
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
            const response = await fetch(`${API_PRODUCTS_URL}/${id}`); 
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
            productImageInput.value = productToEdit.imagen || ''; 
            editingProductId = id; 
            formTitle.textContent = 'Editar Producto';
            submitButton.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
            submitButton.classList.add('edit-mode');
            cancelEditButton.style.display = 'inline-block';
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
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

        
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.accessToken : null; 

        if (!token) {
            showStatusMessage('No estás autenticado. Por favor, inicia sesión para realizar esta acción.', 'danger');
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
            } else if (response.status === 401 || response.status === 403) {
                showStatusMessage('No autorizado. Tu sesión puede haber expirado o no tienes permisos (rol ADMIN).', 'danger');
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

   

    /**
     * Obtiene todos los pedidos del backend.
     * @returns {Promise<Array>} Una promesa que resuelve con un array de pedidos.
     */
    async function fetchOrders() {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.accessToken : null; 

        if (!token) {
            showStatusMessage('No estás autenticado para ver los pedidos.', 'danger');
            return [];
        }
        try {
            const response = await fetch(API_ORDERS_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Status: ${response.status} - ${errorText}`);
            }
            const orders = await response.json();
            return orders;
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            showStatusMessage(`Error al cargar pedidos: ${error.message}`, 'danger');
            return [];
        }
    }

    
    async function loadOrders() {
        if (!ordersTableBody) {
             console.error("Elemento #orders-table-body no encontrado. Asegúrate de que tu HTML tiene la tabla de pedidos.");
             return;
        }

        ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando pedidos...</td></tr>';
        if (emptyOrdersMessage) emptyOrdersMessage.style.display = 'none';

        const orders = await fetchOrders();
        ordersTableBody.innerHTML = '';

        if (orders.length === 0) {
            if (emptyOrdersMessage) emptyOrdersMessage.style.display = 'block';
            return;
        } else {
            if (emptyOrdersMessage) emptyOrdersMessage.style.display = 'none';
        }

        orders.forEach(order => {
            const row = ordersTableBody.insertRow();
            row.setAttribute('data-id', order.id);
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.username || 'N/A'} (ID: ${order.usuarioId})</td>
                <td>${new Date(order.fechaCreacion).toLocaleString()}</td>
                <td>$${order.total ? order.total.toFixed(2) : '0.00'}</td>
                <td>
                    <select class="order-status-select form-select" data-id="${order.id}">
                        <option value="PENDIENTE" ${order.estado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
                        <option value="CONFIRMADO" ${order.estado === 'CONFIRMADO' ? 'selected' : ''}>CONFIRMADO</option>
                        <option value="ENVIADO" ${order.estado === 'ENVIADO' ? 'selected' : ''}>ENVIADO</option>
                        <option value="ENTREGADO" ${order.estado === 'ENTREGADO' ? 'selected' : ''}>ENTREGADO</option>
                        <option value="CANCELADO" ${order.estado === 'CANCELADO' ? 'selected' : ''}>CANCELADO</option>
                    </select>
                </td>
                <td>
                    <button class="view-details-btn btn btn-info btn-sm" data-id="${order.id}"><i class="fas fa-info-circle"></i> Detalles</button>
                </td>
            `;
        });

        // Añadir listeners para los select de estado
        ordersTableBody.querySelectorAll('.order-status-select').forEach(select => {
            select.addEventListener('change', (event) => updateOrderStatus(event.currentTarget.dataset.id, event.currentTarget.value));
        });

        // Añadir listeners para ver detalles
        ordersTableBody.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (event) => viewOrderDetails(event.currentTarget.dataset.id));
        });
    }

    /**
     * Actualiza el estado de un pedido en el backend.
     * @param {string} orderId - El ID del pedido a actualizar.
     * @param {string} newStatus - El nuevo estado (ej: 'ENVIADO').
     */
    async function updateOrderStatus(orderId, newStatus) {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.accessToken : null; 

        if (!token) {
            showStatusMessage('No estás autenticado para actualizar estados de pedidos.', 'danger');
            return;
        }

        try {
            const response = await fetch(`${API_ORDERS_URL}/${orderId}/estado?estado=${newStatus}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showStatusMessage(`Estado del pedido #${orderId} actualizado a ${newStatus}!`, 'success');
                // No es necesario recargar loadOrders() aquí si solo cambia el select,
                // pero si hubiera más lógica de refresco o filtrado, sería útil.
            } else if (response.status === 401 || response.status === 403) {
                showStatusMessage('No tienes permiso para actualizar este pedido. Tu sesión puede haber expirado o no tienes el rol adecuado (ADMIN).', 'danger');
            } else {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Status: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error al actualizar estado del pedido:', error);
            showStatusMessage(`Error al actualizar pedido: ${error.message}`, 'danger');
        }
    }

    /**
     * Muestra los detalles de un pedido específico (usando un modal).
     * @param {string} orderId - El ID del pedido para mostrar detalles.
     */
    async function viewOrderDetails(orderId) {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.accessToken : null; 

        if (!token) {
            showStatusMessage('No estás autenticado para ver los detalles del pedido.', 'danger');
            return;
        }

        try {
            const response = await fetch(`${API_ORDERS_URL}/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Status: ${response.status} - ${errorText}`);
            }
            const orderDetails = await response.json();

            let detailsHtml = `
                <h3>Detalles del Pedido #${orderDetails.id}</h3>
                <p><strong>Usuario:</strong> ${orderDetails.username} (ID: ${orderDetails.usuarioId})</p>
                <p><strong>Fecha:</strong> ${new Date(orderDetails.fechaCreacion).toLocaleString()}</p>
                <p><strong>Total:</strong> $${orderDetails.total.toFixed(2)}</p>
                <p><strong>Estado:</strong> ${orderDetails.estado}</p>
                <h4>Productos en el Pedido:</h4>
                <ul class="list-group">
            `;
            orderDetails.items.forEach(item => {
                detailsHtml += `
                    <li class="list-group-item d-flex align-items-center">
                        <img src="${item.imageUrlProducto || 'https://via.placeholder.com/30x30?text=No+Img'}" alt="${item.nombreProducto}" class="img-thumbnail me-2" style="width: 30px; height: 30px; object-fit: cover;">
                        <div>
                            <strong>${item.nombreProducto}</strong> (x${item.cantidad})<br>
                            Precio Unitario: $${item.precioUnitario.toFixed(2)} - Subtotal: $${item.subtotal.toFixed(2)}
                        </div>
                    </li>
                `;
            });
            detailsHtml += `</ul>`;

            const orderDetailsModalBody = document.getElementById('orderDetailsModalBody');
            if (orderDetailsModalBody) {
                orderDetailsModalBody.innerHTML = detailsHtml;
               
                const myModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
                myModal.show();
            } else {
                alert(`Detalles del Pedido #${orderDetails.id}:\n\n${JSON.stringify(orderDetails, null, 2)}`);
                console.log('Detalles del pedido:', orderDetails);
            }

        } catch (error) {
            console.error('Error al obtener detalles del pedido:', error);
            showStatusMessage(`No se pudieron cargar los detalles del pedido: ${error.message}`, 'danger');
        }
    }


  
    cancelEditButton.addEventListener('click', resetForm);

  
    loadProducts();
});