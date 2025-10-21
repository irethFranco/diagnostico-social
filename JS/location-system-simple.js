// ===========================================
// SISTEMA SIMPLE DE DETECCIÓN DE UBICACIÓN
// ===========================================

class LocationSystemSimple {
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
        this.startLocationDetection();
    }

    // Cargar datos de municipios
    async loadMunicipalityData() {
        try {
            const response = await fetch('JS/colombia-municipality-data.json');
            if (response.ok) {
                this.municipalityData = await response.json();
                console.log('✅ Datos de municipios cargados');
            } else {
                throw new Error('Error cargando datos de municipios');
            }
        } catch (error) {
            console.error('❌ Error cargando datos de municipios:', error);
            this.municipalityData = { departamentos: {}, zonas_rurales: {} };
        }
    }

    // Iniciar detección de ubicación
    startLocationDetection() {
        // Evitar ejecución múltiple
        if (this.detectionStarted) {
            return;
        }
        this.detectionStarted = true;
        
        console.log('🚀 Iniciando detección automática de ubicación...');
        this.showLoadingMessage();
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

    // Intentar detección automática
    tryAutoDetection() {
        console.log('🔍 Intentando detección automática...');
        
        if (!navigator.geolocation) {
            console.log('❌ Geolocalización no soportada');
            this.showLocationFallback();
            return;
        }

        // Intentar obtener ubicación directamente
        this.requestLocation();
    }

    // Solicitar ubicación
    requestLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('✅ Ubicación obtenida:', position.coords);
                
                this.userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                // Determinar municipio
                this.detectedMunicipality = this.determineMunicipality(this.userLocation);
                console.log('✅ Municipio detectado:', this.detectedMunicipality);
                
                // Mostrar información
                this.displayLocationInfo();
            },
            (error) => {
                // No mostrar error en consola, solo usar fallback
                this.showLocationFallback();
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 60000
            }
        );
    }

    // Determinar municipio basado en coordenadas
    determineMunicipality(location) {
        if (!this.municipalityData || !this.municipalityData.departamentos) {
            return { id: 'unknown', name: 'Ubicación no identificada', departamento: 'N/A', coordinates: { lat: location.latitude, lng: location.longitude } };
        }

        const userLat = location.latitude;
        const userLng = location.longitude;
        let closestMunicipality = null;
        let minDistance = Infinity;

        // Coordenadas de ciudades principales
        const cityCoordinates = {
            'bogota': { lat: 4.6097, lng: -74.0817, radius: 0.5 },
            'medellin': { lat: 6.2442, lng: -75.5812, radius: 0.3 },
            'cali': { lat: 3.4516, lng: -76.5320, radius: 0.3 },
            'barranquilla': { lat: 10.9685, lng: -74.7813, radius: 0.3 },
            'cartagena': { lat: 10.3910, lng: -75.4794, radius: 0.3 },
            'bucaramanga': { lat: 7.1193, lng: -73.1227, radius: 0.3 },
            'pereira': { lat: 4.8133, lng: -75.6961, radius: 0.3 },
            'santa_marta': { lat: 11.2408, lng: -74.2110, radius: 0.3 },
            'ibague': { lat: 4.4447, lng: -75.2444, radius: 0.3 },
            'manizales': { lat: 5.0689, lng: -75.5174, radius: 0.3 },
            'villavicencio': { lat: 4.1533, lng: -73.6350, radius: 0.3 },
            'pasto': { lat: 1.2136, lng: -77.2811, radius: 0.3 },
            'neiva': { lat: 2.9345, lng: -75.2809, radius: 0.3 },
            'armenia': { lat: 4.5339, lng: -75.6811, radius: 0.3 },
            'popayan': { lat: 2.4448, lng: -76.6147, radius: 0.3 },
            'valledupar': { lat: 10.4631, lng: -73.2532, radius: 0.3 },
            'monteria': { lat: 8.7500, lng: -75.8772, radius: 0.3 },
            'tunja': { lat: 5.5353, lng: -73.3677, radius: 0.3 },
            'florencia': { lat: 1.6174, lng: -75.6062, radius: 0.3 },
            'yopal': { lat: 5.3480, lng: -72.4007, radius: 0.3 },
            'quibdo': { lat: 5.6909, lng: -76.6586, radius: 0.3 },
            'arauca': { lat: 7.0903, lng: -70.7617, radius: 0.3 },
            'leticia': { lat: -4.2153, lng: -69.9406, radius: 0.3 },
            'sincelejo': { lat: 9.3105, lng: -75.3686, radius: 0.1 },
            'cecar': { lat: 9.3047, lng: -75.3978, radius: 0.05 }
        };

        // Buscar ciudad más cercana
        for (const [cityId, coords] of Object.entries(cityCoordinates)) {
            const distance = this.calculateDistance(userLat, userLng, coords.lat, coords.lng);
            
            if (distance < coords.radius && distance < minDistance) {
                minDistance = distance;
                closestMunicipality = {
                    id: cityId,
                    name: this.getCityName(cityId),
                    departamento: this.getCityDepartment(cityId),
                    coordinates: { lat: coords.lat, lng: coords.lng }
                };
            }
        }

        if (closestMunicipality) {
            console.log('✅ Detectado:', closestMunicipality.name);
            return closestMunicipality;
        }

        return { id: 'unknown', name: 'Ubicación no identificada', departamento: 'N/A', coordinates: { lat: userLat, lng: userLng } };
    }

    // Obtener nombre de ciudad
    getCityName(cityId) {
        const names = {
            'bogota': 'Bogotá',
            'medellin': 'Medellín',
            'cali': 'Cali',
            'barranquilla': 'Barranquilla',
            'cartagena': 'Cartagena',
            'bucaramanga': 'Bucaramanga',
            'pereira': 'Pereira',
            'santa_marta': 'Santa Marta',
            'ibague': 'Ibagué',
            'manizales': 'Manizales',
            'villavicencio': 'Villavicencio',
            'pasto': 'Pasto',
            'neiva': 'Neiva',
            'armenia': 'Armenia',
            'popayan': 'Popayán',
            'valledupar': 'Valledupar',
            'monteria': 'Montería',
            'tunja': 'Tunja',
            'florencia': 'Florencia',
            'yopal': 'Yopal',
            'quibdo': 'Quibdó',
            'arauca': 'Arauca',
            'leticia': 'Leticia',
            'sincelejo': 'Sincelejo',
            'cecar': 'CECAR'
        };
        return names[cityId] || cityId;
    }

    // Obtener departamento de ciudad
    getCityDepartment(cityId) {
        const departments = {
            'bogota': 'Cundinamarca',
            'medellin': 'Antioquia',
            'cali': 'Valle del Cauca',
            'barranquilla': 'Atlántico',
            'cartagena': 'Bolívar',
            'bucaramanga': 'Santander',
            'pereira': 'Risaralda',
            'santa_marta': 'Magdalena',
            'ibague': 'Tolima',
            'manizales': 'Caldas',
            'villavicencio': 'Meta',
            'pasto': 'Nariño',
            'neiva': 'Huila',
            'armenia': 'Quindío',
            'popayan': 'Cauca',
            'valledupar': 'Cesar',
            'monteria': 'Córdoba',
            'tunja': 'Boyacá',
            'florencia': 'Caquetá',
            'yopal': 'Casanare',
            'quibdo': 'Chocó',
            'arauca': 'Arauca',
            'leticia': 'Amazonas',
            'sincelejo': 'Sucre',
            'cecar': 'Sucre'
        };
        return departments[cityId] || 'N/A';
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
                    <button class="btn-location" onclick="locationSystemSimple.showMunicipalityModal()">
                        📊 Ver Información de Mi Zona
                    </button>
                    <button class="btn-location" onclick="locationSystemSimple.tryAutoDetection()" style="background: linear-gradient(135deg, #10b981, #059669);">
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

    // Mostrar fallback si no se puede detectar ubicación
    showLocationFallback() {
        const locationInfo = document.getElementById('locationInfo');
        if (!locationInfo) return;

        // Usar ubicación de Sincelejo, Sucre como fallback
        this.userLocation = {
            latitude: 9.3047,
            longitude: -75.3978
        };
        
        this.detectedMunicipality = {
            id: 'sincelejo',
            name: 'Sincelejo',
            departamento: 'Sucre',
            coordinates: { lat: 9.3047, lng: -75.3978 }
        };

        // Mostrar información con mapa
        this.displayLocationInfo();
    }

    // Mostrar modal de información del municipio
    showMunicipalityModal() {
        if (!this.detectedMunicipality) return;

        const modal = document.createElement('div');
        modal.className = 'location-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Información de ${this.detectedMunicipality.name}</h3>
                    <button class="modal-close" onclick="this.closest('.location-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p><strong>Departamento:</strong> ${this.detectedMunicipality.departamento}</p>
                    <p><strong>Coordenadas:</strong> ${this.detectedMunicipality.coordinates.lat.toFixed(4)}, ${this.detectedMunicipality.coordinates.lng.toFixed(4)}</p>
                    <p><strong>Información adicional:</strong> Esta es una ubicación detectada automáticamente por el sistema.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-location" onclick="this.closest('.location-modal').remove()">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// Inicializar sistema simple
window.locationSystemSimple = new LocationSystemSimple();

// Exportar para uso global
window.LocationSystemSimple = LocationSystemSimple;