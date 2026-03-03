/**
 * @fileoverview Configuración e inicialización de Firebase.
 *
 * Usa imports desde CDN (compatible con ES Modules sin bundler).
 * Las credenciales del SDK web son públicas por diseño — la seguridad
 * la proveen las reglas de Firestore y Storage.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyA47JAQFboRMtMvvvAgtOtWMmBNA7Paz34',
  authDomain: 'purifil-landing.firebaseapp.com',
  projectId: 'purifil-landing',
  storageBucket: 'purifil-landing.firebasestorage.app',
  messagingSenderId: '1005864820542',
  appId: '1:1005864820542:web:c853b2e7f2ebc5001d166f',
  measurementId: 'G-VZKGX3BGJG',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
