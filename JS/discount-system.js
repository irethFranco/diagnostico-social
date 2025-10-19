(function() {
    const STORAGE_KEY = 'userDiscounts';
    const NEW_USER_DISCOUNT = 30; // 30% de descuento para usuarios nuevos
    
    // Función para verificar si es usuario nuevo
    function isNewUser() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const discounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            
            // Verificar si ya se mostró el descuento antes
            if (discounts.newUserDiscount && discounts.newUserDiscount.shown) {
                return false; // Ya se mostró, no es nuevo
            }
            
            // Es nuevo si no tiene citas previas
            const hasPreviousAppointments = appointments.some(apt => 
                apt.userEmail === userData.email || 
                apt.userName === userData.name
            );
            
            return !hasPreviousAppointments;
        } catch (error) {
            console.error('Error verificando usuario nuevo:', error);
            return true; // Por defecto, tratar como nuevo
        }
    }
    
    // Función para aplicar descuento automático
    function applyNewUserDiscount() {
        if (isNewUser()) {
            // Mostrar notificación de descuento
            showDiscountNotification();
            
            // Guardar que el usuario tiene descuento disponible
            const discounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            discounts.newUserDiscount = {
                percentage: NEW_USER_DISCOUNT,
                applied: false,
                available: true,
                shown: true, // Marcar como mostrado
                date: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(discounts));
        }
    }
    
    // Función para mostrar notificación de descuento
    function showDiscountNotification() {
        // Crear notificación flotante
        const notification = document.createElement('div');
        notification.className = 'discount-notification';
        notification.innerHTML = `
            <div class="discount-notification-content">
                <div class="discount-notification-icon">🎉</div>
                <div class="discount-notification-text">
                    <h4>¡Bienvenido!</h4>
                    <p>Tienes <strong>30% OFF</strong> en tu primera consulta</p>
                </div>
                <button class="discount-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 8 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }
    
    // Función para verificar si el usuario tiene descuento disponible
    function hasDiscountAvailable() {
        try {
            const discounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return discounts.newUserDiscount && 
                   discounts.newUserDiscount.available && 
                   !discounts.newUserDiscount.applied;
        } catch (error) {
            return false;
        }
    }
    
    // Función para aplicar descuento a una cita
    function applyDiscountToAppointment(appointmentData) {
        if (hasDiscountAvailable()) {
            const discounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            discounts.newUserDiscount.applied = true;
            discounts.newUserDiscount.available = false;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(discounts));
            
            // Agregar información de descuento a la cita
            appointmentData.discountApplied = true;
            appointmentData.discountPercentage = NEW_USER_DISCOUNT;
            appointmentData.originalPrice = 'Precio normal';
            appointmentData.discountedPrice = '30% OFF aplicado';
            
            return true;
        }
        return false;
    }
    
    // Función para limpiar descuentos cuando se agende una cita
    function clearDiscountAfterBooking() {
        try {
            const discounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (discounts.newUserDiscount) {
                discounts.newUserDiscount.applied = true;
                discounts.newUserDiscount.available = false;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(discounts));
            }
        } catch (error) {
            console.error('Error limpiando descuentos:', error);
        }
    }
    
    // Función para mostrar descuento en el formulario de citas
    function showDiscountInForm() {
        if (hasDiscountAvailable()) {
            const discountBanner = document.createElement('div');
            discountBanner.className = 'form-discount-banner';
            discountBanner.innerHTML = `
                <div class="form-discount-content">
                    <span class="form-discount-icon">🎉</span>
                    <span class="form-discount-text">¡Tienes 30% OFF en tu primera consulta!</span>
                </div>
            `;
            
            // Insertar antes del formulario
            const form = document.getElementById('appointmentForm');
            if (form) {
                form.parentNode.insertBefore(discountBanner, form);
            }
        }
    }
    
    // Función para actualizar precios con descuento
    function updatePricesWithDiscount() {
        if (hasDiscountAvailable()) {
            // Actualizar los precios en las tarjetas de especialistas
            const priceElements = document.querySelectorAll('.price-tag');
            priceElements.forEach(element => {
                const originalText = element.textContent;
                if (originalText.includes('GRATIS')) {
                    element.innerHTML = `
                        <span style="text-decoration: line-through; opacity: 0.7;">${originalText}</span>
                        <br>
                        <span style="color: #dc2626; font-weight: bold;">30% OFF</span>
                    `;
                } else {
                    element.innerHTML = `
                        <span style="text-decoration: line-through; opacity: 0.7;">${originalText}</span>
                        <br>
                        <span style="color: #dc2626; font-weight: bold;">30% OFF</span>
                    `;
                }
            });
        }
    }
    
    // Inicializar sistema de descuentos
    function initDiscountSystem() {
        // Verificar si es usuario nuevo al cargar la página
        applyNewUserDiscount();
        
        // Mostrar descuento en formulario de citas
        showDiscountInForm();
        
        // Actualizar precios si hay descuento disponible
        updatePricesWithDiscount();
    }
    
    // Exponer funciones globalmente
    window.applyNewUserDiscount = applyNewUserDiscount;
    window.hasDiscountAvailable = hasDiscountAvailable;
    window.applyDiscountToAppointment = applyDiscountToAppointment;
    window.updatePricesWithDiscount = updatePricesWithDiscount;
    window.clearDiscountAfterBooking = clearDiscountAfterBooking;
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', initDiscountSystem);
})();
