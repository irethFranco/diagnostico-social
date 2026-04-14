// ===========================================
// PANEL DE INGRESOS PARA TRABAJADORAS
// ===========================================

class RevenueDashboard {
    constructor() {
        this.revenueData = null;
        this.init();
    }

    init() {
        this.loadRevenueData();
        this.displayDashboard();
        this.bindEvents();
    }

    // Cargar datos de ingresos
    loadRevenueData() {
        try {
            this.revenueData = JSON.parse(localStorage.getItem('systemRevenue') || '{"total": 0, "downloads": 0}');
            const downloads = JSON.parse(localStorage.getItem('pdfDownloads') || '[]');
            this.revenueData.downloads = downloads;
        } catch (error) {
            console.error('Error cargando datos de ingresos:', error);
            this.revenueData = { total: 0, downloads: 0 };
        }
    }

    // Mostrar panel de ingresos
    displayDashboard() {
        const dashboardContainer = document.getElementById('revenueDashboard');
        if (!dashboardContainer) return;

        const totalRevenue = this.revenueData.total || 0;
        const totalDownloads = Array.isArray(this.revenueData.downloads) ? this.revenueData.downloads.length : 0;
        const todayRevenue = this.getTodayRevenue();
        const thisWeekRevenue = this.getThisWeekRevenue();

        dashboardContainer.innerHTML = `
            <div class="revenue-header">
                <h2>💰 Panel de Ingresos</h2>
                <p>Ganancias generadas por descargas de PDF</p>
            </div>

            <div class="revenue-stats">
                <div class="stat-card total">
                    <div class="stat-icon">💵</div>
                    <div class="stat-content">
                        <h3>Ingresos Totales</h3>
                        <div class="stat-value">$${totalRevenue.toLocaleString('es-CO')}</div>
                        <div class="stat-label">COP</div>
                    </div>
                </div>

                <div class="stat-card downloads">
                    <div class="stat-icon">📄</div>
                    <div class="stat-content">
                        <h3>PDFs Descargados</h3>
                        <div class="stat-value">${totalDownloads}</div>
                        <div class="stat-label">descargas</div>
                    </div>
                </div>

                <div class="stat-card today">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <h3>Hoy</h3>
                        <div class="stat-value">$${todayRevenue.toLocaleString('es-CO')}</div>
                        <div class="stat-label">COP</div>
                    </div>
                </div>

                <div class="stat-card week">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <h3>Esta Semana</h3>
                        <div class="stat-value">$${thisWeekRevenue.toLocaleString('es-CO')}</div>
                        <div class="stat-label">COP</div>
                    </div>
                </div>
            </div>

            <div class="revenue-details">
                <h3>📈 Detalles de Ingresos</h3>
                <div class="revenue-chart">
                    <canvas id="revenueChart" width="400" height="200"></canvas>
                </div>
            </div>

            <div class="revenue-history">
                <h3>📋 Historial de Descargas</h3>
                <div class="downloads-list" id="downloadsList">
                    ${this.generateDownloadsList()}
                </div>
            </div>

            <div class="revenue-actions">
                <button class="btn-refresh" onclick="revenueDashboard.refreshData()">
                    🔄 Actualizar Datos
                </button>
                <button class="btn-export" onclick="revenueDashboard.exportRevenueReport()">
                    📊 Exportar Reporte
                </button>
            </div>
        `;

        // Inicializar gráfico
        this.initRevenueChart();
    }

    // Obtener ingresos de hoy
    getTodayRevenue() {
        if (!Array.isArray(this.revenueData.downloads)) return 0;
        
        const today = new Date().toDateString();
        return this.revenueData.downloads
            .filter(download => new Date(download.date).toDateString() === today)
            .reduce((total, download) => total + (download.amount || 0), 0);
    }

    // Obtener ingresos de esta semana
    getThisWeekRevenue() {
        if (!Array.isArray(this.revenueData.downloads)) return 0;
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return this.revenueData.downloads
            .filter(download => new Date(download.date) >= weekAgo)
            .reduce((total, download) => total + (download.amount || 0), 0);
    }

    // Generar lista de descargas
    generateDownloadsList() {
        if (!Array.isArray(this.revenueData.downloads) || this.revenueData.downloads.length === 0) {
            return '<div class="no-downloads">No hay descargas registradas aún</div>';
        }

        return this.revenueData.downloads
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10) // Mostrar solo las últimas 10
            .map(download => `
                <div class="download-item">
                    <div class="download-info">
                        <div class="download-file">${download.fileName}</div>
                        <div class="download-date">${new Date(download.date).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="download-amount">$${(download.amount || 0).toLocaleString('es-CO')}</div>
                </div>
            `).join('');
    }

    // Inicializar gráfico de ingresos
    initRevenueChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;

        // Crear datos para los últimos 7 días
        const chartData = this.getLast7DaysData();
        
        const ctx = canvas.getContext('2d');
        
        // Gráfico simple de barras
        const maxValue = Math.max(...chartData.map(d => d.revenue));
        const barWidth = canvas.width / chartData.length - 10;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        chartData.forEach((day, index) => {
            const barHeight = (day.revenue / maxValue) * (canvas.height - 40);
            const x = index * (barWidth + 10) + 5;
            const y = canvas.height - barHeight - 20;
            
            // Dibujar barra
            ctx.fillStyle = day.revenue > 0 ? '#10b981' : '#e5e7eb';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Dibujar etiqueta de día
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(day.day, x + barWidth/2, canvas.height - 5);
            
            // Dibujar valor si es mayor a 0
            if (day.revenue > 0) {
                ctx.fillStyle = '#059669';
                ctx.font = '10px Arial';
                ctx.fillText(`$${day.revenue.toLocaleString()}`, x + barWidth/2, y - 5);
            }
        });
    }

    // Obtener datos de los últimos 7 días
    getLast7DaysData() {
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dayRevenue = this.getRevenueForDate(date);
            const dayName = date.toLocaleDateString('es-CO', { weekday: 'short' });
            
            data.push({
                day: dayName,
                date: date.toDateString(),
                revenue: dayRevenue
            });
        }
        
        return data;
    }

    // Obtener ingresos para una fecha específica
    getRevenueForDate(date) {
        if (!Array.isArray(this.revenueData.downloads)) return 0;
        
        return this.revenueData.downloads
            .filter(download => new Date(download.date).toDateString() === date.toDateString())
            .reduce((total, download) => total + (download.amount || 0), 0);
    }

    // Actualizar datos
    refreshData() {
        this.loadRevenueData();
        this.displayDashboard();
        
        // Mostrar mensaje de actualización
        this.showMessage('Datos actualizados correctamente', 'success');
    }

    // Exportar reporte de ingresos
    exportRevenueReport() {
        try {
            const reportData = {
                fecha: new Date().toLocaleString('es-CO'),
                ingresos_totales: this.revenueData.total,
                descargas_totales: Array.isArray(this.revenueData.downloads) ? this.revenueData.downloads.length : 0,
                ingresos_hoy: this.getTodayRevenue(),
                ingresos_semana: this.getThisWeekRevenue(),
                historial: this.revenueData.downloads || []
            };

            const dataStr = JSON.stringify(reportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `reporte-ingresos-${Date.now()}.json`;
            link.click();
            
            this.showMessage('Reporte exportado correctamente', 'success');
        } catch (error) {
            console.error('Error exportando reporte:', error);
            this.showMessage('Error exportando reporte', 'error');
        }
    }

    // Mostrar mensaje
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `revenue-message ${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        if (type === 'success') {
            messageDiv.style.background = '#10b981';
        } else if (type === 'error') {
            messageDiv.style.background = '#dc2626';
        } else {
            messageDiv.style.background = '#3b82f6';
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // Bindear eventos
    bindEvents() {
        // Auto-actualizar cada 30 segundos
        setInterval(() => {
            this.loadRevenueData();
        }, 30000);
    }
}

// Función global para inicializar
function initRevenueDashboard() {
    window.revenueDashboard = new RevenueDashboard();
}

// Exportar para uso global
window.RevenueDashboard = RevenueDashboard;
window.initRevenueDashboard = initRevenueDashboard;

