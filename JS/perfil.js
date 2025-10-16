// ===========================================
// SISTEMA DE PERFIL DEL USUARIO
// ===========================================

class ProfileSystem {
    constructor() {
        this.init();
        this.selectionMode = false;
        this.chart = null;
    }

    init() {
        this.loadUserData();
        this.loadHistory();
        this.initChart();
        this.bindEvents();
    }

    // Cargar datos del usuario
    loadUserData() {
        const username = localStorage.getItem('username');
        const userEmail = localStorage.getItem('userEmail') || 'usuario@email.com';
        
        if (username) {
            document.getElementById('userName').textContent = username;
            document.getElementById('userEmail').textContent = userEmail;
        }
    }

    // Cargar historial de diagnósticos
    loadHistory() {
        const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        
        this.ensureToolbar();
        this.displayHistory(history);
        this.updateStats(history);
        this.initChart();
    }

    // (Eliminado) Datos de ejemplo: ya no se generan automáticamente para no sobreescribir el historial real

    // Mostrar historial
    displayHistory(history) {
        const timeline = document.getElementById('historyTimeline');
        timeline.innerHTML = '';

        const total = history.length;
        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
            historyItem.dataset.index = index;
            historyItem.style.cursor = 'pointer';
            
            const date = new Date(item.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const diagNumber = total - index; // numeración descendente: el más reciente es el número mayor
            historyItem.innerHTML = `
                <div class="history-date">${date}</div>
                <div class="history-content">
                    <div class="history-score">Diagnóstico número ${diagNumber}</div>
                </div>
                <button class="delete-btn" onclick="deleteDiagnostic(${index})" title="Eliminar diagnóstico">×</button>
            `;

            // Checkbox de selección (visible solo en modo selección)
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'history-select';
            checkbox.dataset.index = index;
            checkbox.style.marginRight = '10px';
            checkbox.style.display = this.selectionMode ? 'inline-block' : 'none';
            historyItem.insertBefore(checkbox, historyItem.firstChild);

            timeline.appendChild(historyItem);

            // Evitar que el botón eliminar dispare navegación
            const deleteBtn = historyItem.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            // Al hacer click en el item, abrir resultados de ese diagnóstico
            historyItem.addEventListener('click', () => {
                if (this.selectionMode) return; // En modo selección, no navegar
                try {
                    const fullHistory = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
                    const selected = fullHistory[index];
                    if (!selected) return;

                    // Intentar preservar campos adicionales si existen del último resultado
                    const lastResults = JSON.parse(localStorage.getItem('diagnosticResults') || '{}');
                    const resultsToShow = {
                        date: selected.date,
                        generalScore: selected.generalScore,
                        categories: selected.categories,
                        recommendations: selected.recommendations,
                        diagnosis: selected.diagnosis || lastResults.diagnosis || null,
                        aiDiagnosis: lastResults.aiDiagnosis || null,
                        answers: lastResults.answers || null,
                        userName: lastResults.userName || localStorage.getItem('userName') || 'Usuario'
                    };

                    localStorage.setItem('diagnosticResults', JSON.stringify(resultsToShow));
                    window.location.href = 'resultados.html';
                } catch (err) {
                    console.error('Error abriendo diagnóstico del historial:', err);
                }
            });
        });
    }

    // Asegurar barra de herramientas para selección múltiple
    ensureToolbar() {
        const container = document.querySelector('.profile-container');
        const timeline = document.getElementById('historyTimeline');
        if (!container || !timeline) return;

        let toolbar = document.getElementById('historyToolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.id = 'historyToolbar';

            // Estilos de barra: visible y elegante dentro del área del historial
            toolbar.style.display = 'flex';
            toolbar.style.alignItems = 'center';
            toolbar.style.justifyContent = 'space-between';
            toolbar.style.gap = '12px';
            toolbar.style.margin = '0 0 14px 0';
            toolbar.style.padding = '10px 12px';
            toolbar.style.background = '#ffffffcc';
            toolbar.style.backdropFilter = 'blur(2px)';
            toolbar.style.border = '1px solid rgba(0,0,0,0.06)';
            toolbar.style.borderRadius = '12px';
            toolbar.style.boxShadow = '0 6px 18px rgba(2, 6, 23, 0.06)';
            toolbar.style.position = 'sticky';
            toolbar.style.top = '0';
            toolbar.style.zIndex = '10';

            // Título lateral (opcional y discreto)
            const title = document.createElement('div');
            title.textContent = 'Historial';
            title.style.fontWeight = '700';
            title.style.color = '#1e293b';
            title.style.fontSize = '14px';

            // Botones
            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '8px';

            const baseBtn = (text, color1, color2) => {
                const b = document.createElement('button');
                b.textContent = text;
                b.style.border = 'none';
                b.style.color = '#fff';
                b.style.padding = '8px 14px';
                b.style.borderRadius = '10px';
                b.style.cursor = 'pointer';
                b.style.fontWeight = '600';
                b.style.boxShadow = '0 4px 12px rgba(2, 6, 23, 0.15)';
                b.style.backgroundImage = `linear-gradient(135deg, ${color1}, ${color2})`;
                b.style.transition = 'transform .15s ease, opacity .15s ease';
                b.onmouseenter = () => { b.style.transform = 'translateY(-1px)'; };
                b.onmouseleave = () => { b.style.transform = 'translateY(0)'; };
                return b;
            };

            const toggleBtn = baseBtn('Seleccionar', '#3b82f6', '#2563eb');
            toggleBtn.id = 'toggleSelectionBtn';

            const deleteBtn = baseBtn('Eliminar seleccionados', '#ef4444', '#dc2626');
            deleteBtn.id = 'deleteSelectedBtn';
            deleteBtn.style.display = 'none';

            const cancelBtn = baseBtn('Cancelar', '#64748b', '#475569');
            cancelBtn.id = 'cancelSelectionBtn';
            cancelBtn.style.display = 'none';

            // Enlace a historial de citas al lado de Seleccionar
            const citasLink = document.createElement('a');
            citasLink.textContent = 'Ver historial de citas';
            citasLink.href = 'citas-historial.html';
            citasLink.style.textDecoration = 'none';
            const citasBtn = baseBtn('Mis citas', '#64748b', '#475569');
            citasBtn.onclick = () => { window.location.replace('citas-historial.html'); };

            actions.appendChild(citasBtn);
            actions.appendChild(toggleBtn);
            actions.appendChild(deleteBtn);
            actions.appendChild(cancelBtn);

            toolbar.appendChild(title);
            toolbar.appendChild(actions);

            // Insertar justo antes del timeline para que quede en su área
            timeline.parentElement.insertBefore(toolbar, timeline);

            toggleBtn.addEventListener('click', () => this.enterSelectionMode());
            deleteBtn.addEventListener('click', () => this.deleteSelectedDiagnostics());
            cancelBtn.addEventListener('click', () => this.exitSelectionMode());
        }
    }

    enterSelectionMode() {
        this.selectionMode = true;
        const checkboxes = document.querySelectorAll('.history-select');
        checkboxes.forEach(cb => cb.style.display = 'inline-block');
        const delBtn = document.getElementById('deleteSelectedBtn');
        const togBtn = document.getElementById('toggleSelectionBtn');
        const cancelBtn = document.getElementById('cancelSelectionBtn');
        if (delBtn) delBtn.style.display = 'inline-block';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        if (togBtn) togBtn.style.display = 'none';
    }

    exitSelectionMode() {
        this.selectionMode = false;
        const checkboxes = document.querySelectorAll('.history-select');
        checkboxes.forEach(cb => { cb.checked = false; cb.style.display = 'none'; });
        const delBtn = document.getElementById('deleteSelectedBtn');
        const togBtn = document.getElementById('toggleSelectionBtn');
        const cancelBtn = document.getElementById('cancelSelectionBtn');
        if (delBtn) delBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (togBtn) togBtn.style.display = 'inline-block';
    }

    deleteSelectedDiagnostics() {
        const selected = Array.from(document.querySelectorAll('.history-select'))
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.dataset.index, 10))
            .sort((a, b) => b - a); // eliminar de mayor a menor índice

        if (selected.length === 0) {
            alert('Selecciona al menos un diagnóstico.');
            return;
        }

        if (!confirm(`¿Eliminar ${selected.length} diagnóstico(s) seleccionados?`)) return;

        const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        selected.forEach(idx => {
            if (idx >= 0 && idx < history.length) history.splice(idx, 1);
        });
        localStorage.setItem('diagnosticHistory', JSON.stringify(history));

        this.exitSelectionMode();
        this.displayHistory(history);
        this.updateStats(history);
        this.initChart();
        alert('Diagnósticos eliminados correctamente');
    }

    // Actualizar estadísticas
    updateStats(history) {
        const totalDiagnostics = history.length;
        const averageScore = totalDiagnostics > 0
            ? Math.round(history.reduce((sum, item) => sum + item.generalScore, 0) / totalDiagnostics)
            : 0;

        document.getElementById('totalDiagnostics').textContent = totalDiagnostics;
        document.getElementById('averageScore').textContent = averageScore;
    }

    // Inicializar gráfico de evolución
    initChart() {
        const canvas = document.getElementById('evolutionChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        
        // Destruir gráfico previo si existe
        if (this.chart && typeof this.chart.destroy === 'function') {
            this.chart.destroy();
            this.chart = null;
        }

        // Si no hay datos, limpiar canvas y salir
        if (history.length === 0) {
            try { ctx.clearRect(0, 0, canvas.width, canvas.height); } catch (_) {}
            return;
        }

        const labels = history.map(item => 
            new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        ).reverse();
        
        const scores = history.map(item => item.generalScore).reverse();

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Puntuación General',
                    data: scores,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 3,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 25,
                            color: '#64748b',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(100, 116, 139, 0.2)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#64748b',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(100, 116, 139, 0.2)'
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // Bindear eventos
    bindEvents() {
        // Eventos específicos del perfil
    }

    // Eliminar diagnóstico
    deleteDiagnostic(index) {
        if (confirm('¿Estás seguro de que quieres eliminar este diagnóstico?')) {
            const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
            
            if (index >= 0 && index < history.length) {
                // Eliminar el elemento del array
                history.splice(index, 1);
                
                // Guardar el historial actualizado
                localStorage.setItem('diagnosticHistory', JSON.stringify(history));
                
                // Recargar la página para actualizar todo
                this.loadHistory();
                this.initChart();
                
                alert('Diagnóstico eliminado correctamente');
            }
        }
    }

    // Exportar historial
    exportHistory() {
        const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        
        if (history.length === 0) {
            alert('No hay historial para exportar');
            return;
        }

        // Exportar toda la vista de perfil como PDF
        const container = document.querySelector('.profile-container');
        if (!container) {
            alert('No se encontró el contenido para exportar.');
            return;
        }

        const { jsPDF } = window.jspdf || {};
        if (!window.html2canvas || !jsPDF) {
            alert('Herramientas de PDF no disponibles. Verifica tu conexión.');
            return;
        }

        // Asegurar fuentes listas y desactivar animaciones/transformaciones para nitidez
        const waitFonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
        waitFonts.then(() => {
            window.scrollTo(0, 0);
            return html2canvas(container, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc) => {
                    clonedDoc.body.style.background = '#ffffff';
                    const nodes = clonedDoc.querySelectorAll('*');
                    nodes.forEach((el) => {
                        el.style.animation = 'none';
                        el.style.transform = 'none';
                        el.style.filter = 'none';
                        el.style.transition = 'none';
                    });
                }
            })
        })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                const imgWidth = pageWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                let position = 0;
                let heightLeft = imgHeight;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                    heightLeft -= pageHeight;
                }

                const fileName = `Perfil_Diagnosticos_${new Date().toISOString().slice(0,10)}.pdf`;
                pdf.save(fileName);
            })
            .catch(err => {
                console.error('Error exportando historial:', err);
                alert('Ocurrió un error al exportar el PDF.');
            });
    }
}

// Función global para inicializar
function initProfilePage() {
    window.profileSystem = new ProfileSystem();
}

// Función global para eliminar diagnóstico
function deleteDiagnostic(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este diagnóstico?')) {
        const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        
        if (index >= 0 && index < history.length) {
            // Eliminar el elemento del array
            history.splice(index, 1);
            
            // Guardar el historial actualizado
            localStorage.setItem('diagnosticHistory', JSON.stringify(history));
            
            // Recargar la página para actualizar todo
            location.reload();
            
            alert('Diagnóstico eliminado correctamente');
        }
    }
}

// Exportar para uso global
window.ProfileSystem = ProfileSystem;
window.initProfilePage = initProfilePage;
window.deleteDiagnostic = deleteDiagnostic;
window.exportHistory = function() {
    if (!window.profileSystem) {
        window.profileSystem = new ProfileSystem();
    }
    window.profileSystem.exportHistory();
};
