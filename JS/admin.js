// ===========================================
// PANEL ADMINISTRADOR (local, sin backend)
// ===========================================

(function() {
    let detailModalState = {
        overlay: null,
        title: null,
        body: null,
        closeBtn: null
    };

    function init() {
        bindEvents();
        ensureDefaultCreds();
        setupGate();
        ensureDetailModal();
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

        const schedulePriorityBtn = document.getElementById('schedulePriorityBtn');
        if (schedulePriorityBtn) {
            schedulePriorityBtn.addEventListener('click', scheduleHighestRiskUser);
        }

        const riskQueueFilter = document.getElementById('riskQueueFilter');
        if (riskQueueFilter) {
            riskQueueFilter.addEventListener('change', renderRiskQueue);
        }

        const refreshRiskQueue = document.getElementById('refreshRiskQueue');
        if (refreshRiskQueue) {
            refreshRiskQueue.addEventListener('click', renderRiskQueue);
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
            renderRiskQueue();
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
        const usersSorted = getUsersSortedByRisk(users);
        let filteredUsers = usersSorted;
        
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
            const riskInfo = getUserRiskInfo(u);
            const item = document.createElement('div');
            item.className = 'user-item';
            item.innerHTML = `
                <div>
                    <div style="font-weight:700; color:#1e293b">${u.username || 'Usuario'}</div>
                    <div class="muted">${u.userEmail || ''}</div>
                    <div class="muted" style="margin-top:6px;">
                        <span class="chip" style="background:#fef3c7;border-color:#fcd34d;color:#92400e;">
                            Riesgo: ${riskInfo.level.toUpperCase()} (${riskInfo.priority})
                        </span>
                    </div>
                </div>
                <div class="muted">Diagnósticos: <strong>${count}</strong></div>
                <div class="muted">Último: ${last}</div>
                <div style="display:flex; gap:8px;">
                    <button class="btn" data-action="view-detail" data-user="${encodeURIComponent(u.username || '')}">Ver Detalle</button>
                    <button class="btn secondary" data-action="schedule-diagnostic">Programar cita</button>
                    <button class="btn danger" data-user="${encodeURIComponent(u.username || '')}" onclick="deleteUser('${encodeURIComponent(u.username || '')}')">Eliminar</button>
                </div>
            `;
            list.appendChild(item);

            const viewBtn = item.querySelector('button[data-action="view-detail"]');
            viewBtn.addEventListener('click', () => showUserDetail(u));
            const scheduleBtn = item.querySelector('button[data-action="schedule-diagnostic"]');
            if (scheduleBtn) {
                scheduleBtn.addEventListener('click', () => scheduleDiagnosticAppointment(u));
            }
        });
    }

    function showUserDetail(user) {
        const diags = user.diagnostics || [];
        const riskInfo = getUserRiskInfo(user);
        const diagnosticsHtml = diags.map((d, i) => {
            const fallbackResult = d?.diagnosisTitle
                ? `Según el diagnóstico, se identifica ${d.diagnosisTitle.toLowerCase()} con puntuación ${d.generalScore ?? 'no disponible'}.`
                : 'No disponible en este diagnóstico.';
            const resultText = d.aiDiagnosis || d.diagnosisDescription || fallbackResult;
            return `
                <div style="padding:10px 12px; border:1px solid #dbeafe; border-radius:10px; background:#f8fbff; margin-bottom:10px;">
                    <div style="font-weight:700; color:#1e293b;">#${i + 1} - ${new Date(d.date).toLocaleString('es-ES')}</div>
                    <div style="color:#334155; margin-top:4px;">Puntuación: <strong>${d.generalScore}</strong></div>
                    <div style="color:#334155; margin-top:2px;">Título: ${d.diagnosisTitle || 'Diagnóstico'}</div>
                    <div style="color:#334155; margin-top:6px; line-height:1.45;">
                        <strong>Resultado:</strong> ${resultText}
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <div style="display:grid; gap:10px;">
                <div style="padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">
                    <div style="color:#0f172a; font-weight:700;">Usuario: ${user.username || 'Usuario'}</div>
                    <div style="color:#475569; margin-top:3px;">Email: ${user.userEmail || '-'}</div>
                    <div style="color:#475569; margin-top:3px;">Diagnósticos: ${diags.length}</div>
                    <div style="margin-top:6px; display:inline-block; padding:4px 10px; border-radius:999px; background:#fef3c7; border:1px solid #fcd34d; color:#92400e; font-weight:700;">
                        Riesgo actual: ${riskInfo.level.toUpperCase()} (${riskInfo.priority})
                    </div>
                </div>
                <div>
                    <div style="font-weight:700; color:#1e293b; margin-bottom:8px;">Historial de diagnósticos</div>
                    ${diagnosticsHtml || '<div style="color:#64748b;">Sin diagnósticos disponibles.</div>'}
                </div>
            </div>
        `;

        openDetailModal('Detalle de diagnóstico', html);
    }

    function ensureDetailModal() {
        if (detailModalState.overlay) return;

        const overlay = document.createElement('div');
        overlay.id = 'adminDetailModal';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            width: min(720px, 95vw);
            max-height: 88vh;
            overflow: auto;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #dbeafe;
            box-shadow: 0 20px 50px rgba(2, 6, 23, 0.35);
            padding: 18px;
        `;

        const header = document.createElement('div');
        header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:12px;';
        const title = document.createElement('h3');
        title.style.cssText = 'margin:0; color:#1e293b; font-size:1.1rem;';
        title.textContent = 'Detalle';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = 'Cerrar';
        closeBtn.style.cssText = `
            border:none;
            border-radius:10px;
            padding:8px 12px;
            cursor:pointer;
            background:#f1f5f9;
            color:#1e293b;
            font-weight:700;
        `;

        const body = document.createElement('div');
        body.style.cssText = 'color:#334155; font-size:0.95rem;';

        header.appendChild(title);
        header.appendChild(closeBtn);
        card.appendChild(header);
        card.appendChild(body);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        closeBtn.addEventListener('click', closeDetailModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeDetailModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                closeDetailModal();
            }
        });

        detailModalState = { overlay, title, body, closeBtn };
    }

    function openDetailModal(title, html) {
        ensureDetailModal();
        detailModalState.title.textContent = title || 'Detalle';
        detailModalState.body.innerHTML = html || '';
        detailModalState.overlay.style.display = 'flex';
    }

    function closeDetailModal() {
        if (!detailModalState.overlay) return;
        detailModalState.overlay.style.display = 'none';
    }

    function deriveRiskFromScore(score) {
        const numeric = Number(score || 0);
        if (numeric >= 30) return { level: 'crítica', priority: 4 };
        if (numeric >= 20) return { level: 'alta', priority: 3 };
        if (numeric >= 10) return { level: 'media', priority: 2 };
        return { level: 'baja', priority: 1 };
    }

    function getLatestDiagnostic(user) {
        const diagnostics = Array.isArray(user?.diagnostics) ? user.diagnostics : [];
        if (diagnostics.length === 0) return null;
        return diagnostics
            .slice()
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0];
    }

    function getUserRiskInfo(user) {
        const latest = getLatestDiagnostic(user);
        if (!latest) return { level: 'baja', priority: 1 };

        const byPriority = Number(latest.riskPriority || 0);
        if (byPriority > 0) {
            return {
                level: latest.riskLevel || (byPriority === 4 ? 'crítica' : byPriority === 3 ? 'alta' : byPriority === 2 ? 'media' : 'baja'),
                priority: byPriority
            };
        }

        return deriveRiskFromScore(latest.generalScore);
    }

    function getUsersSortedByRisk(users) {
        return users.slice().sort((a, b) => {
            const aRisk = getUserRiskInfo(a);
            const bRisk = getUserRiskInfo(b);
            if (bRisk.priority !== aRisk.priority) {
                return bRisk.priority - aRisk.priority;
            }
            const aDate = new Date(a.lastDate || 0).getTime();
            const bDate = new Date(b.lastDate || 0).getTime();
            return bDate - aDate;
        });
    }

    function generateAppointmentId() {
        const rand = Math.random().toString(36).slice(2, 8);
        return `appt_diag_${Date.now()}_${rand}`;
    }

    function isValidWorkingTime(time) {
        const parts = String(time || '').split(':');
        if (parts.length !== 2) return false;
        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;
        const totalMinutes = hours * 60 + minutes;
        const morning = totalMinutes >= (8 * 60) && totalMinutes <= (12 * 60);
        const afternoon = totalMinutes >= (14 * 60) && totalMinutes <= (18 * 60);
        return morning || afternoon;
    }

    function normalizeWorkerId(workerId) {
        if (!workerId) return '';
        const valid = ['mariela', 'francisca', 'yulianis', 'mariana'];
        return valid.includes(workerId) ? workerId : '';
    }

    function getRecommendedWorker(user) {
        const assignments = JSON.parse(localStorage.getItem('diagnosticWorkerAssignments') || '[]');
        const userAssignments = assignments
            .filter(a =>
                (a.userName || '') === (user.username || '') ||
                ((a.userEmail || '') && (a.userEmail || '') === (user.userEmail || ''))
            )
            .sort((a, b) => new Date(b.assignedAt || 0) - new Date(a.assignedAt || 0));

        if (userAssignments.length === 0) return '';
        return normalizeWorkerId(userAssignments[0].workerId || '');
    }

    function scheduleDiagnosticAppointment(user) {
        const diagnosticsCount = (user.diagnostics || []).length;
        if (diagnosticsCount === 0) {
            alert('Este usuario no tiene diagnósticos para programar una cita automática.');
            return;
        }

        const userName = user.username || 'Usuario';
        const userEmail = user.userEmail || '';
        const messageDefault = 'Recibida tu solicitud a través del diagnóstico. Tu cita queda programada en la fecha y hora indicadas.';
        const adminMessage = prompt('Mensaje para el usuario:', messageDefault);
        if (adminMessage === null) return;
        if (!adminMessage.trim()) {
            alert('Debes escribir un mensaje para el usuario.');
            return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const selectedDate = prompt('Fecha de la cita (YYYY-MM-DD):', today);
        if (selectedDate === null) return;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
            alert('Fecha inválida. Debe tener formato YYYY-MM-DD.');
            return;
        }

        const selectedTime = prompt('Hora de la cita (HH:MM, formato 24h):', '10:00');
        if (selectedTime === null) return;
        if (!/^\d{2}:\d{2}$/.test(selectedTime) || !isValidWorkingTime(selectedTime)) {
            alert('Hora inválida. Usa un horario entre 08:00-12:00 o 14:00-18:00.');
            return;
        }

        const suggestedWorker = getRecommendedWorker(user);
        const workerPrompt = `Trabajadora (mariela, francisca, yulianis, mariana).${suggestedWorker ? ` Sugerida: ${suggestedWorker}` : ''}`;
        const selectedWorkerRaw = prompt(workerPrompt, suggestedWorker || '');
        if (selectedWorkerRaw === null) return;
        const selectedWorker = normalizeWorkerId(selectedWorkerRaw.trim().toLowerCase());

        const dateTime = new Date(`${selectedDate}T${selectedTime}`);
        if (Number.isNaN(dateTime.getTime())) {
            alert('No se pudo construir la fecha y hora de la cita.');
            return;
        }

        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const newAppointment = {
            id: generateAppointmentId(),
            userName: userName,
            userEmail: userEmail,
            userPhone: '',
            reason: 'Cita programada desde diagnóstico automático',
            preferredDate: selectedDate,
            preferredTime: selectedTime,
            dateTime: dateTime.toISOString(),
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            origin: 'diagnostic-auto-admin',
            scheduledByAdmin: true,
            adminMessage: adminMessage.trim(),
            assignedWorker: selectedWorker || null
        };

        appointments.push(newAppointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        alert(`Cita programada para ${userName} (${selectedDate} ${selectedTime}). El usuario ya puede verla con tu mensaje.`);
        renderRiskQueue();
    }

    function hasActiveDiagnosticAppointment(user) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        return appointments.some(appt =>
            (appt.origin === 'diagnostic-auto-admin' || appt.origin === 'diagnostic-auto') &&
            (appt.userName || '') === (user.username || '') &&
            (appt.status === 'pending' || appt.status === 'confirmed')
        );
    }

    function scheduleHighestRiskUser() {
        const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        if (!users.length) {
            alert('No hay usuarios con diagnóstico para priorizar.');
            return;
        }

        const ordered = getUsersSortedByRisk(users);
        const candidate = ordered.find(u => !hasActiveDiagnosticAppointment(u));

        if (!candidate) {
            alert('Todos los usuarios priorizados ya tienen una cita activa por diagnóstico.');
            return;
        }

        const riskInfo = getUserRiskInfo(candidate);
        const proceed = confirm(`Se priorizará a ${candidate.username || 'Usuario'} con riesgo ${riskInfo.level.toUpperCase()} (${riskInfo.priority}). ¿Deseas programar su cita ahora?`);
        if (!proceed) return;

        scheduleDiagnosticAppointment(candidate);
        renderUsers();
        renderRiskQueue();
    }

    function getAppointmentStatusForUser(username) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        const userAppointments = appointments
            .filter(appt => (appt.userName || '') === (username || ''))
            .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        if (!userAppointments.length) return 'sin_cita';
        return userAppointments[0].status || 'sin_cita';
    }

    function appointmentStatusLabel(status) {
        if (status === 'confirmed') return 'Confirmada';
        if (status === 'pending') return 'Pendiente';
        if (status === 'completed') return 'Realizada';
        if (status === 'cancelled') return 'Cancelada';
        return 'Sin cita';
    }

    function renderRiskQueue() {
        const list = document.getElementById('riskQueueList');
        if (!list) return;

        const filter = document.getElementById('riskQueueFilter')?.value || 'all';
        const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        const ordered = getUsersSortedByRisk(users);

        let rows = ordered.map(user => {
            const risk = getUserRiskInfo(user);
            const latest = getLatestDiagnostic(user);
            const appointmentStatus = getAppointmentStatusForUser(user.username || '');
            return {
                user,
                risk,
                latest,
                appointmentStatus
            };
        });

        if (filter === 'high') {
            rows = rows.filter(r => r.risk.priority >= 3);
        } else if (filter === 'low') {
            rows = rows.filter(r => r.risk.priority <= 2);
        }

        if (!rows.length) {
            list.innerHTML = '<div class="muted">No hay diagnósticos para este filtro.</div>';
            return;
        }

        list.innerHTML = '';
        rows.forEach((row, index) => {
            const u = row.user;
            const risk = row.risk;
            const lastDate = row.latest?.date ? new Date(row.latest.date).toLocaleString('es-ES') : '-';
            const score = row.latest?.generalScore ?? '-';
            const diagTitle = row.latest?.diagnosisTitle || 'Diagnóstico';
            const statusText = appointmentStatusLabel(row.appointmentStatus);

            const item = document.createElement('div');
            item.className = 'user-item';
            item.innerHTML = `
                <div>
                    <div style="font-weight:700; color:#1e293b">${u.username || 'Usuario'}</div>
                    <div class="muted">${u.userEmail || ''}</div>
                    <div class="muted" style="margin-top:5px;">${diagTitle}</div>
                </div>
                <div class="muted">
                    Puntaje: <strong>${score}</strong><br>
                    Riesgo: <strong>${risk.level.toUpperCase()}</strong><br>
                    Prioridad: <strong>${risk.priority}</strong>
                </div>
                <div class="muted">
                    Último diagnóstico: ${lastDate}<br>
                    Estado cita: <strong>${statusText}</strong><br>
                    Orden cola: <strong>#${index + 1}</strong>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn secondary" data-action="queue-detail">Ver diagnóstico</button>
                    <button class="btn" data-action="queue-schedule">Programar cita</button>
                </div>
            `;

            const detailBtn = item.querySelector('button[data-action="queue-detail"]');
            if (detailBtn) {
                detailBtn.addEventListener('click', () => showUserDetail(u));
            }

            const scheduleBtn = item.querySelector('button[data-action="queue-schedule"]');
            if (scheduleBtn) {
                scheduleBtn.addEventListener('click', () => scheduleDiagnosticAppointment(u));
            }

            list.appendChild(item);
        });
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


