/**
 * @fileoverview Punto de entrada de la aplicación Purifil Landing Page.
 *
 * Orquesta la carga de datos desde Firestore y la inicialización
 * de todos los módulos de la UI y servicios.
 *
 * Flujo:
 *   1. Carga datos dinámicos (productos, banners, contacto) desde Firestore.
 *   2. Inicializa módulos de UI que dependen del DOM ya poblado.
 */

import { renderProducts } from './services/products.js';
import { renderBanners } from './services/banners.js';
import { applyContactConfig } from './services/contact.js';
import { initWhatsAppLinks } from './services/whatsapp.js';
import { initHeader } from './ui/header.js';
import { initCarousel } from './ui/carousel.js';
import { initMediaTabs } from './ui/media-tabs.js';
import { initMobileMenu, initActiveNavLink, initSmoothScroll } from './ui/navigation.js';
import { initProductFilters } from './ui/filters.js';
import { initScrollAnimations } from './ui/animations.js';

const UI_MODULES = [
  { name: 'WhatsApp Links', init: initWhatsAppLinks },
  { name: 'Header', init: initHeader },
  { name: 'Hero Carousel', init: initCarousel },
  { name: 'Mobile Menu', init: initMobileMenu },
  { name: 'Smooth Scroll', init: initSmoothScroll },
  { name: 'Active Nav', init: initActiveNavLink },
  { name: 'Product Filters', init: initProductFilters },
  { name: 'Media Tabs', init: initMediaTabs },
  { name: 'Scroll Animations', init: initScrollAnimations },
];

function initModule({ name, init }) {
  try {
    init();
  } catch (error) {
    console.error(`[Purifil] Error al inicializar "${name}":`, error);
  }
}

async function bootstrap() {
  await Promise.all([
    applyContactConfig(),
    renderProducts('#productsGrid', 'productos'),
    renderProducts('#filtracionGrid', 'filtracion'),
    renderBanners('#heroCarousel'),
  ]);

  UI_MODULES.forEach(initModule);
}

document.addEventListener('DOMContentLoaded', bootstrap);
