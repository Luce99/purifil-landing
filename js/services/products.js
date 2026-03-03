/**
 * @fileoverview Servicio de productos — lectura desde Firestore y renderizado.
 *
 * Reemplaza los productos hardcodeados en el HTML. Lee la colección
 * `products` de Firestore y genera las tarjetas `.product-card`
 * con el mismo markup que el diseño original.
 */

import { db } from '../firebase/config.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const PRODUCTS_COLLECTION = 'products';

/**
 * Lee productos activos de Firestore filtrados por sección.
 *
 * @param {string} section - 'productos' o 'filtracion'
 * @returns {Promise<Array<Object>>} Lista de productos ordenados.
 */
export async function getProducts(section = 'productos') {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('active', '==', true),
    where('section', '==', section),
    orderBy('order'),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Genera el HTML de una feature individual.
 * @param {string} text
 * @returns {string}
 */
function featureHTML(text) {
  return `<span><i class="fas fa-check-circle"></i> ${text}</span>`;
}

/**
 * Genera el HTML de una tarjeta de producto.
 * Soporta badge, video, y la estructura media-tabs para productos con video.
 *
 * @param {Object} product - Documento de Firestore.
 * @returns {string} HTML de la tarjeta.
 */
function productCardHTML(product) {
  const badge = product.badge
    ? `<div class="product-card__badge">${product.badge}</div>`
    : '';

  const features = (product.features || []).map(featureHTML).join('\n            ');

  const categoryLabel = {
    agua: 'Purificador de Agua',
    aire: 'Purificador de Aire',
    cocina: 'Utensilios de Cocina',
    filtracion: 'Sistema de Filtración',
  }[product.category] || product.category;

  const hasVideo = product.video;
  const featured = hasVideo ? ' product-card--featured' : '';

  let mediaBlock;
  if (hasVideo) {
    mediaBlock = `
          <div class="product-card__media">
            <div class="product-card__media-tabs">
              <button class="media-tab active" data-media="image" aria-label="Ver imagen">
                <i class="fas fa-image"></i> Foto
              </button>
              <button class="media-tab" data-media="video" aria-label="Ver video">
                <i class="fas fa-play-circle"></i> Video
              </button>
            </div>
            <div class="product-card__image media-content active" data-content="image">
              <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-card__video media-content" data-content="video">
              <video src="${product.video}" controls preload="metadata" poster="${product.image}">
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>`;
  } else {
    mediaBlock = `
          <div class="product-card__image">
            <img src="${product.image}" alt="${product.title}" loading="lazy">
          </div>`;
  }

  return `
        <div class="product-card${featured}" data-category="${product.category}">
          ${badge}
          ${mediaBlock}
          <div class="product-card__body">
            <span class="product-card__category">${categoryLabel}</span>
            <h3 class="product-card__title">${product.title}</h3>
            <p class="product-card__desc">${product.description}</p>
            <div class="product-card__features">
              ${features}
            </div>
            <a href="#" data-wa-link data-wa-product="${product.whatsappProduct || product.title}" class="btn btn--whatsapp btn--full">
              <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
            </a>
          </div>
        </div>`;
}

/**
 * Renderiza productos en un contenedor del DOM.
 *
 * @param {string} containerSelector - Selector CSS del contenedor.
 * @param {string} section - 'productos' o 'filtracion'
 */
export async function renderProducts(containerSelector, section = 'productos') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  try {
    const products = await getProducts(section);

    if (products.length === 0) {
      container.innerHTML = '<p class="products__empty">No hay productos disponibles en este momento.</p>';
      return;
    }

    container.innerHTML = products.map(productCardHTML).join('');
  } catch (error) {
    console.error('[Purifil] Error al cargar productos:', error);
    container.innerHTML = '<p class="products__error">Error al cargar los productos. Intenta recargar la página.</p>';
  }
}
