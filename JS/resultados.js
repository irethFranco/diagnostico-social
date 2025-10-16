// ===========================================
// SISTEMA DE RESULTADOS DEL DIAGNÓSTICO
// ===========================================

class ResultsSystem {
    constructor() {
        this.init();
    }

    init() {
        this.loadResults();
        this.initChartWithDelay();
        this.bindEvents();
    }

    // Inicializar gráfico con retraso para asegurar que Chart.js esté cargado
    initChartWithDelay() {
        console.log('Iniciando sistema de gráfico...');
        
        // Esperar un poco y crear gráfico simple
        setTimeout(() => {
            this.createSimpleChart();
        }, 1500);
    }

    // Cargar resultados del localStorage
    loadResults() {
        const results = localStorage.getItem('diagnosticResults');
        console.log('Resultados en localStorage:', results);
        
        if (results) {
            const data = JSON.parse(results);
            console.log('Datos parseados:', data);
            this.displayResults(data);
        } else {
            console.log('No hay resultados, mostrando ejemplo');
            // Datos de ejemplo para demostración
            this.displayExampleResults();
        }
    }

    // Mostrar resultados reales
    displayResults(data) {
        console.log('Mostrando resultados:', data);
        
        // Mostrar puntuación general
        document.getElementById('generalScore').textContent = data.generalScore || 0;
        
        // Mostrar diagnóstico específico si existe
        if (data.diagnosis) {
            console.log('Mostrando diagnóstico específico:', data.diagnosis);
            this.displaySpecificDiagnosis(data.diagnosis, data);
        }
        
        // Mostrar diagnóstico de IA si existe
        if (data.aiDiagnosis) {
            console.log('Mostrando diagnóstico de IA:', data.aiDiagnosis);
            this.displayAIDiagnosis(data.aiDiagnosis);
        }
        
        // Si no hay diagnóstico específico ni de IA, mostrar mensaje por defecto
        if (!data.diagnosis && !data.aiDiagnosis) {
            console.log('No hay diagnóstico, mostrando mensaje por defecto');
            const diagnosisText = document.getElementById('diagnosisText');
            if (diagnosisText) {
                diagnosisText.innerHTML = 'Se ha completado tu diagnóstico social. Los resultados se están procesando...';
            }
        }
        
        // Actualizar gráfico con datos reales
        if (data.categories) {
            this.updateChart(data.categories);
        }
        
        // Actualizar recomendaciones
        if (data.recommendations) {
            this.updateRecommendations(data.recommendations);
        }
    }

    // Mostrar diagnóstico específico
    displaySpecificDiagnosis(diagnosis, data = null) {
        const userGreeting = document.getElementById('userGreeting');
        const diagnosisText = document.getElementById('diagnosisText');
        
        // Obtener nombre del usuario (si está disponible)
        const userName = (data && data.userName) || localStorage.getItem('userName') || 'Usuario';
        userGreeting.textContent = `Hola ${userName},`;
        
        // Mostrar diagnóstico específico
        let diagnosisMessage = '';
        
        if (diagnosis.escenario) {
            diagnosisMessage = `Tienes <strong>${diagnosis.escenario}</strong>. ${diagnosis.descripcion}`;
        } else if (diagnosis.diagnostico) {
            diagnosisMessage = `Tienes <strong>${diagnosis.diagnostico}</strong>. ${diagnosis.descripcion}`;
        } else {
            diagnosisMessage = 'Se ha completado tu diagnóstico social.';
        }
        
        diagnosisText.innerHTML = diagnosisMessage;
        
        // Actualizar nivel de riesgo
        this.updateRiskLevel(diagnosis.prioridad || diagnosis.puntuacion);
    }

    // Mostrar diagnóstico de IA
    displayAIDiagnosis(aiDiagnosis) {
        const diagnosisText = document.getElementById('diagnosisText');
        const userGreeting = document.getElementById('userGreeting');
        
        if (diagnosisText && aiDiagnosis) {
            // Ocultar el saludo personalizado si el diagnóstico ya lo incluye
            if (userGreeting && (aiDiagnosis.includes('Querido/a') || aiDiagnosis.includes('Hola'))) {
                userGreeting.style.display = 'none';
            }
            
            // Formatear el texto correctamente
            let cleanDiagnosis = aiDiagnosis.trim();
            
            // Reemplazar saltos de línea con <br> para HTML
            cleanDiagnosis = cleanDiagnosis.replace(/\n/g, '<br>');
            
            // Aplicar el texto formateado
            diagnosisText.innerHTML = cleanDiagnosis;
            
            // Estilos para el texto del diagnóstico
            diagnosisText.style.fontSize = '1.1rem';
            diagnosisText.style.lineHeight = '1.6';
            diagnosisText.style.textAlign = 'left';
            diagnosisText.style.padding = '20px';
            diagnosisText.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
            diagnosisText.style.borderLeft = '4px solid #3b82f6';
            diagnosisText.style.borderRadius = '8px';
            diagnosisText.style.marginTop = '15px';
            diagnosisText.style.whiteSpace = 'normal';
            diagnosisText.style.wordWrap = 'break-word';
            diagnosisText.style.overflow = 'visible';
            diagnosisText.style.height = 'auto';
            diagnosisText.style.maxWidth = '100%';
        }
    }

    // Actualizar nivel de riesgo
    updateRiskLevel(priority) {
        const riskElement = document.querySelector('.score-card:nth-child(2) .score-value');
        const riskDescription = document.querySelector('.score-card:nth-child(2) .score-description');
        
        if (priority === 'CRÍTICA' || priority >= 46) {
            riskElement.textContent = 'CRÍTICO';
            riskElement.style.color = '#dc2626';
            riskDescription.textContent = 'Se requiere atención inmediata y seguimiento intensivo.';
        } else if (priority === 'ALTA' || priority >= 31) {
            riskElement.textContent = 'ALTO';
            riskElement.style.color = '#f59e0b';
            riskDescription.textContent = 'Se detectan factores de riesgo que requieren intervención.';
        } else if (priority === 'MEDIA' || priority >= 16) {
            riskElement.textContent = 'MEDIO';
            riskElement.style.color = '#f59e0b';
            riskDescription.textContent = 'Se detectan algunas áreas de mejora en tu situación social.';
        } else {
            riskElement.textContent = 'BAJO';
            riskElement.style.color = '#10b981';
            riskDescription.textContent = 'No se detectan factores de riesgo significativos.';
        }
    }

    // Mostrar resultados de ejemplo
    displayExampleResults() {
        // Los datos ya están en el HTML como ejemplo
        console.log('Mostrando resultados de ejemplo');
        
        // Mostrar mensaje de ejemplo en el diagnóstico
        const userGreeting = document.getElementById('userGreeting');
        const diagnosisText = document.getElementById('diagnosisText');
        
        if (userGreeting) {
            userGreeting.textContent = 'Hola Usuario,';
        }
        
        if (diagnosisText) {
            diagnosisText.innerHTML = 'Se ha completado tu diagnóstico social. Los resultados se mostrarán aquí cuando completes el formulario.';
        }
    }

    // Inicializar gráfico de categorías
    initChart() {
        const canvas = document.getElementById('categoriesChart');
        if (!canvas) {
            console.error('Canvas del gráfico no encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Verificar si Chart.js está disponible
        if (typeof Chart === 'undefined') {
            console.error('Chart.js no está cargado');
            this.showChartError();
            return;
        }
        
        try {
            this.chart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: [
                        'Vulnerabilidad Económica',
                        'Acceso a Salud',
                        'Acceso a Educación',
                        'Cohesión Social',
                        'Seguridad',
                        'Ambiente'
                    ],
                    datasets: [{
                        label: 'Tu Perfil Social',
                        data: [85, 70, 90, 95, 75, 60],
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                color: '#64748b',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(100, 116, 139, 0.2)'
                            },
                            pointLabels: {
                                color: '#475569',
                                font: {
                                    size: 11,
                                    weight: '500'
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
            console.log('Gráfico inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando gráfico:', error);
            this.showChartError();
        }
    }

    // Mostrar error si el gráfico no se puede cargar
    showChartError() {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <h2 class="chart-title">Análisis por Categorías</h2>
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">📊</div>
                    <p>El gráfico se está cargando...</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Si no aparece, recarga la página</p>
                    <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                        🔄 Recargar Página
                    </button>
                </div>
            `;
        }
    }

    // Actualizar gráfico con datos reales
    updateChart(categories) {
        if (this.chart && categories) {
            const labels = [
                'Vulnerabilidad Económica',
                'Acceso a Salud', 
                'Acceso a Educación',
                'Cohesión Social',
                'Seguridad',
                'Ambiente'
            ];
            
            const data = [
                categories.economico || 0,
                categories.salud || 0,
                categories.educacion || 0,
                categories.social || 0,
                categories.seguridad || 0,
                categories.ambiental || 0
            ];
            
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = data;
            this.chart.update();
            console.log('Gráfico actualizado con datos reales:', data);
        } else if (categories) {
            // Si no hay gráfico pero sí hay datos, crear uno nuevo
            this.createChartWithData(categories);
        }
    }

    // Crear gráfico con datos específicos
    createChartWithData(categories) {
        const canvas = document.getElementById('categoriesChart');
        if (!canvas || typeof Chart === 'undefined') {
            console.error('No se puede crear el gráfico');
            return;
        }

        const ctx = canvas.getContext('2d');
        
        const labels = [
            'Vulnerabilidad Económica',
            'Acceso a Salud', 
            'Acceso a Educación',
            'Cohesión Social',
            'Seguridad',
            'Ambiente'
        ];
        
        const data = [
            categories.economico || 0,
            categories.salud || 0,
            categories.educacion || 0,
            categories.social || 0,
            categories.seguridad || 0,
            categories.ambiental || 0
        ];

        try {
            this.chart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Tu Perfil Social',
                        data: data,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                color: '#64748b',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(100, 116, 139, 0.2)'
                            },
                            pointLabels: {
                                color: '#475569',
                                font: {
                                    size: 11,
                                    weight: '500'
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
            console.log('Gráfico creado con datos específicos');
        } catch (error) {
            console.error('Error creando gráfico con datos:', error);
        }
    }

    // Actualizar recomendaciones
    updateRecommendations(recommendations) {
        const recommendationsContainer = document.querySelector('.recommendations-section');
        if (recommendationsContainer && recommendations && recommendations.length > 0) {
            const recommendationsList = recommendationsContainer.querySelector('.recommendation-item');
            if (recommendationsList) {
                // Limpiar recomendaciones existentes
                const existingItems = recommendationsContainer.querySelectorAll('.recommendation-item');
                existingItems.forEach(item => item.remove());
                
                // Agregar nuevas recomendaciones
                recommendations.forEach((rec, index) => {
                    const icon = this.getRecommendationIcon(rec);
                    const item = document.createElement('div');
                    item.className = 'recommendation-item';
                    item.innerHTML = `
                        <div class="recommendation-icon">${icon}</div>
                        <div class="recommendation-text">
                            <strong>${rec}</strong>
                        </div>
                    `;
                    recommendationsContainer.appendChild(item);
                });
            }
        }
    }

    // Obtener icono para recomendación
    getRecommendationIcon(recommendation) {
        const text = recommendation.toLowerCase();
        if (text.includes('económico') || text.includes('empleo')) return '💰';
        if (text.includes('salud') || text.includes('médico')) return '🏥';
        if (text.includes('educación') || text.includes('capacitación')) return '📚';
        if (text.includes('social') || text.includes('comunitario')) return '🤝';
        if (text.includes('seguridad') || text.includes('violencia')) return '🛡️';
        if (text.includes('ambiente') || text.includes('ambiental')) return '🌱';
        return '💡';
    }

    // Bindear eventos
    bindEvents() {
        // Eventos específicos de resultados
    }

    // Guardar en perfil
    saveToProfile() {
        const results = {
            date: new Date().toISOString(),
            generalScore: document.getElementById('generalScore').textContent,
            categories: this.getCategoriesData(),
            recommendations: this.getRecommendations()
        };

        // Guardar en historial
        this.saveToHistory(results);
        
        alert('¡Diagnóstico guardado en tu perfil!');
    }

    // Obtener datos de categorías
    getCategoriesData() {
        return {
            emotional: 85,
            social: 70,
            economic: 90,
            family: 95,
            personal: 75,
            community: 60
        };
    }

    // Obtener recomendaciones
    getRecommendations() {
        // Cargar recomendaciones reales del localStorage
        const results = localStorage.getItem('diagnosticResults');
        if (results) {
            try {
                const data = JSON.parse(results);
                if (data.recommendations && data.recommendations.length > 0) {
                    console.log('✅ Usando recomendaciones reales del diagnóstico:', data.recommendations);
                    return data.recommendations;
                }
            } catch (error) {
                console.error('Error cargando recomendaciones reales:', error);
            }
        }
        
        // Fallback a recomendaciones básicas si no hay datos reales
        console.log('⚠️ Usando recomendaciones de fallback');
        return [
            "Consulta con especialista en trabajo social para evaluación detallada",
            "Busca programas de apoyo social en tu alcaldía o gobernación",
            "Mantén redes de apoyo familiar y comunitario",
            "Participa en actividades de desarrollo comunitario"
        ];
    }

    // Guardar en historial
    saveToHistory(results) {
        let history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
        history.push(results);
        localStorage.setItem('diagnosticHistory', JSON.stringify(history));
    }

    // Exportar resultados
    exportResults() {
        // Simular exportación de PDF
        alert('Funcionalidad de exportación en desarrollo...');
    }
}

// Función global para inicializar
function initResultsPage() {
    new ResultsSystem();
}

// Exportar para uso global
window.ResultsSystem = ResultsSystem;
window.initResultsPage = initResultsPage;

