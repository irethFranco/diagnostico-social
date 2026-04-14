// ===========================================
// SISTEMA DE LOGIN
// ===========================================

class LoginSystem {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        console.log('🔗 Vinculando eventos del sistema de login...');
        
        // Verificar si jQuery está disponible, si no usar métodos nativos
        const hasJQuery = typeof $ !== 'undefined';
        console.log('jQuery disponible:', hasJQuery);
        
        // Animación entre paneles - Login a Registro
        const registerPanel = document.querySelector('.form-panel.two');
        if (registerPanel) {
            registerPanel.addEventListener('click', (e) => {
                if (!registerPanel.classList.contains('active')) {
                    e.preventDefault();
                    this.showRegisterPanel();
                }
            });
        }

        // Botón X para regresar al Login
        const formToggle = document.querySelector('.form-toggle');
        if (formToggle) {
            formToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginPanel();
            });
        }

        // Enlace "¿No tienes cuenta?" para ir al registro
        this.addRegisterLink();
        this.addLoginLink();

        // Validación y envío del formulario de registro
        const registerForm = document.querySelector('.form-panel.two form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📝 Formulario de registro enviado');
                this.handleRegister(e);
            });
        }

        // Validación y envío del formulario de login
        const loginForm = document.querySelector('.form-panel.one form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📝 Formulario de login enviado');
                this.handleLogin(e);
            });
        }
        
        console.log('✅ Eventos vinculados correctamente');
    }

    showRegisterPanel() {
        const formToggle = document.querySelector('.form-toggle');
        const panelOne = document.querySelector('.form-panel.one');
        const panelTwo = document.querySelector('.form-panel.two');
        const form = document.querySelector('.form');
        
        if (formToggle) formToggle.classList.add('visible');
        if (panelOne) panelOne.classList.add('hidden');
        if (panelTwo) panelTwo.classList.add('active');
        
        // Animación simple sin jQuery
        if (form && panelTwo) {
            form.style.height = panelTwo.scrollHeight + 'px';
        }
    }

    showLoginPanel() {
        const formToggle = document.querySelector('.form-toggle');
        const panelOne = document.querySelector('.form-panel.one');
        const panelTwo = document.querySelector('.form-panel.two');
        const form = document.querySelector('.form');
        
        if (formToggle) formToggle.classList.remove('visible');
        if (panelOne) panelOne.classList.remove('hidden');
        if (panelTwo) panelTwo.classList.remove('active');
        
        // Animación simple sin jQuery
        if (form && panelOne) {
            form.style.height = panelOne.scrollHeight + 'px';
        }
    }

    addRegisterLink() {
        const existingLink = document.querySelector('.go-to-register');
        if (!existingLink) {
            const panelOne = document.querySelector('.form-panel.one');
            if (panelOne) {
                const linkDiv = document.createElement('div');
                linkDiv.className = 'form-group';
                linkDiv.style.cssText = 'text-align: center; margin-top: 20px;';
                
                const link = document.createElement('a');
                link.href = '#';
                link.className = 'go-to-register';
                link.style.cssText = 'color: #4285F4; text-decoration: none; font-size: 14px;';
                link.textContent = '¿No tienes cuenta? Regístrate aquí';
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showRegisterPanel();
                });
                
                linkDiv.appendChild(link);
                panelOne.appendChild(linkDiv);
            }
        }
    }

    addLoginLink() {
        const existingLink = document.querySelector('.go-to-login');
        if (!existingLink) {
            const panelTwo = document.querySelector('.form-panel.two');
            if (panelTwo) {
                const linkDiv = document.createElement('div');
                linkDiv.className = 'form-group';
                linkDiv.style.cssText = 'text-align: center; margin-top: 20px;';
                
                const link = document.createElement('a');
                link.href = '#';
                link.className = 'go-to-login';
                link.style.cssText = 'color: #FFFFFF; text-decoration: none; font-size: 14px;';
                link.textContent = '¿Ya tienes cuenta? Inicia sesión aquí';
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showLoginPanel();
                });
                
                linkDiv.appendChild(link);
                panelTwo.appendChild(linkDiv);
            }
        }
    }

    handleRegister(e) {
        console.log('🔍 Intentando registrar usuario...');
        
        // Obtener valores de los campos usando métodos nativos como fallback
        const username = this.getValue('reg_username');
        const password = this.getValue('reg_password');
        const confirmPassword = this.getValue('reg_cpassword');
        const email = this.getValue('reg_email');
        
        console.log('📝 Datos del formulario:', { username, email });
        
        // Validaciones
        if (!username || username.length < 3) {
            alert('El usuario debe tener al menos 3 caracteres');
            this.focusElement('reg_username');
            return;
        }
        
        if (!password || password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            this.focusElement('reg_password');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            this.focusElement('reg_cpassword');
            return;
        }
        
        if (!email || !email.includes('@')) {
            alert('Por favor ingresa un correo electrónico válido');
            this.focusElement('reg_email');
            return;
        }
        
        // Verificar si el usuario ya existe
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userExists = existingUsers.some(user => user.username === username || user.email === email);
        
        if (userExists) {
            alert('El usuario o correo electrónico ya está registrado');
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            username: username,
            email: email,
            password: password, // En producción esto debería estar encriptado
            registeredAt: new Date().toISOString()
        };
        
        // Guardar usuario
        existingUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
        
        console.log('✅ Usuario registrado exitosamente:', newUser);
        
        // Mostrar mensaje de éxito
        alert('¡Te has registrado correctamente! Ahora puedes iniciar sesión.');
        
        // Limpiar formulario
        this.clearForm(['reg_username', 'reg_password', 'reg_cpassword', 'reg_email']);
        
        // Cambiar al panel de login
        setTimeout(() => {
            this.showLoginPanel();
        }, 1500);
    }

    handleLogin(e) {
        console.log('🔍 Intentando iniciar sesión...');
        
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        
        const username = usernameField ? usernameField.value : '';
        const password = passwordField ? passwordField.value : '';
        
        console.log('📝 Datos de login:', { username });
        
        if (!username || username.length < 3) {
            alert('Por favor ingresa un usuario válido');
            if (usernameField) usernameField.focus();
            return;
        }
        
        // Acceso ADMIN: verificar credenciales de admin PRIMERO
        if (username === 'admin' && password === '1234') {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminCredentials', JSON.stringify({username: 'admin', password: '1234'}));
            alert('Acceso administrador concedido');
            window.location.href = 'index.html';
            return;
        }

        // Verificar credenciales de admin guardadas
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

        // Validación de contraseña solo para usuarios normales
        if (!password || password.length < 6) {
            alert('Por favor ingresa una contraseña válida');
            if (passwordField) passwordField.focus();
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
    
    // Función auxiliar para obtener valores de campos
    getValue(id) {
        const element = document.getElementById(id);
        if (element) {
            return element.value;
        }
        return '';
    }
    
    // Función auxiliar para enfocar elementos
    focusElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.focus();
        }
    }
    
    // Función auxiliar para limpiar formulario
    clearForm(ids) {
        ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
    }
}

// Exportar para uso global
window.LoginSystem = LoginSystem;

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de login...');
    if (typeof LoginSystem !== 'undefined') {
        window.loginSystem = new LoginSystem();
        console.log('✅ Sistema de login inicializado correctamente');
    } else {
        console.error('❌ LoginSystem no está disponible');
    }
});

