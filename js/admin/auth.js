/**
 * @fileoverview Autenticación del panel de administración.
 *
 * Maneja login/logout con Firebase Auth y controla la visibilidad
 * de las secciones login vs admin.
 */

import { auth } from '../firebase/config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');

function showLogin() {
  loginSection.style.display = '';
  adminSection.style.display = 'none';
}

function showAdmin(user) {
  loginSection.style.display = 'none';
  adminSection.style.display = '';
  userEmail.textContent = user.email;

  window.dispatchEvent(new CustomEvent('admin:ready'));
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    showAdmin(user);
  } else {
    showLogin();
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    const messages = {
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/user-not-found': 'No existe una cuenta con este correo.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
      'auth/invalid-email': 'El correo no es válido.',
    };
    loginError.textContent = messages[err.code] || `Error: ${err.message}`;
  } finally {
    loginBtn.disabled = false;
  }
});

logoutBtn.addEventListener('click', () => signOut(auth));
