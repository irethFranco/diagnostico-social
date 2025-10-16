// ===========================================
// ARCHIVO PRINCIPAL - INICIALIZACIÓN
// ===========================================

class MainApp {
    constructor() {
        this.init();
    }

    init() {
        // Esperar a que el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });
    }

    initializeApp() {
        // Detectar qué página estamos cargando
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                this.initIndexPage();
                break;
            case 'login':
                this.initLoginPage();
                break;
            case 'diagnostic':
                this.initDiagnosticPage();
                break;
            default:
                console.log('Página no reconocida');
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename === 'index.html' || filename === '' || path.endsWith('/')) {
            return 'index';
        } else if (filename === 'login.html') {
            return 'login';
        } else if (filename === 'diagnostico.html') {
            return 'diagnostic';
        }
        
        return 'unknown';
    }

    initIndexPage() {
        console.log('Inicializando página principal...');
        
        // Verificar autenticación
        const auth = new AuthSystem();
        if (auth.checkUserSession()) {
            // Inicializar sistemas de la página principal
            const cards = new CardSystem();
            const missionVision = new MissionVisionSystem();
            
            // Inicializar sesión del usuario
            auth.initUserSession();
        }
    }

    initLoginPage() {
        console.log('Inicializando página de login...');
        
        // Inicializar sistema de login
        const login = new LoginSystem();
    }

    initDiagnosticPage() {
        console.log('Inicializando página de diagnóstico...');
        
        // Inicializar sistema de diagnóstico
        const diagnostic = new DiagnosticForm();
    }
}

// ===========================================
// SISTEMA DE MISIÓN Y VISIÓN
// ===========================================

class MissionVisionSystem {
    constructor() {
        this.init();
    }

    init() {
        // Las cartas ya están estáticas, no necesitan JavaScript especial
        // Solo se mantiene para compatibilidad
        console.log('Sistema de Misión y Visión inicializado');
    }
}

// ===========================================
// INICIALIZAR APLICACIÓN
// ===========================================

// Inicializar la aplicación principal
new MainApp();

