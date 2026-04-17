// ===========================================
// GESTION DE CONTENIDO - PAGINA PRINCIPAL
// ===========================================

(function() {
    const STORAGE_KEY = 'siteContentConfig';
    const BANNER_AUTO_HIDE_MS = 15000;

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

    function loadConfig() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return { ...defaults, ...saved };
        } catch (_) {
            return { ...defaults };
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text || '';
    }

    function applyConfig() {
        const cfg = loadConfig();

        setText('heroTitle', cfg.heroTitle);
        setText('heroDescription', cfg.heroDescription);
        setText('heroPrimaryBtn', cfg.heroButtonText);
        setText('featuresTitle', cfg.featuresTitle);
        setText('featuresSubtitle', cfg.featuresSubtitle);
        setText('featuresDescription', cfg.featuresDescription);

        const heroMainImage = document.getElementById('heroMainImage');
        if (heroMainImage && cfg.heroImage) {
            heroMainImage.src = cfg.heroImage;
        }

        const knowMoreImage = document.getElementById('kmSecImage');
        if (knowMoreImage && cfg.knowMoreImage) {
            knowMoreImage.src = cfg.knowMoreImage;
        }

        const missionImage = document.getElementById('missionImage');
        if (missionImage && cfg.missionImage) {
            missionImage.src = cfg.missionImage;
        }

        const promoBanner = document.getElementById('promoBanner');
        const promoBannerText = document.getElementById('promoBannerText');
        const promoBannerCloseBtn = document.getElementById('promoBannerCloseBtn');
        const promoBannerImage = document.getElementById('promoBannerImage');
        if (promoBanner && promoBannerText) {
            if (cfg.promoEnabled) {
                promoBannerText.textContent = cfg.promoText || defaults.promoText;
                if (promoBannerImage) {
                    if (cfg.promoImage) {
                        promoBannerImage.src = cfg.promoImage;
                        promoBannerImage.style.display = 'block';
                    } else {
                        promoBannerImage.style.display = 'none';
                    }
                }
                promoBanner.style.display = 'block';

                setTimeout(() => {
                    if (promoBanner.style.display !== 'none') {
                        promoBanner.style.display = 'none';
                    }
                }, BANNER_AUTO_HIDE_MS);
            } else {
                promoBanner.style.display = 'none';
            }

            if (promoBannerCloseBtn) {
                promoBannerCloseBtn.onclick = () => {
                    promoBanner.style.display = 'none';
                };
            }
        }
    }

    document.addEventListener('DOMContentLoaded', applyConfig);
})();
