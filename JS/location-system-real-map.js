// ===========================================
// SISTEMA DE GEOREFERENCIACIÓN CON MAPA REAL
// ===========================================

class LocationSystemRealMap {
    constructor() {
        this.userLocation = null;
        this.municipalityData = null;
        this.detectedMunicipality = null;
        this.map = null;
        this.marker = null;
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
        console.log('Iniciando detección automática de ubicación...');
        
        // Mostrar mensaje de carga
        this.showLoadingMessage();
        
        // Intentar detección automática
        this.tryAutoDetection();
    }

    // Mostrar mensaje de carga
    showLoadingMessage() {
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;

        locationInfo.innerHTML = `
            <div class="location-loading">
                <div class="loading-spinner">🔄</div>
                <h3>Detectando tu ubicación...</h3>
                <p>Por favor permite el acceso a tu ubicación para una mejor experiencia</p>
            </div>
        `;
    }

    // Ocultar mensaje de carga
    hideLoadingMessage() {
        // Esta función se puede usar si necesitas ocultar el mensaje manualmente
        console.log('✅ Mensaje de carga ocultado');
    }

    // Mostrar interfaz del mapa
    showMapInterface() {
        console.log('🔄 Iniciando showMapInterface...');
        console.log('🔍 Verificando elementos del DOM...');
        
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) {
            console.error('❌ Elemento locationInfo no encontrado');
            console.error('❌ Elementos disponibles:', document.querySelectorAll('[id]'));
            return;
        }
        
        console.log('✅ Elemento locationInfo encontrado:', locationInfo);

        try {
            locationInfo.innerHTML = `
                <div class="location-map-container">
                    <div class="location-map-header">
                        <h3>🗺️ Selecciona Tu Nueva Ubicación</h3>
                        <p>Haz clic en el mapa para seleccionar tu ubicación o usa los botones de abajo</p>
                    </div>
                    <div class="location-map-wrapper">
                        <div id="realMap" style="width: 100%; height: 400px; border-radius: 12px; border: 2px solid #e2e8f0; background: #f8fafc; display: flex; align-items: center; justify-content: center;">
                            <div style="text-align: center; color: #64748b;">
                                <div style="font-size: 2rem; margin-bottom: 10px;">🔄</div>
                                <p>Cargando mapa...</p>
                            </div>
                        </div>
                    </div>
                    <div class="location-map-actions">
                        <button class="btn-location" onclick="locationSystemRealMap.showLocationSelector()" style="background: linear-gradient(135deg, #6b7280, #4b5563);">
                            📋 Lista de Municipios
                        </button>
                        <button class="btn-location" onclick="locationSystemRealMap.tryAutoDetection()" style="background: linear-gradient(135deg, #10b981, #059669);">
                            📍 Mi Ubicación Actual
                        </button>
                        <button class="btn-location" onclick="locationSystemRealMap.cancelLocationChange()" style="background: linear-gradient(135deg, #dc2626, #b91c1c);">
                            ❌ Cancelar
                        </button>
                    </div>
                </div>
            `;
            
            console.log('✅ HTML del mapa insertado correctamente');
            
            // Limpiar ubicación actual
            this.detectedMunicipality = null;
            this.userLocation = null;
            console.log('🧹 Ubicación actual limpiada');
            
            // Inicializar mapa después de que se muestre
            setTimeout(() => {
                console.log('⏰ Iniciando initializeMap después del timeout...');
                console.log('🔍 Verificando si el elemento realMap existe...');
                const realMapElement = document.getElementById('realMap');
                if (realMapElement) {
                    console.log('✅ Elemento realMap encontrado, inicializando mapa...');
                    this.initializeMap();
                } else {
                    console.error('❌ Elemento realMap no encontrado después del timeout');
                    this.showError('No se pudo crear el mapa');
                }
            }, 200);
            
        } catch (error) {
            console.error('❌ Error en showMapInterface:', error);
            this.showError('Error mostrando interfaz del mapa: ' + error.message);
        }
    }

    // Inicializar mapa real
    initializeMap() {
        console.log('🗺️ Iniciando initializeMap...');
        
        const mapElement = document.getElementById('realMap');
        if (!mapElement) {
            console.error('❌ Elemento del mapa no encontrado');
            this.showError('Elemento del mapa no encontrado');
            return;
        }

        console.log('✅ Elemento del mapa encontrado:', mapElement);

        try {
            // Verificar si Leaflet está disponible
            if (typeof L === 'undefined') {
                console.error('❌ Leaflet no está disponible');
                this.showError('Leaflet no está cargado');
                return;
            }
            console.log('✅ Leaflet está disponible');

            // Limpiar mapa existente si existe
            if (this.map) {
                console.log('🧹 Removiendo mapa existente...');
                this.map.remove();
            }

            // Crear mapa centrado en Colombia (no en ubicación específica)
            console.log('🗺️ Creando nuevo mapa...');
            this.map = L.map('realMap', {
                center: [4.6097, -74.0817],
                zoom: 6,
                zoomControl: true
            });
            console.log('✅ Mapa creado');

            // Agregar capa de OpenStreetMap
            console.log('🌍 Agregando capa de OpenStreetMap...');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);
            console.log('✅ Capa de OpenStreetMap agregada');

            console.log('✅ Mapa inicializado correctamente');

            // Evento cuando se hace clic en el mapa
            console.log('🎯 Agregando evento de clic al mapa...');
            this.map.on('click', (e) => {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                console.log('🖱️ Clic en mapa para cambiar ubicación:', lat, lng);
                
                try {
                    this.userLocation = {
                        latitude: lat,
                        longitude: lng
                    };
                    console.log('✅ Ubicación del usuario actualizada');
                    
                    // Actualizar marcador
                    if (this.marker) {
                        console.log('🧹 Removiendo marcador anterior...');
                        this.map.removeLayer(this.marker);
                    }
                    
                    console.log('📍 Agregando nuevo marcador...');
                    this.marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        })
                    }).addTo(this.map);
                    console.log('✅ Marcador agregado');
                    
                    // Determinar municipio
                    console.log('🔍 Determinando municipio...');
                    this.detectedMunicipality = this.determineMunicipality(this.userLocation);
                    console.log('✅ Nueva ubicación detectada:', this.detectedMunicipality);
                    
                    // Centrar mapa en la ubicación detectada
                    if (this.detectedMunicipality && this.detectedMunicipality.id !== 'unknown') {
                        console.log('🎯 Centrando mapa en nueva ubicación...');
                        this.map.setView([lat, lng], 12);
                    }
                    
                    // Mostrar información de la nueva ubicación
                    console.log('📊 Mostrando información de ubicación...');
                    this.displayLocationInfo();
                    
                } catch (error) {
                    console.error('❌ Error en evento de clic:', error);
                    this.showError('Error procesando clic en mapa: ' + error.message);
                }
            });
            console.log('✅ Evento de clic agregado correctamente');

            // Intentar obtener ubicación actual
            this.tryAutoDetection();

        } catch (error) {
            console.error('Error inicializando mapa:', error);
            this.showMapError();
        }
    }

    // Mostrar error del mapa
    showMapError() {
        const mapElement = document.getElementById('realMap');
        if (mapElement) {
            mapElement.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #f8fafc; color: #64748b; text-align: center; padding: 20px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🗺️</div>
                    <h3 style="margin: 0 0 10px 0; color: #1e293b;">Error Cargando Mapa</h3>
                    <p style="margin: 0 0 15px 0;">No se pudo cargar el mapa interactivo</p>
                    <button onclick="locationSystemRealMap.initializeMap()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }
    }

    // Determinar municipio basado en coordenadas
    determineMunicipality(location) {
        const { latitude, longitude } = location;
        
        console.log('Determinando municipio para:', latitude, longitude);
        
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
            'sincelejo': { lat: 9.3047, lng: -75.3978, radius: 0.1, departamento: 'Sucre' } // Radio en grados para Sincelejo
        };

        for (const [city, coords] of Object.entries(cityCoordinates)) {
            // Calcular diferencia en grados
            const latDiff = Math.abs(latitude - coords.lat);
            const lngDiff = Math.abs(longitude - coords.lng);
            const totalDiff = latDiff + lngDiff;
            
            console.log(`Diferencia a ${city}: lat=${latDiff.toFixed(4)}, lng=${lngDiff.toFixed(4)}, total=${totalDiff.toFixed(4)} (radio: ${coords.radius})`);
            
            if (totalDiff <= coords.radius) {
                console.log(`✅ Detectado: ${city}`);
                return {
                    id: city,
                    name: city.charAt(0).toUpperCase() + city.slice(1).replace('_', ' '),
                    departamento: coords.departamento,
                    distance: totalDiff,
                    coordinates: { lat: latitude, lng: longitude },
                    type: 'urban'
                };
            }
        }

        console.log('❌ No se detectó ninguna ciudad cercana');
        return {
            id: 'unknown',
            name: 'Ubicación no identificada',
            departamento: 'Colombia',
            type: 'unknown',
            coordinates: { lat: latitude, lng: longitude }
        };
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
                        <p style="font-size: 0.9rem; color: #10b981; margin-top: 10px;">
                            ✅ Ubicación detectada automáticamente
                        </p>
                    </div>
                </div>
                
                <!-- Mapa de ubicación -->
                <div class="location-map-visual">
                    <h4>🗺️ Mapa de Tu Ubicación</h4>
                    <div class="mini-map">
                        <div class="map-container">
                            <div id="locationMap" style="width: 100%; height: 300px; border-radius: 8px; border: 2px solid #e2e8f0;"></div>
                        </div>
                        <div class="map-info">
                            <p><strong>📍 ${this.detectedMunicipality.name}</strong></p>
                            <p>${this.detectedMunicipality.departamento}</p>
                            <p>Lat: ${this.detectedMunicipality.coordinates.lat.toFixed(4)}°</p>
                            <p>Lng: ${this.detectedMunicipality.coordinates.lng.toFixed(4)}°</p>
                        </div>
                    </div>
                </div>
                
                <div class="location-actions">
                    <button class="btn-location" onclick="locationSystemRealMap.showMunicipalityModal()">
                        📊 Ver Información de Mi Zona
                    </button>
                    <button class="btn-location" onclick="locationSystemRealMap.tryAutoDetection()" style="background: linear-gradient(135deg, #10b981, #059669);">
                        🔄 Actualizar Ubicación
                    </button>
                </div>
            `;
            
            // Inicializar mapa después de mostrar la información
            setTimeout(() => {
                this.initializeLocationMap();
            }, 100);
        }
    }

    // Inicializar mapa de ubicación
    initializeLocationMap() {
        console.log('🗺️ Inicializando mapa de ubicación...');
        
        const mapElement = document.getElementById('locationMap');
        if (!mapElement) {
            console.error('❌ Elemento locationMap no encontrado');
            return;
        }

        if (typeof L === 'undefined') {
            console.error('❌ Leaflet no está disponible');
            return;
        }

        try {
            // Limpiar mapa existente
            if (this.map) {
                console.log('🧹 Removiendo mapa existente...');
                this.map.remove();
            }

            console.log('📍 Creando mapa centrado en:', this.detectedMunicipality.coordinates);
            
            // Crear mapa centrado en la ubicación detectada
            this.map = L.map('locationMap', {
                center: [this.detectedMunicipality.coordinates.lat, this.detectedMunicipality.coordinates.lng],
                zoom: 12,
                zoomControl: true
            });

            // Agregar capa de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Agregar marcador en la ubicación
            this.marker = L.marker([this.detectedMunicipality.coordinates.lat, this.detectedMunicipality.coordinates.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(this.map);

            // Agregar popup al marcador
            this.marker.bindPopup(`
                <div style="text-align: center;">
                    <h4 style="margin: 0 0 10px 0; color: #1e293b;">📍 ${this.detectedMunicipality.name}</h4>
                    <p style="margin: 0; color: #64748b;">${this.detectedMunicipality.departamento}</p>
                </div>
            `).openPopup();

            console.log('✅ Mapa de ubicación inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando mapa:', error);
        }
    }

    // Función auxiliar para actualizar información (si se necesita)
    updateLocationInfo(newMunicipality) {
        // Esta función se puede usar para actualizar la información sin recargar todo
        console.log('🔄 Actualizando información de ubicación:', newMunicipality);
    }
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;
                
                console.log('Clic en mapa de ubicación:', lat, lng);
                
                // Actualizar ubicación
                this.userLocation = {
                    latitude: lat,
                    longitude: lng
                };
                
                // Determinar nueva ubicación
                const newMunicipality = this.determineMunicipality(this.userLocation);
                console.log('Nueva ubicación detectada:', newMunicipality);
                
                // Actualizar marcador
                locationMap.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        locationMap.removeLayer(layer);
                    }
                });
                
                // Agregar nuevo marcador
                L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }).addTo(locationMap);
                
                // Actualizar información sin recargar todo
                this.updateLocationInfo(newMunicipality);
            });

            // Agregar mensaje de instrucción
            const instructionDiv = document.createElement('div');
            instructionDiv.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
            `;
            instructionDiv.textContent = 'Haz clic en el mapa para cambiar ubicación';
            mapElement.appendChild(instructionDiv);
            
            // Remover mensaje después de 3 segundos
            setTimeout(() => {
                if (instructionDiv.parentNode) {
                    instructionDiv.parentNode.removeChild(instructionDiv);
                }
            }, 3000);

            console.log('Mapa de ubicación inicializado correctamente');

        } catch (error) {
            console.error('Error inicializando mapa de ubicación:', error);
        }
    }

    // Actualizar información de ubicación sin recargar
    updateLocationInfo(newMunicipality) {
        this.detectedMunicipality = newMunicipality;
        
        console.log('Actualizando información para:', newMunicipality.name);
        
        // Actualizar solo la información, no todo el HTML
        const locationDetails = document.querySelector('.location-details');
        if (locationDetails) {
            locationDetails.innerHTML = `
                <h3>Ubicación Detectada</h3>
                <p><strong>${newMunicipality.name}</strong></p>
                <p>Departamento: ${newMunicipality.departamento || 'N/A'}</p>
                <p>Coordenadas: ${newMunicipality.coordinates.lat.toFixed(4)}, ${newMunicipality.coordinates.lng.toFixed(4)}</p>
                <p style="font-size: 0.9rem; color: #10b981; margin-top: 10px;">
                    ✅ Ubicación actualizada en el mapa
                </p>
            `;
        }
        
        // Actualizar información del mapa
        const mapInfo = document.querySelector('.map-info');
        if (mapInfo) {
            mapInfo.innerHTML = `
                <p><strong>📍 ${newMunicipality.name}</strong></p>
                <p>${newMunicipality.departamento}</p>
                <p>Lat: ${newMunicipality.coordinates.lat.toFixed(4)}°</p>
                <p>Lng: ${newMunicipality.coordinates.lng.toFixed(4)}°</p>
            `;
        }
        
        // Mostrar notificación de cambio
        this.showLocationChangeNotification(newMunicipality.name);
        
        console.log('Información de ubicación actualizada');
    }

    // Mostrar notificación de cambio de ubicación
    showLocationChangeNotification(cityName) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = `📍 Ubicación cambiada a: ${cityName}`;
        
        // Agregar animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remover notificación después de 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    // Mostrar error al usuario
    showError(message) {
        console.error('🚨 Error mostrado al usuario:', message);
        
        const locationInfo = document.getElementById('locationInfo');
        if (locationInfo) {
            locationInfo.innerHTML = `
                <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">❌</div>
                    <h3 style="color: #dc2626; margin: 0 0 10px 0;">Error del Sistema</h3>
                    <p style="color: #7f1d1d; margin: 0 0 15px 0;">${message}</p>
                    <button onclick="locationSystemRealMap.showMapInterface()" style="background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        🔄 Reintentar
                    </button>
                </div>
            `;
        }
    }

    // Cancelar cambio de ubicación
    cancelLocationChange() {
        // Volver a mostrar la información de ubicación actual
        if (this.detectedMunicipality) {
            this.displayLocationInfo();
        } else {
            // Si no hay ubicación, mostrar fallback
            this.showLocationFallback();
        }
    }

    // Intentar detección automática
    tryAutoDetection() {
        if (!navigator.geolocation) {
            console.log('Geolocalización no soportada');
            this.showLocationFallback();
            return;
        }

        // Mostrar mensaje de carga
        this.showLoadingMessage();

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Ubicación obtenida:', position.coords);
                this.hideLoadingMessage();
                
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Centrar mapa en ubicación del usuario (solo si existe)
                if (this.map) {
                    this.map.setView([lat, lng], 12);
                }
                
                // Agregar marcador (solo si el mapa existe)
                if (this.map) {
                    if (this.marker) {
                        this.map.removeLayer(this.marker);
                    }
                    
                    this.marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        })
                    }).addTo(this.map);
                }
                
                this.userLocation = {
                    latitude: lat,
                    longitude: lng
                };
                
                const newMunicipality = this.determineMunicipality(this.userLocation);
                this.detectedMunicipality = newMunicipality;
                
                // Centrar mapa en la ubicación detectada (solo si existe)
                if (this.map && newMunicipality && newMunicipality.id !== 'unknown') {
                    this.map.setView([lat, lng], 12);
                }
                
                // Mostrar información de ubicación
                this.displayLocationInfo();
            },
            (error) => {
                console.log('Error obteniendo ubicación:', error);
                this.hideLoadingMessage();
                this.showLocationFallback();
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 300000
            }
        );
    }

    // Mostrar mensaje de carga
    showLoadingMessage() {
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingMessage';
        loadingDiv.innerHTML = `
            <div style="text-align: center; color: #64748b; padding: 20px; background: #f8fafc; border-radius: 8px; margin: 10px 0;">
                <div style="font-size: 2rem; margin-bottom: 10px;">🔄</div>
                <p>Detectando ubicación...</p>
            </div>
        `;
        
        locationInfo.appendChild(loadingDiv);
    }

    // Ocultar mensaje de carga
    hideLoadingMessage() {
        const loadingDiv = document.getElementById('loadingMessage');
        if (loadingDiv) {
            loadingDiv.remove();
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
                        Puedes hacer clic en el mapa para seleccionar tu ubicación.
                    </p>
                </div>
            </div>
            <div class="location-actions">
                <button class="btn-location" onclick="locationSystemRealMap.showLocationSelector()">
                    📋 Lista de Municipios
                </button>
                <button class="btn-location" onclick="locationSystemRealMap.tryAutoDetection()" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    🔄 Intentar Nuevamente
                </button>
            </div>
        `;
    }

    // Mostrar selector de ubicación (lista)
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
                                <button class="location-option" onclick="locationSystemRealMap.selectMunicipality('${municipio.nombre.toLowerCase().replace(/\s+/g, '_')}')">
                                    🏘️ ${municipio.nombre}
                                </button>
                            `).join('')}
                            ${departamento.municipios.length > 5 ? `
                                <button class="location-option more-options" onclick="locationSystemRealMap.showMoreMunicipios('${departamentoId}')">
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
                        <input type="text" id="municipioSearch" placeholder="🔍 Buscar municipio..." onkeyup="locationSystemRealMap.filterMunicipios(this.value)">
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
                        <input type="text" id="municipioSearch" placeholder="🔍 Buscar municipio..." onkeyup="locationSystemRealMap.filterMunicipios(this.value)">
                    </div>
                    <div class="municipios-grid">
                        ${departamento.municipios.map(municipio => `
                            <button class="location-option" onclick="locationSystemRealMap.selectMunicipality('${municipio.nombre.toLowerCase().replace(/\s+/g, '_')}')">
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
                    <button class="btn-download" onclick="locationSystemRealMap.downloadMunicipalityInfo()">
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

// Inicializar sistema de ubicación con mapa real
window.locationSystemRealMap = new LocationSystemRealMap();

// Función de prueba para verificar que el botón funciona
window.testLocationChange = function() {
    console.log('🧪 Función de prueba ejecutada');
    if (window.locationSystemRealMap) {
        console.log('✅ locationSystemRealMap está disponible');
        window.locationSystemRealMap.showMapInterface();
    } else {
        console.error('❌ locationSystemRealMap no está disponible');
    }
};

// Exportar para uso global
window.LocationSystemRealMap = LocationSystemRealMap;
