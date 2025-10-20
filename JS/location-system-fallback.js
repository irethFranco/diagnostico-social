// ===========================================
// SISTEMA DE GEOREFERENCIACIÓN FALLBACK
// ===========================================

class LocationSystemFallback {
    constructor() {
        this.userLocation = null;
        this.municipalityData = null;
        this.detectedMunicipality = null;
        this.init();
    }

    async init() {
        await this.loadMunicipalityData();
        this.bindEvents();
        // Iniciar detección inmediatamente
        this.startLocationDetection();
    }

    // Cargar datos de municipios
    async loadMunicipalityData() {
        try {
            const response = await fetch('JS/colombia-municipality-data.json');
            if (response.ok) {
                this.municipalityData = await response.json();
                console.log('Datos de municipios de Colombia cargados');
            } else {
                throw new Error('Error cargando datos de municipios');
            }
        } catch (error) {
            console.error('Error cargando datos de municipios:', error);
            this.municipalityData = { departamentos: {}, zonas_rurales: {} };
        }
    }

    // Bindear eventos
    bindEvents() {
        // No esperar DOMContentLoaded, iniciar inmediatamente
    }

    // Iniciar detección de ubicación
    startLocationDetection() {
        console.log('Iniciando sistema de ubicación fallback...');
        
        // Mostrar mensaje inicial
        this.showInitialMessage();
        
        // Intentar detección automática
        this.tryAutoDetection();
    }

    // Mostrar mensaje inicial
    showInitialMessage() {
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;

        locationInfo.innerHTML = `
            <div style="text-align: center; color: #64748b; padding: 20px;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📍</div>
                <p>Detectando tu ubicación...</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Si no se detecta en 3 segundos, podrás seleccionar manualmente</p>
            </div>
        `;
    }

    // Intentar detección automática
    tryAutoDetection() {
        if (!navigator.geolocation) {
            console.log('Geolocalización no soportada');
            setTimeout(() => this.showLocationFallback(), 1000);
            return;
        }

        // Timeout muy corto - 3 segundos
        const timeoutId = setTimeout(() => {
            console.log('Timeout - mostrando opciones manuales');
            this.showLocationFallback();
        }, 3000);

        // Intentar obtener ubicación
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                console.log('Ubicación obtenida:', position.coords);
                this.handleLocationSuccess(position);
            },
            (error) => {
                clearTimeout(timeoutId);
                console.log('Error obteniendo ubicación:', error);
                this.showLocationFallback();
            },
            {
                enableHighAccuracy: false,
                timeout: 2000,
                maximumAge: 300000
            }
        );
    }

    // Manejar éxito de ubicación
    handleLocationSuccess(position) {
        this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        };

        // Determinar municipio
        this.detectedMunicipality = this.determineMunicipality(this.userLocation);
        
        // Mostrar información
        this.displayLocationInfo();
    }

    // Determinar municipio basado en coordenadas
    determineMunicipality(location) {
        const { latitude, longitude } = location;
        
        // Coordenadas aproximadas de principales ciudades de Colombia
        const cityCoordinates = {
            'bogota': { lat: 4.6097, lng: -74.0817, radius: 0.5, departamento: 'Cundinamarca' },
            'medellin': { lat: 6.2442, lng: -75.5812, radius: 0.3, departamento: 'Antioquia' },
            'cali': { lat: 3.4516, lng: -76.5320, radius: 0.4, departamento: 'Valle del Cauca' },
            'barranquilla': { lat: 10.9685, lng: -74.7813, radius: 0.3, departamento: 'Atlántico' },
            'cartagena': { lat: 10.3910, lng: -75.4794, radius: 0.4, departamento: 'Bolívar' },
            'bucaramanga': { lat: 7.1193, lng: -73.1227, radius: 0.3, departamento: 'Santander' },
            'pereira': { lat: 4.8133, lng: -75.6961, radius: 0.3, departamento: 'Risaralda' },
            'santa_marta': { lat: 11.2408, lng: -74.2110, radius: 0.3, departamento: 'Magdalena' },
            'ibague': { lat: 4.4447, lng: -75.2437, radius: 0.3, departamento: 'Tolima' },
            'manizales': { lat: 5.0689, lng: -75.5174, radius: 0.3, departamento: 'Caldas' },
            'villavicencio': { lat: 4.1420, lng: -73.6268, radius: 0.3, departamento: 'Meta' },
            'pasto': { lat: 1.2059, lng: -77.2858, radius: 0.3, departamento: 'Nariño' },
            'neiva': { lat: 2.9345, lng: -75.2809, radius: 0.3, departamento: 'Huila' },
            'armenia': { lat: 4.5363, lng: -75.6811, radius: 0.3, departamento: 'Quindío' },
            'popayan': { lat: 2.4448, lng: -76.6147, radius: 0.3, departamento: 'Cauca' },
            'valledupar': { lat: 10.4631, lng: -73.2532, radius: 0.3, departamento: 'Cesar' },
            'monteria': { lat: 8.7500, lng: -75.8833, radius: 0.3, departamento: 'Córdoba' },
            'tunja': { lat: 5.5353, lng: -73.3678, radius: 0.3, departamento: 'Boyacá' },
            'florencia': { lat: 1.6174, lng: -75.6062, radius: 0.3, departamento: 'Caquetá' },
            'yopal': { lat: 5.3480, lng: -72.4030, radius: 0.3, departamento: 'Casanare' },
            'quibdo': { lat: 5.6909, lng: -76.6586, radius: 0.3, departamento: 'Chocó' },
            'arauca': { lat: 7.0903, lng: -70.7617, radius: 0.3, departamento: 'Arauca' },
            'leticia': { lat: -4.2153, lng: -69.9406, radius: 0.3, departamento: 'Amazonas' },
            'sincelejo': { lat: 9.3047, lng: -75.3978, radius: 0.3, departamento: 'Sucre' }
        };

        for (const [city, coords] of Object.entries(cityCoordinates)) {
            const distance = this.calculateDistance(
                latitude, longitude,
                coords.lat, coords.lng
            );
            
            if (distance <= coords.radius) {
                return {
                    id: city,
                    name: city.charAt(0).toUpperCase() + city.slice(1).replace('_', ' '),
                    departamento: coords.departamento,
                    distance: distance,
                    coordinates: { lat: latitude, lng: longitude },
                    type: 'urban'
                };
            }
        }

        // Si no está en ninguna ciudad principal, determinar departamento aproximado
        const departamento = this.determineDepartment(latitude, longitude);
        
        return {
            id: 'unknown',
            name: 'Ubicación no identificada',
            departamento: departamento,
            type: 'unknown',
            coordinates: { lat: latitude, lng: longitude }
        };
    }

    // Determinar departamento basado en coordenadas
    determineDepartment(lat, lng) {
        // Regiones aproximadas de Colombia
        if (lat > 12) return 'La Guajira';
        if (lat > 10 && lng > -75) return 'Atlántico';
        if (lat > 8 && lng > -75) return 'Bolívar';
        if (lat > 6 && lng > -75) return 'Antioquia';
        if (lat > 4 && lng > -75) return 'Cundinamarca';
        if (lat > 2 && lng > -75) return 'Valle del Cauca';
        if (lat > 0 && lng > -75) return 'Nariño';
        if (lat > 4 && lng < -75) return 'Meta';
        if (lat > 2 && lng < -75) return 'Caquetá';
        if (lat > 0 && lng < -75) return 'Putumayo';
        if (lat < 0) return 'Amazonas';
        
        return 'Colombia';
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

    // Mostrar información de ubicación
    displayLocationInfo() {
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;

        if (this.detectedMunicipality) {
            locationInfo.innerHTML = `
                <div class="location-detected">
                    <div class="location-icon">📍</div>
                    <div class="location-details">
                        <h3>Ubicación Detectada</h3>
                        <p><strong>${this.detectedMunicipality.name}</strong></p>
                        <p>Departamento: ${this.detectedMunicipality.departamento || 'N/A'}</p>
                        <p>Coordenadas: ${this.detectedMunicipality.coordinates.lat.toFixed(4)}, ${this.detectedMunicipality.coordinates.lng.toFixed(4)}</p>
                    </div>
                </div>
                <div class="location-actions">
                    <button class="btn-location" onclick="locationSystemFallback.showMunicipalityModal()">
                        📊 Ver Información de Mi Zona
                    </button>
                </div>
            `;
        }
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
                <button class="btn-location" onclick="locationSystemFallback.showLocationSelector()">
                    🗺️ Seleccionar Mi Zona
                </button>
                <button class="btn-location" onclick="locationSystemFallback.tryAutoDetection()" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    🔄 Intentar Nuevamente
                </button>
            </div>
        `;
    }

    // Mostrar selector de ubicación
    showLocationSelector() {
        const modal = document.createElement('div');
        modal.className = 'location-modal';
        
        // Generar opciones de departamentos
        let departamentosOptions = '';
        if (this.municipalityData && this.municipalityData.departamentos) {
            for (const [departamentoId, departamento] of Object.entries(this.municipalityData.departamentos)) {
                departamentosOptions += `
                    <div class="departamento-section">
                        <h4>${departamento.nombre}</h4>
                        <div class="municipios-grid">
                            ${departamento.municipios.slice(0, 5).map(municipio => `
                                <button class="location-option" onclick="locationSystemFallback.selectMunicipality('${municipio.nombre.toLowerCase().replace(/\s+/g, '_')}')">
                                    🏘️ ${municipio.nombre}
                                </button>
                            `).join('')}
                            ${departamento.municipios.length > 5 ? `
                                <button class="location-option more-options" onclick="locationSystemFallback.showMoreMunicipios('${departamentoId}')">
                                    📋 Ver más municipios (${departamento.municipios.length - 5} más)
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            }
        }
        
        modal.innerHTML = `
            <div class="location-modal-content">
                <div class="location-modal-header">
                    <h2>🗺️ Selecciona Tu Zona</h2>
                    <button class="close-modal" onclick="this.closest('.location-modal').remove()">&times;</button>
                </div>
                <div class="location-modal-body">
                    <div class="search-box">
                        <input type="text" id="municipioSearch" placeholder="🔍 Buscar municipio..." onkeyup="locationSystemFallback.filterMunicipios(this.value)">
                    </div>
                    <div class="departamentos-container" id="departamentosContainer">
                        ${departamentosOptions}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Seleccionar municipio manualmente
    selectMunicipality(municipalityId) {
        const municipalityData = this.getMunicipalityData(municipalityId);
        this.detectedMunicipality = {
            id: municipalityId,
            name: municipalityData?.nombre || municipalityId,
            departamento: municipalityData?.departamento || 'N/A',
            type: municipalityId.includes('rural') ? 'rural' : 'urban'
        };
        
        this.displayLocationInfo();
        
        // Cerrar modal
        const modal = document.querySelector('.location-modal');
        if (modal) modal.remove();
    }

    // Obtener datos del municipio
    getMunicipalityData(municipalityId) {
        if (!this.municipalityData) return null;
        
        // Buscar en todos los departamentos
        for (const [departamentoId, departamento] of Object.entries(this.municipalityData.departamentos)) {
            if (departamento.municipios) {
                for (const municipio of departamento.municipios) {
                    if (municipio.nombre.toLowerCase().replace(/\s+/g, '_') === municipalityId.toLowerCase()) {
                        return {
                            ...municipio,
                            departamento: departamento.nombre,
                            caracteristicas: departamento.caracteristicas
                        };
                    }
                }
            }
        }
        
        return null;
    }

    // Filtrar municipios por búsqueda
    filterMunicipios(searchTerm) {
        const container = document.getElementById('departamentosContainer');
        if (!container) return;

        const searchLower = searchTerm.toLowerCase();
        const departamentoSections = container.querySelectorAll('.departamento-section');
        
        departamentoSections.forEach(section => {
            const municipios = section.querySelectorAll('.location-option');
            let hasVisibleMunicipios = false;
            
            municipios.forEach(municipio => {
                const text = municipio.textContent.toLowerCase();
                if (text.includes(searchLower)) {
                    municipio.style.display = 'block';
                    hasVisibleMunicipios = true;
                } else {
                    municipio.style.display = 'none';
                }
            });
            
            section.style.display = hasVisibleMunicipios ? 'block' : 'none';
        });
    }

    // Mostrar más municipios de un departamento
    showMoreMunicipios(departamentoId) {
        const departamento = this.municipalityData.departamentos[departamentoId];
        if (!departamento) return;

        const modal = document.createElement('div');
        modal.className = 'location-modal';
        modal.innerHTML = `
            <div class="location-modal-content">
                <div class="location-modal-header">
                    <h2>🏘️ Municipios de ${departamento.nombre}</h2>
                    <button class="close-modal" onclick="this.closest('.location-modal').remove()">&times;</button>
                </div>
                <div class="location-modal-body">
                    <div class="search-box">
                        <input type="text" id="municipioSearch" placeholder="🔍 Buscar municipio..." onkeyup="locationSystemFallback.filterMunicipios(this.value)">
                    </div>
                    <div class="municipios-grid">
                        ${departamento.municipios.map(municipio => `
                            <button class="location-option" onclick="locationSystemFallback.selectMunicipality('${municipio.nombre.toLowerCase().replace(/\s+/g, '_')}')">
                                🏘️ ${municipio.nombre}
                                <small>Población: ${municipio.poblacion?.toLocaleString() || 'N/A'}</small>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
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
                    <button class="btn-download" onclick="locationSystemFallback.downloadMunicipalityInfo()">
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

// Inicializar sistema de ubicación fallback
window.locationSystemFallback = new LocationSystemFallback();

// Exportar para uso global
window.LocationSystemFallback = LocationSystemFallback;
