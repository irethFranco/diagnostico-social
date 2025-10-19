// ===========================================
// SISTEMA DE RESEÑAS (localStorage)
// ===========================================

(function() {
    const STORAGE_KEY = 'reviews';
    
    // Función para obtener reseñas del localStorage
    function getReviews() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (error) {
            console.error('Error al cargar reseñas:', error);
            return [];
        }
    }
    
    // Función para guardar reseñas en localStorage
    function saveReviews(reviews) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        } catch (error) {
            console.error('Error al guardar reseñas:', error);
        }
    }
    
    // Función para generar ID único
    function generateReviewId() {
        return 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Función para formatear fecha
    function formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('es-ES', options);
    }
    
    // Función para generar estrellas
    function generateStars(rating) {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    }
    
    // Función para renderizar testimonios
    function renderTestimonials() {
        const reviews = getReviews();
        const testimonialsList = document.getElementById('testimonialsList');
        
        if (!testimonialsList) return;
        
        if (reviews.length === 0) {
            testimonialsList.innerHTML = `
                <div class="no-testimonials">
                    <p>📝 Aún no hay testimonios. ¡Sé el primero en compartir tu experiencia!</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha (más recientes primero)
        const sortedReviews = reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        testimonialsList.innerHTML = sortedReviews.map(review => `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <div class="testimonial-name">${review.name || 'Usuario Anónimo'}</div>
                    <div class="testimonial-rating">${generateStars(review.rating)}</div>
                </div>
                <div class="testimonial-comment">"${review.comment}"</div>
                <div class="testimonial-date">${formatDate(review.date)}</div>
            </div>
        `).join('');
    }
    
    // Función para manejar el envío del formulario
    function handleReviewSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const name = document.getElementById('reviewerName').value.trim();
        const rating = document.querySelector('input[name="rating"]:checked');
        const comment = document.getElementById('reviewComment').value.trim();
        
        // Validaciones
        if (!rating) {
            alert('⭐ Por favor, selecciona una calificación con las estrellas.');
            return;
        }
        
        if (!comment) {
            alert('💬 Por favor, escribe tu comentario.');
            return;
        }
        
        if (comment.length < 10) {
            alert('📝 Tu comentario debe tener al menos 10 caracteres.');
            return;
        }
        
        // Crear nueva reseña
        const newReview = {
            id: generateReviewId(),
            name: name || null,
            rating: parseInt(rating.value),
            comment: comment,
            date: new Date().toISOString(),
            approved: true // Por defecto aprobadas
        };
        
        // Guardar reseña
        const reviews = getReviews();
        reviews.push(newReview);
        saveReviews(reviews);
        
        // Limpiar formulario
        form.reset();
        
        // Mostrar mensaje de éxito
        showSuccessMessage();
        
        // Actualizar testimonios
        renderTestimonials();
    }
    
    // Función para mostrar mensaje de éxito
    function showSuccessMessage() {
        const button = document.querySelector('.submit-review-btn');
        const originalText = button.textContent;
        
        button.textContent = '✅ ¡Reseña enviada!';
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
        }, 2000);
    }
    
    // Función para inicializar el sistema de reseñas
    function initReviewsSystem() {
        const reviewForm = document.getElementById('reviewForm');
        
        if (reviewForm) {
            reviewForm.addEventListener('submit', handleReviewSubmit);
        }
        
        // Renderizar testimonios existentes
        renderTestimonials();
    }
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', initReviewsSystem);
    
    // Exponer funciones para uso externo si es necesario
    window.ReviewsSystem = {
        getReviews,
        saveReviews,
        renderTestimonials
    };
    
})();
