// ===========================================
// SISTEMA DE PRECIOS Y OFERTAS
// ===========================================

(function() {
    const STORAGE_KEY = 'pricing';
    
    // Precios por defecto
    const defaultPricing = {
        mariela: '💬 Consulta GRATIS',
        francisca: '💬 Consulta GRATIS', 
        yulianis: '💬 Consulta GRATIS',
        mariana: '💬 Consulta GRATIS'
    };
    
    // Función para obtener precios
    function getPricing() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : defaultPricing;
        } catch (error) {
            console.error('Error al cargar precios:', error);
            return defaultPricing;
        }
    }
    
    // Función para guardar precios
    function savePricing(pricing) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pricing));
        } catch (error) {
            console.error('Error al guardar precios:', error);
        }
    }
    
    // Función para actualizar precios en la página
    function updatePricingDisplay() {
        const pricing = getPricing();
        
        // Actualizar cada especialista
        Object.keys(pricing).forEach(specialist => {
            const element = document.getElementById(`price-${specialist}`);
            if (element) {
                element.textContent = pricing[specialist];
            }
        });
    }
    
    // Función para cargar precios en el admin
    function loadPricingInAdmin() {
        const pricing = getPricing();
        
        document.getElementById('mariela-price').value = pricing.mariela;
        document.getElementById('francisca-price').value = pricing.francisca;
        document.getElementById('yulianis-price').value = pricing.yulianis;
        document.getElementById('mariana-price').value = pricing.mariana;
    }
    
    // Función para actualizar precios desde el admin
    function updatePricing() {
        const pricing = {
            mariela: document.getElementById('mariela-price').value.trim(),
            francisca: document.getElementById('francisca-price').value.trim(),
            yulianis: document.getElementById('yulianis-price').value.trim(),
            mariana: document.getElementById('mariana-price').value.trim()
        };
        
        // Validar que no estén vacíos
        const emptyFields = Object.entries(pricing).filter(([key, value]) => !value);
        if (emptyFields.length > 0) {
            alert('Por favor, completa todos los campos de precios.');
            return;
        }
        
        savePricing(pricing);
        updatePricingDisplay();
        
        // Mostrar mensaje de éxito
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✅ Guardado!';
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
        }, 2000);
    }
    
    // Función para restaurar precios por defecto
    function resetPricing() {
        if (confirm('¿Estás seguro de que quieres restaurar los precios por defecto?')) {
            savePricing(defaultPricing);
            loadPricingInAdmin();
            updatePricingDisplay();
        }
    }
    
    // Función para refrescar precios
    function refreshPricing() {
        loadPricingInAdmin();
    }
    
    // Exponer funciones globalmente
    window.updatePricing = updatePricing;
    window.resetPricing = resetPricing;
    window.refreshPricing = refreshPricing;
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Cargar precios en la página principal
        updatePricingDisplay();
        
        // Cargar precios en el admin si estamos ahí
        if (document.getElementById('mariela-price')) {
            loadPricingInAdmin();
        }
    });
    
})();
