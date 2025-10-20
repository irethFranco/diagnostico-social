// ===========================================
// SISTEMA DE GEOREFERENCIACIÓN CON GOOGLE MAPS
// ===========================================

class LocationSystemGoogleMaps {
    constructor() {
        this.userLocation = null;
        this.municipalityData = null;
        this.detectedMunicipality = null;
        this.map = null;
        this.geocoder = null;
        this.marker = null;
        this.init();
    }

    async init() {
        await this.loadMunicipalityData();
        this.bindEvents();
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
        // Esperar a que Google Maps esté listo
        if (typeof google !== 'undefined' && google.maps) {
            this.startLocationDetection();
        } else {
            // Esperar a que Google Maps se cargue
            window.initGoogleMaps = () => this.startLocationDetection();
        }
    }

    // Inicializar Google Maps
    startLocationDetection() {
        console.log('Iniciando sistema de ubicación con Google Maps...');
        
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
                <div style="font-size: 2rem; margin-bottom: 10px;">🗺️</div>
                <p>Detectando tu ubicación con Google Maps...</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Esto es más preciso que el GPS del navegador</p>
            </div>
        `;
    }

    // Intentar detección automática con Google Maps
    async tryAutoDetection() {
        if (!navigator.geolocation) {
            console.log('Geolocalización no soportada');
            setTimeout(() => this.showLocationFallback(), 1000);
            return;
        }

        // Timeout de 5 segundos
        const timeoutId = setTimeout(() => {
            console.log('Timeout - mostrando opciones manuales');
            this.showLocationFallback();
        }, 5000);

        try {
            console.log('Solicitando ubicación...');
            const position = await this.getCurrentPosition();
            
            // Limpiar timeout
            clearTimeout(timeoutId);
            console.log('Ubicación obtenida:', position.coords);
            
            this.userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            // Usar Google Maps Geocoding para obtener información detallada
            await this.getLocationDetailsFromGoogleMaps();
            
        } catch (error) {
            console.log('Error obteniendo ubicación:', error);
            // Limpiar timeout
            clearTimeout(timeoutId);
            // Mostrar fallback
            this.showLocationFallback();
        }
    }

    // Obtener posición actual con promesa
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 4000,
                    maximumAge: 300000
                }
            );
        });
    }

    // Obtener detalles de ubicación usando Google Maps Geocoding
    async getLocationDetailsFromGoogleMaps() {
        if (!this.userLocation) return;

        try {
            // Crear geocoder si no existe
            if (!this.geocoder) {
                this.geocoder = new google.maps.Geocoder();
            }

            const latlng = new google.maps.LatLng(
                this.userLocation.latitude, 
                this.userLocation.longitude
            );

            // Realizar geocoding inverso
            this.geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const result = results[0];
                    console.log('Resultado de Google Maps:', result);
                    
                    // Extraer información de la dirección
                    const addressComponents = result.address_components;
                    let city = '';
                    let department = '';
                    let country = '';

                    // Buscar componentes de la dirección
                    for (const component of addressComponents) {
                        if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                            city = component.long_name;
                        }
                        if (component.types.includes('administrative_area_level_1')) {
                            department = component.long_name;
                        }
                        if (component.types.includes('country')) {
                            country = component.long_name;
                        }
                    }

                    // Determinar municipio
                    this.detectedMunicipality = {
                        id: city.toLowerCase().replace(/\s+/g, '_'),
                        name: city,
                        departamento: department,
                        pais: country,
                        coordinates: { 
                            lat: this.userLocation.latitude, 
                            lng: this.userLocation.longitude 
                        },
                        type: 'detected'
                    };

                    console.log('Municipio detectado:', this.detectedMunicipality);
                    
                    // Mostrar información de ubicación
                    this.displayLocationInfo();
                    
                } else {
                    console.error('Error en geocoding:', status);
                    this.showLocationFallback();
                }
            });

        } catch (error) {
            console.error('Error obteniendo detalles de Google Maps:', error);
            this.showLocationFallback();
        }
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
                        <h3>Ubicación Detectada con Google Maps</h3>
                        <p><strong>${this.detectedMunicipality.name}</strong></p>
                        <p>Departamento: ${this.detectedMunicipality.departamento || 'N/A'}</p>
                        <p>País: ${this.detectedMunicipality.pais || 'N/A'}</p>
                        <p>Coordenadas: ${this.detectedMunicipality.coordinates.lat.toFixed(4)}, ${this.detectedMunicipality.coordinates.lng.toFixed(4)}</p>
                        <p style="font-size: 0.9rem; color: #10b981; margin-top: 10px;">
                            ✅ Detección precisa con Google Maps
                        </p>
                    </div>
                </div>
                <div class="location-actions">
                    <button class="btn-location" onclick="locationSystemGoogleMaps.showMunicipalityModal()">
                        📊 Ver Información de Mi Zona
                    </button>
                    <button class="btn-location" onclick="locationSystemGoogleMaps.showGoogleMapsModal()" style="background: linear-gradient(135deg, #10b981, #059669);">
                        🗺️ Ver en Google Maps
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
                        Puedes seleccionar tu zona manualmente o usar Google Maps.
                    </p>
                </div>
            </div>
            <div class="location-actions">
                <button class="btn-location" onclick="locationSystemGoogleMaps.showLocationSelector()">
                    🗺️ Seleccionar Mi Zona
                </button>
                <button class="btn-location" onclick="locationSystemGoogleMaps.showGoogleMapsModal()" style="background: linear-gradient(135deg, #10b981, #059669);">
                    🗺️ Usar Google Maps
                </button>
                <button class="btn-location" onclick="locationSystemGoogleMaps.tryAutoDetection()" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    🔄 Intentar Nuevamente
                </button>
            </div>
        `;
    }

    // Mostrar modal de Google Maps
    showGoogleMapsModal() {
        const modal = document.createElement('div');
        modal.className = 'location-modal';
        modal.innerHTML = `
            <div class="location-modal-content" style="max-width: 900px; height: 600px;">
                <div class="location-modal-header">
                    <h2>🗺️ Google Maps - Selecciona Tu Ubicación</h2>
                    <button class="close-modal" onclick="this.closest('.location-modal').remove()">&times;</button>
                </div>
                <div class="location-modal-body" style="padding: 0; height: 500px;">
                    <div id="googleMap" style="width: 100%; height: 100%; border-radius: 0 0 20px 20px;"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Inicializar mapa después de que se muestre el modal
        setTimeout(() => {
            this.initializeGoogleMap();
        }, 100);
    }

    // Inicializar Google Map
    initializeGoogleMap() {
        const mapElement = document.getElementById('googleMap');
        if (!mapElement) return;

        // Configuración del mapa centrado en Colombia
        const mapOptions = {
            center: { lat: 4.6097, lng: -74.0817 }, // Bogotá
            zoom: 6,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        };

        // Crear mapa
        this.map = new google.maps.Map(mapElement, mapOptions);

        // Crear geocoder si no existe
        if (!this.geocoder) {
            this.geocoder = new google.maps.Geocoder();
        }

        // Agregar marcador inicial
        this.marker = new google.maps.Marker({
            position: mapOptions.center,
            map: this.map,
            draggable: true,
            title: 'Arrastra para seleccionar tu ubicación'
        });

        // Evento cuando se arrastra el marcador
        this.marker.addListener('dragend', () => {
            const position = this.marker.getPosition();
            this.userLocation = {
                latitude: position.lat(),
                longitude: position.lng()
            };
            this.getLocationDetailsFromGoogleMaps();
        });

        // Evento cuando se hace clic en el mapa
        this.map.addListener('click', (event) => {
            const position = event.latLng;
            this.marker.setPosition(position);
            this.userLocation = {
                latitude: position.lat(),
                longitude: position.lng()
            };
            this.getLocationDetailsFromGoogleMaps();
        });

        // Buscar ubicación actual si está disponible
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.map.setCenter(userLocation);
                this.marker.setPosition(userLocation);
                this.userLocation = {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                };
                this.getLocationDetailsFromGoogleMaps();
            });
        }
    }

    // Mostrar selector de ubicación (versión mejorada)
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
                                <button class="location-option" onclick="locationSystemGoogleMaps.selectMunicipality('${municipio.nombre.toLowerCase().replace(/\s+/g, '_')}')">
                                    🏘️ ${municipio.nombre}
                                </button>
                            `).join('')}
                            ${departamento.municipios.length > 5 ? `
                                <button class="location-option more-options" onclick="locationSystemGoogleMaps.showMoreMunicipios('${departamentoId}')">
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
                        <input type="text" id="municipioSearch" placeholder="🔍 Buscar municipio..." onkeyup="locationSystemGoogleMaps.filterMunicipios(this.value)">
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
                        <input type="text" id="municipioSearch" placeholder="🔍 Buscar municipio..." onkeyup="locationSystemGoogleMaps.filterMunicipios(this.value)">
                    </div>
                    <div class="municipios-grid">
                        ${departamento.municipios.map(municipio => `
                            <button class="location-option" onclick="locationSystemGoogleMaps.selectMunicipality('${municipio.nombre.toLowerCase().replace(/\s+/g, '_')}')">
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
                    <button class="btn-download" onclick="locationSystemGoogleMaps.downloadMunicipalityInfo()">
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

// Inicializar sistema de ubicación con Google Maps
window.locationSystemGoogleMaps = new LocationSystemGoogleMaps();

// Función de callback para Google Maps
window.initGoogleMaps = function() {
    console.log('Google Maps cargado correctamente');
    if (window.locationSystemGoogleMaps) {
        window.locationSystemGoogleMaps.startLocationDetection();
    }
};

// Exportar para uso global
window.LocationSystemGoogleMaps = LocationSystemGoogleMaps;
