// ===========================================
// ADMIN - Gestión de Citas (localStorage)
// ===========================================

(function() {
    function getAppointments() {
        try { return JSON.parse(localStorage.getItem('appointments') || '[]'); } catch(_) { return []; }
    }
    function saveAppointments(list) {
        localStorage.setItem('appointments', JSON.stringify(list));
    }

    function renderAppointments() {
        const listEl = document.getElementById('appointmentsList');
        if (!listEl) return;

        const dateFilter = document.getElementById('apptDateFilter')?.value || '';
        const statusFilter = document.getElementById('apptStatusFilter')?.value || '';

        const appts = getAppointments();
        let filtered = appts;
        if (dateFilter) {
            filtered = filtered.filter(a => (a.dateTime || '').startsWith(dateFilter));
        }
        if (statusFilter) {
            filtered = filtered.filter(a => a.status === statusFilter);
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
                    </div>
                    <div class="muted">${when}</div>
                    <div><span class="chip"><span class="dot"></span> ${a.status === 'pending' ? 'pendiente' : a.status === 'confirmed' ? 'confirmada' : 'cancelada'}</span></div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn" data-action="confirm">Confirmar</button>
                        <button class="btn secondary" data-action="pending">Marcar pendiente</button>
                        <button class="btn danger" data-action="cancel">Cancelar</button>
                    </div>
                `;

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
        const clear = document.getElementById('apptClearFilters');
        const autoAccept = document.getElementById('autoAcceptPending');
        
        if (dateFilter) dateFilter.addEventListener('change', renderAppointments);
        if (statusFilter) statusFilter.addEventListener('change', renderAppointments);
        if (clear) clear.addEventListener('click', () => { if (dateFilter) dateFilter.value = ''; if (statusFilter) statusFilter.value=''; renderAppointments(); });
        
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


