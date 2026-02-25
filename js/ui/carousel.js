/**
 * @fileoverview Carrusel de imágenes para la sección hero.
 *
 * Implementa un carrusel tipo fade con auto-play, controles
 * prev/next, indicadores (dots) y soporte para touch/swipe.
 */

const CAROUSEL_SELECTOR = '#heroCarousel';
const SLIDE_SELECTOR = '.carousel__slide';
const DOT_SELECTOR = '.carousel__dot';
const BTN_PREV_SELECTOR = '.carousel__btn--prev';
const BTN_NEXT_SELECTOR = '.carousel__btn--next';
const ACTIVE_CLASS = 'active';
const AUTOPLAY_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

/**
 * Inicializa el carrusel del hero si existe en el DOM.
 */
export function initCarousel() {
  const carousel = document.querySelector(CAROUSEL_SELECTOR);
  if (!carousel) return;

  const slides = carousel.querySelectorAll(SLIDE_SELECTOR);
  const dots = carousel.querySelectorAll(DOT_SELECTOR);
  const btnPrev = carousel.querySelector(BTN_PREV_SELECTOR);
  const btnNext = carousel.querySelector(BTN_NEXT_SELECTOR);

  if (slides.length === 0) return;

  let current = 0;
  let autoplayId = null;
  let touchStartX = 0;

  function goTo(index) {
    slides[current].classList.remove(ACTIVE_CLASS);
    dots[current]?.classList.remove(ACTIVE_CLASS);

    current = (index + slides.length) % slides.length;

    slides[current].classList.add(ACTIVE_CLASS);
    dots[current]?.classList.add(ACTIVE_CLASS);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(next, AUTOPLAY_INTERVAL_MS);
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  btnNext?.addEventListener('click', () => { next(); startAutoplay(); });
  btnPrev?.addEventListener('click', () => { prev(); startAutoplay(); });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.slide));
      startAutoplay();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      delta < 0 ? next() : prev();
    }
    startAutoplay();
  }, { passive: true });

  startAutoplay();
}
