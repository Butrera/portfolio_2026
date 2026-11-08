
'use strict';

// Muestra la pantalla solo en cargas que superen los tres segundos.
const initSplash = () => {
    const splash = document.querySelector('.Splash');
    if (!splash || document.readyState === 'complete') return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let finished = false;
    let revealTimer;
    let safetyTimer;

    const finish = (immediately = false) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(revealTimer);
        window.clearTimeout(safetyTimer);
        window.removeEventListener('load', onLoad);
        document.removeEventListener('focusin', onFocus);
        if (splash.hidden) return;

        document.body.classList.remove('is-loading');
        splash.classList.add('is-complete');
        if (motion.matches || immediately) splash.hidden = true;
        else window.setTimeout(() => { splash.hidden = true; }, 250);
    };
    const onLoad = () => finish();
    const onFocus = () => finish(true);

    window.addEventListener('load', onLoad, { once: true });
    document.addEventListener('focusin', onFocus, { once: true });
    revealTimer = window.setTimeout(() => {
        if (finished || document.readyState === 'complete') {
            finish();
            return;
        }
        splash.hidden = false;
        document.body.classList.add('is-loading');
        safetyTimer = window.setTimeout(onLoad, 8000);
    }, Math.max(0, 3000 - performance.now()));
};

initSplash();


// MENÚ DE NAVEGACIÓN

const menu = document.querySelector('.Menu');
const menuBtn = document.querySelector('.Menu-btn');
const menuPanel = document.querySelector('.Menu-panel');
const menuLinks = document.querySelectorAll('.Menu-link');

// Activar el comportamiento con JavaScript
if (menu && menuBtn && menuPanel) {

    menu.classList.add('is-enhanced');

    // Estado inicial: menú cerrado
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');

    // Función para abrir o cerrar el menú
    function toggleMenu() {

        const isOpen = menu.classList.toggle('is-open');

        menuBtn.setAttribute('aria-expanded', String(isOpen));

        menuBtn.setAttribute(
            'aria-label',
            isOpen ? 'Cerrar menú' : 'Abrir menú'
        );

    }

    // Función para cerrar el menú
    function closeMenu() {

        menu.classList.remove('is-open');

        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Abrir menú');

    }

    // Clic en botón hamburguesa
    menuBtn.addEventListener('click', toggleMenu);

    // Clic en los enlaces
    menuLinks.forEach(link => {

        link.addEventListener('click', () => {

            closeMenu();

        });

    });

    // Cerrar al pulsar Escape
    document.addEventListener('keydown', (event) => {

        if (event.key === 'Escape' && menu.classList.contains('is-open')) {

            closeMenu();
            menuBtn.focus();

        }

    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (event) => {

        if (!menu.contains(event.target)) {

            closeMenu();

        }

    });

}

/* OCULTAR INTRO UNA SOLA VEZ */

const heroIntro = document.querySelector('.Hero-intro');

function ocultarIntro() {
    if (window.scrollY > 100 && heroIntro) {
        heroIntro.classList.add('is-hidden');

        // Dejar de escuchar el scroll
        window.removeEventListener('scroll', ocultarIntro);
    }
}

window.addEventListener('scroll', ocultarIntro, { passive: true });
