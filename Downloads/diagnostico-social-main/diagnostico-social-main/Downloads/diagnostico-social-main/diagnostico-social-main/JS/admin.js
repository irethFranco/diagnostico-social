// ===========================================
// PANEL ADMINISTRADOR (local, sin backend)
// ===========================================

(function() {
    function init() {
        bindEvents();
        ensureDefaultCreds();
        setupGate();
    }

    function bindEvents() {
        const saveBtn = document.getElementById('saveAdminJson');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const txt = document.getElementById('adminJson').value.trim();
                try {
                    const json = JSON.parse(txt);
                    if (!json.username || !json.password) throw new Error('JSON debe incluir username y password');
                    localStorage.setItem('adminCredentials', JSON.stringify(json));
                    alert('Credenciales guardadas');
                } catch (e) {
                    alert('JSON inválido: ' + e.message);
                }
            });
        }

        const exportBtn = document.getElementById('exportUsers');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportUsersPdf);
        }

        const loginBtn = document.getElementById('loginAdmin');
        if (loginBtn) {
            loginBtn.addEventListener('click', tryLogin);
        }

        const logoutBtn = document.getElementById('logoutAdmin');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('adminLoggedIn');
                // Redirigir al login principal de la app
                window.location.href = 'login.html';
            });
        }

        const goToCreds = document.getElementById('goToCreds');
        if (goToCreds) {
            goToCreds.addEventListener('click', () => {
                document.getElementById('adminContent').style.display = 'grid';
                document.getElementById('adminLogin').scrollIntoView({ behavior: 'smooth' });
            });
        }

        const toggleCreds = document.getElementById('toggleCreds');
        if (toggleCreds) {
            toggleCreds.addEventListener('click', () => {
                const card = document.getElementById('credsCard');
                if (!card) return;
                card.style.display = card.style.display === 'none' ? 'block' : 'none';
            });
        }

        // Eventos para filtros
        const dateFilter = document.getElementById('dateFilter');
        const userFilter = document.getElementById('userFilter');
        const clearFilters = document.getElementById('clearFilters');

        if (dateFilter) {
            dateFilter.addEventListener('change', renderUsers);
        }
        if (userFilter) {
            userFilter.addEventListener('input', renderUsers);
        }
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                if (dateFilter) dateFilter.value = '';
                if (userFilter) userFilter.value = '';
                renderUsers();
            });
        }
    }

    function loadAdminJson() {
        const saved = localStorage.getItem('adminCredentials');
        if (saved) {
            const ta = document.getElementById('adminJson');
            if (ta) ta.value = saved;
        }
    }

    function ensureDefaultCreds() {
        const existing = localStorage.getItem('adminCredentials');
        if (!existing) {
            const defaults = { username: 'admin', password: '1234' };
            localStorage.setItem('adminCredentials', JSON.stringify(defaults));
        }
    }

    function setupGate() {
        const isLogged = localStorage.getItem('adminLoggedIn') === 'true';
        const login = document.getElementById('adminLogin');
        const content = document.getElementById('adminContent');
        if (isLogged) {
            login.style.display = 'none';
            content.style.display = 'grid';
            loadAdminJson();
            renderUsers();
        } else {
            login.style.display = 'block';
            content.style.display = 'none';
        }
    }

    function tryLogin() {
        const credsStr = localStorage.getItem('adminCredentials');
        if (!credsStr) { alert('Primero configura las credenciales en esta página.'); return; }
        let creds; try { creds = JSON.parse(credsStr); } catch (e) { alert('Credenciales inválidas.'); return; }

        const user = document.getElementById('adminUser').value.trim();
        const pass = document.getElementById('adminPass').value.trim();
        if (user === creds.username && pass === creds.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            setupGate();
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    }

    function renderUsers() {
        const list = document.getElementById('usersList');
        if (!list) return;
        
        // Obtener filtros
        const dateFilter = document.getElementById('dateFilter')?.value;
        const userFilter = document.getElementById('userFilter')?.value?.toLowerCase();
        
        const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        let filteredUsers = users;
        
        // Aplicar filtros
        if (dateFilter || userFilter) {
            filteredUsers = users.filter(u => {
                let matchesDate = true;
                let matchesUser = true;
                
                if (dateFilter) {
                    const userDate = u.lastDate ? new Date(u.lastDate).toISOString().split('T')[0] : '';
                    matchesDate = userDate === dateFilter;
                }
                
                if (userFilter) {
                    matchesUser = (u.username || '').toLowerCase().includes(userFilter);
                }
                
                return matchesDate && matchesUser;
            });
        }
        
        if (filteredUsers.length === 0) {
            list.innerHTML = '<div class="muted">No hay usuarios que coincidan con los filtros.</div>';
            return;
        }

        list.innerHTML = '';
        filteredUsers.forEach(u => {
            const count = (u.diagnostics || []).length;
            const last = u.lastDate ? new Date(u.lastDate).toLocaleString('es-ES') : '-';
            const item = document.createElement('div');
            item.className = 'user-item';
            item.innerHTML = `
                <div>
                    <div style="font-weight:700; color:#1e293b">${u.username || 'Usuario'}</div>
                    <div class="muted">${u.userEmail || ''}</div>
                </div>
                <div class="muted">Diagnósticos: <strong>${count}</strong></div>
                <div class="muted">Último: ${last}</div>
                <div style="display:flex; gap:8px;">
                    <button class="btn" data-user="${encodeURIComponent(u.username || '')}">Ver Detalle</button>
                    <button class="btn danger" data-user="${encodeURIComponent(u.username || '')}" onclick="deleteUser('${encodeURIComponent(u.username || '')}')">Eliminar</button>
                </div>
            `;
            list.appendChild(item);

            const viewBtn = item.querySelector('button:not(.danger)');
            viewBtn.addEventListener('click', () => showUserDetail(u));
        });
    }

    function showUserDetail(user) {
        const diags = user.diagnostics || [];
        let msg = `Usuario: ${user.username || 'Usuario'}\nEmail: ${user.userEmail || '-'}\nDiagnósticos: ${diags.length}`;
        diags.forEach((d, i) => {
            msg += `\n\n#${i + 1} - ${new Date(d.date).toLocaleString('es-ES')}`;
            msg += `\nPuntuación: ${d.generalScore}`;
            msg += `\nTítulo: ${d.diagnosisTitle}`;
        });
        alert(msg);
    }

    // Función para eliminar usuario
    window.deleteUser = function(username) {
        if (!confirm(`¿Estás seguro de eliminar al usuario "${username}" y todos sus diagnósticos?`)) {
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        const filteredUsers = users.filter(u => u.username !== username);
        localStorage.setItem('adminUsers', JSON.stringify(filteredUsers));
        
        // También eliminar del historial general si existe
        const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        const filteredHistory = history.filter(h => h.userName !== username);
        localStorage.setItem('diagnosticHistory', JSON.stringify(filteredHistory));
        
        alert('Usuario eliminado correctamente');
        renderUsers();
    };

    async function exportUsersPdf() {
        try {
            const container = document.querySelector('.admin-container');
            if (!container) return;
            if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (_) {} }
            const { jsPDF } = window.jspdf || {};
            if (!window.html2canvas || !jsPDF) {
                alert('Herramientas de PDF no disponibles');
                return;
            }
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (doc) => {
                    doc.body.style.background = '#ffffff';
                    doc.querySelectorAll('*').forEach(el => {
                        el.style.animation = 'none';
                        el.style.transform = 'none';
                        el.style.transition = 'none';
                    });
                }
            });

            const img = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let position = 0;
            let heightLeft = imgHeight;
            pdf.addImage(img, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(img, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }
            pdf.save(`admin_usuarios_${new Date().toISOString().slice(0,10)}.pdf`);
        } catch (e) {
            console.error(e);
            alert('No se pudo exportar el PDF.');
        }
    }

    // Iniciar
    document.addEventListener('DOMContentLoaded', init);
})();


