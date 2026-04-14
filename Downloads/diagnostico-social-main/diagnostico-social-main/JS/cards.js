// ===========================================
// SISTEMA DE TARJETAS INTERACTIVAS
// ===========================================

class CardSystem {
    constructor() {
        this.init();
    }

    init() {
        this.initCardClick();
        this.initFeatureCards();
    }

    // Función para manejar el click en las tarjetas de características
    initCardClick() {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            card.addEventListener('click', function() {
                // Remover clase 'clicked' de todas las tarjetas
                cards.forEach(c => c.classList.remove('clicked'));
                // Agregar clase 'clicked' a la tarjeta clickeada
                this.classList.add('clicked');
            });
        });
    }

    // Función para las tarjetas de Misión y Visión
    initFeatureCards() {
        // Las cartas ya están estáticas, no necesitan JavaScript especial
        // Solo se mantiene para compatibilidad
        console.log('Sistema de tarjetas inicializado');
    }

    // Función para agregar efectos adicionales a las tarjetas
    addHoverEffects() {
        const cards = document.querySelectorAll('.mission-card, .vision-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-12px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
}

// Exportar para uso global
window.CardSystem = CardSystem;

