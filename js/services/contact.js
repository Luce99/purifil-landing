/**
 * @fileoverview Servicio de contacto — lectura de configuración desde Firestore.
 *
 * Lee el documento `config/contact` de Firestore y aplica los datos
 * de contacto (WhatsApp, teléfonos, email, nombre) en todo el sitio.
 * Si Firestore no está disponible, se usan los valores de config.js como fallback.
 */

import { db } from '../firebase/config.js';
import {
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { CONTACT } from '../config.js';

const CONTACT_DOC_PATH = 'config/contact';

/**
 * Lee la configuración de contacto desde Firestore.
 * Retorna los datos del documento o null si no existe.
 *
 * @returns {Promise<Object|null>}
 */
export async function getContactConfig() {
  try {
    const snap = await getDoc(doc(db, CONTACT_DOC_PATH));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.warn('[Purifil] No se pudo leer config de contacto, usando fallback:', error.message);
    return null;
  }
}

/**
 * Aplica la configuración de contacto al DOM.
 * Actualiza el objeto CONTACT global y re-renderiza los elementos
 * que muestran información de contacto.
 */
export async function applyContactConfig() {
  const config = await getContactConfig();
  if (!config) return;

  if (config.whatsappNumber) {
    CONTACT.WHATSAPP_NUMBER = config.whatsappNumber;
  }

  const contactItems = document.querySelectorAll('.contact__item');
  contactItems.forEach((item) => {
    const icon = item.querySelector('i');
    if (!icon) return;

    const textSpan = item.querySelector('span');
    if (!textSpan) return;

    if (icon.classList.contains('fa-phone') && config.phones) {
      textSpan.textContent = config.phones;
    }
    if (icon.classList.contains('fa-whatsapp') && config.whatsappDisplay) {
      textSpan.textContent = config.whatsappDisplay;
    }
    if (icon.classList.contains('fa-envelope') && config.email) {
      textSpan.textContent = config.email;
    }
  });

  if (config.name) {
    const aboutTitle = document.querySelector('.about__content .section-title');
    if (aboutTitle) aboutTitle.textContent = config.name;
  }
}
