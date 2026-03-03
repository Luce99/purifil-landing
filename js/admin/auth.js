/**
 * @fileoverview Autenticación del panel de administración.
 *
 * Maneja login/logout, recuperación de contraseña y cambio de contraseña
 * con Firebase Auth.
 */

import { auth } from '../firebase/config.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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

// ─── Login ─────────────────────────────────────────────────

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

// ─── Recuperar contraseña ──────────────────────────────────

document.getElementById('forgotPasswordBtn').addEventListener('click', async () => {
  const forgotSuccess = document.getElementById('forgotSuccess');
  const emailInput = document.getElementById('email');
  forgotSuccess.textContent = '';
  loginError.textContent = '';

  const email = emailInput.value.trim();
  if (!email) {
    loginError.textContent = 'Escribe tu correo arriba y luego haz clic aquí.';
    emailInput.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    forgotSuccess.textContent = `Correo de recuperación enviado a ${email}. Revisa tu bandeja de entrada.`;
  } catch (err) {
    const messages = {
      'auth/user-not-found': 'No existe una cuenta con este correo.',
      'auth/invalid-email': 'El correo no es válido.',
    };
    loginError.textContent = messages[err.code] || `Error: ${err.message}`;
  }
});

// ─── Cambiar contraseña ────────────────────────────────────

const changePasswordForm = document.getElementById('changePasswordForm');
const changePasswordError = document.getElementById('changePasswordError');
const changePasswordSuccess = document.getElementById('changePasswordSuccess');

changePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  changePasswordError.textContent = '';
  changePasswordSuccess.textContent = '';

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    changePasswordError.textContent = 'La nueva contraseña y la confirmación no coinciden.';
    return;
  }

  if (newPassword.length < 6) {
    changePasswordError.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
    return;
  }

  const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    changePasswordSuccess.textContent = 'Contraseña actualizada correctamente.';
    changePasswordForm.reset();
    setTimeout(() => { changePasswordSuccess.textContent = ''; }, 4000);
  } catch (err) {
    const messages = {
      'auth/wrong-password': 'La contraseña actual es incorrecta.',
      'auth/invalid-credential': 'La contraseña actual es incorrecta.',
      'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
      'auth/weak-password': 'La nueva contraseña es demasiado débil.',
      'auth/requires-recent-login': 'Sesión expirada. Cierra sesión e inicia de nuevo.',
    };
    changePasswordError.textContent = messages[err.code] || `Error: ${err.message}`;
  } finally {
    submitBtn.disabled = false;
  }
});
