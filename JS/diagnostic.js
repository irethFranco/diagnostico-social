// ===========================================
// SISTEMA DE DIAGNÓSTICO
// ===========================================

class DiagnosticForm {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 10;
        this.answers = {};
        this.diagnosticoData = null;
        this.init();
    }

    async init() {
        await this.loadDiagnosticoData();
        this.updateProgress();
        this.bindEvents();
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
        const currentSlide = document.querySelector(`.question-slide:nth-child(${questionNumber})`);
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
        console.log('🔍 Guardando respuesta:', questionName, answer);
        
        // Manejar checkboxes (múltiples respuestas)
        if (questionName === 'q2') {
            if (!this.answers[questionName]) {
                this.answers[questionName] = [];
            }
            
            if (Array.isArray(this.answers[questionName])) {
                if (this.answers[questionName].includes(answer)) {
                    // Remover si ya está seleccionado
                    this.answers[questionName] = this.answers[questionName].filter(a => a !== answer);
                    console.log(`  - Removido ${answer} de ${questionName}`);
                } else {
                    // Agregar si no está seleccionado
                    this.answers[questionName].push(answer);
                    console.log(`  - Agregado ${answer} a ${questionName}`);
                }
            }
        } else {
            // Para radio buttons, reemplazar la respuesta
            this.answers[questionName] = answer;
            console.log(`  - Respuesta ${questionName} establecida como: ${answer}`);
        }
        
        console.log('✅ Respuesta guardada:', questionName, this.answers[questionName]);
        console.log('📊 Todas las respuestas actuales:', this.answers);
        
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
        const results = {
            date: new Date().toISOString(),
            generalScore: generalScore, // Usar puntuación real calculada
            categories: categories, // Usar datos reales calculados
            recommendations: recommendations,
            diagnosis: specificDiagnosis,
            aiDiagnosis: diagnosis,
            answers: this.answers,
            userName: userName
        };
        
        console.log('🔍 DEBUG - Guardando resultados:', results);
        console.log('🔍 DEBUG - Categorías calculadas:', categories);
        localStorage.setItem('diagnosticResults', JSON.stringify(results));
        
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

    validateCurrentQuestion() {
        const questionNumber = this.currentQuestion;
        const questionName = `q${questionNumber}`;
        const answer = this.answers[questionName];
        
        console.log(`Validando pregunta actual ${questionNumber} (${questionName}):`, answer);
        
        // Para pregunta 2 (checkboxes), verificar que al menos una opción esté seleccionada
        if (questionName === 'q2') {
            if (!answer || !Array.isArray(answer) || answer.length === 0) {
                console.log(`Pregunta ${questionNumber} no respondida (checkboxes vacías)`);
                alert(`Por favor responde la pregunta ${questionNumber} antes de continuar.`);
                return false;
            }
        } else if (questionName === 'q6') {
            // Para pregunta 6, verificar que haya una respuesta y si es "si", verificar el texto
            if (!answer || answer === '') {
                console.log(`Pregunta ${questionNumber} no respondida (radio button vacío)`);
                alert(`Por favor responde la pregunta ${questionNumber} antes de continuar.`);
                return false;
            }
            // Si respondió "si", verificar que haya especificado
            if (answer === 'si') {
                const specifyInput = document.querySelector('input[name="q6_specify"]');
                if (specifyInput && (!specifyInput.value || specifyInput.value.trim() === '')) {
                    console.log(`Pregunta ${questionNumber} especificación vacía`);
                    alert(`Por favor especifica tu respuesta en la pregunta ${questionNumber}.`);
                    return false;
                }
            }
        } else if (questionName === 'q9') {
            // Para pregunta 9, verificar que haya una respuesta y si es "otro", verificar el texto
            if (!answer || answer === '') {
                console.log(`Pregunta ${questionNumber} no respondida (radio button vacío)`);
                alert(`Por favor responde la pregunta ${questionNumber} antes de continuar.`);
                return false;
            }
            // Si respondió "otro", verificar que haya especificado
            if (answer === 'otro') {
                const otherInput = document.querySelector('label[for="q9f"] input[type="text"]');
                if (otherInput && (!otherInput.value || otherInput.value.trim() === '')) {
                    console.log(`Pregunta ${questionNumber} especificación de "otro" vacía`);
                    alert(`Por favor especifica tu respuesta en la pregunta ${questionNumber}.`);
                    return false;
                }
            }
        } else {
            // Para radio buttons, verificar que haya una respuesta
            if (!answer || answer === '') {
                console.log(`Pregunta ${questionNumber} no respondida (radio button vacío)`);
                alert(`Por favor responde la pregunta ${questionNumber} antes de continuar.`);
                return false;
            }
        }
        
        console.log(`Pregunta ${questionNumber} está respondida correctamente`);
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
                    alert(`Por favor responde la pregunta ${i} antes de continuar.`);
                    return false;
                }
            } else if (questionName === 'q6') {
                // Para pregunta 6, verificar que haya una respuesta y si es "si", verificar el texto
                if (!answer || answer === '') {
                    console.log(`Pregunta ${i} no respondida (radio button vacío)`);
                    alert(`Por favor responde la pregunta ${i} antes de continuar.`);
                    return false;
                }
                // Si respondió "si", verificar que haya especificado
                if (answer === 'si') {
                    const specifyInput = document.querySelector('input[name="q6_specify"]');
                    if (specifyInput && (!specifyInput.value || specifyInput.value.trim() === '')) {
                        console.log(`Pregunta ${i} especificación vacía`);
                        alert(`Por favor especifica tu respuesta en la pregunta ${i}.`);
                        return false;
                    }
                }
            } else if (questionName === 'q9') {
                // Para pregunta 9, verificar que haya una respuesta y si es "otro", verificar el texto
                if (!answer || answer === '') {
                    console.log(`Pregunta ${i} no respondida (radio button vacío)`);
                    alert(`Por favor responde la pregunta ${i} antes de continuar.`);
                    return false;
                }
                // Si respondió "otro", verificar que haya especificado
                if (answer === 'otro') {
                    const otherInput = document.querySelector('label[for="q9f"] input[type="text"]');
                    if (otherInput && (!otherInput.value || otherInput.value.trim() === '')) {
                        console.log(`Pregunta ${i} especificación de "otro" vacía`);
                        alert(`Por favor especifica tu respuesta en la pregunta ${i}.`);
                        return false;
                    }
                }
            } else {
                // Para radio buttons, verificar que haya una respuesta
                if (!answer || answer === '') {
                    console.log(`Pregunta ${i} no respondida (radio button vacío)`);
                    alert(`Por favor responde la pregunta ${i} antes de continuar.`);
                return false;
                }
            }
        }
        
        console.log('Todas las preguntas están respondidas');
        return true;
    }

    // Calcular puntuación general usando el nuevo sistema
    calculateGeneralScore() {
        if (!this.diagnosticoData || !this.diagnosticoData.preguntas) {
            console.log('No hay datos de diagnóstico, usando cálculo básico');
            return this.calculateBasicScore();
        }
        
        let totalScore = 0;
        console.log('🔍 Calculando puntuación general con datos del JSON...');
        
        // Calcular puntos para cada pregunta usando los datos del JSON
        for (let i = 1; i <= this.totalQuestions; i++) {
            const questionId = `q${i}`;
            const answer = this.answers[questionId];
            if (answer) {
                const points = this.getPointsForAnswer(questionId, answer);
                console.log(`Pregunta ${i} (${questionId}): ${answer} = ${points} puntos`);
                totalScore += points;
            }
        }
        
        console.log('✅ Puntuación total calculada:', totalScore);
        return totalScore;
    }

    // Obtener puntos por respuesta usando el JSON
    getPointsForAnswer(questionId, answer) {
        if (!this.diagnosticoData || !this.diagnosticoData.preguntas) {
            console.log('No hay datos de diagnóstico disponibles para calcular puntos');
            return 0;
        }
        
        const question = this.diagnosticoData.preguntas.find(q => q.id === questionId);
        if (!question) {
            console.log(`No se encontró la pregunta ${questionId} en los datos`);
            return 0;
        }
        
        console.log(`Procesando pregunta ${questionId}, tipo: ${question.tipo}, respuesta:`, answer);
        
        if (question.tipo === 'checkbox') {
            // Para checkboxes, sumar puntos de todas las opciones seleccionadas
            let totalPoints = 0;
            if (Array.isArray(answer)) {
                answer.forEach(val => {
                    const option = question.opciones.find(opt => opt.valor === val);
                    if (option) {
                        totalPoints += option.puntos;
                        console.log(`  - Opción ${val}: ${option.puntos} puntos`);
                    }
                });
            }
            console.log(`  Total puntos para ${questionId}: ${totalPoints}`);
            return totalPoints;
        } else {
            // Para radio buttons, obtener puntos de la opción seleccionada
            const option = question.opciones.find(opt => opt.valor === answer);
            const points = option ? option.puntos : 0;
            console.log(`  Opción ${answer}: ${points} puntos`);
            return points;
        }
    }

    // Obtener datos de categorías usando el nuevo sistema
    getCategoriesData() {
        if (!this.diagnosticoData) return {};
        
        const categories = {};
        
        // Calcular puntuación por categoría
        Object.keys(this.diagnosticoData.categorias).forEach(cat => {
            categories[cat] = this.calculateCategoryScore(cat);
        });
        
        return categories;
    }

    // Calcular puntuación por categoría
    calculateCategoryScore(category) {
        let score = 0;
        let count = 0;
        
        // Buscar preguntas que pertenecen a esta categoría
        this.diagnosticoData.preguntas.forEach(question => {
            if (question.opciones) {
                question.opciones.forEach(option => {
                    if (option.categoria === category) {
                        // Verificar si esta opción fue seleccionada
                        const answer = this.answers[question.id];
                        
                        if (answer && (answer === option.valor || (Array.isArray(answer) && answer.includes(option.valor)))) {
                            score += option.puntos;
                            count++;
                        }
                    }
                });
            }
        });
        
        return count > 0 ? Math.round((score / count) * 20) : 0;
    }

    // Obtener ID de pregunta por tipo
    getQuestionIdByType(questionType) {
        const mapping = {
            'tipo_comunidad': 'q1',
            'problematicas_principales': 'q2',
            'afectacion_personal': 'q3',
            'situacion_laboral': 'q4',
            'ingresos_hogar': 'q5',
            'condicion_especial': 'q6',
            'acceso_salud': 'q7',
            'nivel_educativo': 'q8',
            'tipo_ayuda_necesaria': 'q9',
            'disposicion_participacion': 'q10'
        };
        return mapping[questionType];
    }

    // Generar diagnóstico específico
    generateSpecificDiagnosis() {
        if (!this.diagnosticoData) {
            console.log('No hay datos de diagnóstico, generando diagnóstico básico');
            return this.generateBasicDiagnosis();
        }
        
        const totalScore = this.calculateGeneralScore();
        console.log('Puntuación total calculada:', totalScore);
        
        const scenarios = this.diagnosticoData.diagnostico_social.logica_diagnostico.escenarios_diagnostico;
        
        // Buscar escenario que coincida con las respuestas
        if (scenarios && typeof scenarios === 'object') {
            for (const [key, scenario] of Object.entries(scenarios)) {
                if (scenario && this.matchesScenario(scenario)) {
                    console.log('Escenario encontrado:', scenario.nombre);
                    return {
                        escenario: scenario.nombre,
                        diagnostico: scenario.diagnostico,
                        descripcion: scenario.descripcion,
                        prioridad: scenario.prioridad,
                        recomendaciones: scenario.recomendaciones_especificas,
                        seguimiento: scenario.seguimiento,
                        puntuacion: totalScore
                    };
                }
            }
        }
        
        // Si no hay escenario específico, generar diagnóstico inteligente
        return this.generateIntelligentDiagnosis(totalScore);
    }

    // Generar diagnóstico inteligente basado en análisis específico
    generateIntelligentDiagnosis(totalScore) {
        const analysis = this.generateDetailedAnalysis();
        const categories = this.getCategoriesData();
        
        // Determinar nivel de vulnerabilidad
        let vulnerabilityLevel = 'baja';
        let priority = 'BAJA';
        let followUp = 'Mensual';
        
        if (totalScore >= 40) {
            vulnerabilityLevel = 'crítica';
            priority = 'CRÍTICA';
            followUp = 'Semanal';
        } else if (totalScore >= 30) {
            vulnerabilityLevel = 'alta';
            priority = 'ALTA';
            followUp = 'Quincenal';
        } else if (totalScore >= 20) {
            vulnerabilityLevel = 'media';
            priority = 'MEDIA';
            followUp = 'Mensual';
        }
        
        // Crear diagnóstico específico
        const diagnosis = {
            escenario: `Vulnerabilidad Social ${vulnerabilityLevel.toUpperCase()}`,
            diagnostico: this.generateSpecificDiagnosticText(analysis, vulnerabilityLevel),
            descripcion: this.generateDetailedDescription(analysis, totalScore, categories),
            prioridad: priority,
            recomendaciones: this.generateSpecificRecommendations(analysis, vulnerabilityLevel),
            seguimiento: followUp,
            puntuacion: totalScore,
            categorias: categories
        };
        
        return diagnosis;
    }

    // Generar texto de diagnóstico específico
    generateSpecificDiagnosticText(analysis, vulnerabilityLevel) {
        let diagnosticText = `Vulnerabilidad social ${vulnerabilityLevel}`;
        
        if (analysis.primaryIssue) {
            diagnosticText += ` con ${analysis.primaryIssue}`;
        }
        
        if (analysis.specificProblems.length > 0) {
            diagnosticText += `. Problemáticas identificadas: ${analysis.specificProblems.join(', ')}`;
        }
        
        return diagnosticText;
    }

    // Generar descripción detallada
    generateDetailedDescription(analysis, totalScore, categories) {
        let description = `Puntuación total: ${totalScore}. `;
        
        if (analysis.economicImpact) {
            description += `Aspecto económico: ${analysis.economicImpact}. `;
        }
        
        if (analysis.socialImpact) {
            description += `Aspecto social: ${analysis.socialImpact}. `;
        }
        
        if (analysis.educationalImpact) {
            description += `Aspecto educativo: ${analysis.educationalImpact}. `;
        }
        
        if (analysis.healthImpact) {
            description += `Aspecto de salud: ${analysis.healthImpact}. `;
        }
        
        // Agregar información de categorías
        let categoryInfo = '';
        if (categories && typeof categories === 'object') {
            categoryInfo = Object.entries(categories)
                .filter(([cat, score]) => score > 0)
                .map(([cat, score]) => `${cat}: ${score}%`)
                .join(', ');
        }
        
        if (categoryInfo) {
            description += `Análisis por categorías: ${categoryInfo}.`;
        }
        
        return description;
    }

    // Generar recomendaciones específicas y realistas
    generateSpecificRecommendations(analysis, vulnerabilityLevel) {
        const recommendations = [];
        
        // Recomendaciones basadas en problemáticas específicas identificadas
        if (analysis.specificProblems && analysis.specificProblems.length > 0) {
            analysis.specificProblems.forEach(problem => {
                const problemRecommendations = this.getRecommendationsForProblem(problem);
                recommendations.push(...problemRecommendations);
            });
        }
        
        // Recomendaciones basadas en vulnerabilidades económicas
        if (analysis.economicImpact) {
            recommendations.push(...this.getEconomicRecommendations(analysis.economicImpact));
        }
        
        // Recomendaciones basadas en vulnerabilidades sociales
        if (analysis.socialImpact) {
            recommendations.push(...this.getSocialRecommendations(analysis.socialImpact));
        }
        
        // Recomendaciones basadas en vulnerabilidades de salud
        if (analysis.healthImpact) {
            recommendations.push(...this.getHealthRecommendations(analysis.healthImpact));
        }
        
        // Recomendaciones basadas en vulnerabilidades educativas
        if (analysis.educationalImpact) {
            recommendations.push(...this.getEducationalRecommendations(analysis.educationalImpact));
        }
        
        // Recomendaciones según nivel de vulnerabilidad
        const levelRecommendations = this.getLevelBasedRecommendations(vulnerabilityLevel);
        recommendations.push(...levelRecommendations);
        
        // Eliminar duplicados y limitar a 6 recomendaciones
        const uniqueRecommendations = [...new Set(recommendations)];
        return uniqueRecommendations.slice(0, 6);
    }

    // Recomendaciones específicas por problemática
    getRecommendationsForProblem(problem) {
        const problemRecommendations = {
            'Falta de empleo o ingresos estables': [
                'Inscríbete en el Servicio Público de Empleo para acceder a ofertas laborales. Este servicio gratuito del gobierno conecta a las personas con empleadores y ofrece orientación laboral personalizada, incluyendo talleres de hoja de vida y preparación para entrevistas.',
                'Participa en programas de capacitación técnica del SENA. El SENA ofrece más de 600 programas técnicos gratuitos en áreas como tecnología, servicios, agroindustria y construcción. Los cursos incluyen práctica laboral y certificación oficial que mejora significativamente las oportunidades de empleo.',
                'Explora oportunidades de emprendimiento con apoyo de Cámara de Comercio. Las cámaras ofrecen programas de incubación de empresas, asesoría legal y contable, acceso a microcréditos y redes de contactos empresariales. También organizan ferias de emprendimiento y eventos de networking.',
                'Considera trabajos temporales mientras encuentras empleo estable. Los trabajos temporales en sectores como construcción, agricultura, servicios domésticos o delivery pueden generar ingresos inmediatos y experiencia laboral. Muchas empresas usan estos trabajos como puerta de entrada para empleos permanentes.'
            ],
            'Inseguridad y violencia': [
                'Participa en programas de convivencia ciudadana de tu alcaldía. Estos programas incluyen talleres de resolución pacífica de conflictos, actividades deportivas y culturales para jóvenes, y estrategias de prevención del delito. La participación activa fortalece los lazos comunitarios y reduce la violencia.',
                'Únete a redes vecinales de seguridad comunitaria. Las redes vecinales organizan patrullajes comunitarios, sistemas de alerta temprana, y actividades de vigilancia colaborativa. También facilitan la comunicación con autoridades policiales y la denuncia de actividades sospechosas.',
                'Acude a la Comisaría de Familia si hay violencia intrafamiliar. Las comisarías ofrecen protección inmediata, órdenes de restricción, acompañamiento psicológico y legal, y programas de reeducación para agresores. El proceso es confidencial y gratuito.',
                'Busca apoyo psicológico en centros de salud mental. Los centros de salud mental públicos ofrecen terapia individual y grupal gratuita, grupos de apoyo para víctimas de violencia, y programas de rehabilitación. También brindan medicamentos subsidiados cuando es necesario.'
            ],
            'Deficiente acceso a salud': [
                'Afíliate al sistema de salud (EPS) más cercano a tu domicilio. La afiliación es gratuita para personas de bajos recursos y cubre consultas médicas, medicamentos, exámenes de laboratorio, hospitalización y cirugías. Incluye también atención de urgencias 24 horas y programas de prevención.',
                'Acude a centros de salud públicos para atención primaria. Los centros de salud públicos ofrecen consultas médicas generales, control prenatal, vacunación, planificación familiar, y programas de prevención de enfermedades crónicas. La atención es gratuita y de calidad.',
                'Participa en brigadas de salud comunitaria. Las brigadas médicas visitan barrios y veredas ofreciendo consultas médicas, odontológicas, toma de presión arterial, exámenes de diabetes, y entrega de medicamentos. Son especialmente importantes en zonas rurales y de difícil acceso.',
                'Solicita citas médicas prioritarias si tienes condiciones especiales. Las personas con discapacidad, enfermedades crónicas, embarazadas, o adultos mayores tienen derecho a citas prioritarias y atención preferencial. También pueden acceder a programas especiales de seguimiento y medicamentos subsidiados.'
            ],
            'Problemas ambientales': [
                'Únete a comités ambientales de tu barrio o vereda. Los comités ambientales organizan campañas de limpieza, reforestación, reciclaje, y educación ambiental. También gestionan proyectos comunitarios para mejorar la calidad del aire, agua y suelo, y pueden acceder a recursos municipales para implementar soluciones.',
                'Participa en jornadas de limpieza y reciclaje comunitario. Estas jornadas no solo mejoran el entorno inmediato, sino que crean conciencia ambiental, generan empleo temporal, y pueden convertirse en proyectos sostenibles de economía circular. También fortalecen la cohesión social.',
                'Reporta problemas ambientales a la autoridad ambiental. La Corporación Autónoma Regional (CAR) y las autoridades ambientales municipales tienen la obligación de investigar y sancionar actividades que contaminen el ambiente. Los reportes pueden hacerse de forma anónima y son investigados de manera prioritaria.',
                'Implementa prácticas de manejo de residuos en tu hogar. La separación de residuos, compostaje doméstico, reutilización de materiales, y reducción del consumo no solo benefician el ambiente, sino que pueden generar ahorros económicos. Estas prácticas pueden extenderse a toda la comunidad.'
            ],
            'Bajo acceso a educación': [
                'Inscríbete en programas de alfabetización para adultos. Los programas de alfabetización son gratuitos y flexibles, adaptándose a horarios laborales. Incluyen lectura, escritura, matemáticas básicas, y uso de tecnología. Al completar el programa se obtiene certificación oficial que mejora las oportunidades laborales.',
                'Busca becas educativas en tu alcaldía o gobernación. Las entidades territoriales ofrecen becas para educación básica, media, técnica y universitaria. Las becas cubren matrícula, materiales, transporte y alimentación. También existen becas especiales para mujeres, víctimas del conflicto, y personas con discapacidad.',
                'Participa en programas de educación virtual gratuita. Plataformas como "Aprende en Casa" del gobierno, cursos del SENA virtual, y programas de universidades públicas ofrecen educación de calidad sin costo. Incluyen desde educación básica hasta cursos de posgrado, con certificación oficial.',
                'Considera la educación técnica del SENA. El SENA ofrece programas técnicos de 1-2 años en áreas de alta demanda laboral como tecnología, salud, agroindustria, y servicios. Los programas incluyen práctica laboral, certificación internacional, y alta probabilidad de empleo inmediato.'
            ],
            'Conflictos familiares o comunitarios': [
                'Acude a mediación familiar en la Comisaría de Familia. La mediación familiar es un proceso gratuito y confidencial donde un profesional neutral ayuda a resolver conflictos sin necesidad de procesos judiciales. Es especialmente efectiva para problemas de custodia, pensiones alimentarias, y violencia intrafamiliar.',
                'Participa en talleres de resolución de conflictos. Estos talleres enseñan técnicas de comunicación asertiva, negociación, y manejo de emociones. Son especialmente útiles para resolver conflictos vecinales, laborales, y familiares. Incluyen ejercicios prácticos y seguimiento personalizado.',
                'Busca apoyo psicológico familiar. Los centros de salud mental ofrecen terapia familiar gratuita que ayuda a identificar patrones de conflicto, mejorar la comunicación, y fortalecer los vínculos familiares. También incluyen grupos de apoyo para familias en crisis.',
                'Únete a grupos de apoyo comunitario. Los grupos de apoyo ofrecen un espacio seguro para compartir experiencias, recibir orientación de pares, y desarrollar estrategias colectivas para resolver problemas comunitarios. También facilitan el acceso a recursos y servicios especializados.'
            ],
            'Pocas oportunidades para jóvenes y mujeres': [
                'Participa en programas de liderazgo juvenil. Los programas de liderazgo juvenil desarrollan habilidades de comunicación, trabajo en equipo, y gestión de proyectos. Incluyen mentorías con líderes comunitarios, oportunidades de representación política, y acceso a redes de contactos profesionales.',
                'Inscríbete en cursos de emprendimiento femenino. Los cursos de emprendimiento femenino ofrecen capacitación en plan de negocios, marketing, finanzas, y tecnología. Incluyen mentorías con empresarias exitosas, acceso a capital semilla, y participación en ferias de emprendimiento exclusivas para mujeres.',
                'Únete a redes de mujeres emprendedoras. Las redes de mujeres emprendedoras ofrecen apoyo mutuo, intercambio de experiencias, acceso a oportunidades de negocio, y mentorías entre pares. También facilitan el acceso a créditos especiales, ferias comerciales, y programas de internacionalización.',
                'Busca mentorías profesionales. Las mentorías profesionales conectan a jóvenes y mujeres con profesionales experimentados que ofrecen orientación en desarrollo de carrera, habilidades técnicas, y networking. Incluyen acompañamiento personalizado, acceso a oportunidades laborales, y desarrollo de competencias específicas.'
            ]
        };
        
        return problemRecommendations[problem] || [];
    }

    // Recomendaciones económicas
    getEconomicRecommendations(economicImpact) {
        if (economicImpact.includes('crítica')) {
            return [
                'Solicita ayuda económica de emergencia en tu alcaldía',
                'Inscríbete en programas de transferencias monetarias condicionadas',
                'Busca apoyo alimentario en bancos de alimentos',
                'Acude a la Defensoría del Pueblo para orientación legal'
            ];
        } else if (economicImpact.includes('inestabilidad')) {
            return [
                'Diversifica tus fuentes de ingreso con trabajos adicionales',
                'Aprende habilidades digitales para trabajos remotos',
                'Considera la economía colaborativa (delivery, transporte)',
                'Busca microcréditos para pequeños negocios'
            ];
        } else {
            return [
                'Mantén un fondo de emergencia equivalente a 3 meses de gastos',
                'Diversifica tus inversiones y fuentes de ingreso',
                'Participa en programas de educación financiera'
            ];
        }
    }

    // Recomendaciones sociales
    getSocialRecommendations(socialImpact) {
        if (socialImpact.includes('disposición')) {
            return [
                'Únete a organizaciones comunitarias de tu barrio',
                'Participa en actividades culturales y deportivas locales',
                'Ofrece tu tiempo como voluntario en causas sociales',
                'Organiza eventos comunitarios para fortalecer vínculos'
            ];
        } else if (socialImpact.includes('resistencia')) {
            return [
                'Comienza con actividades sociales de bajo compromiso',
                'Participa en grupos de interés común (hobbies, deportes)',
                'Busca apoyo psicológico para superar barreras sociales',
                'Únete a grupos de apoyo mutuo'
            ];
        } else {
            return [
                'Mantén contacto regular con familiares y amigos',
                'Participa en actividades sociales de tu comunidad',
                'Ofrece ayuda a vecinos y conocidos'
            ];
        }
    }

    // Recomendaciones de salud
    getHealthRecommendations(healthImpact) {
        if (healthImpact.includes('crítica') || healthImpact.includes('deficiente')) {
            return [
                'Acude inmediatamente a centros de salud de urgencias',
                'Solicita citas médicas prioritarias en tu EPS',
                'Participa en brigadas de salud comunitaria',
                'Busca apoyo en organizaciones de salud mental'
            ];
        } else if (healthImpact.includes('condición especial')) {
            return [
                'Inscríbete en programas de atención diferencial',
                'Busca redes de apoyo para personas con condiciones similares',
                'Solicita ayudas técnicas y medicamentos subsidiados',
                'Participa en grupos de apoyo familiar'
            ];
        } else {
            return [
                'Mantén controles médicos regulares',
                'Participa en programas de prevención en salud',
                'Practica hábitos de vida saludable'
            ];
        }
    }

    // Recomendaciones educativas
    getEducationalRecommendations(educationalImpact) {
        if (educationalImpact.includes('bajo nivel')) {
            return [
                'Inscríbete en programas de alfabetización para adultos',
                'Busca clases de refuerzo en matemáticas y lenguaje',
                'Participa en programas de educación virtual gratuita',
                'Considera la educación técnica del SENA'
            ];
        } else if (educationalImpact.includes('interés en capacitación')) {
            return [
                'Explora cursos técnicos del SENA en tu área de interés',
                'Busca becas para educación superior',
                'Participa en programas de formación para el trabajo',
                'Considera educación virtual y a distancia'
            ];
        } else {
            return [
                'Mantén actualización continua en tu área profesional',
                'Participa en cursos de desarrollo personal',
                'Busca oportunidades de educación continua'
            ];
        }
    }

    // Recomendaciones basadas en nivel de vulnerabilidad
    getLevelBasedRecommendations(vulnerabilityLevel) {
        const levelRecommendations = {
            'critica': [
                'Contacta inmediatamente servicios sociales de emergencia',
                'Solicita ayuda urgente en la alcaldía o gobernación',
                'Acude a la Defensoría del Pueblo para orientación legal',
                'Busca apoyo en organizaciones de ayuda humanitaria'
            ],
            'alta': [
                'Solicita cita prioritaria con trabajador social',
                'Inscríbete en programas de apoyo integral',
                'Busca acompañamiento psicosocial especializado',
                'Participa en programas de intervención temprana'
            ],
            'media': [
                'Acude a orientación en servicios sociales locales',
                'Participa en programas de desarrollo comunitario',
                'Busca apoyo en organizaciones no gubernamentales',
                'Mantén seguimiento regular con profesionales'
            ],
            'baja': [
                'Mantén las buenas prácticas actuales',
                'Participa en programas de prevención',
                'Ayuda a otros en tu comunidad',
                'Continúa con tu desarrollo personal'
            ]
        };
        
        return levelRecommendations[vulnerabilityLevel] || levelRecommendations['baja'];
    }

    // Respaldo: generar recomendaciones extensas directamente de las respuestas
    generateFallbackRecommendations() {
        const recs = [];

        // Situación laboral e ingresos (q4, q5)
        const q4 = this.answers?.q4;
        const q5 = this.answers?.q5;
        if (q4 === 'desempleado' || q5 === 'no') {
            recs.push(
                'Inscríbete en el Servicio Público de Empleo para acceder a ofertas laborales. Este servicio gratuito del gobierno conecta a las personas con empleadores y ofrece orientación laboral personalizada, incluyendo talleres de hoja de vida y preparación para entrevistas.',
                'Participa en programas de capacitación técnica del SENA. El SENA ofrece programas gratuitos con práctica laboral y certificación oficial que mejoran significativamente tus oportunidades de empleo.',
                'Solicita apoyo económico de emergencia y acceso a bancos de alimentos en tu alcaldía mientras estabilizas tu situación laboral.'
            );
        }

        // Problemáticas seleccionadas (q2)
        const problems = this.answers?.q2 || [];
        if (Array.isArray(problems)) {
            if (problems.includes('falta_empleo')) {
                recs.push('Explora oportunidades de emprendimiento con apoyo de Cámara de Comercio, incluyendo asesoría legal, contable y acceso a microcréditos.');
            }
            if (problems.includes('inseguridad')) {
                recs.push('Únete a redes vecinales de seguridad y participa en programas de convivencia ciudadana para fortalecer la prevención del delito.');
            }
            if (problems.includes('salud')) {
                recs.push('Afíliate o actualiza tu afiliación a una EPS y acude a centros de salud públicos para atención primaria y programas de prevención.');
            }
            if (problems.includes('educacion')) {
                recs.push('Inscríbete en programas de alfabetización o educación básica y busca becas en tu alcaldía o gobernación.');
            }
            if (problems.includes('ambientales')) {
                recs.push('Participa en comités ambientales locales y reporta afectaciones a la autoridad ambiental para activar rutas de intervención.');
            }
            if (problems.includes('conflictos')) {
                recs.push('Acude a mediación en la Comisaría de Familia y participa en talleres de resolución de conflictos para fortalecer habilidades de diálogo.');
            }
        }

        // Acceso a salud (q7) y condición especial (q6)
        const q7 = this.answers?.q7;
        const q6 = this.answers?.q6;
        if (q7 === 'deficiente' || q7 === 'inexistente') {
            recs.push('Participa en brigadas de salud comunitaria; muchos municipios realizan jornadas periódicas con atención médica y odontológica gratuita.');
        }
        if (q6 === 'si') {
            recs.push('Solicita atención diferencial para condiciones especiales, incluyendo ayudas técnicas, medicamentos subsidiados y acompañamiento psicosocial.');
        }

        // Participación social (q10)
        const q10 = this.answers?.q10;
        if (q10 === 'no') {
            recs.push('Comienza con actividades comunitarias de bajo compromiso (deporte, cultura o voluntariado) para ampliar tu red de apoyo y acceso a oportunidades.');
        }

        // Nivel educativo (q8)
        const q8 = this.answers?.q8;
        if (q8 === 'ninguno' || q8 === 'primaria') {
            recs.push('Accede a educación formal o flexible y considera formación técnica del SENA para mejorar tu empleabilidad en el corto plazo.');
        }

        // Asegurar un mínimo de recomendaciones extensas
        if (recs.length < 4) {
            recs.push(
                'Mantén un fondo de emergencia y realiza un plan de gastos básico; participa en talleres de educación financiera en tu comunidad.',
                'Construye y mantén redes de apoyo con familiares y vecinos; una red activa mejora el acceso a oportunidades y soporte emocional.'
            );
        }

        // Limitar y deduplicar
        return [...new Set(recs)].slice(0, 6);
    }

    // Generar diagnóstico básico cuando no hay datos completos
    generateBasicDiagnosis() {
        const totalScore = this.calculateBasicScore();
        console.log('Puntuación básica:', totalScore);
        
        let nivel = 'baja';
        let recomendaciones = ['Mantenimiento de programas preventivos'];
        
        if (totalScore >= 40) {
            nivel = 'critica';
            recomendaciones = ['Atención de emergencia', 'Intervención multisectorial'];
        } else if (totalScore >= 30) {
            nivel = 'alta';
            recomendaciones = ['Intervención integral urgente', 'Apoyo económico inmediato'];
        } else if (totalScore >= 20) {
            nivel = 'media';
            recomendaciones = ['Programas de apoyo focalizado', 'Intervención temprana'];
        }
        
        return {
            escenario: `Vulnerabilidad Social ${nivel}`,
            diagnostico: `Vulnerabilidad social ${nivel}`,
            descripcion: `Puntuación total: ${totalScore}. Vulnerabilidad social ${nivel}`,
            prioridad: nivel.toUpperCase(),
            recomendaciones: recomendaciones,
            seguimiento: nivel === 'critica' ? 'Semanal' : nivel === 'alta' ? 'Quincenal' : 'Mensual',
            puntuacion: totalScore
        };
    }

    // Calcular puntuación básica
    calculateBasicScore() {
        let score = 0;
        
        // Sistema de puntuación simple basado en respuestas
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
        
        return score;
    }

    // Obtener puntos básicos por respuesta
    getBasicPoints(question, answer) {
        // Sistema de puntuación simple
        const highRiskAnswers = ['desempleado', 'no', 'deficiente', 'inexistente', 'ninguno', 'primaria', 'mucho'];
        const mediumRiskAnswers = ['trabajador_independiente', 'parcialmente', 'regular', 'secundaria', 'poco'];
        
        if (highRiskAnswers.includes(answer)) return 5;
        if (mediumRiskAnswers.includes(answer)) return 3;
        return 1;
    }

    // Verificar si las respuestas coinciden con un escenario
    matchesScenario(scenario) {
        if (!scenario || !scenario.condiciones) return false;
        
        const conditions = scenario.condiciones;
        
        if (!conditions || typeof conditions !== 'object') return false;
        
        for (const [conditionKey, expectedValues] of Object.entries(conditions)) {
            const questionId = this.getQuestionIdByType(conditionKey);
            const answer = this.answers[questionId];
            
            if (!answer) return false;
            
            if (Array.isArray(expectedValues)) {
                if (Array.isArray(answer)) {
                    // Para checkboxes, verificar si alguna respuesta coincide
                    if (!expectedValues.some(val => answer.includes(val))) {
                        return false;
                    }
                } else {
                    // Para radio buttons, verificar si la respuesta está en los valores esperados
                    if (!expectedValues.includes(answer)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    // Generar diagnóstico por puntuación
    generateDiagnosisByScore(score) {
        const niveles = this.diagnosticoData.diagnostico_social.niveles_vulnerabilidad;
        
        let nivel = 'baja';
        if (score >= 46) nivel = 'critica';
        else if (score >= 31) nivel = 'alta';
        else if (score >= 16) nivel = 'media';
        
        const nivelData = niveles[nivel];
        
        return {
            escenario: `Vulnerabilidad Social ${nivelData.descripcion}`,
            diagnostico: nivelData.descripcion,
            descripcion: `Puntuación total: ${score}. ${nivelData.descripcion}`,
            prioridad: nivel.toUpperCase(),
            recomendaciones: nivelData.recomendaciones,
            seguimiento: nivel === 'critica' ? 'Semanal' : nivel === 'alta' ? 'Quincenal' : 'Mensual',
            puntuacion: score
        };
    }

    // Obtener recomendaciones usando el nuevo sistema
    getRecommendations() {
        const diagnosis = this.generateSpecificDiagnosis();
        return diagnosis ? diagnosis.recomendaciones : ["Consulta con un especialista"];
    }

    // Generar diagnóstico con IA usando OpenAI
    async generateAIDiagnosis() {
        try {
            const userName = localStorage.getItem('userName') || 'Usuario';
            
            // Preparar las respuestas para enviar a la IA
            const answersText = this.formatAnswersForAI();
            
            const prompt = `Eres un asistente especializado en diagnóstico social automatizado. Recibes respuestas de un formulario donde las personas contestan preguntas sobre su entorno familiar, económico, emocional y social.

Analiza las respuestas y genera un diagnóstico social claro y empático.

El diagnóstico debe identificar la problemática principal (por ejemplo: vulnerabilidad económica, violencia intrafamiliar, exclusión laboral, abandono escolar, etc.), y explicar brevemente las causas según las respuestas.

Si es posible, ofrece una breve recomendación general o mensaje de apoyo.

Muestra el resultado en formato texto, iniciando con un saludo personalizado:

'Querido/a ${userName}, según el análisis de tus respuestas, tu diagnóstico social es…'

Evita usar lenguaje técnico complejo. Sé empático, claro y profesional.

Respuestas del usuario:
${answersText}`;

            const API_KEY = 'TU_CLAVE_API_AQUI';
            
            console.log('Enviando petición a OpenAI...');
            console.log('API Key configurada:', API_KEY ? 'SÍ' : 'NO');
            console.log('Header Authorization:', `Bearer ${API_KEY}`);
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'Eres un especialista en diagnóstico social con experiencia en análisis de vulnerabilidades sociales.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            console.log('Respuesta recibida:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error de la API:', errorData);
                throw new Error(`Error en la API: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log('Datos de respuesta:', data);
            return data.choices[0].message.content;

        } catch (error) {
            console.error('Error generando diagnóstico con IA:', error);
            // Retornar diagnóstico de fallback si la API falla
            return this.generateFallbackDiagnosis();
        }
    }

    // Formatear respuestas para enviar a la IA
    formatAnswersForAI() {
        const questionMapping = {
            'q1': 'Tipo de comunidad',
            'q2': 'Problemáticas identificadas',
            'q3': 'Afectación personal',
            'q4': 'Situación laboral',
            'q5': 'Ingresos del hogar',
            'q6': 'Condición especial',
            'q7': 'Acceso a salud',
            'q8': 'Nivel educativo',
            'q9': 'Tipo de ayuda necesaria',
            'q10': 'Disposición a participar'
        };

        let formattedAnswers = '';
        
        Object.keys(this.answers).forEach(question => {
            const answer = this.answers[question];
            const questionText = questionMapping[question] || question;
            
            if (Array.isArray(answer)) {
                formattedAnswers += `${questionText}: ${answer.join(', ')}\n`;
            } else {
                formattedAnswers += `${questionText}: ${answer}\n`;
            }
        });

        return formattedAnswers;
    }

    // Generar diagnóstico de fallback si la API falla
    generateFallbackDiagnosis() {
        const userName = localStorage.getItem('userName') || 'Usuario';
        
        if (!this.diagnosticoData) {
            return `Querido/a ${userName}, se ha completado tu diagnóstico social. Los resultados se están procesando...`;
        }
        
        // Calcular puntuación total
        const totalScore = this.calculateGeneralScore();
        const categoryScores = this.getCategoriesData();
        
        // Determinar nivel de vulnerabilidad
        const vulnerabilityLevel = this.getVulnerabilityLevel(totalScore);
        const specificDiagnosis = this.getSpecificDiagnosis();
        
        let diagnosisText = `Querido/a ${userName}, según el análisis de tus respuestas, `;
        
        // Diagnóstico específico si existe
        if (specificDiagnosis) {
            diagnosisText += specificDiagnosis.mensaje;
            return diagnosisText; // Retornar el mensaje específico completo
        } else {
            diagnosisText += `tu nivel de vulnerabilidad es ${vulnerabilityLevel.nombre.toLowerCase()}. `;
        }
        
        // Análisis por categorías
        let topCategories = [];
        if (categoryScores && typeof categoryScores === 'object') {
            topCategories = Object.entries(categoryScores)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3);
        }
        
        if (topCategories.length > 0) {
            diagnosisText += `Las áreas que requieren mayor atención son: `;
            topCategories.forEach(([category, score], index) => {
                const categoryInfo = this.diagnosticoData.categorias[category];
                if (categoryInfo && score > 0) {
                    diagnosisText += `${categoryInfo.nombre}${index < topCategories.length - 1 ? ', ' : '. '}`;
                }
            });
        }
        
        // Recomendaciones
        diagnosisText += `\n\nRecomendaciones específicas:\n`;
        if (specificDiagnosis && specificDiagnosis.recomendaciones) {
            specificDiagnosis.recomendaciones.forEach((rec, index) => {
                diagnosisText += `${index + 1}. ${rec}\n`;
            });
        } else {
            vulnerabilityLevel.recomendaciones.forEach((rec, index) => {
                diagnosisText += `${index + 1}. ${rec}\n`;
            });
        }
        
        // Mensaje de apoyo
        diagnosisText += `\n\nRecuerda que cada paso que tomes hacia la mejora de tu situación es valioso. Te recomendamos buscar apoyo en programas locales de desarrollo social.`;
        
        console.log('Diagnóstico generado:', diagnosisText);
        return diagnosisText;
    }

    // Generar análisis detallado de las respuestas
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

        console.log('Generando análisis detallado para respuestas:', this.answers);

        // Analizar problemáticas identificadas (q2)
        const problems = this.answers.q2;
        if (Array.isArray(problems) && problems.length > 0) {
            analysis.specificProblems = problems.map(problem => {
                const problemNames = {
                    'falta_empleo': 'Falta de empleo o ingresos estables',
                    'inseguridad': 'Inseguridad y violencia',
                    'salud': 'Deficiente acceso a salud',
                    'ambientales': 'Problemas ambientales',
                    'educacion': 'Bajo acceso a educación',
                    'conflictos': 'Conflictos familiares o comunitarios',
                    'oportunidades': 'Pocas oportunidades para jóvenes y mujeres'
                };
                return problemNames[problem] || problem.replace(/_/g, ' ');
            });
            console.log('Problemáticas identificadas:', analysis.specificProblems);
        }

        // Determinar problema principal basado en las respuestas específicas
        if (problems && problems.includes('falta_empleo')) {
            analysis.primaryIssue = 'vulnerabilidad económica severa';
        } else if (problems && problems.includes('inseguridad')) {
            analysis.primaryIssue = 'vulnerabilidad por inseguridad';
        } else if (problems && problems.includes('salud')) {
            analysis.primaryIssue = 'vulnerabilidad en salud';
        } else if (problems && problems.includes('educacion')) {
            analysis.primaryIssue = 'vulnerabilidad educativa';
        } else if (problems && problems.includes('ambientales')) {
            analysis.primaryIssue = 'vulnerabilidad ambiental';
        } else if (problems && problems.includes('conflictos')) {
            analysis.primaryIssue = 'vulnerabilidad social por conflictos';
        } else if (problems && problems.includes('oportunidades')) {
            analysis.primaryIssue = 'vulnerabilidad por falta de oportunidades';
        } else {
            analysis.primaryIssue = 'vulnerabilidad social múltiple';
        }

        // Análisis económico
        const laborSituation = this.answers.q4;
        const incomeSituation = this.answers.q5;
        
        if (laborSituation === 'desempleado' && incomeSituation === 'no') {
            analysis.economicImpact = 'se presenta una situación económica crítica con desempleo y ingresos insuficientes para cubrir necesidades básicas';
            analysis.specificRecommendations.push('Buscar programas de empleo y apoyo económico inmediato');
        } else if (laborSituation === 'trabajador_independiente' && incomeSituation === 'parcialmente') {
            analysis.economicImpact = 'existe inestabilidad económica con ingresos parciales que requieren fortalecimiento';
            analysis.specificRecommendations.push('Explorar opciones de capacitación y formalización laboral');
        } else if (incomeSituation === 'no') {
            analysis.economicImpact = 'los ingresos no cubren las necesidades básicas, requiriendo apoyo económico';
            analysis.specificRecommendations.push('Acceder a programas de apoyo económico y alimentario');
        }

        // Análisis social
        const communityType = this.answers.q1;
        const participation = this.answers.q10;
        
        if (communityType === 'rural' && participation === 'si') {
            analysis.socialImpact = 'existe disposición para participar en procesos comunitarios, lo cual es una fortaleza para el desarrollo social';
            analysis.specificRecommendations.push('Participar activamente en programas comunitarios de desarrollo');
        } else if (participation === 'no') {
            analysis.socialImpact = 'se identifica resistencia a la participación social, lo cual puede limitar el acceso a oportunidades';
            analysis.specificRecommendations.push('Considerar participar en actividades comunitarias para acceder a más oportunidades');
        }

        // Análisis educativo
        const educationLevel = this.answers.q8;
        const helpNeeded = this.answers.q9;
        
        if (educationLevel === 'ninguno' || educationLevel === 'primaria') {
            analysis.educationalImpact = 'se identifica un bajo nivel educativo que puede limitar las oportunidades laborales';
            analysis.specificRecommendations.push('Acceder a programas de alfabetización y educación básica');
        } else if (educationLevel === 'secundaria' && helpNeeded === 'capacitacion') {
            analysis.educationalImpact = 'existe interés en capacitación, lo cual es positivo para el desarrollo personal';
            analysis.specificRecommendations.push('Buscar programas de capacitación técnica y profesional');
        }

        // Análisis de salud
        const healthAccess = this.answers.q7;
        const specialCondition = this.answers.q6;
        
        if (healthAccess === 'deficiente' || healthAccess === 'inexistente') {
            analysis.healthImpact = 'se presenta un acceso deficiente a servicios de salud, lo cual es una vulnerabilidad crítica';
            analysis.specificRecommendations.push('Buscar atención en centros de salud públicos y programas de salud comunitaria');
        }
        
        if (specialCondition === 'si') {
            analysis.healthImpact += ' Además, se identifica una condición especial en el hogar que requiere atención específica';
            analysis.specificRecommendations.push('Acceder a programas especializados para personas con condiciones especiales');
        }

        // Análisis de afectación personal
        const personalAffection = this.answers.q3;
        if (personalAffection === 'mucho') {
            analysis.specificRecommendations.push('Buscar apoyo psicológico y emocional para manejar el impacto personal de las problemáticas');
        }

        return analysis;
    }
    
    // Obtener nivel de vulnerabilidad basado en puntuación
    getVulnerabilityLevel(totalScore) {
        if (!this.diagnosticoData || !this.diagnosticoData.niveles_vulnerabilidad) {
            console.log('No hay datos de niveles de vulnerabilidad, usando niveles por defecto');
            return this.getDefaultVulnerabilityLevel(totalScore);
        }
        
        const levels = this.diagnosticoData.niveles_vulnerabilidad;
        
        if (!levels || typeof levels !== 'object') {
            console.log('Los niveles de vulnerabilidad no son válidos, usando niveles por defecto');
            return this.getDefaultVulnerabilityLevel(totalScore);
        }
        
        for (const [key, level] of Object.entries(levels)) {
            if (level && level.puntos_min !== undefined && level.puntos_max !== undefined) {
                if (totalScore >= level.puntos_min && totalScore <= level.puntos_max) {
                    return level;
                }
            }
        }
        
        // Fallback a nivel crítico si no se encuentra coincidencia
        return levels.critica || this.getDefaultVulnerabilityLevel(totalScore);
    }

    // Obtener nivel de vulnerabilidad por defecto
    getDefaultVulnerabilityLevel(totalScore) {
        const defaultLevels = {
            baja: { nombre: 'Vulnerabilidad Baja', descripcion: 'Tu situación presenta riesgos mínimos', recomendaciones: ['Mantén tu situación actual', 'Busca oportunidades de crecimiento'] },
            media: { nombre: 'Vulnerabilidad Media', descripcion: 'Presentas algunos riesgos que requieren atención', recomendaciones: ['Busca apoyo en programas sociales', 'Mejora tus habilidades'] },
            alta: { nombre: 'Vulnerabilidad Alta', descripcion: 'Tu situación requiere atención inmediata', recomendaciones: ['Busca ayuda profesional', 'Accede a programas de apoyo'] },
            critica: { nombre: 'Vulnerabilidad Crítica', descripcion: 'Tu situación requiere intervención urgente', recomendaciones: ['Busca ayuda inmediata', 'Contacta servicios sociales'] }
        };

        if (totalScore >= 21) return defaultLevels.critica;
        if (totalScore >= 13) return defaultLevels.alta;
        if (totalScore >= 6) return defaultLevels.media;
        return defaultLevels.baja;
    }
    
    // Obtener diagnóstico específico basado en condiciones
    getSpecificDiagnosis() {
        if (!this.diagnosticoData) return null;
        
        const specificDiagnoses = this.diagnosticoData.diagnosticos_especificos;
        
        for (const diagnosis of specificDiagnoses) {
            if (this.matchesDiagnosisConditions(diagnosis.condicion)) {
                return diagnosis;
            }
        }
        
        return null;
    }
    
    // Verificar si las respuestas coinciden con las condiciones de un diagnóstico
    matchesDiagnosisConditions(condition) {
        // Verificar comunidad
        if (condition.comunidad) {
            const userCommunity = this.answers.q1;
            if (userCommunity !== condition.comunidad) {
                return false;
            }
        }
        
        // Verificar problemas
        if (condition.problemas) {
            const userProblems = this.answers.q2 || [];
            const hasMatchingProblems = condition.problemas.some(problem => 
                userProblems.includes(problem)
            );
            if (!hasMatchingProblems) {
                return false;
            }
        }
        
        // Verificar situación laboral
        if (condition.laboral) {
            const userLabor = this.answers.q4;
            if (userLabor !== condition.laboral) {
                return false;
            }
        }
        
        // Verificar impacto personal
        if (condition.impacto) {
            const userImpact = this.answers.q3;
            if (userImpact !== condition.impacto) {
                return false;
            }
        }
        
        // Verificar servicios de salud
        if (condition.servicios_salud) {
            const userHealth = this.answers.q7;
            if (userHealth !== condition.servicios_salud) {
                return false;
            }
        }
        
        // Verificar nivel educativo
        if (condition.educacion) {
            const userEducation = this.answers.q8;
            if (userEducation !== condition.educacion) {
                return false;
            }
        }
        
        // Verificar condición especial en el hogar
        if (condition.condicion_hogar) {
            const userCondition = this.answers.q6;
            if (userCondition !== condition.condicion_hogar) {
                return false;
            }
        }
        
        return true;
    }

    // Calcular categorías basadas en las respuestas reales usando el JSON
    calculateCategoriesFromAnswers() {
        console.log('🔍 Calculando categorías desde respuestas:', this.answers);
        
        const categories = {
            'Económica': 0,
            'Social': 0,
            'Salud': 0,
            'Educativa': 0,
            'Ambiental': 0
        };

        // Usar los datos del JSON para calcular categorías
        if (this.diagnosticoData && this.diagnosticoData.preguntas) {
            for (let i = 1; i <= this.totalQuestions; i++) {
                const questionId = `q${i}`;
                const answer = this.answers[questionId];
                const question = this.diagnosticoData.preguntas.find(q => q.id === questionId);
                
                if (question && answer) {
                    console.log(`Procesando categorías para ${questionId}:`, answer);
                    
                    if (question.tipo === 'checkbox' && Array.isArray(answer)) {
                        // Para checkboxes, sumar puntos de todas las opciones seleccionadas
                        answer.forEach(val => {
                            const option = question.opciones.find(opt => opt.valor === val);
                            if (option && option.categoria) {
                                const categoryName = this.getCategoryDisplayName(option.categoria);
                                if (categories.hasOwnProperty(categoryName)) {
                                    categories[categoryName] += option.puntos;
                                    console.log(`  - ${val} (${option.categoria}): +${option.puntos} puntos`);
                                }
                            }
                        });
                    } else if (question.tipo === 'radio') {
                        // Para radio buttons, obtener puntos de la opción seleccionada
                        const option = question.opciones.find(opt => opt.valor === answer);
                        if (option && option.categoria) {
                            const categoryName = this.getCategoryDisplayName(option.categoria);
                            if (categories.hasOwnProperty(categoryName)) {
                                categories[categoryName] += option.puntos;
                                console.log(`  - ${answer} (${option.categoria}): +${option.puntos} puntos`);
                            }
                        }
                    }
                }
            }
        } else {
            console.log('No hay datos de diagnóstico, usando cálculo básico de categorías');
            // Fallback al cálculo básico si no hay datos del JSON
            return this.calculateBasicCategories();
        }

        // Limitar puntuaciones a máximo 25
        Object.keys(categories).forEach(key => {
            categories[key] = Math.min(categories[key], 25);
        });

        console.log('✅ Categorías calculadas:', categories);
        return categories;
    }

    // Obtener nombre de categoría para mostrar
    getCategoryDisplayName(categoryKey) {
        const categoryMap = {
            'economica': 'Económica',
            'social': 'Social',
            'salud': 'Salud',
            'educativa': 'Educativa',
            'ambiental': 'Ambiental'
        };
        return categoryMap[categoryKey] || categoryKey;
    }

    // Cálculo básico de categorías como fallback
    calculateBasicCategories() {
        const categories = {
            'Económica': 0,
            'Social': 0,
            'Salud': 0,
            'Educativa': 0,
            'Ambiental': 0
        };

        // Cálculo básico basado en respuestas específicas
        Object.keys(this.answers).forEach(question => {
            const answer = this.answers[question];
            
            if (Array.isArray(answer)) {
                // Para checkboxes, sumar puntos básicos
                answer.forEach(val => {
                    if (val.includes('empleo') || val.includes('economico')) {
                        categories['Económica'] += 2;
                    } else if (val.includes('social') || val.includes('conflictos')) {
                        categories['Social'] += 2;
                    } else if (val.includes('salud')) {
                        categories['Salud'] += 2;
                    } else if (val.includes('educacion')) {
                        categories['Educativa'] += 2;
                    } else if (val.includes('ambiental')) {
                        categories['Ambiental'] += 2;
                    }
                });
            } else {
                // Para radio buttons, asignar puntos básicos
                if (question === 'q4' && answer === 'desempleado') {
                    categories['Económica'] += 3;
                } else if (question === 'q5' && answer === 'no') {
                    categories['Económica'] += 2;
                } else if (question === 'q7' && (answer === 'deficiente' || answer === 'inexistente')) {
                    categories['Salud'] += 3;
                } else if (question === 'q8' && (answer === 'ninguno' || answer === 'primaria')) {
                    categories['Educativa'] += 2;
                }
            }
        });

        return categories;
    }

    // Generar texto de diagnóstico específico
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
        
        // Complementar con categorías calculadas (asegura incluir top 1-2 áreas con mayor puntaje)
        try {
            const categories = this.calculateCategoriesFromAnswers();
            const mappedNames = { economica: 'económica', salud: 'salud', educativa: 'educativa', social: 'social', ambiental: 'ambiental' };
            const sorted = Object.entries(categories || {})
                .sort((a, b) => (b[1] || 0) - (a[1] || 0))
                .slice(0, 2);
            sorted.forEach(([key, val]) => {
                const pretty = mappedNames[key];
                if (val > 0 && pretty && !vulnerabilityAreas.includes(pretty)) {
                    vulnerabilityAreas.push(pretty);
                    hasSpecificIssues = true;
                }
            });
        } catch (_) {}

        // Impacto personal y recomendaciones específicas
        if (impact === 'mucho') {
            diagnosis += `Estas vulnerabilidades te afectan significativamente en tu vida diaria. `;
        } else if (impact === 'poco') {
            diagnosis += `Estas vulnerabilidades te afectan moderadamente. `;
        }
        
        // Recomendaciones específicas basadas en vulnerabilidades
        if (vulnerabilityAreas.length > 0) {
            const areas = [...vulnerabilityAreas];
            let areasText = '';
            if (areas.length === 1) {
                areasText = areas[0];
            } else if (areas.length === 2) {
                areasText = `${areas[0]} y ${areas[1]}`;
            } else {
                areasText = `${areas.slice(0, -1).join(', ')} y ${areas[areas.length - 1]}`;
            }
            diagnosis += `Se recomienda atención prioritaria en las áreas de: ${areasText}. `;
        }
        
        if (!hasSpecificIssues) {
            diagnosis += `Tu situación social presenta características estables con oportunidades de mejora. `;
        }
        
        diagnosis += `El análisis muestra que requieres apoyo específico en las áreas identificadas.`;
        
        return diagnosis;
    }
}

// Exportar para uso global
window.DiagnosticForm = DiagnosticForm;
