// ===========================================
// SISTEMA DE LOGIN SIMPLE (SIN JQUERY)
// ===========================================

class SimpleLoginSystem {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Inicializando sistema de login simple...');
        this.bindEvents();
    }

    bindEvents() {
        console.log('🔗 Vinculando eventos...');
        
        // Evento para la barra azul (form-panel.two) para ir al registro
        const registerPanel = document.querySelector('.form-panel.two');
        if (registerPanel) {
            registerPanel.addEventListener('click', (e) => {
                // Solo si no está activo (para evitar conflictos)
                if (!registerPanel.classList.contains('active')) {
                    e.preventDefault();
                    console.log('🔄 Clic en barra azul - mostrando registro');
                    this.showRegisterPanel();
                }
            });
        }

        // Evento para el botón X (form-toggle) para volver al login
        const formToggle = document.querySelector('.form-toggle');
        if (formToggle) {
            formToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Clic en X - volviendo al login');
                this.showLoginPanel();
            });
        }
        
        // Eventos para el formulario de registro
        const registerForm = document.querySelector('.form-panel.two form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📝 Formulario de registro enviado');
                this.handleRegister(e);
            });
        }

        // Eventos para el formulario de login
        const loginForm = document.querySelector('.form-panel.one form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📝 Formulario de login enviado');
                this.handleLogin(e);
            });
        }

        // Enlaces de navegación
        this.addNavigationLinks();
        
        console.log('✅ Eventos vinculados correctamente');
    }

    addNavigationLinks() {
        // Agregar enlace "¿No tienes cuenta?" al panel de login
        const loginPanel = document.querySelector('.form-panel.one');
        if (loginPanel && !document.querySelector('.go-to-register')) {
            const registerLink = document.createElement('div');
            registerLink.className = 'form-group';
            registerLink.style.cssText = 'text-align: center; margin-top: 20px;';
            registerLink.innerHTML = `
                <a href="#" class="go-to-register" style="color: #4285F4; text-decoration: none; font-size: 14px;">
                    ¿No tienes cuenta? Regístrate aquí
                </a>
            `;
            loginPanel.appendChild(registerLink);
            
            registerLink.querySelector('.go-to-register').addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterPanel();
            });
        }

        // Agregar enlace "¿Ya tienes cuenta?" al panel de registro
        const registerPanel = document.querySelector('.form-panel.two');
        if (registerPanel && !document.querySelector('.go-to-login')) {
            const loginLink = document.createElement('div');
            loginLink.className = 'form-group';
            loginLink.style.cssText = 'text-align: center; margin-top: 20px;';
            loginLink.innerHTML = `
                <a href="#" class="go-to-login" style="color: #FFFFFF; text-decoration: none; font-size: 14px;">
                    ¿Ya tienes cuenta? Inicia sesión aquí
                </a>
            `;
            registerPanel.appendChild(loginLink);
            
            loginLink.querySelector('.go-to-login').addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginPanel();
            });
        }
    }

    showRegisterPanel() {
        console.log('🔄 Mostrando panel de registro...');
        const formToggle = document.querySelector('.form-toggle');
        const loginPanel = document.querySelector('.form-panel.one');
        const registerPanel = document.querySelector('.form-panel.two');
        const form = document.querySelector('.form');
        
        if (formToggle) formToggle.classList.add('visible');
        if (loginPanel) loginPanel.classList.add('hidden');
        if (registerPanel) registerPanel.classList.add('active');
        
        if (form) {
            form.style.height = registerPanel.scrollHeight + 'px';
        }
    }

    showLoginPanel() {
        console.log('🔄 Mostrando panel de login...');
        const formToggle = document.querySelector('.form-toggle');
        const loginPanel = document.querySelector('.form-panel.one');
        const registerPanel = document.querySelector('.form-panel.two');
        const form = document.querySelector('.form');
        
        if (formToggle) formToggle.classList.remove('visible');
        if (loginPanel) loginPanel.classList.remove('hidden');
        if (registerPanel) registerPanel.classList.remove('active');
        
        if (form) {
            form.style.height = loginPanel.offsetHeight + 'px';
        }
    }

    handleRegister(e) {
        console.log('🔍 Intentando registrar usuario...');
        console.log('🔍 Evento recibido:', e);
        
        // Obtener valores de los campos
        const username = document.getElementById('reg_username')?.value || '';
        const password = document.getElementById('reg_password')?.value || '';
        const confirmPassword = document.getElementById('reg_cpassword')?.value || '';
        const email = document.getElementById('reg_email')?.value || '';
        
        console.log('📝 Datos del formulario:', { username, email, password: password ? '***' : 'vacío' });
        
        // Validaciones
        if (!username || username.length < 3) {
            alert('El usuario debe tener al menos 3 caracteres');
            document.getElementById('reg_username')?.focus();
            return;
        }
        
        if (!password || password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            document.getElementById('reg_password')?.focus();
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            document.getElementById('reg_cpassword')?.focus();
            return;
        }
        
        if (!email || !email.includes('@') || !email.includes('.')) {
            alert('Por favor ingresa un correo electrónico válido');
            document.getElementById('reg_email')?.focus();
            return;
        }
        
        // Verificar si el usuario ya existe
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        console.log('👥 Usuarios existentes:', existingUsers);
        
        const userExists = existingUsers.some(user => 
            user.username.toLowerCase() === username.toLowerCase() || 
            user.email.toLowerCase() === email.toLowerCase()
        );
        
        if (userExists) {
            alert('El usuario o correo electrónico ya está registrado');
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            username: username,
            email: email,
            password: password,
            registeredAt: new Date().toISOString()
        };
        
        // Guardar usuario
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        console.log('✅ Usuario registrado exitosamente:', newUser);
        console.log('💾 Usuarios guardados en localStorage:', JSON.parse(localStorage.getItem('registeredUsers') || '[]'));
        
        // Mostrar mensaje de éxito
        alert('¡Te has registrado correctamente! Ahora puedes iniciar sesión.');
        
        // Limpiar formulario
        document.getElementById('reg_username').value = '';
        document.getElementById('reg_password').value = '';
        document.getElementById('reg_cpassword').value = '';
        document.getElementById('reg_email').value = '';
        
        // Cambiar al panel de login
        setTimeout(() => {
            this.showLoginPanel();
        }, 1500);
    }

    handleLogin(e) {
        console.log('🔍 Intentando iniciar sesión...');
        
        const username = document.getElementById('username')?.value || '';
        const password = document.getElementById('password')?.value || '';
        
        console.log('📝 Datos de login:', { username });
        
        if (!username || username.length < 3) {
            alert('Por favor ingresa un usuario válido');
            document.getElementById('username')?.focus();
            return;
        }
        
        // Acceso ADMIN desde el login principal
        try {
            const adminCredsStr = localStorage.getItem('adminCredentials');
            if (adminCredsStr) {
                const adminCreds = JSON.parse(adminCredsStr);
                if (username === adminCreds.username && password === adminCreds.password) {
                    localStorage.setItem('adminLoggedIn', 'true');
                    alert('Acceso administrador concedido');
                    window.location.href = 'index.html';
                    return;
                }
            }
        } catch (_) {}

        if (!password || password.length < 6) {
            alert('Por favor ingresa una contraseña válida');
            document.getElementById('password')?.focus();
            return;
        }
        
        // Verificar credenciales contra usuarios registrados
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = registeredUsers.find(u => u.username === username && u.password === password);
        
        if (!user) {
            alert('Usuario o contraseña incorrectos. Verifica tus datos o regístrate si no tienes cuenta.');
            return;
        }
        
        console.log('✅ Login exitoso para usuario:', user.username);
        
        // Guardar sesión en localStorage
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('userEmail', user.email);
        
        // Mostrar mensaje de éxito y redirigir
        alert('¡Inicio de sesión exitoso!');
        window.location.href = 'index.html';
    }
}

// Exportar para uso global
window.SimpleLoginSystem = SimpleLoginSystem;

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de login simple...');
    if (typeof SimpleLoginSystem !== 'undefined') {
        window.simpleLoginSystem = new SimpleLoginSystem();
        console.log('✅ Sistema de login simple inicializado correctamente');
    } else {
        console.error('❌ SimpleLoginSystem no está disponible');
    }
});
