(function() {
    function getAppointments() {
        try { return JSON.parse(localStorage.getItem('appointments') || '[]'); } catch(_) { return []; }
    }

    function statusToEs(s) {
        if (s === 'pending') return 'pendiente';
        if (s === 'confirmed') return 'confirmada';
        if (s === 'completed') return 'realizada';
        if (s === 'cancelled') return 'cancelada';
        return s || '';
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

    function render() {
        const listEl = document.getElementById('histList');
        if (!listEl) return;
        const username = localStorage.getItem('username');
        const filterState = document.getElementById('filterState')?.value || '';
        const filterDate = document.getElementById('filterDate')?.value || '';

        let appts = getAppointments().filter(a => !username || a.userName === username);
        if (filterState) appts = appts.filter(a => a.status === filterState);
        if (filterDate) appts = appts.filter(a => (a.dateTime || '').startsWith(filterDate) || a.preferredDate === filterDate);

        if (appts.length === 0) {
            listEl.innerHTML = '<div class="muted">No hay citas para mostrar con los filtros actuales.</div>';
            return;
        }

        listEl.innerHTML = '';
        appts.sort((a,b) => (b.dateTime||'').localeCompare(a.dateTime||''));
        appts.forEach(a => {
            const when = a.dateTime ? new Date(a.dateTime).toLocaleString('es-ES') : `${a.preferredDate} ${a.preferredTime}`;
            const item = document.createElement('div');
            item.className = 'appt-item';
            
            let messageHtml = '';
            let currentStatus = a.status;
            
            // Si hay mensaje de la trabajadora, mostrar el mensaje
            if (a.adminMessage) {
                if (a.status === 'pending') {
                    currentStatus = 'cancelled';
                }
                messageHtml = `<div style="margin-top:8px; padding:8px; background:#fff3cd; border:1px solid #ffeaa7; border-radius:8px; color:#856404; font-size:0.9rem;"><strong>Mensaje de la trabajadora:</strong> ${a.adminMessage}</div>`;
            }
            
        item.innerHTML = `
            <div>
                <div style="font-weight:700; color:#1e293b">${a.reason || 'Cita'}</div>
                <div class="muted">${a.userName || ''} · ${a.userEmail || ''}</div>
                ${a.assignedWorker ? `<div style="margin-top: 5px; padding: 4px 8px; background: #e0f2fe; border-radius: 6px; font-size: 0.85rem; color: #0369a1;">
                    <strong>👩‍💼 Asignada a:</strong> ${getWorkerName(a.assignedWorker)}
                </div>` : ''}
                ${messageHtml}
            </div>
            <div class="muted">${when}</div>
            <div><span class="status ${statusToEs(currentStatus)}">${statusToEs(currentStatus)}</span></div>
        `;
            listEl.appendChild(item);
        });
    }

    function bind() {
        const s = document.getElementById('filterState');
        const d = document.getElementById('filterDate');
        const c = document.getElementById('clearFilters');
        const back = document.getElementById('backToProfile');
        if (s) s.addEventListener('change', render);
        if (d) d.addEventListener('change', render);
        if (c) c.addEventListener('click', () => { if (s) s.value = ''; if (d) d.value = ''; render(); });
        if (back) back.addEventListener('click', function(e) { e.preventDefault(); window.location.replace('perfil.html'); });
    }

    document.addEventListener('DOMContentLoaded', () => { bind(); render(); });
})();


