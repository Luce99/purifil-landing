/**
 * @fileoverview Lógica principal del panel de administración.
 *
 * CRUD de productos, banners y configuración de contacto.
 * Incluye compresión automática de imágenes y manejo de errores
 * de cuota de Firebase Storage.
 */

import { db, storage } from '../firebase/config.js';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

const MAX_IMAGE_WIDTH = 800;
const IMAGE_QUALITY = 0.8;
const STORAGE_QUOTA_ERROR = 'storage/quota-exceeded';
const STORAGE_QUOTA_MSG =
  'No hay espacio de almacenamiento disponible. Elimina imágenes de productos que ya no uses o reduce el tamaño de las imágenes antes de subirlas.';

// ─── Utilidades ────────────────────────────────────────────

/**
 * Comprime una imagen del lado del cliente antes de subirla.
 * Redimensiona a MAX_IMAGE_WIDTH manteniendo proporción y comprime a JPEG.
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_IMAGE_WIDTH) {
        height = Math.round((height * MAX_IMAGE_WIDTH) / width);
        width = MAX_IMAGE_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
          } else {
            reject(new Error('Error al comprimir la imagen'));
          }
        },
        'image/jpeg',
        IMAGE_QUALITY,
      );
    };

    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = url;
  });
}

/**
 * Sube un archivo a Firebase Storage con manejo de cuota.
 * @returns {Promise<string>} URL de descarga.
 */
async function uploadFile(file, path) {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (err) {
    if (err.code === STORAGE_QUOTA_ERROR || err.code === 'storage/retry-limit-exceeded') {
      throw new Error(STORAGE_QUOTA_MSG);
    }
    throw err;
  }
}

/**
 * Extrae la ruta de Storage desde una URL de descarga de Firebase.
 * Las URLs tienen el formato: .../o/ENCODED_PATH?alt=media&token=...
 */
function extractStoragePath(url) {
  try {
    const match = url.match(/\/o\/(.+?)\?/);
    if (match) return decodeURIComponent(match[1]);
  } catch {
    // URL no válida
  }
  return null;
}

/**
 * Elimina un archivo de Storage por URL. Silencia errores si no existe.
 */
async function deleteFileByUrl(url) {
  if (!url || !url.includes('firebasestorage')) return;
  const path = extractStoragePath(url);
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // El archivo puede no existir si era una imagen local
  }
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearError(elementId) {
  showError(elementId, '');
}

// ─── Navegación del sidebar ────────────────────────────────

const sidebarLinks = document.querySelectorAll('.sidebar__link');
const sectionTitle = document.getElementById('sectionTitle');
const sectionNames = {
  products: 'Productos',
  banners: 'Banners',
  contact: 'Contacto',
};

sidebarLinks.forEach((link) => {
  link.addEventListener('click', () => {
    sidebarLinks.forEach((l) => l.classList.remove('active'));
    link.classList.add('active');

    const target = link.dataset.section;
    sectionTitle.textContent = sectionNames[target] || target;

    document.querySelectorAll('.content-section').forEach((s) => s.classList.remove('active'));
    document.getElementById(`sec-${target}`)?.classList.add('active');
  });
});

// ─── PRODUCTOS ─────────────────────────────────────────────

const productsList = document.getElementById('productsList');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const productModalTitle = document.getElementById('productModalTitle');
const prodImagePreview = document.getElementById('prodImagePreview');

function openProductModal(title = 'Nuevo Producto') {
  productModalTitle.textContent = title;
  productModal.classList.add('open');
  clearError('productError');
}

function closeProductModal() {
  productModal.classList.remove('open');
  productForm.reset();
  prodImagePreview.removeAttribute('src');
  prodImagePreview.style.display = 'none';
  document.getElementById('prodId').value = '';
}

document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
document.getElementById('cancelProductBtn').addEventListener('click', closeProductModal);
productModal.querySelector('.modal__overlay').addEventListener('click', closeProductModal);

document.getElementById('prodImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    prodImagePreview.src = URL.createObjectURL(file);
    prodImagePreview.style.display = 'block';
  }
});

async function loadProducts() {
  productsList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner"></i> Cargando...</div>';

  try {
    const q = query(collection(db, 'products'), orderBy('order'));
    const snap = await getDocs(q);

    if (snap.empty) {
      productsList.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No hay productos. Crea el primero.</p></div>';
      return;
    }

    productsList.innerHTML = snap.docs
      .map((d) => {
        const p = d.data();
        const badge = p.active
          ? '<span class="admin-card__badge admin-card__badge--active">Activo</span>'
          : '<span class="admin-card__badge admin-card__badge--inactive">Inactivo</span>';
        const img = p.image || '';
        return `
        <div class="admin-card" data-id="${d.id}">
          <img class="admin-card__img" src="${img}" alt="${p.title || ''}" onerror="this.style.display='none'">
          <div class="admin-card__info">
            <div class="admin-card__title">${p.title || 'Sin título'}</div>
            <div class="admin-card__meta">${p.category || ''} · ${p.section || ''} · Orden: ${p.order ?? 0} ${badge}</div>
          </div>
          <div class="admin-card__actions">
            <button class="btn btn--outline btn--sm edit-product" data-id="${d.id}"><i class="fas fa-pen"></i></button>
            <button class="btn btn--danger btn--sm delete-product" data-id="${d.id}" data-title="${p.title || ''}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      })
      .join('');

    productsList.querySelectorAll('.edit-product').forEach((btn) =>
      btn.addEventListener('click', () => editProduct(btn.dataset.id)),
    );
    productsList.querySelectorAll('.delete-product').forEach((btn) =>
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id, btn.dataset.title)),
    );
  } catch (err) {
    productsList.innerHTML = `<div class="empty-state"><p>Error al cargar productos: ${err.message}</p></div>`;
  }
}

async function editProduct(id) {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return;

  const p = snap.data();
  document.getElementById('prodId').value = id;
  document.getElementById('prodTitle').value = p.title || '';
  document.getElementById('prodCategory').value = p.category || 'agua';
  document.getElementById('prodSection').value = p.section || 'productos';
  document.getElementById('prodBadge').value = p.badge || '';
  document.getElementById('prodDesc').value = p.description || '';
  document.getElementById('prodFeatures').value = (p.features || []).join(', ');
  document.getElementById('prodWhatsapp').value = p.whatsappProduct || '';
  document.getElementById('prodOrder').value = p.order ?? 0;
  document.getElementById('prodActive').checked = p.active !== false;

  if (p.image) {
    prodImagePreview.src = p.image;
    prodImagePreview.style.display = 'block';
  }

  openProductModal('Editar Producto');
}

async function deleteProduct(id, title) {
  if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;

  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) {
      const data = snap.data();
      await deleteFileByUrl(data.image);
      if (data.video) await deleteFileByUrl(data.video);
    }
    await deleteDoc(doc(db, 'products', id));
    await loadProducts();
  } catch (err) {
    alert(`Error al eliminar: ${err.message}`);
  }
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError('productError');

  const saveBtn = document.getElementById('saveProductBtn');
  saveBtn.disabled = true;

  try {
    const id = document.getElementById('prodId').value;
    const imageFile = document.getElementById('prodImage').files[0];
    const videoFile = document.getElementById('prodVideo').files[0];

    const data = {
      title: document.getElementById('prodTitle').value.trim(),
      category: document.getElementById('prodCategory').value,
      section: document.getElementById('prodSection').value,
      badge: document.getElementById('prodBadge').value.trim() || null,
      description: document.getElementById('prodDesc').value.trim(),
      features: document.getElementById('prodFeatures').value
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      whatsappProduct: document.getElementById('prodWhatsapp').value.trim() || null,
      order: parseInt(document.getElementById('prodOrder').value, 10) || 0,
      active: document.getElementById('prodActive').checked,
    };

    if (imageFile) {
      const compressed = await compressImage(imageFile);
      const ts = Date.now();
      data.image = await uploadFile(compressed, `products/${ts}-${compressed.name}`);
    } else if (!id) {
      showError('productError', 'La imagen es obligatoria para un producto nuevo.');
      return;
    }

    if (videoFile) {
      const ts = Date.now();
      data.video = await uploadFile(videoFile, `products/videos/${ts}-${videoFile.name}`);
    }

    if (id) {
      await updateDoc(doc(db, 'products', id), data);
    } else {
      await addDoc(collection(db, 'products'), data);
    }

    closeProductModal();
    await loadProducts();
  } catch (err) {
    showError('productError', err.message);
  } finally {
    saveBtn.disabled = false;
  }
});

// ─── BANNERS ───────────────────────────────────────────────

const bannersList = document.getElementById('bannersList');
const bannerModal = document.getElementById('bannerModal');
const bannerForm = document.getElementById('bannerForm');
const bannerModalTitle = document.getElementById('bannerModalTitle');
const bannerImagePreview = document.getElementById('bannerImagePreview');

function openBannerModal(title = 'Nuevo Banner') {
  bannerModalTitle.textContent = title;
  bannerModal.classList.add('open');
  clearError('bannerError');
}

function closeBannerModal() {
  bannerModal.classList.remove('open');
  bannerForm.reset();
  bannerImagePreview.removeAttribute('src');
  bannerImagePreview.style.display = 'none';
  document.getElementById('bannerId').value = '';
}

document.getElementById('addBannerBtn').addEventListener('click', () => openBannerModal());
document.getElementById('closeBannerModal').addEventListener('click', closeBannerModal);
document.getElementById('cancelBannerBtn').addEventListener('click', closeBannerModal);
bannerModal.querySelector('.modal__overlay').addEventListener('click', closeBannerModal);

document.getElementById('bannerImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    bannerImagePreview.src = URL.createObjectURL(file);
    bannerImagePreview.style.display = 'block';
  }
});

async function loadBanners() {
  bannersList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner"></i> Cargando...</div>';

  try {
    const q = query(collection(db, 'banners'), orderBy('order'));
    const snap = await getDocs(q);

    if (snap.empty) {
      bannersList.innerHTML = '<div class="empty-state"><i class="fas fa-images"></i><p>No hay banners. Crea el primero.</p></div>';
      return;
    }

    bannersList.innerHTML = snap.docs
      .map((d) => {
        const b = d.data();
        const badge = b.active
          ? '<span class="admin-card__badge admin-card__badge--active">Activo</span>'
          : '<span class="admin-card__badge admin-card__badge--inactive">Inactivo</span>';
        return `
        <div class="admin-card" data-id="${d.id}">
          <img class="admin-card__img" src="${b.image || ''}" alt="${b.alt || ''}" onerror="this.style.display='none'">
          <div class="admin-card__info">
            <div class="admin-card__title">${b.alt || 'Banner sin descripción'}</div>
            <div class="admin-card__meta">Orden: ${b.order ?? 0} ${badge}</div>
          </div>
          <div class="admin-card__actions">
            <button class="btn btn--outline btn--sm edit-banner" data-id="${d.id}"><i class="fas fa-pen"></i></button>
            <button class="btn btn--danger btn--sm delete-banner" data-id="${d.id}" data-alt="${b.alt || 'este banner'}"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
      })
      .join('');

    bannersList.querySelectorAll('.edit-banner').forEach((btn) =>
      btn.addEventListener('click', () => editBanner(btn.dataset.id)),
    );
    bannersList.querySelectorAll('.delete-banner').forEach((btn) =>
      btn.addEventListener('click', () => deleteBanner(btn.dataset.id, btn.dataset.alt)),
    );
  } catch (err) {
    bannersList.innerHTML = `<div class="empty-state"><p>Error al cargar banners: ${err.message}</p></div>`;
  }
}

async function editBanner(id) {
  const snap = await getDoc(doc(db, 'banners', id));
  if (!snap.exists()) return;

  const b = snap.data();
  document.getElementById('bannerId').value = id;
  document.getElementById('bannerAlt').value = b.alt || '';
  document.getElementById('bannerOrder').value = b.order ?? 0;
  document.getElementById('bannerActive').checked = b.active !== false;

  if (b.image) {
    bannerImagePreview.src = b.image;
    bannerImagePreview.style.display = 'block';
  }

  openBannerModal('Editar Banner');
}

async function deleteBanner(id, alt) {
  if (!confirm(`¿Eliminar "${alt}"? Esta acción no se puede deshacer.`)) return;

  try {
    const snap = await getDoc(doc(db, 'banners', id));
    if (snap.exists()) {
      await deleteFileByUrl(snap.data().image);
    }
    await deleteDoc(doc(db, 'banners', id));
    await loadBanners();
  } catch (err) {
    alert(`Error al eliminar: ${err.message}`);
  }
}

bannerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError('bannerError');

  const saveBtn = document.getElementById('saveBannerBtn');
  saveBtn.disabled = true;

  try {
    const id = document.getElementById('bannerId').value;
    const imageFile = document.getElementById('bannerImage').files[0];

    const data = {
      alt: document.getElementById('bannerAlt').value.trim(),
      order: parseInt(document.getElementById('bannerOrder').value, 10) || 0,
      active: document.getElementById('bannerActive').checked,
    };

    if (imageFile) {
      const compressed = await compressImage(imageFile);
      const ts = Date.now();
      data.image = await uploadFile(compressed, `banners/${ts}-${compressed.name}`);
    } else if (!id) {
      showError('bannerError', 'La imagen es obligatoria para un banner nuevo.');
      return;
    }

    if (id) {
      await updateDoc(doc(db, 'banners', id), data);
    } else {
      await addDoc(collection(db, 'banners'), data);
    }

    closeBannerModal();
    await loadBanners();
  } catch (err) {
    showError('bannerError', err.message);
  } finally {
    saveBtn.disabled = false;
  }
});

// ─── CONTACTO ──────────────────────────────────────────────

const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');

async function loadContactConfig() {
  try {
    const snap = await getDoc(doc(db, 'config', 'contact'));
    if (!snap.exists()) return;

    const c = snap.data();
    document.getElementById('cfgName').value = c.name || '';
    document.getElementById('cfgWhatsapp').value = c.whatsappNumber || '';
    document.getElementById('cfgWhatsappDisplay').value = c.whatsappDisplay || '';
    document.getElementById('cfgPhones').value = c.phones || '';
    document.getElementById('cfgEmail').value = c.email || '';
  } catch (err) {
    console.error('Error cargando config de contacto:', err);
  }
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  contactSuccess.textContent = '';

  const data = {
    name: document.getElementById('cfgName').value.trim(),
    whatsappNumber: document.getElementById('cfgWhatsapp').value.trim(),
    whatsappDisplay: document.getElementById('cfgWhatsappDisplay').value.trim(),
    phones: document.getElementById('cfgPhones').value.trim(),
    email: document.getElementById('cfgEmail').value.trim(),
  };

  try {
    const docRef = doc(db, 'config', 'contact');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, data);
    } else {
      const { setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      await setDoc(docRef, data);
    }
    contactSuccess.textContent = 'Cambios guardados correctamente.';
    setTimeout(() => { contactSuccess.textContent = ''; }, 3000);
  } catch (err) {
    alert(`Error al guardar: ${err.message}`);
  }
});

// ─── Inicialización ────────────────────────────────────────

window.addEventListener('admin:ready', () => {
  loadProducts();
  loadBanners();
  loadContactConfig();
});
