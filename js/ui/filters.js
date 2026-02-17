/**
 * @fileoverview Filtro de productos por categoría.
 *
 * Responsabilidad única: mostrar/ocultar tarjetas de producto
 * según el filtro seleccionado y gestionar la animación de entrada.
 */

import { SELECTORS, CSS_CLASSES, UI } from '../config.js';

/**
 * Inyecta la animación `fadeInUp` una sola vez en el documento.
 * Evita duplicados comprobando si ya existe.
 */
function injectFilterAnimation() {
  if (document.getElementById('filter-animation')) return;

  const style = document.createElement('style');
  style.id = 'filter-animation';
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Marca un botón como activo y desactiva los demás.
 *
 * @param {NodeList} buttons   - Todos los botones de filtro.
 * @param {HTMLElement} active - El botón que se acaba de pulsar.
 */
function setActiveButton(buttons, active) {
  buttons.forEach((btn) => btn.classList.remove(CSS_CLASSES.ACTIVE));
  active.classList.add(CSS_CLASSES.ACTIVE);
}

/**
 * Determina si una tarjeta debe mostrarse según el filtro actual.
 *
 * @param {string} filter   - Categoría seleccionada (o 'todos').
 * @param {string} category - Categoría de la tarjeta (data-category).
 * @returns {boolean}
 */
function shouldShowCard(filter, category) {
  return filter === UI.FILTER_ALL || category === filter;
}

/**
 * Muestra u oculta tarjetas de producto y aplica la animación de entrada.
 *
 * @param {NodeList} cards  - Todas las tarjetas de producto.
 * @param {string}   filter - Categoría a mostrar.
 */
function applyFilter(cards, filter) {
  cards.forEach((card) => {
    const show = shouldShowCard(filter, card.dataset.category);

    if (show) {
      card.classList.remove(CSS_CLASSES.HIDDEN);
      card.style.animation = 'fadeInUp 0.4s ease forwards';
    } else {
      card.classList.add(CSS_CLASSES.HIDDEN);
    }
  });
}

/**
 * Inicializa los filtros de productos.
 * Conecta los botones de filtro con la lógica de mostrar/ocultar tarjetas.
 */
export function initProductFilters() {
  const buttons = document.querySelectorAll(SELECTORS.FILTER_BTN);
  const cards = document.querySelectorAll(SELECTORS.PRODUCT_CARD);
  if (!buttons.length || !cards.length) return;

  injectFilterAnimation();

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveButton(buttons, btn);
      applyFilter(cards, btn.dataset.filter);
    });
  });
}
