// ===========================================
// SISTEMA DE PAGO PARA DESCARGA DE PDF
// ===========================================

class PaymentSystem {
    constructor() {
        this.paymentModal = null;
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.paymentModal = document.getElementById('paymentModal');
        this.bindEvents();
    }

    bindEvents() {
        // Cambiar método de pago
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.togglePaymentDetails(e.target.value);
            });
        });

        // Formatear número de tarjeta
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                this.formatCardNumber(e.target);
            });
        }

        // Formatear fecha de vencimiento
        const cardExpiryInput = document.getElementById('cardExpiry');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                this.formatCardExpiry(e.target);
            });
        }

        // Validar CVV
        const cardCVVInput = document.getElementById('cardCVV');
        if (cardCVVInput) {
            cardCVVInput.addEventListener('input', (e) => {
                this.validateCVV(e.target);
            });
        }

        // Cerrar modal al hacer clic fuera
        if (this.paymentModal) {
            this.paymentModal.addEventListener('click', (e) => {
                if (e.target === this.paymentModal) {
                    this.closeModal();
                }
            });
        }
    }

    // Mostrar modal de pago
    showModal() {
        if (this.paymentModal) {
            this.paymentModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Resetear formulario
            this.resetForm();
            
            // Enfocar primer campo
            setTimeout(() => {
                const firstInput = this.paymentModal.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    // Cerrar modal
    closeModal() {
        if (this.paymentModal) {
            this.paymentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.resetForm();
        }
    }

    // Alternar detalles de pago según método seleccionado
    togglePaymentDetails(method) {
        const cardDetails = document.getElementById('cardDetails');
        const mobileDetails = document.getElementById('mobileDetails');

        if (method === 'card') {
            cardDetails.style.display = 'block';
            mobileDetails.style.display = 'none';
        } else {
            cardDetails.style.display = 'none';
            mobileDetails.style.display = 'block';
        }
    }

    // Formatear número de tarjeta
    formatCardNumber(input) {
        let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        
        if (formattedValue.length > 19) {
            formattedValue = formattedValue.substring(0, 19);
        }
        
        input.value = formattedValue;
    }

    // Formatear fecha de vencimiento
    formatCardExpiry(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        input.value = value;
    }

    // Validar CVV
    validateCVV(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 3) {
            value = value.substring(0, 3);
        }
        input.value = value;
    }

    // Resetear formulario
    resetForm() {
        const form = this.paymentModal.querySelector('form') || this.paymentModal;
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });

        // Resetear método de pago a tarjeta
        const cardRadio = document.querySelector('input[name="paymentMethod"][value="card"]');
        if (cardRadio) {
            cardRadio.checked = true;
            this.togglePaymentDetails('card');
        }

        // Resetear botón de pago
        const payButton = document.querySelector('.btn-pay');
        if (payButton) {
            payButton.disabled = false;
            payButton.classList.remove('loading');
        }
    }

    // Procesar pago
    async processPayment() {
        if (this.isProcessing) return;

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        
        if (!paymentMethod) {
            this.showError('Por favor selecciona un método de pago');
            return;
        }

        // Validar datos según método de pago
        if (paymentMethod === 'card') {
            if (!this.validateCardPayment()) return;
        } else {
            if (!this.validateMobilePayment()) return;
        }

        this.isProcessing = true;
        this.showLoading(true);

        try {
            // Simular procesamiento de pago
            await this.simulatePayment(paymentMethod);
            
            // Si el pago es exitoso, guardar en perfil y generar PDF
            this.saveToProfile();
            await this.generateAndDownloadPDF();
            
            this.showSuccess();
            this.closeModal();
            
        } catch (error) {
            console.error('Error procesando pago:', error);
            this.showError('Error procesando el pago. Por favor intenta de nuevo.');
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
        }
    }

    // Validar pago con tarjeta
    validateCardPayment() {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCVV = document.getElementById('cardCVV').value;
        const cardName = document.getElementById('cardName').value;

        if (!cardNumber || cardNumber.length < 16) {
            this.showFieldError('cardNumber', 'Número de tarjeta inválido');
            return false;
        }

        if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            this.showFieldError('cardExpiry', 'Fecha de vencimiento inválida');
            return false;
        }

        if (!cardCVV || cardCVV.length < 3) {
            this.showFieldError('cardCVV', 'CVV inválido');
            return false;
        }

        if (!cardName.trim()) {
            this.showFieldError('cardName', 'Nombre del titular requerido');
            return false;
        }

        return true;
    }

    // Validar pago móvil
    validateMobilePayment() {
        const mobileNumber = document.getElementById('mobileNumber').value.replace(/\D/g, '');
        const mobileConfirm = document.getElementById('mobileConfirm').value.replace(/\D/g, '');

        if (!mobileNumber || mobileNumber.length < 10) {
            this.showFieldError('mobileNumber', 'Número de celular inválido');
            return false;
        }

        if (mobileNumber !== mobileConfirm) {
            this.showFieldError('mobileConfirm', 'Los números no coinciden');
            return false;
        }

        return true;
    }

    // Mostrar error en campo específico
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
            field.style.borderColor = '#dc2626';
        }
        this.showError(message);
    }

    // Mostrar error general
    showError(message) {
        // Crear o actualizar mensaje de error
        let errorDiv = document.querySelector('.payment-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'payment-error';
            errorDiv.style.cssText = `
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 12px 16px;
                border-radius: 8px;
                margin: 15px 0;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            const paymentForm = document.querySelector('.payment-form');
            if (paymentForm) {
                paymentForm.insertBefore(errorDiv, paymentForm.firstChild);
            }
        }
        
        errorDiv.innerHTML = `❌ ${message}`;
        errorDiv.style.display = 'block';

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }

    // Mostrar estado de carga
    showLoading(show) {
        const payButton = document.querySelector('.btn-pay');
        if (payButton) {
            if (show) {
                payButton.disabled = true;
                payButton.classList.add('loading');
            } else {
                payButton.disabled = false;
                payButton.classList.remove('loading');
            }
        }
    }

    // Simular procesamiento de pago
    async simulatePayment(method) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular éxito del pago (90% de éxito)
                if (Math.random() > 0.1) {
                    console.log(`Pago procesado exitosamente con ${method}`);
                    resolve();
                } else {
                    reject(new Error('Pago rechazado'));
                }
            }, 2000);
        });
    }

    // Generar y descargar PDF
    async generateAndDownloadPDF() {
        try {
            // Obtener datos del diagnóstico
            const results = JSON.parse(localStorage.getItem('diagnosticResults') || '{}');
            
            // Crear contenido del PDF
            const pdfContent = this.createPDFContent(results);
            
            // Generar PDF usando jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar fuente y tamaño
            doc.setFont('helvetica');
            
            // Título principal
            doc.setFontSize(20);
            doc.setTextColor(59, 130, 246);
            doc.text('DIAGNÓSTICO SOCIAL PERSONALIZADO', 20, 30);
            
            // Línea separadora
            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(0.5);
            doc.line(20, 35, 190, 35);
            
            // Información del usuario
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 20, 50);
            doc.text(`Usuario: ${results.userName || 'Usuario'}`, 20, 60);
            
            // Puntuación general
            doc.setFontSize(16);
            doc.setTextColor(59, 130, 246);
            doc.text('PUNTUACIÓN GENERAL', 20, 80);
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`Puntuación: ${results.generalScore || 'N/A'}`, 20, 95);
            
            // Diagnóstico específico
            if (results.diagnosis) {
                doc.setFontSize(16);
                doc.setTextColor(59, 130, 246);
                doc.text('DIAGNÓSTICO ESPECÍFICO', 20, 115);
                
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                const diagnosisText = results.diagnosis.escenario || results.diagnosis.diagnostico || 'Diagnóstico no disponible';
                doc.text(diagnosisText, 20, 130);
                
                if (results.diagnosis.descripcion) {
                    const splitDesc = doc.splitTextToSize(results.diagnosis.descripcion, 170);
                    doc.text(splitDesc, 20, 145);
                }
            }
            
            // Análisis por categorías
            if (results.categories) {
                doc.setFontSize(16);
                doc.setTextColor(59, 130, 246);
                doc.text('ANÁLISIS POR CATEGORÍAS', 20, 175);
                
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                let yPos = 190;
                Object.entries(results.categories).forEach(([category, score]) => {
                    doc.text(`${category}: ${score}%`, 20, yPos);
                    yPos += 10;
                });
            }
            
            // Recomendaciones
            if (results.recommendations && results.recommendations.length > 0) {
                doc.setFontSize(16);
                doc.setTextColor(59, 130, 246);
                doc.text('RECOMENDACIONES PERSONALIZADAS', 20, yPos + 20);
                
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                yPos += 35;
                
                results.recommendations.forEach((rec, index) => {
                    const recText = `${index + 1}. ${rec}`;
                    const splitRec = doc.splitTextToSize(recText, 170);
                    doc.text(splitRec, 20, yPos);
                    yPos += splitRec.length * 5 + 5;
                });
            }
            
            // Pie de página
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text('Generado por Sistema de Diagnóstico Social', 20, doc.internal.pageSize.height - 20);
            doc.text(`Fecha de generación: ${new Date().toLocaleString('es-CO')}`, 20, doc.internal.pageSize.height - 10);
            
            // Descargar PDF
            const fileName = `diagnostico-social-${Date.now()}.pdf`;
            doc.save(fileName);
            
            // Registrar descarga exitosa
            this.recordSuccessfulDownload();
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            throw new Error('Error generando el PDF');
        }
    }

    // Crear contenido del PDF
    createPDFContent(results) {
        return {
            title: 'Diagnóstico Social Personalizado',
            date: new Date().toLocaleDateString('es-CO'),
            user: results.userName || 'Usuario',
            score: results.generalScore || 'N/A',
            diagnosis: results.diagnosis || {},
            categories: results.categories || {},
            recommendations: results.recommendations || []
        };
    }

    // Guardar en perfil del usuario
    saveToProfile() {
        try {
            // Obtener resultados del diagnóstico
            const results = JSON.parse(localStorage.getItem('diagnosticResults') || '{}');
            
            // Crear objeto para guardar en historial
            const profileData = {
                date: new Date().toISOString(),
                generalScore: results.generalScore || document.getElementById('generalScore')?.textContent || 'N/A',
                categories: results.categories || {},
                recommendations: results.recommendations || [],
                diagnosis: results.diagnosis || {},
                aiDiagnosis: results.aiDiagnosis || null,
                answers: results.answers || null,
                userName: results.userName || localStorage.getItem('userName') || 'Usuario'
            };

            // Guardar en historial del perfil
            let history = JSON.parse(localStorage.getItem('diagnosticHistory') || '[]');
            history.push(profileData);
            localStorage.setItem('diagnosticHistory', JSON.stringify(history));
            
            console.log('✅ Diagnóstico guardado en perfil del usuario');
            
        } catch (error) {
            console.error('Error guardando en perfil:', error);
        }
    }

    // Registrar descarga exitosa
    recordSuccessfulDownload() {
        try {
            // Guardar en historial de descargas
            let downloads = JSON.parse(localStorage.getItem('pdfDownloads') || '[]');
            downloads.push({
                date: new Date().toISOString(),
                fileName: `diagnostico-social-${Date.now()}.pdf`,
                amount: 5000
            });
            localStorage.setItem('pdfDownloads', JSON.stringify(downloads));
            
            // Actualizar estadísticas de ingresos
            let revenue = JSON.parse(localStorage.getItem('systemRevenue') || '{"total": 0, "downloads": 0}');
            revenue.total += 5000;
            revenue.downloads += 1;
            localStorage.setItem('systemRevenue', JSON.stringify(revenue));
            
            console.log('Descarga registrada exitosamente');
        } catch (error) {
            console.error('Error registrando descarga:', error);
        }
    }

    // Mostrar mensaje de éxito
    showSuccess() {
        // Crear mensaje de éxito
        const successDiv = document.createElement('div');
        successDiv.className = 'payment-success';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        
        successDiv.innerHTML = `
            <div style="font-size: 1.5rem;">✅</div>
            <div>
                <div>¡Pago exitoso!</div>
                <div style="font-size: 0.9rem; font-weight: 400; margin-top: 4px;">Diagnóstico guardado en tu perfil y PDF descargándose...</div>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remover después de 4 segundos
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 4000);
    }
}

// Funciones globales para el HTML
function showPaymentModal() {
    if (window.paymentSystem) {
        window.paymentSystem.showModal();
    }
}

function closePaymentModal() {
    if (window.paymentSystem) {
        window.paymentSystem.closeModal();
    }
}

function processPayment() {
    if (window.paymentSystem) {
        window.paymentSystem.processPayment();
    }
}

// Inicializar sistema de pago cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.paymentSystem = new PaymentSystem();
});

// Exportar para uso global
window.PaymentSystem = PaymentSystem;
window.showPaymentModal = showPaymentModal;
window.closePaymentModal = closePaymentModal;
window.processPayment = processPayment;

