/**
 * @fileoverview Módulo de pestañas multimedia para tarjetas de producto.
 *
 * Permite alternar entre la vista de imagen y video dentro de una
 * tarjeta de producto, proporcionando una experiencia interactiva
 * sin recargar la página.
 */

import { SELECTORS } from '../config.js';

const MEDIA_TAB_SELECTOR = '.media-tab';
const MEDIA_CONTENT_SELECTOR = '.media-content';
const ACTIVE_CLASS = 'active';

/**
 * Maneja el cambio de pestaña de media dentro de una tarjeta de producto.
 *
 * @param {Event} event - Evento click en una pestaña.
 */
function handleTabClick(event) {
  const tab = event.currentTarget;
  const card = tab.closest('.product-card');
  if (!card) return;

  const targetMedia = tab.dataset.media;

  card.querySelectorAll(MEDIA_TAB_SELECTOR).forEach((t) => {
    t.classList.remove(ACTIVE_CLASS);
  });
  tab.classList.add(ACTIVE_CLASS);

  card.querySelectorAll(MEDIA_CONTENT_SELECTOR).forEach((content) => {
    content.classList.remove(ACTIVE_CLASS);
  });

  const targetContent = card.querySelector(`[data-content="${targetMedia}"]`);
  if (targetContent) {
    targetContent.classList.add(ACTIVE_CLASS);
  }

  if (targetMedia !== 'video') {
    const video = card.querySelector('video');
    if (video) {
      video.pause();
    }
  }
}

/**
 * Inicializa las pestañas de media en todas las tarjetas de producto.
 */
export function initMediaTabs() {
  document.querySelectorAll(MEDIA_TAB_SELECTOR).forEach((tab) => {
    tab.addEventListener('click', handleTabClick);
  });
}
