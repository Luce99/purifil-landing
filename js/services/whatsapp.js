/**
 * @fileoverview Servicio de WhatsApp.
 *
 * Responsabilidad única: construir URLs de WhatsApp y vincularlas al DOM.
 * El número de teléfono se lee desde config.js (fuente única de verdad),
 * eliminando toda duplicación en el HTML.
 */

import { CONTACT, WHATSAPP_MESSAGES, SELECTORS } from '../config.js';

const WA_BASE_URL = 'https://wa.me/';

/**
 * Codifica un texto para incluirlo como parámetro `text` en una URL de WhatsApp.
 *
 * @param {string} message - Texto sin codificar.
 * @returns {string} Texto codificado para URL.
 */
function encodeMessage(message) {
  return encodeURIComponent(message);
}

/**
 * Genera la URL completa de WhatsApp con un mensaje opcional.
 *
 * @param {string} [message=''] - Mensaje pre-cargado en el chat.
 * @returns {string} URL lista para abrir en wa.me.
 */
export function buildWhatsAppUrl(message = '') {
  const base = `${WA_BASE_URL}${CONTACT.WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeMessage(message)}` : base;
}

/**
 * Resuelve el mensaje de WhatsApp a partir de los data-attributes de un elemento.
 *
 * Prioridad:
 *  1. `data-wa-product` → mensaje de consulta de producto.
 *  2. `data-wa-message` → mensaje personalizado literal.
 *  3. Fallback          → mensaje por defecto de la configuración.
 *
 * @param {HTMLElement} element - Elemento con data-attributes de WhatsApp.
 * @returns {string} Mensaje resuelto.
 */
function resolveMessage(element) {
  const product = element.dataset.waProduct;
  if (product) {
    return `${WHATSAPP_MESSAGES.PRODUCT_INQUIRY}${product}`;
  }

  return element.dataset.waMessage || WHATSAPP_MESSAGES.DEFAULT;
}

/**
 * Recorre todos los elementos marcados con `data-wa-link` y les asigna
 * el `href` correcto a partir de la configuración centralizada.
 *
 * Esto permite que el HTML no contenga el número de teléfono hardcodeado;
 * basta con poner `data-wa-link` y opcionalmente `data-wa-product` o
 * `data-wa-message` para personalizar el texto.
 */
export function initWhatsAppLinks() {
  const links = document.querySelectorAll(SELECTORS.WA_LINK);

  links.forEach((link) => {
    const message = resolveMessage(link);
    link.href = buildWhatsAppUrl(message);
    link.target = '_blank';
    link.rel = 'noopener';
  });
}
