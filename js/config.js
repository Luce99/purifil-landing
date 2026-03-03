/**
 * @fileoverview Configuración centralizada de la aplicación.
 *
 * Fuente única de verdad (Single Source of Truth) para todos los datos
 * de contacto, WhatsApp, selectores del DOM y textos reutilizables.
 *
 * Para cambiar el número de WhatsApp o los mensajes, modifica SOLO este archivo.
 */

/** Datos de contacto de la asesora (mutable para que Firestore pueda sobreescribirlos) */
export const CONTACT = {
  WHATSAPP_NUMBER: '573153855543',
  PHONE_MAIN: '+576016164645',
  EMAIL: 'telemercadeo@purifilinternacional.com',
  ADVISOR_NAME: 'Diana Grisales',
};

/** Configuración de mensajes predefinidos para WhatsApp */
export const WHATSAPP_MESSAGES = Object.freeze({
  DEFAULT: 'Hola Diana, me interesan los productos Purifil',
  PRODUCT_INQUIRY: 'Hola Diana, me interesa el producto: ',
  ADVISOR: 'Hola Diana, quiero recibir asesoría sobre productos Purifil',
  ABOUT: 'Hola Diana, quiero saber más sobre los productos Purifil',
  GENERAL: 'Hola Diana, me interesa conocer más sobre los productos Purifil',
});

/** Selectores del DOM usados en toda la aplicación */
export const SELECTORS = Object.freeze({
  HEADER: '#header',
  NAV: '#nav',
  MENU_TOGGLE: '#menuToggle',
  PRODUCTS_GRID: '#productsGrid',
  WA_LINK: '[data-wa-link]',
  FILTER_BTN: '.filter-btn',
  PRODUCT_CARD: '.product-card',
  NAV_LINK: '.nav__link',
  ANIMATED_ELEMENTS: [
    '.category-card',
    '.product-card',
    '.benefit-card',
    '.testimonial-card',
    '.about__image',
    '.about__content',
    '.contact__info',
    '.contact__map',
    '.section-header',
  ].join(', '),
});

/** Clases CSS reutilizadas en JS */
export const CSS_CLASSES = Object.freeze({
  ACTIVE: 'active',
  OPEN: 'open',
  HIDDEN: 'hidden',
  SCROLLED: 'scrolled',
  FADE_IN: 'fade-in',
  VISIBLE: 'visible',
});

/** Umbrales y valores numéricos de la UI */
export const UI = Object.freeze({
  SCROLL_OFFSET: 20,
  NAV_SCROLL_OFFSET: 100,
  OBSERVER_THRESHOLD: 0.1,
  OBSERVER_ROOT_MARGIN: '0px 0px -40px 0px',
  FILTER_ALL: 'todos',
});
