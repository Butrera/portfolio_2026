
'use strict';

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
