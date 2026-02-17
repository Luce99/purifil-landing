/**
 * @fileoverview Comportamiento del header al hacer scroll.
 *
 * Responsabilidad única: agregar/quitar la clase `scrolled` según
 * la posición vertical de la ventana.
 */

import { SELECTORS, CSS_CLASSES, UI } from '../config.js';

/**
 * Alterna la clase CSS del header cuando el usuario pasa cierto umbral de scroll.
 *
 * @param {HTMLElement} header - Elemento del header.
 */
function toggleHeaderShadow(header) {
  header.classList.toggle(CSS_CLASSES.SCROLLED, window.scrollY > UI.SCROLL_OFFSET);
}

/**
 * Inicializa el efecto de sombra/fondo del header al hacer scroll.
 * Registra un listener pasivo para mejor rendimiento.
 */
export function initHeader() {
  const header = document.querySelector(SELECTORS.HEADER);
  if (!header) return;

  const onScroll = () => toggleHeaderShadow(header);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
