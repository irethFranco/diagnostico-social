// ===========================================
// SISTEMA SIMPLE DE RESULTADOS
// ===========================================

class SimpleResultsSystem {
    constructor() {
        this.init();
    }

    init() {
        this.loadResults();
        this.createSimpleChart();
        this.bindEvents();
    }

    // Cargar resultados del localStorage
    loadResults() {
        const results = localStorage.getItem('diagnosticResults');
        console.log('Cargando resultados:', results);
        
        if (results) {
            const data = JSON.parse(results);
            console.log('Datos cargados:', data);
            this.displayResults(data);
        } else {
            console.log('No hay resultados, mostrando ejemplo');
            this.displayExampleResults();
        }
    }

    // Mostrar resultados
    displayResults(data) {
        console.log('Mostrando resultados:', data);
        
        // Mostrar diagnóstico específico
        if (data.diagnosis) {
            this.displaySpecificDiagnosis(data.diagnosis);
        }
        
        // Mostrar diagnóstico de IA
        if (data.aiDiagnosis) {
            this.displayAIDiagnosis(data.aiDiagnosis);
        }
        
        // Actualizar gráfico
        this.updateChart(data.categories);
        
        // Actualizar recomendaciones
        this.updateRecommendations(data.recommendations);
        
        // Actualizar nivel de riesgo
        this.updateRiskLevel(data.generalScore);
        
        // Actualizar puntuación general
        this.updateGeneralScore(data.generalScore);
    }

    // Mostrar diagnóstico específico
    displaySpecificDiagnosis(diagnosis) {
        const diagnosisElement = document.getElementById('diagnosisText');
        if (diagnosisElement && diagnosis) {
            let diagnosisText = '';
            if (typeof diagnosis === 'object') {
                diagnosisText = diagnosis.mensaje || diagnosis.descripcion || 'Diagnóstico completado';
            } else {
                diagnosisText = diagnosis;
            }
            diagnosisElement.innerHTML = diagnosisText;
        }
    }

    // Mostrar diagnóstico de IA
    displayAIDiagnosis(aiDiagnosis) {
        const diagnosisText = document.getElementById('diagnosisText');
        const userGreeting = document.getElementById('userGreeting');
        
        if (diagnosisText && aiDiagnosis) {
            // Ocultar saludo si el diagnóstico ya lo incluye
            if (userGreeting && (aiDiagnosis.includes('Querido/a') || aiDiagnosis.includes('Hola'))) {
                userGreeting.style.display = 'none';
            }
            
            // Formatear texto correctamente
            let cleanDiagnosis = aiDiagnosis.trim();
            
            // Asegurar que el texto esté completo
            if (cleanDiagnosis.length < 200) {
                cleanDiagnosis = 'Querido/a Usuario, según el análisis de tus respuestas, se ha completado tu diagnóstico social. Los resultados muestran información importante sobre tu situación actual.';
            }
            
            // Reemplazar saltos de línea con <br> para HTML
            cleanDiagnosis = cleanDiagnosis.replace(/\n/g, '<br>');
            
            // Aplicar estilos para texto completo
            diagnosisText.innerHTML = cleanDiagnosis;
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
            diagnosisText.style.minHeight = '100px';
            diagnosisText.style.maxWidth = '100%';
            diagnosisText.style.display = 'block';
        }
    }

    // Crear gráfico simple
    createSimpleChart() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) {
            console.log('Contenedor del gráfico no encontrado');
            return;
        }

        console.log('Creando gráfico simple...');
        
        // Intentar cargar datos reales primero
        const results = localStorage.getItem('diagnosticResults');
        let categories = {
            'Económica': 0,
            'Social': 0, 
            'Salud': 0,
            'Educativa': 0,
            'Ambiental': 0
        };
        
        if (results) {
            try {
                const data = JSON.parse(results);
                if (data.categories) {
                    categories = data.categories;
                    console.log('✅ Usando datos reales del diagnóstico:', categories);
                }
            } catch (error) {
                console.error('Error cargando datos reales:', error);
            }
        }

        let chartHTML = '<div class="simple-chart">';
        chartHTML += '<h3 style="text-align: center; margin-bottom: 20px; color: #1e293b;">📊 Análisis por Categorías</h3>';
        
        Object.entries(categories).forEach(([category, score]) => {
            const percentage = (score / 25) * 100;
            const color = percentage > 60 ? '#ef4444' : percentage > 40 ? '#f59e0b' : '#10b981';
            
            chartHTML += `
                <div class="category-bar" style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: 600; color: #1e293b;">${category}</span>
                        <span style="color: #64748b;">${score}</span>
                    </div>
                    <div style="background: #e2e8f0; border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="background: ${color}; height: 100%; width: ${percentage}%; border-radius: 10px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        });
        
        chartHTML += '</div>';
        
        chartContainer.innerHTML = chartHTML;
        console.log('Gráfico simple creado exitosamente');
    }

    // Actualizar gráfico con datos reales
    updateChart(categories) {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;

        console.log('🔍 DEBUG - Actualizando gráfico con categorías:', categories);
        console.log('🔍 DEBUG - Tipo de datos:', typeof categories);
        console.log('🔍 DEBUG - Claves del objeto:', Object.keys(categories || {}));

        // Verificar que hay datos reales
        if (!categories || Object.keys(categories).length === 0) {
            console.warn('⚠️ No se recibieron categorías con datos reales');
            return;
        }
        
        const chartData = categories;

        let chartHTML = '<div class="simple-chart">';
        chartHTML += '<h3 style="text-align: center; margin-bottom: 20px; color: #1e293b;">📊 Análisis por Categorías</h3>';
        
        Object.entries(chartData).forEach(([category, score]) => {
            // Calcular porcentaje basado en el valor máximo real
            const maxValue = Math.max(...Object.values(chartData));
            const percentage = maxValue > 0 ? (score / maxValue) * 100 : 0;
            const color = percentage > 80 ? '#ef4444' : percentage > 50 ? '#f59e0b' : '#10b981';
            
            chartHTML += `
                <div class="category-bar" style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: 600; color: #1e293b;">${category}</span>
                        <span style="color: #64748b;">${score}</span>
                    </div>
                    <div style="background: #e2e8f0; border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="background: ${color}; height: 100%; width: ${percentage}%; border-radius: 10px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        });
        
        chartHTML += '</div>';
        
        chartContainer.innerHTML = chartHTML;
        console.log('Gráfico actualizado con datos reales');
    }

    // Actualizar recomendaciones
    updateRecommendations(recommendations) {
        if (!recommendations) return;
        
        const recommendationsContainer = document.querySelector('.recommendations-list');
        if (!recommendationsContainer) return;

        let html = '';
        recommendations.forEach((rec, index) => {
            const icon = this.getRecommendationIcon(index);
            const expanded = this.expandRecommendation(rec);
            html += `
                <div class="recommendation-item">
                    <div class="recommendation-icon">${icon}</div>
                    <div class="recommendation-text">${expanded}</div>
                </div>
            `;
        });
        
        recommendationsContainer.innerHTML = html;
    }

    // Expandir recomendaciones cortas conocidas a versiones más detalladas (fallback UI)
    expandRecommendation(text) {
        if (!text || typeof text !== 'string') return text;
        const t = text.trim().toLowerCase();
        const map = [
            {
                match: (s) => s.startsWith('consulta con especialista'),
                value: 'Agenda una consulta con un especialista en trabajo social para una evaluación integral de tu situación. Lleva documentos básicos (identificación, recibos de servicios, soportes de ingresos/gastos) para agilizar el estudio del caso. El profesional te orientará sobre programas vigentes, rutas de atención prioritaria, requisitos, seguimiento y acompañamiento psicosocial si lo requieres.'
            },
            {
                match: (s) => s.startsWith('busca programas sociales') || s.startsWith('busca programas de apoyo social'),
                value: 'Acércate a tu alcaldía o gobernación y pregunta por programas de empleo, transferencias monetarias, bancos de alimentos, subsidios de arriendo y formación para el trabajo. Revisa también canales virtuales (sitio web y redes oficiales) para enterarte de convocatorias y fechas de inscripción. Si cumples requisitos, realiza la postulación y conserva los radicados para seguimiento.'
            },
            {
                match: (s) => s.startsWith('mantén redes de apoyo') || s.startsWith('mantén redes de apoyo'),
                value: 'Fortalece tus redes de apoyo: mantén comunicación periódica con familiares, vecinos y amistades; identifica personas clave para apoyo en emergencias; participa en grupos comunitarios, iglesias, clubes deportivos o culturales. Las redes activas mejoran el acceso a oportunidades (empleo, educación) y brindan contención emocional en momentos difíciles.'
            },
            {
                match: (s) => s.startsWith('fortalecer redes sociales'),
                value: 'Integra organizaciones comunitarias, juntas de acción comunal y comités barriales. Propón y participa en actividades culturales/deportivas y jornadas de voluntariado. Presentarte a líderes locales te permite conocer ayudas disponibles, proyectos productivos y espacios de formación; además, amplías tu red de confianza y colaboración.'
            },
            {
                match: (s) => s.startsWith('gestión del estrés'),
                value: 'Incluye hábitos de manejo del estrés: respiración diafragmática 10 minutos al día, caminatas o actividad física moderada 3 veces por semana y pausas activas durante la jornada. Si el malestar persiste, solicita cita de salud mental en tu centro de salud; la atención psicológica es gratuita en la red pública y puede incluir grupos de apoyo.'
            },
            {
                match: (s) => s.startsWith('desarrollo profesional'),
                value: 'Actualiza tu hoja de vida y portafolio; crea perfil en el Servicio Público de Empleo. Inscríbete en formación del SENA o cursos virtuales gratuitos (ofimática, ventas, atención al cliente). Define un objetivo laboral de corto plazo y postúlate a ofertas afines; complementa con trabajo temporal o por horas mientras fortaleces competencias.'
            }
        ];

        const found = map.find(m => m.match(t));
        return found ? found.value : text;
    }

    // Obtener icono para recomendación
    getRecommendationIcon(index) {
        const icons = ['💡', '🤝', '📚', '🏥', '🌱', '💪'];
        return icons[index] || '💡';
    }

    // Actualizar nivel de riesgo
    updateRiskLevel(score) {
        const riskElement = document.querySelector('.score-card:nth-child(2) .score-value');
        const riskDescription = document.querySelector('.score-card:nth-child(2) .score-description');
        
        if (!riskElement || !riskDescription) return;

        let riskLevel = 'BAJO';
        let riskColor = '#10b981';
        let riskText = 'No se detectan factores de riesgo significativos.';

        if (score > 20) {
            riskLevel = 'ALTO';
            riskColor = '#ef4444';
            riskText = 'Se detectan múltiples factores de riesgo que requieren atención.';
        } else if (score > 15) {
            riskLevel = 'MEDIO';
            riskColor = '#f59e0b';
            riskText = 'Se identifican algunos factores de riesgo moderados.';
        }

        riskElement.textContent = riskLevel;
        riskElement.style.color = riskColor;
        riskDescription.textContent = riskText;
    }

    // Actualizar puntuación general
    updateGeneralScore(score) {
        const scoreElement = document.getElementById('generalScore');
        const scoreDescription = document.querySelector('.score-card:nth-child(1) .score-description');
        
        if (scoreElement) {
            scoreElement.textContent = score || 0;
            console.log('✅ Puntuación general actualizada:', score);
        }
        
        if (scoreDescription) {
            let description = '';
            if (score >= 20) {
                description = 'Tu situación social presenta múltiples vulnerabilidades que requieren atención inmediata.';
            } else if (score >= 15) {
                description = 'Tu situación social presenta algunas vulnerabilidades que requieren atención.';
            } else if (score >= 10) {
                description = 'Tu situación social presenta vulnerabilidades moderadas con oportunidades de mejora.';
            } else if (score >= 5) {
                description = 'Tu bienestar social se encuentra en un nivel satisfactorio con algunas áreas de mejora.';
            } else {
                description = 'Tu bienestar social se encuentra en un nivel excelente.';
            }
            scoreDescription.textContent = description;
        }
    }

    // Mostrar resultados de ejemplo
    displayExampleResults() {
        console.log('Mostrando resultados de ejemplo');
        
        const exampleData = {
            diagnosis: { escenario: 'Diagnóstico Social Completado', descripcion: 'Análisis básico realizado' },
            aiDiagnosis: 'Querido/a Usuario, según el análisis de tus respuestas, se ha completado tu diagnóstico social. Los resultados muestran información importante sobre tu situación actual. Te recomendamos consultar con un especialista en trabajo social para obtener un análisis más detallado y personalizado.',
            categories: { 
                'Económica': 0, 
                'Social': 0, 
                'Salud': 0, 
                'Educativa': 0, 
                'Ambiental': 0 
            },
            recommendations: ['Consulta con especialista', 'Busca programas sociales', 'Mantén redes de apoyo'],
            generalScore: 0
        };
        
        this.displayResults(exampleData);
    }

    // Vincular eventos
    bindEvents() {
        // Botón de volver al inicio
        const backButton = document.getElementById('backToHome');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Los botones usan atributos onclick en resultados.html; exponemos funciones globales abajo
    }
}

    // Función global para inicializar la página
function initResultsPage() {
    console.log('Inicializando sistema simple de resultados...');
    window.simpleResultsSystem = new SimpleResultsSystem();
}

// Función de prueba para forzar datos específicos
function testChartWithData() {
    console.log('🧪 TEST - Probando gráfica con datos específicos');
    const testData = {
        'Económica': 8,
        'Social': 6,
        'Salud': 4,
        'Educativa': 3,
        'Ambiental': 2
    };
    
    if (window.simpleResultsSystem) {
        window.simpleResultsSystem.updateChart(testData);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initResultsPage();
});

// ========== Funciones Globales para Botones en resultados.html ==========
window.saveToProfile = async function saveToProfile() {
    try {
        // 1) NO guardar en historial aquí - ya se guardó automáticamente al completar el formulario

        // 2) Generar PDF de la vista de resultados
        const container = document.querySelector('.results-container');
        if (!container) {
            alert('No se encontró el contenido para exportar.');
            return;
        }

        const { jsPDF } = window.jspdf || {};
        if (!window.html2canvas || !jsPDF) {
            alert('Herramientas de PDF no disponibles. Verifica tu conexión.');
            return;
        }

        // Asegurar que las fuentes estén listas y quitar animaciones/transformaciones durante la captura
        if (document.fonts && document.fonts.ready) {
            try { await document.fonts.ready; } catch (_) {}
        }
        window.scrollTo(0, 0);

        const canvas = await html2canvas(container, {
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
        });
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

        const fileName = `Diagnostico_${new Date().toISOString().slice(0,10)}.pdf`;
        pdf.save(fileName);

        alert('¡Diagnóstico guardado en tu perfil y exportado como PDF!');
    } catch (err) {
        console.error('Error al guardar/exportar:', err);
        alert('Ocurrió un error al generar el PDF.');
    }
};

window.exportResults = async function exportResults() {
    try {
        const container = document.querySelector('.results-container');
        if (!container) {
            alert('No se encontró el contenido para exportar.');
            return;
        }

        const { jsPDF } = window.jspdf || {};
        if (!window.html2canvas || !jsPDF) {
            alert('Herramientas de PDF no disponibles. Verifica tu conexión.');
            return;
        }

        // Asegurar fuentes y desactivar animaciones/transformaciones
        if (document.fonts && document.fonts.ready) {
            try { await document.fonts.ready; } catch (_) {}
        }
        window.scrollTo(0, 0);

        const canvas = await html2canvas(container, {
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
        });
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

        const fileName = `Resultados_${new Date().toISOString().slice(0,10)}.pdf`;
        pdf.save(fileName);
    } catch (err) {
        console.error('Error exportando PDF:', err);
        alert('Ocurrió un error al exportar el PDF.');
    }
};
