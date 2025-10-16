// ===========================================
// SISTEMA DE CITAS (localStorage, sin backend)
// ===========================================

(function() {
    const STORAGE_KEYS = {
        appointments: 'appointments', // lista de citas
        availability: 'appointmentsAvailability' // reglas/huecos (futuro)
    };

    function getAppointments() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.appointments) || '[]'); } catch(_) { return []; }
    }

    function saveAppointments(list) {
        localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(list));
    }

    function generateId() {
        const rand = Math.random().toString(36).slice(2, 8);
        return `appt_${Date.now()}_${rand}`;
    }

    function findNextSlot(preferredDate, preferredTime) {
        // Modo simple: si no hay conflicto exacto con otra cita confirmada, acepta el preferido
        // En el futuro se puede cruzar con availability
        const list = getAppointments();
        const preferred = new Date(`${preferredDate}T${preferredTime}`);
        const conflict = list.some(a => a.status === 'confirmed' && a.dateTime === preferred.toISOString());
        if (!conflict) return preferred;
        return null; // sin lógica de búsqueda avanzada por simplicidad
    }

    function onSubmit(e) {
        const form = e.target;
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const reason = document.getElementById('reason').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const assignMode = 'manual'; // Siempre manual para usuarios
        const consent = document.getElementById('consent').checked;

        if (!consent) { alert('Debes aceptar el uso de datos.'); return; }
        if (!fullName || !email || !phone || !reason || !date || !time) { alert('Completa todos los campos.'); return; }

        const id = generateId();
        const preferredDateTime = new Date(`${date}T${time}`);
        let status = 'pending';
        let scheduledAt = preferredDateTime.toISOString();

        if (assignMode === 'auto') {
            const slot = findNextSlot(date, time);
            if (slot) {
                status = 'confirmed';
                scheduledAt = slot.toISOString();
            }
        }

        const username = localStorage.getItem('username') || fullName;
        const appt = {
            id,
            userName: username,
            userEmail: email,
            userPhone: phone,
            reason,
            preferredDate: date,
            preferredTime: time,
            dateTime: scheduledAt,
            status, // pending | confirmed | cancelled
            createdAt: new Date().toISOString(),
            origin: assignMode === 'auto' ? 'auto' : 'manual'
        };

        const list = getAppointments();
        list.push(appt);
        saveAppointments(list);

        const success = document.getElementById('successMsg');
        if (success) success.style.display = 'block';
        form.reset();
        try { document.getElementById('assignMode').value = 'manual'; } catch(_) {}
    }

    function initForm() {
        const form = document.getElementById('appointmentForm');
        if (!form) return;
        form.addEventListener('submit', function(e) { e.preventDefault(); onSubmit(e); });
        // Prefill con usuario si existe
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('userEmail');
        if (username) { try { document.getElementById('fullName').value = username; } catch(_) {} }
        if (email) { try { document.getElementById('email').value = email; } catch(_) {} }
        // Min date hoy
        const d = document.getElementById('date');
        if (d) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth()+1).padStart(2,'0');
            const dd = String(today.getDate()).padStart(2,'0');
            d.min = `${yyyy}-${mm}-${dd}`;
        }
    }

    document.addEventListener('DOMContentLoaded', initForm);
})();



