/**
 * @fileoverview Animaciones de aparición al hacer scroll.
 *
 * Responsabilidad única: observar elementos y aplicar la transición
 * fade-in cuando entran en el viewport, usando Intersection Observer.
 */

import { SELECTORS, CSS_CLASSES, UI } from '../config.js';

/**
 * Crea un IntersectionObserver configurado para agregar la clase `visible`
 * a los elementos cuando aparecen en pantalla.
 *
 * @returns {IntersectionObserver} Observer listo para usar.
 */
function createScrollObserver() {
  return new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(CSS_CLASSES.VISIBLE);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: UI.OBSERVER_THRESHOLD,
      rootMargin: UI.OBSERVER_ROOT_MARGIN,
    }
  );
}

/**
 * Prepara un elemento para la animación fade-in.
 *
 * @param {HTMLElement} element - Elemento a preparar.
 */
function prepareElement(element) {
  element.classList.add(CSS_CLASSES.FADE_IN);
}

/**
 * Inicializa las animaciones de scroll en todos los elementos
 * definidos en la configuración de selectores animados.
 */
export function initScrollAnimations() {
  const elements = document.querySelectorAll(SELECTORS.ANIMATED_ELEMENTS);
  if (!elements.length) return;

  elements.forEach(prepareElement);

  const observer = createScrollObserver();
  elements.forEach((el) => observer.observe(el));
}
