// ===========================================
// ADMIN - GESTION DE CONTENIDO INICIO
// ===========================================

(function() {
    const STORAGE_KEY = 'siteContentConfig';

    const defaults = {
        heroTitle: 'Bienvenido al diagnostico social',
        heroDescription: 'Comparte tu problemática social y recibe un diagnóstico orientado hacia alternativas de solución, empoderamiento y transformación personal y colectiva.',
        heroButtonText: 'COMENZAR DIAGNÓSTICO',
        featuresTitle: 'Tecnología para el trabajo social',
        featuresSubtitle: 'Transformando comunidades',
        featuresDescription: 'Utilizamos tecnología avanzada para brindar diagnósticos sociales precisos y soluciones innovadoras que empoderan a las comunidades y promueven el cambio social positivo.',
        promoEnabled: false,
        promoText: 'Descuento especial disponible por tiempo limitado',
        promoImage: '',
        heroImage: 'imagenes/fonfo.jpg',
        knowMoreImage: 'imagenes/conocer.jpg',
        missionImage: 'imagenes/social.jpg'
    };

    function getEl(id) {
        return document.getElementById(id);
    }

    function loadConfig() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return { ...defaults, ...saved };
        } catch (_) {
            return { ...defaults };
        }
    }

    function saveConfig(config) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    function fillForm(config) {
        if (!getEl('cmHeroTitle')) return;
        getEl('cmHeroTitle').value = config.heroTitle || '';
        getEl('cmHeroDescription').value = config.heroDescription || '';
        getEl('cmHeroButtonText').value = config.heroButtonText || '';
        getEl('cmFeaturesTitle').value = config.featuresTitle || '';
        getEl('cmFeaturesSubtitle').value = config.featuresSubtitle || '';
        getEl('cmFeaturesDescription').value = config.featuresDescription || '';
        getEl('cmPromoEnabled').value = String(!!config.promoEnabled);
        getEl('cmPromoText').value = config.promoText || '';
        getEl('cmPromoImage').value = config.promoImage || '';
        getEl('cmHeroImage').value = config.heroImage || '';
        getEl('cmKnowMoreImage').value = config.knowMoreImage || '';
        getEl('cmMissionImage').value = config.missionImage || '';
        refreshAllPreviews();
    }

    function readForm() {
        return {
            heroTitle: (getEl('cmHeroTitle')?.value || '').trim() || defaults.heroTitle,
            heroDescription: (getEl('cmHeroDescription')?.value || '').trim() || defaults.heroDescription,
            heroButtonText: (getEl('cmHeroButtonText')?.value || '').trim() || defaults.heroButtonText,
            featuresTitle: (getEl('cmFeaturesTitle')?.value || '').trim() || defaults.featuresTitle,
            featuresSubtitle: (getEl('cmFeaturesSubtitle')?.value || '').trim() || defaults.featuresSubtitle,
            featuresDescription: (getEl('cmFeaturesDescription')?.value || '').trim() || defaults.featuresDescription,
            promoEnabled: (getEl('cmPromoEnabled')?.value || 'false') === 'true',
            promoText: (getEl('cmPromoText')?.value || '').trim() || defaults.promoText,
            promoImage: (getEl('cmPromoImage')?.value || '').trim(),
            heroImage: (getEl('cmHeroImage')?.value || '').trim() || defaults.heroImage,
            knowMoreImage: (getEl('cmKnowMoreImage')?.value || '').trim() || defaults.knowMoreImage,
            missionImage: (getEl('cmMissionImage')?.value || '').trim() || defaults.missionImage
        };
    }

    function bindEvents() {
        const saveBtn = getEl('saveContentConfig');
        const resetBtn = getEl('resetContentConfig');
        bindFileInputs();
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const config = readForm();
                saveConfig(config);
                alert('Contenido de inicio guardado correctamente.');
            });
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                saveConfig({ ...defaults });
                fillForm({ ...defaults });
                clearFileInputs();
                alert('Contenido restaurado a valores por defecto.');
            });
        }
    }

    function clearFileInputs() {
        const ids = ['cmPromoImageFile', 'cmHeroImageFile', 'cmKnowMoreImageFile', 'cmMissionImageFile'];
        ids.forEach(id => {
            const el = getEl(id);
            if (el) el.value = '';
        });
    }

    function bindFileInputs() {
        bindSingleFileInput('cmPromoImageFile', 'cmPromoImage');
        bindSingleFileInput('cmHeroImageFile', 'cmHeroImage');
        bindSingleFileInput('cmKnowMoreImageFile', 'cmKnowMoreImage');
        bindSingleFileInput('cmMissionImageFile', 'cmMissionImage');

        bindTextPreview('cmPromoImage');
        bindTextPreview('cmHeroImage');
        bindTextPreview('cmKnowMoreImage');
        bindTextPreview('cmMissionImage');
    }

    function bindSingleFileInput(fileInputId, targetInputId) {
        const fileInput = getEl(fileInputId);
        const targetInput = getEl(targetInputId);
        if (!fileInput || !targetInput) return;

        fileInput.addEventListener('change', () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Solo se permiten archivos de imagen.');
                fileInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    targetInput.value = reader.result;
                    refreshPreviewByInputId(targetInputId);
                }
            };
            reader.onerror = () => {
                alert('No se pudo leer la imagen seleccionada.');
            };
            reader.readAsDataURL(file);
        });
    }

    function bindTextPreview(inputId) {
        const input = getEl(inputId);
        if (!input) return;
        input.addEventListener('input', () => refreshPreviewByInputId(inputId));
        input.addEventListener('change', () => refreshPreviewByInputId(inputId));
    }

    function refreshAllPreviews() {
        refreshPreviewByInputId('cmPromoImage');
        refreshPreviewByInputId('cmHeroImage');
        refreshPreviewByInputId('cmKnowMoreImage');
        refreshPreviewByInputId('cmMissionImage');
    }

    function refreshPreviewByInputId(inputId) {
        const map = {
            cmPromoImage: { preview: 'cmPromoImagePreview', empty: 'cmPromoImageEmpty' },
            cmHeroImage: { preview: 'cmHeroImagePreview', empty: 'cmHeroImageEmpty' },
            cmKnowMoreImage: { preview: 'cmKnowMoreImagePreview', empty: 'cmKnowMoreImageEmpty' },
            cmMissionImage: { preview: 'cmMissionImagePreview', empty: 'cmMissionImageEmpty' }
        };
        const target = map[inputId];
        if (!target) return;

        const input = getEl(inputId);
        const img = getEl(target.preview);
        const empty = getEl(target.empty);
        if (!input || !img || !empty) return;

        const value = (input.value || '').trim();
        if (!value) {
            img.style.display = 'none';
            img.removeAttribute('src');
            empty.style.display = 'block';
            return;
        }

        img.onerror = () => {
            img.style.display = 'none';
            empty.style.display = 'block';
        };
        img.onload = () => {
            img.style.display = 'block';
            empty.style.display = 'none';
        };
        img.src = value;
    }

    function init() {
        if (!getEl('cmHeroTitle')) return;
        fillForm(loadConfig());
        bindEvents();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
