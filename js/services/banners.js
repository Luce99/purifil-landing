/**
 * @fileoverview Servicio de banners — lectura desde Firestore y renderizado.
 *
 * Lee la colección `banners` y genera las slides del carrusel hero
 * con dots y controles de navegación.
 */

import { db } from '../firebase/config.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const BANNERS_COLLECTION = 'banners';

/**
 * Lee banners activos de Firestore, ordenados por `order`.
 * @returns {Promise<Array<Object>>}
 */
export async function getBanners() {
  const q = query(
    collection(db, BANNERS_COLLECTION),
    where('active', '==', true),
    orderBy('order'),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Renderiza los banners dentro del carrusel hero.
 *
 * @param {string} carouselSelector - Selector del contenedor del carrusel.
 */
export async function renderBanners(carouselSelector = '#heroCarousel') {
  const carousel = document.querySelector(carouselSelector);
  if (!carousel) return;

  try {
    const banners = await getBanners();

    if (banners.length === 0) return;

    const track = carousel.querySelector('.carousel__track');
    const dotsContainer = carousel.querySelector('.carousel__dots');

    if (!track || !dotsContainer) return;

    track.innerHTML = banners
      .map(
        (banner, i) => `
      <div class="carousel__slide${i === 0 ? ' active' : ''}">
        <img src="${banner.image}" alt="${banner.alt || ''}" loading="${i === 0 ? 'eager' : 'lazy'}">
      </div>`,
      )
      .join('');

    dotsContainer.innerHTML = banners
      .map(
        (_, i) =>
          `<button class="carousel__dot${i === 0 ? ' active' : ''}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>`,
      )
      .join('');
  } catch (error) {
    console.error('[Purifil] Error al cargar banners:', error);
  }
}
