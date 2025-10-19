// ===========================================
// ADMIN - Gestión de Citas (localStorage)
// ===========================================

(function() {
    function getAppointments() {
        try { return JSON.parse(localStorage.getItem('appointments') || '[]'); } catch(_) { return []; }
    }
    
    function getWorkerName(workerId) {
        const workers = {
            'mariela': 'Mariela - Especialista en Diagnóstico Social',
            'francisca': 'Francisca - Especialista en Trabajo Social', 
            'yulianis': 'Yulianis - Especialista en Terapia Familiar',
            'mariana': 'Mariana - Especialista en Intervención Social'
        };
        return workers[workerId] || 'No asignada';
    }
    function saveAppointments(list) {
        localStorage.setItem('appointments', JSON.stringify(list));
    }

    function renderAppointments() {
        const listEl = document.getElementById('appointmentsList');
        if (!listEl) return;

        const dateFilter = document.getElementById('apptDateFilter')?.value || '';
        const statusFilter = document.getElementById('apptStatusFilter')?.value || '';
        const workerFilter = document.getElementById('workerFilter')?.value || '';

        const appts = getAppointments();
        let filtered = appts;
        if (dateFilter) {
            filtered = filtered.filter(a => (a.dateTime || '').startsWith(dateFilter));
        }
        if (statusFilter) {
            filtered = filtered.filter(a => a.status === statusFilter);
        }
        if (workerFilter === 'unassigned') {
            filtered = filtered.filter(a => !a.assignedWorker);
        } else if (workerFilter) {
            filtered = filtered.filter(a => a.assignedWorker === workerFilter);
        }

        if (filtered.length === 0) {
            listEl.innerHTML = '<div class="muted">No hay citas para los filtros seleccionados.</div>';
            return;
        }

        listEl.innerHTML = '';
        filtered
            .sort((a,b) => (a.dateTime || '').localeCompare(b.dateTime || ''))
            .forEach(a => {
                const when = a.dateTime ? new Date(a.dateTime).toLocaleString('es-ES') : `${a.preferredDate} ${a.preferredTime}`;
                const item = document.createElement('div');
                item.className = 'user-item';
                item.innerHTML = `
                    <div>
                        <div style="font-weight:700; color:#1e293b">${a.userName || 'Usuario'}</div>
                        <div class="muted">${a.userEmail || ''} · ${a.userPhone || ''}</div>
                        <div class="muted" style="margin-top: 5px; font-size: 0.85rem;">
                            <strong>Motivo:</strong> ${a.reason || 'No especificado'}
                        </div>
                        ${a.assignedWorker ? `<div style="margin-top: 5px; padding: 4px 8px; background: #e0f2fe; border-radius: 6px; font-size: 0.85rem; color: #0369a1;">
                            <strong>👩‍💼 Asignada a:</strong> ${getWorkerName(a.assignedWorker)}
                        </div>` : ''}
                    </div>
                    <div class="muted">${when}</div>
                    <div><span class="chip"><span class="dot"></span> ${a.status === 'pending' ? 'pendiente' : a.status === 'confirmed' ? 'confirmada' : a.status === 'completed' ? 'realizada' : 'cancelada'}</span></div>
                    <div style="display:flex; gap:8px; flex-wrap: wrap;">
                        <button class="btn" data-action="confirm">Confirmar</button>
                        <button class="btn" data-action="completed" style="background: linear-gradient(135deg, #10b981, #059669);">✅ Realizada</button>
                        <button class="btn secondary" data-action="pending">Marcar pendiente</button>
                        <button class="btn danger" data-action="cancel">Cancelar</button>
                    </div>
                    <div style="margin-top: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <label style="font-weight: 600; color: #374151; font-size: 0.9rem; display: block; margin-bottom: 5px;">👩‍💼 Asignar Trabajadora Social:</label>
                        <select class="worker-assignment" data-appointment-id="${a.id}" style="width: 100%; padding: 8px 12px; border: 2px solid rgba(59, 130, 246, 0.2); border-radius: 8px; background: #ffffff; font-size: 0.9rem; transition: all 0.3s ease;">
                            <option value="">Seleccionar trabajadora...</option>
                            <option value="mariela" ${a.assignedWorker === 'mariela' ? 'selected' : ''}>Mariela - Especialista en Diagnóstico Social</option>
                            <option value="francisca" ${a.assignedWorker === 'francisca' ? 'selected' : ''}>Francisca - Especialista en Trabajo Social</option>
                            <option value="yulianis" ${a.assignedWorker === 'yulianis' ? 'selected' : ''}>Yulianis - Especialista en Terapia Familiar</option>
                            <option value="mariana" ${a.assignedWorker === 'mariana' ? 'selected' : ''}>Mariana - Especialista en Intervención Social</option>
                        </select>
                    </div>
                `;

                // Asignación de trabajadora
                const workerSelect = item.querySelector('.worker-assignment');
                if (workerSelect) {
                    workerSelect.addEventListener('change', (e) => {
                        const list = getAppointments();
                        const idx = list.findIndex(x => x.id === a.id);
                        if (idx !== -1) {
                            list[idx].assignedWorker = e.target.value || null;
                            list[idx].updatedAt = new Date().toISOString();
                            saveAppointments(list);
                            renderAppointments(); // Refrescar para mostrar cambios
                        }
                    });
                }

                // Acciones
                const btns = item.querySelectorAll('button');
                btns.forEach(b => b.addEventListener('click', () => {
                    const list = getAppointments();
                    const idx = list.findIndex(x => x.id === a.id);
                    if (idx === -1) return;
                    
                    if (b.dataset.action === 'confirm') {
                        list[idx].status = 'confirmed';
                        // Si no hay dateTime (no autoasignado), usar preferido
                        if (!list[idx].dateTime && a.preferredDate && a.preferredTime) {
                            list[idx].dateTime = new Date(`${a.preferredDate}T${a.preferredTime}`).toISOString();
                        }
                    } else if (b.dataset.action === 'completed') {
                        list[idx].status = 'completed';
                        // Si no hay dateTime (no autoasignado), usar preferido
                        if (!list[idx].dateTime && a.preferredDate && a.preferredTime) {
                            list[idx].dateTime = new Date(`${a.preferredDate}T${a.preferredTime}`).toISOString();
                        }
                        // Actualizar métricas cuando se marca como realizada
                        if (window.refreshMetrics) {
                            window.refreshMetrics();
                        }
                    } else if (b.dataset.action === 'cancel') {
                        const message = prompt('Mensaje para el usuario (ej: "Disculpa, se me presentó un inconveniente, por favor elige otro día"):');
                        if (message && message.trim()) {
                            list[idx].status = 'cancelled';
                            list[idx].adminMessage = message.trim();
                        } else {
                            return; // No hacer nada si no hay mensaje
                        }
                    } else if (b.dataset.action === 'pending') {
                        list[idx].status = 'pending';
                        list[idx].adminMessage = ''; // Limpiar mensaje anterior
                    }
                    list[idx].updatedAt = new Date().toISOString();
                    saveAppointments(list);
                    renderAppointments();
                }));

                listEl.appendChild(item);
            });
    }

    function bind() {
        const refresh = document.getElementById('refreshAppointments');
        if (refresh) refresh.addEventListener('click', renderAppointments);
        const dateFilter = document.getElementById('apptDateFilter');
        const statusFilter = document.getElementById('apptStatusFilter');
        const workerFilter = document.getElementById('workerFilter');
        const clear = document.getElementById('apptClearFilters');
        const autoAccept = document.getElementById('autoAcceptPending');
        
        if (dateFilter) dateFilter.addEventListener('change', renderAppointments);
        if (statusFilter) statusFilter.addEventListener('change', renderAppointments);
        if (workerFilter) workerFilter.addEventListener('change', renderAppointments);
        if (clear) clear.addEventListener('click', () => { 
            if (dateFilter) dateFilter.value = ''; 
            if (statusFilter) statusFilter.value=''; 
            if (workerFilter) workerFilter.value=''; 
            renderAppointments(); 
        });
        
        if (autoAccept) {
            autoAccept.addEventListener('click', function() {
                if (confirm('¿Confirmar automáticamente todas las citas pendientes?')) {
                    const appts = getAppointments();
                    let updated = false;
                    appts.forEach(appt => {
                        if (appt.status === 'pending') {
                            appt.status = 'confirmed';
                            appt.updatedAt = new Date().toISOString();
                            updated = true;
                        }
                    });
                    if (updated) {
                        saveAppointments(appts);
                        alert('Todas las citas pendientes han sido confirmadas automáticamente');
                        renderAppointments();
                    } else {
                        alert('No hay citas pendientes para confirmar');
                    }
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => { bind(); renderAppointments(); });
})();


