/**
 * @fileoverview Navegación: menú móvil y enlace activo por scroll.
 *
 * Responsabilidad única: gestionar la apertura/cierre del menú hamburguesa
 * y resaltar la sección visible en la barra de navegación.
 */

import { SELECTORS, CSS_CLASSES, UI } from '../config.js';

/**
 * Alterna el estado del menú móvil y el bloqueo del body.
 *
 * @param {HTMLElement} toggle - Botón hamburguesa.
 * @param {HTMLElement} nav    - Contenedor del menú de navegación.
 */
function toggleMenu(toggle, nav) {
  toggle.classList.toggle(CSS_CLASSES.ACTIVE);
  nav.classList.toggle(CSS_CLASSES.OPEN);

  const isOpen = nav.classList.contains(CSS_CLASSES.OPEN);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

/**
 * Cierra el menú móvil si está abierto.
 *
 * @param {HTMLElement} toggle - Botón hamburguesa.
 * @param {HTMLElement} nav    - Contenedor del menú de navegación.
 */
function closeMenu(toggle, nav) {
  toggle.classList.remove(CSS_CLASSES.ACTIVE);
  nav.classList.remove(CSS_CLASSES.OPEN);
  document.body.style.overflow = '';
}

/**
 * Inicializa el menú hamburguesa para pantallas pequeñas.
 * Al pulsar un enlace del menú, este se cierra automáticamente.
 */
export function initMobileMenu() {
  const toggle = document.querySelector(SELECTORS.MENU_TOGGLE);
  const nav = document.querySelector(SELECTORS.NAV);
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => toggleMenu(toggle, nav));

  nav.querySelectorAll(SELECTORS.NAV_LINK).forEach((link) => {
    link.addEventListener('click', () => closeMenu(toggle, nav));
  });
}

/**
 * Resalta el enlace de navegación correspondiente a la sección visible.
 * Usa un listener de scroll pasivo para no afectar el rendimiento.
 */
export function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll(SELECTORS.NAV_LINK);
  if (!sections.length || !navLinks.length) return;

  /** @param {Element} activeLink - Enlace a marcar como activo. */
  const setActive = (activeLink) => {
    navLinks.forEach((l) => l.classList.remove(CSS_CLASSES.ACTIVE));
    activeLink.classList.add(CSS_CLASSES.ACTIVE);
  };

  const onScroll = () => {
    const scrollPos = window.scrollY + UI.NAV_SCROLL_OFFSET;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        const id = section.getAttribute('id');
        const match = [...navLinks].find((l) => l.getAttribute('href') === `#${id}`);
        if (match) setActive(match);
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Inicializa el smooth-scroll para todos los anchor links internos.
 */
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
