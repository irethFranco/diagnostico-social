(function() {
    // Datos de las trabajadoras
    const WORKERS = {
        'mariela': {
            name: 'Mariela',
            specialty: 'Especialista en Diagnóstico Social',
            username: 'mariela',
            password: 'mariela123'
        },
        'francisca': {
            name: 'Francisca', 
            specialty: 'Especialista en Trabajo Social',
            username: 'francisca',
            password: 'francisca123'
        },
        'yulianis': {
            name: 'Yulianis',
            specialty: 'Especialista en Terapia Familiar', 
            username: 'yulianis',
            password: 'yulianis123'
        },
        'mariana': {
            name: 'Mariana',
            specialty: 'Especialista en Intervención Social',
            username: 'mariana', 
            password: 'mariana123'
        }
    };

    let currentWorker = null;

    // Función para obtener citas
    function getAppointments() {
        try {
            return JSON.parse(localStorage.getItem('appointments') || '[]');
        } catch (_) {
            return [];
        }
    }

    // Función para guardar citas
    function saveAppointments(list) {
        localStorage.setItem('appointments', JSON.stringify(list));
    }

    function getDiagnosticAssignments() {
        try {
            return JSON.parse(localStorage.getItem('diagnosticWorkerAssignments') || '[]');
        } catch (_) {
            return [];
        }
    }

    // Función para verificar autenticación de trabajadora
    function checkWorkerAuth() {
        const workerId = localStorage.getItem('currentWorker');
        if (!workerId || !WORKERS[workerId]) {
            // Redirigir al login de trabajadoras
            window.location.href = 'login-trabajadoras.html';
            return false;
        }
        currentWorker = WORKERS[workerId];
        return true;
    }

    // Función para cargar información de la trabajadora
    function loadWorkerInfo() {
        if (!currentWorker) return;

        document.getElementById('workerName').textContent = currentWorker.name;
        document.getElementById('workerSpecialty').textContent = currentWorker.specialty;
    }

    // Función para calcular estadísticas
    function calculateStats() {
        const appointments = getAppointments();
        const workerAppointments = appointments.filter(apt => apt.assignedWorker === currentWorker.username);
        
        const total = workerAppointments.length;
        const pending = workerAppointments.filter(apt => apt.status === 'pending').length;
        const confirmed = workerAppointments.filter(apt => apt.status === 'confirmed').length;
        const completed = workerAppointments.filter(apt => apt.status === 'completed').length;

        document.getElementById('totalAppointments').textContent = total;
        document.getElementById('pendingAppointments').textContent = pending;
        document.getElementById('confirmedAppointments').textContent = confirmed;
        document.getElementById('completedAppointments').textContent = completed;
    }

    // Función para renderizar citas
    function renderAppointments() {
        const appointmentsList = document.getElementById('appointmentsList');
        if (!appointmentsList) return;

        const appointments = getAppointments();
        const workerAppointments = appointments
            .filter(apt => apt.assignedWorker === currentWorker.username)
            .sort((a, b) => {
                // Ordenar por fecha, las más recientes primero
                const dateA = new Date(a.dateTime || a.preferredDate + 'T' + a.preferredTime);
                const dateB = new Date(b.dateTime || b.preferredDate + 'T' + b.preferredTime);
                return dateB - dateA;
            });

        if (workerAppointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="no-appointments">
                    <h3>📅 No tienes citas asignadas</h3>
                    <p>Cuando el administrador te asigne citas, aparecerán aquí.</p>
                </div>
            `;
            return;
        }

        appointmentsList.innerHTML = workerAppointments.map(apt => {
            const date = apt.dateTime ? new Date(apt.dateTime).toLocaleString('es-ES') : 
                        `${apt.preferredDate} ${apt.preferredTime}`;
            
            const statusClass = apt.status === 'pending' ? 'status-pending' : 
                              apt.status === 'confirmed' ? 'status-confirmed' : 
                              apt.status === 'completed' ? 'status-completed' : 'status-pending';
            
            const statusText = apt.status === 'pending' ? 'Pendiente' :
                             apt.status === 'confirmed' ? 'Confirmada' :
                             apt.status === 'completed' ? 'Realizada' : 'Pendiente';

            return `
                <div class="appointment-item">
                    <div class="appointment-header">
                        <div class="appointment-client">${apt.userName || 'Cliente'}</div>
                        <div class="appointment-status ${statusClass}">${statusText}</div>
                    </div>
                    
                    <div class="appointment-details">
                        <div class="detail-item">
                            <div class="detail-label">📧 Email</div>
                            <div class="detail-value">${apt.userEmail || 'No especificado'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">📞 Teléfono</div>
                            <div class="detail-value">${apt.userPhone || 'No especificado'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">📅 Fecha y Hora</div>
                            <div class="detail-value">${date}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">💬 Motivo</div>
                            <div class="detail-value">${apt.reason || 'No especificado'}</div>
                        </div>
                    </div>
                    
                    ${apt.status === 'pending' ? `
                        <div class="appointment-actions">
                            <button class="btn btn-primary" onclick="confirmAppointment('${apt.id}')">
                                ✅ Confirmar Cita
                            </button>
                            <button class="btn btn-secondary" onclick="cancelAppointment('${apt.id}')">
                                ❌ Cancelar
                            </button>
                        </div>
                    ` : apt.status === 'confirmed' ? `
                        <div class="appointment-actions">
                            <button class="btn btn-success" onclick="completeAppointment('${apt.id}')">
                                ✅ Marcar como Realizada
                            </button>
                            <button class="btn btn-secondary" onclick="cancelAppointment('${apt.id}')">
                                ❌ Cancelar
                            </button>
                        </div>
                    ` : apt.status === 'completed' ? `
                        <div class="appointment-actions">
                            <span style="color: #10b981; font-weight: 600; padding: 10px 20px; background: #ecfdf5; border-radius: 10px; border: 1px solid #a7f3d0;">
                                ✅ Cita Completada
                            </span>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    function renderDiagnosticAssignments() {
        if (!currentWorker) return;

        const assignments = getDiagnosticAssignments()
            .filter(item => item.workerId === currentWorker.username)
            .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));

        let section = document.getElementById('diagnosticAssignmentsSection');
        if (!section) {
            section = document.createElement('div');
            section.id = 'diagnosticAssignmentsSection';
            section.className = 'appointments-section';
            const appointmentsSection = document.querySelector('.appointments-section');
            if (appointmentsSection && appointmentsSection.parentNode) {
                appointmentsSection.parentNode.insertBefore(section, appointmentsSection);
            }
        }

        if (!section) return;

        if (assignments.length === 0) {
            section.innerHTML = `
                <h2 class="section-title">🧾 Diagnósticos asignados automáticamente</h2>
                <div class="no-appointments">
                    <h3>Sin diagnósticos asignados</h3>
                    <p>Cuando los usuarios finalicen el formulario, aparecerán aquí.</p>
                </div>
            `;
            return;
        }

        section.innerHTML = `
            <h2 class="section-title">🧾 Diagnósticos asignados automáticamente</h2>
            ${assignments.map(item => {
                const assignedDate = item.assignedAt
                    ? new Date(item.assignedAt).toLocaleString('es-ES')
                    : 'Sin fecha';
                return `
                    <div class="appointment-item">
                        <div class="appointment-header">
                            <div class="appointment-client">${item.userName || 'Usuario'}</div>
                            <div class="appointment-status status-confirmed">Asignado</div>
                        </div>
                        <div class="appointment-details">
                            <div class="detail-item">
                                <div class="detail-label">📧 Email</div>
                                <div class="detail-value">${item.userEmail || 'No especificado'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">📊 Puntaje</div>
                                <div class="detail-value">${item.score ?? 'No disponible'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">🧠 Diagnóstico</div>
                                <div class="detail-value">${item.diagnosisTitle || 'Diagnóstico social'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">🕒 Fecha de asignación</div>
                                <div class="detail-value">${assignedDate}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">📌 Motivo de asignación</div>
                            <div class="detail-value">${item.reason || 'Asignación automática del sistema.'}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    // Función para confirmar cita
    window.confirmAppointment = function(appointmentId) {
        if (confirm('¿Confirmar esta cita?')) {
            const appointments = getAppointments();
            const appointment = appointments.find(apt => apt.id === appointmentId);
            
            if (appointment) {
                appointment.status = 'confirmed';
                appointment.confirmedBy = currentWorker.username;
                appointment.confirmedAt = new Date().toISOString();
                saveAppointments(appointments);
                renderAppointments();
                calculateStats();
                
                // Notificar al usuario si es posible
                showNotification('Cita confirmada exitosamente', 'success');
            }
        }
    };

    // Función para completar cita
    window.completeAppointment = function(appointmentId) {
        if (confirm('¿Marcar esta cita como realizada?')) {
            const appointments = getAppointments();
            const appointment = appointments.find(apt => apt.id === appointmentId);
            
            if (appointment) {
                appointment.status = 'completed';
                appointment.completedBy = currentWorker.username;
                appointment.completedAt = new Date().toISOString();
                saveAppointments(appointments);
                renderAppointments();
                calculateStats();
                
                // Actualizar métricas globales
                if (window.refreshMetrics) {
                    window.refreshMetrics();
                }
                
                showNotification('Cita marcada como realizada', 'success');
            }
        }
    };

    // Función para cancelar cita
    window.cancelAppointment = function(appointmentId) {
        const reason = prompt('Motivo de la cancelación (opcional):');
        if (reason !== null) { // No se canceló el prompt
            const appointments = getAppointments();
            const appointment = appointments.find(apt => apt.id === appointmentId);
            
            if (appointment) {
                appointment.status = 'cancelled';
                appointment.cancelledBy = currentWorker.username;
                appointment.cancelledAt = new Date().toISOString();
                appointment.cancellationReason = reason || 'Cancelada por la trabajadora';
                saveAppointments(appointments);
                renderAppointments();
                calculateStats();
                
                showNotification('Cita cancelada', 'info');
            }
        }
    };

    // Función para cerrar sesión
    window.logoutWorker = function() {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('currentWorker');
            window.location.href = 'login-trabajadoras.html';
        }
    };

    // Función para mostrar notificaciones
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Inicializar panel
    function initWorkerPanel() {
        if (!checkWorkerAuth()) return;
        
        loadWorkerInfo();
        calculateStats();
        renderDiagnosticAssignments();
        renderAppointments();
        
        // Actualizar cada 30 segundos
        setInterval(() => {
            calculateStats();
            renderDiagnosticAssignments();
            renderAppointments();
        }, 30000);
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', initWorkerPanel);
})();
