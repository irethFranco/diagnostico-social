// ===========================================
// SISTEMA DE GEOREFERENCIACIÓN Y MUNICIPIOS
// ===========================================

class LocationSystem {
    constructor() {
        this.userLocation = null;
        this.municipalityData = null;
        this.detectedMunicipality = null;
        this.init();
    }

    async init() {
        await this.loadMunicipalityData();
        this.bindEvents();
    }

    // Cargar datos de municipios
    async loadMunicipalityData() {
        try {
            const response = await fetch('JS/municipality-data.json');
            if (response.ok) {
                this.municipalityData = await response.json();
                console.log('Datos de municipios cargados:', this.municipalityData);
            } else {
                throw new Error('Error cargando datos de municipios');
            }
        } catch (error) {
            console.error('Error cargando datos de municipios:', error);
            // Datos de fallback
            this.municipalityData = {
                municipios: {},
                zonas_rurales: {}
            };
        }
    }

    // Bindear eventos
    bindEvents() {
        // Auto-detectar ubicación cuando se carga la página
        document.addEventListener('DOMContentLoaded', () => {
            // Esperar un poco para que la página se cargue completamente
            setTimeout(() => {
                this.detectUserLocation();
            }, 1000);
        });
    }

    // Detectar ubicación del usuario
    async detectUserLocation() {
        console.log('Iniciando detección de ubicación...');
        
        if (!navigator.geolocation) {
            console.log('Geolocalización no soportada');
            this.showLocationFallback();
            return;
        }

        // Mostrar mensaje de detección
        this.showDetectionMessage();

        // Timeout de seguridad más corto - 5 segundos
        const timeoutId = setTimeout(() => {
            console.log('Timeout de detección de ubicación - mostrando fallback');
            this.showLocationFallback();
        }, 5000);

        try {
            console.log('Solicitando ubicación...');
            const position = await this.getCurrentPosition();
            
            // Limpiar timeout si se obtuvo la ubicación
            clearTimeout(timeoutId);
            console.log('Ubicación obtenida:', position.coords);
            
            this.userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            console.log('Ubicación detectada:', this.userLocation);
            
            // Determinar municipio basado en coordenadas
            this.detectedMunicipality = this.determineMunicipality(this.userLocation);
            
            // Mostrar información de ubicación
            this.displayLocationInfo();
            
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            // Limpiar timeout
            clearTimeout(timeoutId);
            // Mostrar fallback inmediatamente si hay error
            this.showLocationFallback();
        }
    }

    // Mostrar mensaje de detección
    showDetectionMessage() {
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;

        locationInfo.innerHTML = `
            <div style="text-align: center; color: #64748b; padding: 20px;">
                <div style="font-size: 2rem; margin-bottom: 10px;">🔄</div>
                <p>Detectando tu ubicación...</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Si no se detecta automáticamente, podrás seleccionar tu zona manualmente</p>
            </div>
        `;
    }

    // Obtener posición actual con promesa
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: false, // Cambiado a false para más compatibilidad
                    timeout: 5000, // Reducido a 5 segundos
                    maximumAge: 600000 // 10 minutos
                }
            );
        });
    }

    // Determinar municipio basado en coordenadas
    determineMunicipality(location) {
        const { latitude, longitude } = location;
        
        // Coordenadas aproximadas de principales ciudades
        const cityCoordinates = {
            'bogota': { lat: 4.6097, lng: -74.0817, radius: 0.5 },
            'medellin': { lat: 6.2442, lng: -75.5812, radius: 0.3 },
            'cali': { lat: 3.4516, lng: -76.5320, radius: 0.4 },
            'barranquilla': { lat: 10.9685, lng: -74.7813, radius: 0.3 },
            'cartagena': { lat: 10.3910, lng: -75.4794, radius: 0.4 }
        };

        for (const [city, coords] of Object.entries(cityCoordinates)) {
            const distance = this.calculateDistance(
                latitude, longitude,
                coords.lat, coords.lng
            );
            
            if (distance <= coords.radius) {
                return {
                    id: city,
                    name: this.municipalityData.municipios[city]?.nombre || city,
                    distance: distance,
                    coordinates: { lat: latitude, lng: longitude }
                };
            }
        }

        // Si no está en ninguna ciudad principal, determinar zona rural
        return this.determineRuralZone(latitude, longitude);
    }

    // Calcular distancia entre dos puntos
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Determinar zona rural
    determineRuralZone(latitude, longitude) {
        // Lógica simplificada para determinar zona rural
        if (latitude > 5 && latitude < 6 && longitude > -75 && longitude < -74) {
            return {
                id: 'cundinamarca_rural',
                name: 'Zona Rural Cundinamarca',
                type: 'rural',
                coordinates: { lat: latitude, lng: longitude }
            };
        } else if (latitude > 5.5 && latitude < 7 && longitude > -76 && longitude < -75) {
            return {
                id: 'antioquia_rural',
                name: 'Zona Rural Antioquia',
                type: 'rural',
                coordinates: { lat: latitude, lng: longitude }
            };
        } else if (latitude > 3 && latitude < 4 && longitude > -77 && longitude < -76) {
            return {
                id: 'valle_rural',
                name: 'Zona Rural Valle del Cauca',
                type: 'rural',
                coordinates: { lat: latitude, lng: longitude }
            };
        }

        return {
            id: 'unknown',
            name: 'Ubicación no identificada',
            type: 'unknown',
            coordinates: { lat: latitude, lng: longitude }
        };
    }

    // Mostrar información de ubicación
    displayLocationInfo() {
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;

        if (this.detectedMunicipality) {
            const municipalityData = this.getMunicipalityData(this.detectedMunicipality.id);
            
            locationInfo.innerHTML = `
                <div class="location-detected">
                    <div class="location-icon">📍</div>
                    <div class="location-details">
                        <h3>Ubicación Detectada</h3>
                        <p><strong>${this.detectedMunicipality.name}</strong></p>
                        <p>Población: ${municipalityData?.poblacion?.toLocaleString() || 'N/A'} habitantes</p>
                        <p>Departamento: ${municipalityData?.departamento || 'N/A'}</p>
                    </div>
                </div>
                <div class="location-actions">
                    <button class="btn-location" onclick="locationSystem.showMunicipalityModal()">
                        📊 Ver Información de Mi Zona
                    </button>
                </div>
            `;
        }
    }

    // Obtener datos del municipio
    getMunicipalityData(municipalityId) {
        if (!this.municipalityData) return null;
        
        if (this.municipalityData.municipios[municipalityId]) {
            return this.municipalityData.municipios[municipalityId];
        }
        
        // Buscar en zonas rurales
        for (const [zone, data] of Object.entries(this.municipalityData.zonas_rurales)) {
            if (municipalityId.includes(zone)) {
                return {
                    nombre: data.caracteristicas.nombre || `Zona Rural ${zone}`,
                    departamento: zone.replace('_', ' '),
                    poblacion: data.caracteristicas.poblacion_rural * 1000,
                    ...data.caracteristicas
                };
            }
        }
        
        return null;
    }

    // Mostrar fallback si no se puede detectar ubicación
    showLocationFallback() {
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;

        locationInfo.innerHTML = `
            <div class="location-fallback">
                <div class="location-icon">❓</div>
                <div class="location-details">
                    <h3>Ubicación No Detectada</h3>
                    <p>No pudimos detectar tu ubicación automáticamente</p>
                    <p style="font-size: 0.9rem; color: #64748b; margin-top: 10px;">
                        Esto puede deberse a permisos de ubicación o conexión. 
                        Puedes seleccionar tu zona manualmente.
                    </p>
                </div>
            </div>
            <div class="location-actions">
                <button class="btn-location" onclick="locationSystem.showLocationSelector()">
                    🗺️ Seleccionar Mi Zona
                </button>
                <button class="btn-location" onclick="locationSystem.detectUserLocation()" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    🔄 Intentar Nuevamente
                </button>
            </div>
        `;
    }

    // Mostrar selector de ubicación
    showLocationSelector() {
        const modal = document.createElement('div');
        modal.className = 'location-modal';
        modal.innerHTML = `
            <div class="location-modal-content">
                <div class="location-modal-header">
                    <h2>🗺️ Selecciona Tu Zona</h2>
                    <button class="close-modal" onclick="this.closest('.location-modal').remove()">&times;</button>
                </div>
                <div class="location-modal-body">
                    <h3>Ciudades Principales:</h3>
                    <div class="location-options">
                        <button class="location-option" onclick="locationSystem.selectMunicipality('bogota')">
                            🏙️ Bogotá D.C.
                        </button>
                        <button class="location-option" onclick="locationSystem.selectMunicipality('medellin')">
                            🏙️ Medellín
                        </button>
                        <button class="location-option" onclick="locationSystem.selectMunicipality('cali')">
                            🏙️ Cali
                        </button>
                        <button class="location-option" onclick="locationSystem.selectMunicipality('barranquilla')">
                            🏙️ Barranquilla
                        </button>
                        <button class="location-option" onclick="locationSystem.selectMunicipality('cartagena')">
                            🏙️ Cartagena
                        </button>
                    </div>
                    <h3>Zonas Rurales:</h3>
                    <div class="location-options">
                        <button class="location-option" onclick="locationSystem.selectMunicipality('cundinamarca_rural')">
                            🌾 Zona Rural Cundinamarca
                        </button>
                        <button class="location-option" onclick="locationSystem.selectMunicipality('antioquia_rural')">
                            🌾 Zona Rural Antioquia
                        </button>
                        <button class="location-option" onclick="locationSystem.selectMunicipality('valle_rural')">
                            🌾 Zona Rural Valle del Cauca
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Seleccionar municipio manualmente
    selectMunicipality(municipalityId) {
        this.detectedMunicipality = {
            id: municipalityId,
            name: this.getMunicipalityData(municipalityId)?.nombre || municipalityId,
            type: municipalityId.includes('rural') ? 'rural' : 'urban'
        };
        
        this.displayLocationInfo();
        
        // Cerrar modal
        const modal = document.querySelector('.location-modal');
        if (modal) modal.remove();
    }

    // Mostrar modal de información del municipio
    showMunicipalityModal() {
        if (!this.detectedMunicipality) {
            alert('No se ha detectado ubicación. Por favor selecciona tu zona primero.');
            return;
        }

        const municipalityData = this.getMunicipalityData(this.detectedMunicipality.id);
        if (!municipalityData) {
            alert('No hay información disponible para esta zona.');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'municipality-modal';
        modal.innerHTML = `
            <div class="municipality-modal-content">
                <div class="municipality-modal-header">
                    <h2>📊 Información de ${municipalityData.nombre}</h2>
                    <button class="close-modal" onclick="this.closest('.municipality-modal').remove()">&times;</button>
                </div>
                <div class="municipality-modal-body">
                    <div class="municipality-info">
                        <h3>🏛️ Información General</h3>
                        <p><strong>Población:</strong> ${municipalityData.poblacion?.toLocaleString() || 'N/A'} habitantes</p>
                        <p><strong>Departamento:</strong> ${municipalityData.departamento || 'N/A'}</p>
                        <p><strong>Área:</strong> ${municipalityData.area || 'N/A'} km²</p>
                        <p><strong>Clima:</strong> ${municipalityData.clima || 'N/A'}</p>
                    </div>
                    
                    <div class="municipality-economy">
                        <h3>💰 Economía</h3>
                        <p><strong>PIB per cápita:</strong> $${municipalityData.economia?.pib_per_capita?.toLocaleString() || 'N/A'} COP</p>
                        <p><strong>Desempleo:</strong> ${municipalityData.economia?.desempleo || 'N/A'}%</p>
                        <p><strong>Sectores principales:</strong> ${municipalityData.economia?.sectores_principales?.join(', ') || 'N/A'}</p>
                    </div>
                    
                    <div class="municipality-services">
                        <h3>🏥 Servicios Sociales</h3>
                        <p><strong>Hospitales:</strong> ${municipalityData.servicios_sociales?.salud?.hospitales || 'N/A'}</p>
                        <p><strong>Centros de salud:</strong> ${municipalityData.servicios_sociales?.salud?.centros_salud || 'N/A'}</p>
                        <p><strong>Cobertura de salud:</strong> ${municipalityData.servicios_sociales?.salud?.cobertura || 'N/A'}%</p>
                        <p><strong>Colegios públicos:</strong> ${municipalityData.servicios_sociales?.educacion?.colegios_publicos || 'N/A'}</p>
                        <p><strong>Cobertura educativa:</strong> ${municipalityData.servicios_sociales?.educacion?.cobertura_primaria || 'N/A'}%</p>
                    </div>
                    
                    <div class="municipality-programs">
                        <h3>🤝 Programas Sociales</h3>
                        <ul>
                            ${municipalityData.programas_sociales?.map(program => `<li>${program}</li>`).join('') || '<li>No hay programas específicos</li>'}
                        </ul>
                    </div>
                    
                    <div class="municipality-contacts">
                        <h3>📞 Contactos Importantes</h3>
                        <p><strong>Alcaldía:</strong> ${municipalityData.contactos_importantes?.alcaldia || 'N/A'}</p>
                        <p><strong>Secretaría de Salud:</strong> ${municipalityData.contactos_importantes?.secretaria_salud || 'N/A'}</p>
                        <p><strong>Secretaría de Educación:</strong> ${municipalityData.contactos_importantes?.secretaria_educacion || 'N/A'}</p>
                        <p><strong>Secretaría de Integración:</strong> ${municipalityData.contactos_importantes?.secretaria_integracion || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="municipality-actions">
                    <button class="btn-cancel" onclick="this.closest('.municipality-modal').remove()">
                        Cerrar
                    </button>
                    <button class="btn-download" onclick="locationSystem.downloadMunicipalityInfo()">
                        💳 Descargar PDF ($3.000)
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Descargar información del municipio
    async downloadMunicipalityInfo() {
        if (!this.detectedMunicipality) {
            alert('No se ha detectado ubicación');
            return;
        }

        const municipalityData = this.getMunicipalityData(this.detectedMunicipality.id);
        if (!municipalityData) {
            alert('No hay información disponible para esta zona');
            return;
        }

        try {
            // Simular procesamiento de pago
            const paymentSuccess = await this.simulateMunicipalityPayment();
            
            if (paymentSuccess) {
                // Generar PDF con información del municipio
                await this.generateMunicipalityPDF(municipalityData);
                this.recordMunicipalityDownload();
                alert('✅ PDF descargado exitosamente');
            } else {
                alert('❌ Error procesando el pago');
            }
        } catch (error) {
            console.error('Error descargando información del municipio:', error);
            alert('Error descargando la información');
        }
    }

    // Simular pago para información del municipio
    async simulateMunicipalityPayment() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 90% de éxito en el pago
                resolve(Math.random() > 0.1);
            }, 1500);
        });
    }

    // Generar PDF con información del municipio
    async generateMunicipalityPDF(municipalityData) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(20);
            doc.setTextColor(59, 130, 246);
            doc.text(`INFORMACIÓN DE ${municipalityData.nombre.toUpperCase()}`, 20, 30);
            
            // Línea separadora
            doc.setDrawColor(59, 130, 246);
            doc.setLineWidth(0.5);
            doc.line(20, 35, 190, 35);
            
            // Información general
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('INFORMACIÓN GENERAL', 20, 55);
            
            doc.setFontSize(12);
            doc.text(`Población: ${municipalityData.poblacion?.toLocaleString() || 'N/A'} habitantes`, 20, 70);
            doc.text(`Departamento: ${municipalityData.departamento || 'N/A'}`, 20, 80);
            doc.text(`Área: ${municipalityData.area || 'N/A'} km²`, 20, 90);
            doc.text(`Clima: ${municipalityData.clima || 'N/A'}`, 20, 100);
            
            // Economía
            doc.text('ECONOMÍA', 20, 120);
            doc.text(`PIB per cápita: $${municipalityData.economia?.pib_per_capita?.toLocaleString() || 'N/A'} COP`, 20, 135);
            doc.text(`Desempleo: ${municipalityData.economia?.desempleo || 'N/A'}%`, 20, 145);
            doc.text(`Sectores principales: ${municipalityData.economia?.sectores_principales?.join(', ') || 'N/A'}`, 20, 155);
            
            // Servicios sociales
            doc.text('SERVICIOS SOCIALES', 20, 175);
            doc.text(`Hospitales: ${municipalityData.servicios_sociales?.salud?.hospitales || 'N/A'}`, 20, 190);
            doc.text(`Centros de salud: ${municipalityData.servicios_sociales?.salud?.centros_salud || 'N/A'}`, 20, 200);
            doc.text(`Cobertura de salud: ${municipalityData.servicios_sociales?.salud?.cobertura || 'N/A'}%`, 20, 210);
            
            // Programas sociales
            doc.text('PROGRAMAS SOCIALES', 20, 230);
            let yPos = 245;
            municipalityData.programas_sociales?.forEach(program => {
                doc.text(`• ${program}`, 20, yPos);
                yPos += 10;
            });
            
            // Contactos
            doc.text('CONTACTOS IMPORTANTES', 20, yPos + 20);
            doc.text(`Alcaldía: ${municipalityData.contactos_importantes?.alcaldia || 'N/A'}`, 20, yPos + 35);
            doc.text(`Secretaría de Salud: ${municipalityData.contactos_importantes?.secretaria_salud || 'N/A'}`, 20, yPos + 45);
            
            // Pie de página
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text('Información generada por Sistema de Diagnóstico Social', 20, doc.internal.pageSize.height - 20);
            doc.text(`Fecha: ${new Date().toLocaleString('es-CO')}`, 20, doc.internal.pageSize.height - 10);
            
            // Descargar PDF
            const fileName = `informacion-${this.detectedMunicipality.id}-${Date.now()}.pdf`;
            doc.save(fileName);
            
        } catch (error) {
            console.error('Error generando PDF del municipio:', error);
            throw error;
        }
    }

    // Registrar descarga del municipio
    recordMunicipalityDownload() {
        try {
            let municipalityDownloads = JSON.parse(localStorage.getItem('municipalityDownloads') || '[]');
            municipalityDownloads.push({
                date: new Date().toISOString(),
                municipality: this.detectedMunicipality.name,
                municipalityId: this.detectedMunicipality.id,
                amount: 3000
            });
            localStorage.setItem('municipalityDownloads', JSON.stringify(municipalityDownloads));
            
            // Actualizar ingresos totales
            let revenue = JSON.parse(localStorage.getItem('systemRevenue') || '{"total": 0, "downloads": 0}');
            revenue.total += 3000;
            revenue.municipalityDownloads = (revenue.municipalityDownloads || 0) + 1;
            localStorage.setItem('systemRevenue', JSON.stringify(revenue));
            
            console.log('Descarga de municipio registrada');
        } catch (error) {
            console.error('Error registrando descarga de municipio:', error);
        }
    }
}

// Inicializar sistema de ubicación
document.addEventListener('DOMContentLoaded', function() {
    window.locationSystem = new LocationSystem();
});

// Exportar para uso global
window.LocationSystem = LocationSystem;
