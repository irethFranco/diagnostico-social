// ===========================================
// SISTEMA DE AUTENTICACIÓN
// ===========================================

class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // Limpieza defensiva: ocultar enlaces ADMIN si no corresponde
        this.removeAdminLinksIfNotAdmin();
        this.checkUserSession();
        this.bindEvents();
        this.addAdminLink();
    }

    // Verificar si el usuario está logueado
    checkUserSession() {
        const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
        if (isAdmin) {
            // Si es admin, permitir acceso a la página sin forzar login de usuario
            return true;
        }
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const username = localStorage.getItem('username');
        
        if (!isLoggedIn || !username) {
            // Si no está logueado, redirigir al login
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Inicializar sesión del usuario
    initUserSession() {
        const userIcon = document.getElementById('userIcon');
        const userName = document.getElementById('userName');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginLogoutLink = document.getElementById('loginLogoutLink');
        
        // Verificar si el usuario está logueado
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        const username = localStorage.getItem('username');
        
        if (isLoggedIn && username) {
            // Asegurar que solo admins vean ADMIN
            this.removeAdminLinksIfNotAdmin();
            // Mostrar enlace a Mi Perfil
            const profileLink = document.getElementById('profileLink');
            if (profileLink) {
                profileLink.style.display = 'block';
            }
            
            // Cambiar el enlace del navbar a logout
            loginLogoutLink.textContent = 'LOGOUT';
            loginLogoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
            
            // Mostrar ícono de usuario
            userIcon.style.display = 'block';
            userName.textContent = username;
            
            // Mostrar/ocultar dropdown al hacer clic
            userIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
            });
            
            // Cerrar dropdown al hacer clic fuera
            document.addEventListener('click', () => {
                userDropdown.style.display = 'none';
            });
            
            // Función de logout
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
            
            // Función para ir a Mi Perfil
            const profileMenuItem = userDropdown.querySelector('.menu-item');
            if (profileMenuItem) {
                profileMenuItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'perfil.html';
                });
            }
        }
    }

    // Función de logout
    logout() {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('username');
        // Asegurar que no se muestre ADMIN a usuarios normales
        localStorage.removeItem('adminLoggedIn');
        alert('Sesión cerrada correctamente');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    // Bindear eventos
    bindEvents() {
        // Eventos específicos de autenticación si los hay
    }

    // Mostrar enlace de admin si está logueado como admin
    addAdminLink() {
        const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
        if (!isAdmin) { this.removeAdminLinksIfNotAdmin(); return; }
        try {
            const nav = document.querySelector('.nav-links');
            if (!nav) return;
            // Evitar duplicado
            if (nav.querySelector('#adminLink')) return;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.id = 'adminLink';
            a.href = 'admin.html';
            a.textContent = 'ADMIN';
            li.appendChild(a);
            nav.insertBefore(li, nav.firstChild);
        } catch (_) {}
    }

    removeAdminLinksIfNotAdmin() {
        const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
        if (isAdmin) return;
        try {
            const nav = document.querySelector('.nav-links');
            if (!nav) return;
            // Por id conocido
            const byId = nav.querySelector('#adminLink');
            if (byId && byId.parentElement) byId.parentElement.remove();
            // Limpieza extra: por texto/href
            const anchors = nav.querySelectorAll('a');
            anchors.forEach(a => {
                if ((a.textContent || '').trim().toUpperCase() === 'ADMIN' || (a.getAttribute('href') || '') === 'admin.html') {
                    if (a.parentElement) a.parentElement.remove();
                }
            });
        } catch(_) {}
    }
}

// Exportar para uso global
window.AuthSystem = AuthSystem;
