// ===========================================
// DASHBOARD DE MÉTRICAS Y LOGROS
// ===========================================

(function() {
    const STORAGE_KEY = 'metrics';
    
    // Métricas por defecto
    const defaultMetrics = {
        familiesHelped: 0,
        reviewsCount: 0,
        appointmentsCount: 0,
        yearsExperience: 5
    };
    
    // Función para obtener métricas
    function getMetrics() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : defaultMetrics;
        } catch (error) {
            console.error('Error al cargar métricas:', error);
            return defaultMetrics;
        }
    }
    
    // Función para guardar métricas
    function saveMetrics(metrics) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
        } catch (error) {
            console.error('Error al guardar métricas:', error);
        }
    }
    
    // Función para actualizar métricas automáticamente
    function updateMetricsFromData() {
        const metrics = getMetrics();
        
        // Contar reseñas
        try {
            const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            metrics.reviewsCount = reviews.length;
        } catch (error) {
            console.error('Error al contar reseñas:', error);
        }
        
        // Contar citas confirmadas y realizadas
        try {
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            metrics.appointmentsCount = appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'completed').length;
        } catch (error) {
            console.error('Error al contar citas:', error);
        }
        
        // Estimar familias ayudadas (citas + reseñas)
        metrics.familiesHelped = Math.max(metrics.appointmentsCount, metrics.reviewsCount);
        
        saveMetrics(metrics);
        return metrics;
    }
    
    // Función para animar números
    function animateNumber(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
    
    // Función para renderizar métricas
    function renderMetrics() {
        const metrics = updateMetricsFromData();
        
        // Animar números
        const familiesElement = document.getElementById('families-helped');
        const reviewsElement = document.getElementById('reviews-count');
        const appointmentsElement = document.getElementById('appointments-count');
        
        if (familiesElement) {
            animateNumber(familiesElement, metrics.familiesHelped);
        }
        
        if (reviewsElement) {
            animateNumber(reviewsElement, metrics.reviewsCount);
        }
        
        if (appointmentsElement) {
            animateNumber(appointmentsElement, metrics.appointmentsCount);
        }
    }
    
    // Función para actualizar métricas cuando hay cambios
    function refreshMetrics() {
        renderMetrics();
    }
    
    // Exponer funciones globalmente
    window.refreshMetrics = refreshMetrics;
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Solo renderizar si estamos en la página principal
        if (document.getElementById('families-helped')) {
            renderMetrics();
        }
    });
    
    // Actualizar métricas cuando se añaden reseñas o citas
    const originalReviewsSystem = window.ReviewsSystem;
    if (originalReviewsSystem) {
        const originalSaveReviews = originalReviewsSystem.saveReviews;
        originalReviewsSystem.saveReviews = function(reviews) {
            originalSaveReviews.call(this, reviews);
            refreshMetrics();
        };
    }
    
})();
