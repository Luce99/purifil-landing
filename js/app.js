/**
 * @fileoverview Punto de entrada de la aplicación Purifil Landing Page.
 *
 * Orquesta la inicialización de todos los módulos de la UI y servicios.
 * Cada módulo tiene una responsabilidad única (SRP) y se importa
 * desde su archivo dedicado.
 *
 * Arquitectura:
 *   config.js              → Configuración centralizada (DRY)
 *   services/whatsapp.js   → Servicio de enlaces WhatsApp
 *   ui/header.js           → Comportamiento del header
 *   ui/navigation.js       → Menú móvil + navegación activa + smooth scroll
 *   ui/filters.js          → Filtros de productos por categoría
 *   ui/animations.js       → Animaciones de scroll (Intersection Observer)
 */

import { initWhatsAppLinks } from './services/whatsapp.js';
import { initHeader } from './ui/header.js';
import { initMediaTabs } from './ui/media-tabs.js';
import { initMobileMenu, initActiveNavLink, initSmoothScroll } from './ui/navigation.js';
import { initProductFilters } from './ui/filters.js';
import { initScrollAnimations } from './ui/animations.js';

/**
 * Lista ordenada de inicializadores.
 * El orden importa: WhatsApp se ejecuta primero para que los hrefs
 * estén listos antes de que el usuario pueda interactuar.
 *
 * @type {Array<{name: string, init: Function}>}
 */
const MODULES = [
  { name: 'WhatsApp Links', init: initWhatsAppLinks },
  { name: 'Header',         init: initHeader },
  { name: 'Mobile Menu',    init: initMobileMenu },
  { name: 'Smooth Scroll',  init: initSmoothScroll },
  { name: 'Active Nav',     init: initActiveNavLink },
  { name: 'Product Filters', init: initProductFilters },
  { name: 'Media Tabs',      init: initMediaTabs },
  { name: 'Scroll Animations', init: initScrollAnimations },
];

/**
 * Inicializa un módulo individual con manejo de errores.
 * Si un módulo falla, el resto continúa funcionando (resiliencia).
 *
 * @param {{name: string, init: Function}} module - Módulo a inicializar.
 */
function initModule({ name, init }) {
  try {
    init();
  } catch (error) {
    console.error(`[Purifil] Error al inicializar "${name}":`, error);
  }
}

/**
 * Inicializa toda la aplicación una vez que el DOM está listo.
 * Recorre la lista de módulos y los arranca de forma segura.
 */
function bootstrap() {
  MODULES.forEach(initModule);
}

document.addEventListener('DOMContentLoaded', bootstrap);
