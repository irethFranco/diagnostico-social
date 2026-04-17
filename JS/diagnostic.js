// ===========================================
// SISTEMA DE DIAGNÓSTICO
// Cache buster - Debug formulario v47
// ===========================================

class DiagnosticForm {
    constructor() {
        console.log('🏗️ Constructor DiagnosticForm iniciado');
        this.currentQuestion = 1;
        this.totalQuestions = 10;
        this.answers = {};
        this.diagnosticoData = null;
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando DiagnosticForm...');
        await this.loadDiagnosticoData();
        this.updateProgress();
        this.bindEvents();
        console.log('✅ DiagnosticForm inicializado completamente');
    }

    async loadDiagnosticoData() {
        try {
            const response = await fetch('JS/diagnostico-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.diagnosticoData = await response.json();
            console.log('Datos de diagnóstico cargados exitosamente:', this.diagnosticoData);
        } catch (error) {
            console.error('Error cargando datos de diagnóstico:', error);
            // Crear datos de prueba si falla la carga
            this.diagnosticoData = {
                diagnostico_social: {
                    preguntas: [],
                    categorias_diagnostico: {},
                    niveles_vulnerabilidad: {
                        baja: { descripcion: "Baja vulnerabilidad", recomendaciones: ["Mantenimiento preventivo"] },
                        media: { descripcion: "Vulnerabilidad media", recomendaciones: ["Apoyo focalizado"] },
                        alta: { descripcion: "Alta vulnerabilidad", recomendaciones: ["Intervención urgente"] },
                        critica: { descripcion: "Vulnerabilidad crítica", recomendaciones: ["Atención de emergencia"] }
                    },
                    logica_diagnostico: {
                        escenarios_diagnostico: {}
                    }
                }
            };
            console.log('Usando datos de prueba');
        }
    }

    bindEvents() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuestion());
        if (submitBtn) submitBtn.addEventListener('click', (e) => this.submitForm(e));

        // Auto-save answers when option is selected
        document.querySelectorAll('.option-input').forEach(input => {
            console.log('Bindando evento para:', input.name, input.value, input.type);
            
            input.addEventListener('change', (e) => {
                console.log('Evento change disparado:', e.target.name, e.target.value);
                
                // Logging especial para pregunta 7
                if (e.target.name === 'q7') {
                    console.log('PREGUNTA 7 SELECCIONADA:', e.target.value);
                }
                
                this.saveAnswer(e.target.name, e.target.value);
                
                // Mostrar campo de texto para pregunta 6 si se selecciona "Sí"
                if (e.target.name === 'q6' && e.target.value === 'si') {
                    const specifyDiv = document.getElementById('q6_specify');
                    if (specifyDiv) {
                        specifyDiv.style.display = 'block';
                    }
                } else if (e.target.name === 'q6' && e.target.value !== 'si') {
                    const specifyDiv = document.getElementById('q6_specify');
                    if (specifyDiv) {
                        specifyDiv.style.display = 'none';
                    }
                }
                
                // Guardar texto de "otro" para pregunta 9
                if (e.target.name === 'q9' && e.target.value === 'otro') {
                    const otherInput = document.querySelector('label[for="q9f"] input[type="text"]');
                    if (otherInput) {
                        // Guardar el valor actual del input
                        this.saveAnswer('q9_other_text', otherInput.value);
                    }
                }
            });
        });
        
        // Capturar texto mientras se escribe en el campo "otro" de pregunta 9
        const otherInput = document.querySelector('label[for="q9f"] input[type="text"]');
        if (otherInput) {
            otherInput.addEventListener('input', (e) => {
                console.log('Texto de "otro" cambiado:', e.target.value);
                this.saveAnswer('q9_other_text', e.target.value);
            });
        }
    }

    nextQuestion() {
        // Validar la pregunta actual antes de avanzar
        if (!this.validateCurrentQuestion()) {
            return; // No avanzar si la pregunta no está respondida
        }
        
        if (this.currentQuestion < this.totalQuestions) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
            this.updateProgress();
            this.updateButtons();
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 1) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
            this.updateProgress();
            this.updateButtons();
        }
    }

    showQuestion(questionNumber) {
        // Hide all questions
        document.querySelectorAll('.question-slide').forEach(slide => {
            slide.classList.remove('active');
        });

        // Show current question
        const allSlides = document.querySelectorAll('.question-slide');
        const currentSlide = allSlides[questionNumber - 1];
        
        if (currentSlide) {
            currentSlide.classList.add('active');
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const currentQuestionEl = document.getElementById('currentQuestion');
        const totalQuestionsEl = document.getElementById('totalQuestions');

        if (progressFill) {
            const progress = (this.currentQuestion / this.totalQuestions) * 100;
            progressFill.style.width = `${progress}%`;
        }

        if (currentQuestionEl) currentQuestionEl.textContent = this.currentQuestion;
        if (totalQuestionsEl) totalQuestionsEl.textContent = this.totalQuestions;
    }

    updateButtons() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Update previous button
        if (prevBtn) prevBtn.disabled = this.currentQuestion === 1;

        // Update next/submit button
        if (this.currentQuestion === this.totalQuestions) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'block';
        } else {
            if (nextBtn) nextBtn.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    saveAnswer(questionName, answer) {
        // Manejar checkboxes (múltiples respuestas)
        if (questionName === 'q2') {
            if (!this.answers[questionName]) {
                this.answers[questionName] = [];
            }
            
            if (Array.isArray(this.answers[questionName])) {
                if (this.answers[questionName].includes(answer)) {
                    // Remover si ya está seleccionado
                    this.answers[questionName] = this.answers[questionName].filter(a => a !== answer);
                } else {
                    // Agregar si no está seleccionado
                    this.answers[questionName].push(answer);
                }
            }
        } else {
            // Para radio buttons, reemplazar la respuesta
            this.answers[questionName] = answer;
        }
        
        // Verificar si todas las preguntas están respondidas
        this.checkAllQuestionsAnswered();
    }
    
    checkAllQuestionsAnswered() {
        let answeredCount = 0;
        let totalQuestions = this.totalQuestions;
        
        for (let i = 1; i <= totalQuestions; i++) {
            const questionName = `q${i}`;
            const answer = this.answers[questionName];
            
            if (questionName === 'q2') {
                if (answer && Array.isArray(answer) && answer.length > 0) {
                    answeredCount++;
                }
            } else {
                if (answer && answer !== '') {
                    answeredCount++;
                }
            }
        }
        
        console.log(`Preguntas respondidas: ${answeredCount}/${totalQuestions}`);
        
        // Actualizar el botón de envío si todas están respondidas
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            if (answeredCount === totalQuestions) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Diagnóstico';
            } else {
                submitBtn.disabled = true;
                submitBtn.textContent = `Responder ${totalQuestions - answeredCount} preguntas más`;
            }
        }
    }

    submitForm(e) {
        e.preventDefault();
        
        console.log('Enviando formulario...');
        
        // Verificar que todas las preguntas estén respondidas
        if (!this.validateAllAnswers()) {
            alert('Por favor responde todas las preguntas antes de continuar.');
            return;
        }

        console.log('Formulario válido, procesando...');
        
        // Generar diagnóstico específico basado en las respuestas
        const userName = localStorage.getItem('userName') || 'Usuario';
        console.log('🔍 DEBUG - Respuestas del usuario al enviar:', this.answers);
        console.log('🔍 DEBUG - Datos de diagnóstico disponibles:', this.diagnosticoData);
        const diagnosis = this.generateSpecificDiagnosisText();
        
        // Calcular categorías basadas en las respuestas reales
        const categories = this.calculateCategoriesFromAnswers();
        console.log('✅ Usando datos reales calculados:', categories);
        
        // Calcular puntuación general basada en las respuestas reales
        const generalScore = this.calculateGeneralScore();
        console.log('✅ Puntuación general calculada:', generalScore);
        
        // Generar análisis detallado y nivel de vulnerabilidad de forma segura
        let analysis, vulnerabilityLevel, recommendations, specificDiagnosis;
        
        try {
            analysis = this.generateDetailedAnalysis();
            vulnerabilityLevel = this.getVulnerabilityLevel(generalScore);
            recommendations = this.generateSpecificRecommendations(analysis, vulnerabilityLevel.nombre);
            specificDiagnosis = this.generateSpecificDiagnosis();
        } catch (error) {
            console.error('Error generando análisis:', error);
            // Respaldo robusto: usar recomendaciones extensas basadas en respuestas
            analysis = { specificRecommendations: [] };
            vulnerabilityLevel = { nombre: 'media' };
            recommendations = this.generateFallbackRecommendations();
            specificDiagnosis = { escenario: 'Diagnóstico Social Completado', descripcion: 'Análisis basado en tus respuestas' };
        }
        
        // Guardar resultados
        const riskInfo = this.getRiskInfo(generalScore);
        const results = {
            date: new Date().toISOString(),
            generalScore: generalScore, // Usar puntuación real calculada
            categories: categories, // Usar datos reales calculados
            recommendations: recommendations,
            diagnosis: specificDiagnosis,
            aiDiagnosis: diagnosis,
            answers: this.answers,
            userName: userName,
            riskLevel: riskInfo.level,
            riskPriority: riskInfo.priority
        };
        
        console.log('🔍 DEBUG - Guardando resultados:', results);
        console.log('🔍 DEBUG - Categorías calculadas:', categories);
        localStorage.setItem('diagnosticResults', JSON.stringify(results));
        this.assignWorkerAfterDiagnostic(results);
        
        // También agregar la ejecución al historial del perfil (solo si no existe ya)
        try {
            const history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
            
            // Verificar si ya existe un diagnóstico con la misma fecha y puntuación
            const exists = history.some(item => {
                const itemDate = new Date(item.date);
                const resultsDate = new Date(results.date);
                
                // Comparar fechas hasta el minuto para ser menos estricto con los milisegundos
                const sameDateMinute = itemDate.getFullYear() === resultsDate.getFullYear() &&
                                       itemDate.getMonth() === resultsDate.getMonth() &&
                                       itemDate.getDate() === resultsDate.getDate() &&
                                       itemDate.getHours() === resultsDate.getHours() &&
                                       itemDate.getMinutes() === resultsDate.getMinutes();
                
                // Comparar también el score, categorías y recomendaciones para una verificación más robusta
                return sameDateMinute &&
                       item.generalScore === results.generalScore &&
                       JSON.stringify(item.categories) === JSON.stringify(results.categories) &&
                       JSON.stringify(item.recommendations) === JSON.stringify(results.recommendations);
            });
            
            if (!exists) {
                const historyEntry = {
                    date: results.date,
                    generalScore: results.generalScore,
                    categories: results.categories,
                    recommendations: results.recommendations,
                    diagnosis: results.diagnosis
                };
                history.push(historyEntry);
                localStorage.setItem('diagnosticHistory', JSON.stringify(history));
            }

            // Actualizar resumen para panel de administrador (no afecta UI)
            try {
                const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
                const currentUserName = localStorage.getItem('userName') || localStorage.getItem('username') || 'Usuario';
                const userEmail = localStorage.getItem('userEmail') || '';
                const existingIdx = adminUsers.findIndex(u => u.username === currentUserName && u.userEmail === userEmail);
                const summaryEntry = {
                    date: results.date,
                    generalScore: results.generalScore,
                    diagnosisTitle: results?.diagnosis?.escenario || results?.diagnosis?.diagnostico || 'Diagnóstico',
                    diagnosisDescription: results?.diagnosis?.descripcion || '',
                    aiDiagnosis: results?.aiDiagnosis || '',
                    riskLevel: results.riskLevel,
                    riskPriority: results.riskPriority
                };
                if (existingIdx >= 0) {
                    adminUsers[existingIdx].diagnostics = adminUsers[existingIdx].diagnostics || [];
                    adminUsers[existingIdx].diagnostics.push(summaryEntry);
                    adminUsers[existingIdx].lastDate = results.date;
                } else {
                    adminUsers.push({
                        username: currentUserName,
                        userEmail: userEmail,
                        registeredAt: localStorage.getItem('registeredAt') || new Date().toISOString(),
                        lastDate: results.date,
                        diagnostics: [summaryEntry]
                    });
                }
                localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
            } catch (e) {
                console.warn('No se pudo actualizar adminUsers:', e);
            }
        } catch (err) {
            console.error('Error actualizando el historial de diagnósticos:', err);
        }
        
        alert('¡Diagnóstico completado! Redirigiendo a resultados...');
        
        // Redirigir
            window.location.href = 'resultados.html';
    }

    assignWorkerAfterDiagnostic(results) {
        try {
            const userName = localStorage.getItem('username') || localStorage.getItem('userName') || 'Usuario';
            const userEmail = localStorage.getItem('userEmail') || '';
            const assignedWorker = this.selectBestWorker(results);
            const assignedAt = new Date().toISOString();

            const assignmentRecord = {
                id: `assign_${Date.now()}`,
                assignedAt,
                userName,
                userEmail,
                workerId: assignedWorker.id,
                workerName: assignedWorker.name,
                workerSpecialty: assignedWorker.specialty,
                reason: assignedWorker.reason,
                score: results.generalScore,
                riskLevel: results.riskLevel || '',
                riskPriority: results.riskPriority || 0,
                diagnosisTitle: results?.diagnosis?.escenario || 'Diagnóstico social',
                categories: results.categories || {}
            };

            const assignmentForProfile = {
                workerId: assignedWorker.id,
                workerName: assignedWorker.name,
                workerSpecialty: assignedWorker.specialty,
                reason: assignedWorker.reason,
                assignedAt
            };

            localStorage.setItem('assignedWorkerProfile', JSON.stringify(assignmentForProfile));

            const allAssignments = JSON.parse(localStorage.getItem('diagnosticWorkerAssignments') || '[]');
            allAssignments.push(assignmentRecord);
            localStorage.setItem('diagnosticWorkerAssignments', JSON.stringify(allAssignments));

            console.log('✅ Trabajadora asignada automáticamente:', assignmentRecord);
        } catch (error) {
            console.error('No se pudo asignar trabajadora automáticamente:', error);
        }
    }

    selectBestWorker(results) {
        const workers = {
            mariela: {
                id: 'mariela',
                name: 'Mariela',
                specialty: 'Especialista en Diagnóstico Social'
            },
            francisca: {
                id: 'francisca',
                name: 'Francisca',
                specialty: 'Especialista en Trabajo Social'
            },
            yulianis: {
                id: 'yulianis',
                name: 'Yulianis',
                specialty: 'Especialista en Terapia Familiar'
            },
            mariana: {
                id: 'mariana',
                name: 'Mariana',
                specialty: 'Especialista en Intervención Social'
            }
        };

        const selectedProblems = Array.isArray(this.answers.q2) ? this.answers.q2 : [];
        const selectedHelp = this.answers.q9 || '';
        const laborStatus = this.answers.q4 || '';
        const incomeStatus = this.answers.q5 || '';
        const score = Number(results.generalScore || 0);
        const categories = results.categories || {};

        const hasFamilyConflict = selectedProblems.includes('conflictos_familiares') || selectedHelp === 'atencion_psicologica';
        if (hasFamilyConflict) {
            return { ...workers.yulianis, reason: 'Prioridad en terapia familiar por conflictos o apoyo psicosocial.' };
        }

        const economicLoad = Number(categories['Económica'] || 0);
        const needsEconomicSupport = selectedProblems.includes('falta_empleo') ||
            selectedHelp === 'apoyo_economico' ||
            selectedHelp === 'programas_empleo' ||
            laborStatus === 'desempleado' ||
            incomeStatus === 'no' ||
            economicLoad >= 7;
        if (needsEconomicSupport) {
            return { ...workers.mariela, reason: 'Prioridad económica detectada en el diagnóstico.' };
        }

        const interventionNeed = selectedProblems.includes('inseguridad') ||
            selectedProblems.includes('problemas_ambientales') ||
            selectedProblems.includes('oportunidades_jovenes') ||
            selectedHelp === 'proyectos_comunitarios' ||
            score >= 30;
        if (interventionNeed) {
            return { ...workers.mariana, reason: 'Requiere intervención social comunitaria o prioritaria.' };
        }

        const socialGuidanceNeed = selectedProblems.includes('acceso_salud') ||
            selectedProblems.includes('acceso_educacion') ||
            selectedHelp === 'capacitacion';
        if (socialGuidanceNeed) {
            return { ...workers.francisca, reason: 'Necesita orientación en acceso a redes de apoyo social.' };
        }

        const allAssignments = JSON.parse(localStorage.getItem('diagnosticWorkerAssignments') || '[]');
        const workloadByWorker = allAssignments.reduce((acc, item) => {
            const workerId = item.workerId;
            acc[workerId] = (acc[workerId] || 0) + 1;
            return acc;
        }, {});

        const fallback = Object.values(workers).sort((a, b) => {
            const countA = workloadByWorker[a.id] || 0;
            const countB = workloadByWorker[b.id] || 0;
            return countA - countB;
        })[0];

        return { ...fallback, reason: 'Asignación automática balanceada según carga actual.' };
    }

    validateCurrentQuestion() {
        const questionNumber = this.currentQuestion;
        const questionName = `q${questionNumber}`;
        const answer = this.answers[questionName];
        
        // Para pregunta 2 (checkboxes), verificar que al menos una opción esté seleccionada
        if (questionName === 'q2') {
            if (!answer || !Array.isArray(answer) || answer.length === 0) {
                return false;
            }
        } else if (questionName === 'q6') {
            // Para pregunta 6, verificar que haya una respuesta y si es "si", verificar el texto
            if (!answer || answer === '') {
                return false;
            }
            // Si respondió "si", verificar que haya especificado
            if (answer === 'si') {
                const specifyInput = document.querySelector('input[name="q6_specify"]');
                if (specifyInput && (!specifyInput.value || specifyInput.value.trim() === '')) {
                    return false;
                }
            }
        } else if (questionName === 'q9') {
            // Para pregunta 9, verificar que haya una respuesta y si es "otro", verificar el texto
            if (!answer || answer === '') {
                return false;
            }
            // Si respondió "otro", verificar que haya especificado
            if (answer === 'otro') {
                const otherInput = document.querySelector('label[for="q9f"] input[type="text"]');
                if (otherInput && (!otherInput.value || otherInput.value.trim() === '')) {
                    return false;
                }
            }
        } else {
            // Para radio buttons, verificar que haya una respuesta
            if (!answer || answer === '') {
                return false;
            }
        }
        
        return true;
    }

    validateAllAnswers() {
        console.log('Validando respuestas:', this.answers);
        
        for (let i = 1; i <= this.totalQuestions; i++) {
            const questionName = `q${i}`;
            const answer = this.answers[questionName];
            
            console.log(`Validando pregunta ${i} (${questionName}):`, answer);
            
            // Para pregunta 2 (checkboxes), verificar que al menos una opción esté seleccionada
            if (questionName === 'q2') {
                if (!answer || !Array.isArray(answer) || answer.length === 0) {
                    console.log(`Pregunta ${i} no respondida (checkboxes vacías)`);
                    return false;
                }
            } else if (questionName === 'q6') {
                // Para pregunta 6, verificar que haya una respuesta y si es "si", verificar el texto
                if (!answer || answer === '') {
                    console.log(`Pregunta ${i} no respondida (radio button vacío)`);
                    return false;
                }
                // Si respondió "si", verificar que haya especificado
                if (answer === 'si') {
                    const specifyInput = document.querySelector('input[name="q6_specify"]');
                    if (specifyInput && (!specifyInput.value || specifyInput.value.trim() === '')) {
                        console.log(`Pregunta ${i} especificación vacía`);
                        return false;
                    }
                }
            } else if (questionName === 'q9') {
                // Para pregunta 9, verificar que haya una respuesta y si es "otro", verificar el texto
                if (!answer || answer === '') {
                    console.log(`Pregunta ${i} no respondida (radio button vacío)`);
                    return false;
                }
                // Si respondió "otro", verificar que haya especificado
                if (answer === 'otro') {
                    const otherInput = document.querySelector('label[for="q9f"] input[type="text"]');
                    if (otherInput && (!otherInput.value || otherInput.value.trim() === '')) {
                        console.log(`Pregunta ${i} especificación de "otro" vacía`);
                        return false;
                    }
                }
            } else {
                // Para radio buttons, verificar que haya una respuesta
                if (!answer || answer === '') {
                    console.log(`Pregunta ${i} no respondida (radio button vacío)`);
                return false;
                }
            }
        }
        
        console.log('Todas las preguntas están respondidas');
        return true;
    }

    // Métodos adicionales necesarios para el funcionamiento
    calculateGeneralScore() {
        let score = 0;
        
        // Calcular puntuación basada en respuestas
        Object.keys(this.answers).forEach(question => {
            const answer = this.answers[question];
            
            if (Array.isArray(answer)) {
                // Para checkboxes, sumar puntos
                score += answer.length * 2;
            } else {
                // Para radio buttons, asignar puntos según la respuesta
                const points = this.getBasicPoints(question, answer);
                score += points;
            }
        });
        
        return Math.min(score, 50); // Limitar a máximo 50
    }

    getBasicPoints(question, answer) {
        // Sistema de puntuación basado en vulnerabilidad
        const highRiskAnswers = ['desempleado', 'no', 'deficiente', 'inexistente', 'ninguno', 'primaria', 'mucho'];
        const mediumRiskAnswers = ['trabajador_independiente', 'parcialmente', 'regular', 'secundaria', 'poco'];
        
        if (highRiskAnswers.includes(answer)) return 5;
        if (mediumRiskAnswers.includes(answer)) return 3;
        return 1;
    }

    calculateCategoriesFromAnswers() {
        const categories = {
            'Económica': 0,
            'Social': 0,
            'Salud': 0,
            'Educativa': 0,
            'Ambiental': 0
        };

        // Cálculo basado en respuestas específicas
        Object.keys(this.answers).forEach(question => {
            const answer = this.answers[question];
            
            if (Array.isArray(answer)) {
                // Para checkboxes, sumar puntos por categoría
                answer.forEach(val => {
                    if (val.includes('empleo') || val.includes('economico')) {
                        categories['Económica'] += 3;
                    } else if (val.includes('social') || val.includes('conflictos')) {
                        categories['Social'] += 3;
                    } else if (val.includes('salud')) {
                        categories['Salud'] += 3;
                    } else if (val.includes('educacion')) {
                        categories['Educativa'] += 3;
                    } else if (val.includes('ambiental')) {
                        categories['Ambiental'] += 3;
                    }
                });
        } else {
                // Para radio buttons, asignar puntos por categoría
                if (question === 'q4' && answer === 'desempleado') {
                    categories['Económica'] += 5;
                } else if (question === 'q5' && answer === 'no') {
                    categories['Económica'] += 4;
                } else if (question === 'q7' && (answer === 'deficiente' || answer === 'inexistente')) {
                    categories['Salud'] += 5;
                } else if (question === 'q8' && (answer === 'ninguno' || answer === 'primaria')) {
                    categories['Educativa'] += 4;
                }
            }
        });

        // Limitar puntuaciones a máximo 25
        Object.keys(categories).forEach(key => {
            categories[key] = Math.min(categories[key], 25);
        });

        return categories;
    }

    generateDetailedAnalysis() {
        const analysis = {
            primaryIssue: '',
            specificProblems: [],
            economicImpact: '',
            socialImpact: '',
            educationalImpact: '',
            healthImpact: '',
            specificRecommendations: []
        };

        // Analizar problemáticas identificadas (q2)
        const problems = this.answers.q2;
        if (Array.isArray(problems) && problems.length > 0) {
            analysis.specificProblems = problems.map(problem => {
                const problemNames = {
                    'falta_empleo': 'Falta de empleo o ingresos estables',
                    'inseguridad': 'Inseguridad y violencia',
                    'acceso_salud': 'Deficiente acceso a salud',
                    'problemas_ambientales': 'Problemas ambientales',
                    'acceso_educacion': 'Bajo acceso a educación',
                    'conflictos_familiares': 'Conflictos familiares o comunitarios',
                    'oportunidades_jovenes': 'Pocas oportunidades para jóvenes y mujeres'
                };
                return problemNames[problem] || problem.replace(/_/g, ' ');
            });
        }

        // Determinar problema principal
        if (problems && problems.includes('falta_empleo')) {
            analysis.primaryIssue = 'vulnerabilidad económica severa';
        } else if (problems && problems.includes('inseguridad')) {
            analysis.primaryIssue = 'vulnerabilidad por inseguridad';
        } else if (problems && problems.includes('acceso_salud')) {
            analysis.primaryIssue = 'vulnerabilidad en salud';
        } else {
            analysis.primaryIssue = 'vulnerabilidad social múltiple';
        }

        // Análisis económico
        const laborSituation = this.answers.q4;
        const incomeSituation = this.answers.q5;
        
        if (laborSituation === 'desempleado' && incomeSituation === 'no') {
            analysis.economicImpact = 'se presenta una situación económica crítica con desempleo y ingresos insuficientes';
        } else if (laborSituation === 'trabajador_independiente' && incomeSituation === 'parcialmente') {
            analysis.economicImpact = 'existe inestabilidad económica con ingresos parciales';
        } else if (incomeSituation === 'no') {
            analysis.economicImpact = 'los ingresos no cubren las necesidades básicas';
        }

        // Análisis de salud
        const healthAccess = this.answers.q7;
        if (healthAccess === 'deficiente' || healthAccess === 'inexistente') {
            analysis.healthImpact = 'se presenta un acceso deficiente a servicios de salud';
        }

        // Análisis educativo
        const educationLevel = this.answers.q8;
        if (educationLevel === 'ninguno' || educationLevel === 'primaria') {
            analysis.educationalImpact = 'se identifica un bajo nivel educativo que puede limitar las oportunidades laborales';
        }

        return analysis;
    }
    
    getVulnerabilityLevel(score) {
        if (score >= 30) {
            return { nombre: 'crítica', descripcion: 'Vulnerabilidad crítica' };
        } else if (score >= 20) {
            return { nombre: 'alta', descripcion: 'Vulnerabilidad alta' };
        } else if (score >= 10) {
            return { nombre: 'media', descripcion: 'Vulnerabilidad media' };
        } else {
            return { nombre: 'baja', descripcion: 'Vulnerabilidad baja' };
        }
    }

    getRiskInfo(score) {
        if (score >= 30) return { level: 'crítica', priority: 4 };
        if (score >= 20) return { level: 'alta', priority: 3 };
        if (score >= 10) return { level: 'media', priority: 2 };
        return { level: 'baja', priority: 1 };
    }

    generateSpecificRecommendations(analysis, level) {
        const recommendations = [];
        
        // Recomendaciones basadas en problemas específicos
        if (analysis.specificProblems && analysis.specificProblems.length > 0) {
            analysis.specificProblems.forEach(problem => {
                if (problem.includes('empleo')) {
                    recommendations.push('Inscríbete en el Servicio Público de Empleo para acceder a ofertas laborales');
                    recommendations.push('Participa en programas de capacitación técnica del SENA');
                }
                if (problem.includes('salud')) {
                    recommendations.push('Afíliate al sistema de salud (EPS) más cercano a tu domicilio');
                    recommendations.push('Acude a centros de salud públicos para atención primaria');
                }
                if (problem.includes('educación')) {
                    recommendations.push('Inscríbete en programas de alfabetización para adultos');
                    recommendations.push('Busca becas educativas en tu alcaldía o gobernación');
                }
            });
        }
        
        // Asegurar un mínimo de recomendaciones
        if (recommendations.length < 3) {
            recommendations.push('Busca apoyo en programas sociales locales');
            recommendations.push('Participa en actividades comunitarias');
            recommendations.push('Mantén contacto con servicios sociales');
        }
        
        return recommendations.slice(0, 6);
    }

    generateSpecificDiagnosis() {
        const score = this.calculateGeneralScore();
        const level = this.getVulnerabilityLevel(score);
        
        return {
            escenario: `Vulnerabilidad Social ${level.nombre.toUpperCase()}`,
            diagnostico: level.descripcion,
            descripcion: `Puntuación total: ${score}. ${level.descripcion}`,
            prioridad: level.nombre.toUpperCase(),
            seguimiento: level.nombre === 'crítica' ? 'Semanal' : level.nombre === 'alta' ? 'Quincenal' : 'Mensual',
            puntuacion: score
        };
    }

    generateFallbackRecommendations() {
        return [
            'Buscar apoyo en programas sociales locales',
            'Participa en actividades comunitarias',
            'Mantén contacto con servicios sociales',
            'Busca orientación en tu alcaldía',
            'Considera programas de capacitación',
            'Mantén una red de apoyo social'
        ];
    }

    generateSpecificDiagnosisText() {
        const userName = localStorage.getItem('userName') || 'Usuario';
        let diagnosis = `Querido/a ${userName}, según el análisis detallado de tus respuestas, tu diagnóstico social indica: `;
        
        // Analizar respuestas específicas
        const problems = this.answers.q2 || [];
        const impact = this.answers.q3;
        const labor = this.answers.q4;
        const income = this.answers.q5;
        const health = this.answers.q7;
        const education = this.answers.q8;
        const community = this.answers.q1;
        
        console.log('🔍 DEBUG - Respuestas recibidas para diagnóstico:');
        console.log('🔍 DEBUG - Problemas (q2):', problems);
        console.log('🔍 DEBUG - Impacto (q3):', impact);
        console.log('🔍 DEBUG - Labor (q4):', labor);
        console.log('🔍 DEBUG - Ingresos (q5):', income);
        console.log('🔍 DEBUG - Salud (q7):', health);
        console.log('🔍 DEBUG - Educación (q8):', education);
        console.log('🔍 DEBUG - Comunidad (q1):', community);
        
        let hasSpecificIssues = false;
        let vulnerabilityAreas = [];
        
        // Diagnóstico basado en problemas identificados
        if (problems.includes('falta_empleo')) {
            diagnosis += `Se identifica una vulnerabilidad económica alta debido a la falta de empleo. `;
            vulnerabilityAreas.push('económica');
            hasSpecificIssues = true;
        }
        
        if (problems.includes('acceso_salud')) {
            diagnosis += `Existe una vulnerabilidad en salud por el deficiente acceso a servicios médicos. `;
            vulnerabilityAreas.push('salud');
            hasSpecificIssues = true;
        }
        
        if (problems.includes('problemas_ambientales')) {
            diagnosis += `Se detectan problemas ambientales que afectan la calidad de vida. `;
            vulnerabilityAreas.push('ambiental');
            hasSpecificIssues = true;
        }
        
        if (problems.includes('acceso_educacion')) {
            diagnosis += `Se observa una vulnerabilidad educativa que limita las oportunidades. `;
            vulnerabilityAreas.push('educativa');
            hasSpecificIssues = true;
        }
        
        if (problems.includes('inseguridad')) {
            diagnosis += `Se percibe inseguridad que genera vulnerabilidad social. `;
            vulnerabilityAreas.push('social');
            hasSpecificIssues = true;
        }
        
        // Diagnóstico basado en situación laboral
        if (labor === 'desempleado') {
            diagnosis += `Tu situación de desempleo genera una vulnerabilidad económica crítica. `;
            vulnerabilityAreas.push('económica');
            hasSpecificIssues = true;
        } else if (labor === 'trabajador_independiente') {
            diagnosis += `Tu trabajo independiente presenta inestabilidad económica. `;
            vulnerabilityAreas.push('económica');
            hasSpecificIssues = true;
        }
        
        // Diagnóstico basado en ingresos
        if (income === 'no') {
            diagnosis += `Los ingresos insuficientes generan vulnerabilidad económica severa. `;
            vulnerabilityAreas.push('económica');
            hasSpecificIssues = true;
        } else if (income === 'parcialmente') {
            diagnosis += `Los ingresos parciales generan vulnerabilidad económica moderada. `;
            vulnerabilityAreas.push('económica');
            hasSpecificIssues = true;
        }
        
        // Diagnóstico basado en salud
        if (health === 'deficiente' || health === 'inexistente') {
            diagnosis += `El acceso limitado a servicios de salud genera vulnerabilidad sanitaria. `;
            vulnerabilityAreas.push('salud');
            hasSpecificIssues = true;
        }
        
        // Diagnóstico basado en educación
        if (education === 'ninguno' || education === 'primaria') {
            diagnosis += `El bajo nivel educativo genera vulnerabilidad educativa y laboral. `;
            vulnerabilityAreas.push('educativa');
            hasSpecificIssues = true;
        }

        // Impacto personal y recomendaciones específicas
        if (impact === 'mucho') {
            diagnosis += `Estas vulnerabilidades te afectan significativamente en tu vida diaria. `;
        } else if (impact === 'poco') {
            diagnosis += `Estas vulnerabilidades te afectan moderadamente. `;
        }
        
        // Recomendaciones específicas basadas en vulnerabilidades
        if (vulnerabilityAreas.length > 0) {
            diagnosis += `Se recomienda atención prioritaria en las áreas mencionadas anteriormente. `;
        }
        
        if (!hasSpecificIssues) {
            diagnosis += `Tu situación social presenta características estables con oportunidades de mejora. `;
        }
        
        diagnosis += `El análisis muestra que requieres apoyo específico en las áreas identificadas.`;
        
        console.log('🔍 DEBUG - Diagnóstico generado:', diagnosis);
        console.log('🔍 DEBUG - Áreas de vulnerabilidad identificadas:', vulnerabilityAreas);
        console.log('🔍 DEBUG - Tiene problemas específicos:', hasSpecificIssues);
        
        return diagnosis;
    }
}

// Exportar para uso global
window.DiagnosticForm = DiagnosticForm;
