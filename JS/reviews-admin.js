// ===========================================
// ADMIN: MODERACIÓN DE RESEÑAS
// ===========================================

(function() {
    const STORAGE_KEY = 'reviews';
    
    // Función para obtener reseñas
    function getReviews() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (error) {
            console.error('Error al cargar reseñas:', error);
            return [];
        }
    }
    
    // Función para guardar reseñas
    function saveReviews(reviews) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
        } catch (error) {
            console.error('Error al guardar reseñas:', error);
        }
    }
    
    // Función para formatear fecha
    function formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
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
    
    // Función para renderizar reseñas en el admin
    function renderReviewsAdmin() {
        const reviews = getReviews();
        const reviewsList = document.getElementById('reviewsList');
        
        if (!reviewsList) return;
        
        if (reviews.length === 0) {
            reviewsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b; font-style: italic;">
                    📝 No hay reseñas para moderar
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha (más recientes primero)
        const sortedReviews = reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        reviewsList.innerHTML = sortedReviews.map((review, index) => `
            <div class="user-item" style="grid-template-columns: 1fr 120px 100px auto;">
                <div>
                    <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                        ${review.name || 'Usuario Anónimo'}
                    </div>
                    <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 8px;">
                        ${formatDate(review.date)}
                    </div>
                    <div style="color: #374151; font-style: italic; line-height: 1.4;">
                        "${review.comment}"
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #fbbf24; font-size: 1.1rem;">
                        ${generateStars(review.rating)}
                    </div>
                    <div style="color: #64748b; font-size: 0.8rem; margin-top: 4px;">
                        ${review.rating}/5
                    </div>
                </div>
                <div style="text-align: center;">
                    <span class="chip" style="background: ${review.approved ? '#dcfce7' : '#fef3c7'}; color: ${review.approved ? '#166534' : '#92400e'}; border-color: ${review.approved ? '#bbf7d0' : '#fde68a'};">
                        <span class="dot" style="background: ${review.approved ? '#10b981' : '#f59e0b'};"></span>
                        ${review.approved ? 'Aprobada' : 'Pendiente'}
                    </span>
                </div>
                <div class="toolbar">
                    <button class="btn secondary" onclick="toggleReviewApproval(${index})" style="font-size: 0.8rem; padding: 6px 12px;">
                        ${review.approved ? '❌ Desaprobar' : '✅ Aprobar'}
                    </button>
                    <button class="btn danger" onclick="deleteReview(${index})" style="font-size: 0.8rem; padding: 6px 12px;">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Función para alternar aprobación de reseña
    function toggleReviewApproval(index) {
        const reviews = getReviews();
        if (index >= 0 && index < reviews.length) {
            reviews[index].approved = !reviews[index].approved;
            saveReviews(reviews);
            renderReviewsAdmin();
        }
    }
    
    // Función para eliminar reseña
    function deleteReview(index) {
        if (confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.')) {
            const reviews = getReviews();
            if (index >= 0 && index < reviews.length) {
                reviews.splice(index, 1);
                saveReviews(reviews);
                renderReviewsAdmin();
            }
        }
    }
    
    // Función para actualizar reseñas
    function refreshReviews() {
        renderReviewsAdmin();
    }
    
    // Función para exportar reseñas
    function exportReviews() {
        const reviews = getReviews();
        if (reviews.length === 0) {
            alert('No hay reseñas para exportar.');
            return;
        }
        
        const csvContent = [
            ['Nombre', 'Calificación', 'Comentario', 'Fecha', 'Aprobada'],
            ...reviews.map(review => [
                review.name || 'Anónimo',
                review.rating,
                `"${review.comment.replace(/"/g, '""')}"`,
                formatDate(review.date),
                review.approved ? 'Sí' : 'No'
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reseñas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Exponer funciones globalmente
    window.toggleReviewApproval = toggleReviewApproval;
    window.deleteReview = deleteReview;
    window.refreshReviews = refreshReviews;
    window.exportReviews = exportReviews;
    
    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Solo renderizar si estamos en la página de admin
        if (document.getElementById('reviewsList')) {
            renderReviewsAdmin();
        }
    });
    
})();
