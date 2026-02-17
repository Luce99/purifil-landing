# Purifil Internacional – Landing Page

Landing page para **Purifil Internacional**, empresa colombiana especializada en purificadores de agua, aire y utensilios de cocina premium. El objetivo principal es mostrar el catálogo de productos y dirigir a los usuarios a contactar por **WhatsApp**.

---

## Características

- Catálogo de productos con filtros por categoría (agua, aire, cocina)
- Botón flotante de WhatsApp siempre visible
- Cada producto redirige a WhatsApp con un mensaje personalizado
- Diseño responsivo (móvil, tablet, desktop)
- Animaciones suaves al hacer scroll (Intersection Observer)
- Sección de testimonios corporativos
- Información de contacto completa con mapa
- Sin dependencias de frameworks — HTML + CSS + JS vanilla (ES Modules)
- Optimizado para GitHub Pages

---

## Estructura del Proyecto

```
Purifil/
├── index.html                  # Página principal
├── css/
│   └── styles.css              # Estilos (Custom Properties, Grid, Flexbox)
├── js/
│   ├── config.js               # Configuración centralizada (número WA, mensajes, selectores)
│   ├── app.js                  # Orquestador: inicializa todos los módulos
│   ├── services/
│   │   └── whatsapp.js         # Servicio de WhatsApp (construye URLs desde config)
│   └── ui/
│       ├── header.js           # Efecto de sombra al hacer scroll
│       ├── navigation.js       # Menú móvil, navegación activa, smooth scroll
│       ├── filters.js          # Filtros de productos por categoría
│       └── animations.js       # Animaciones de aparición (Intersection Observer)
├── img/                        # Imágenes locales (si se agregan)
├── .gitignore
└── README.md
```

---

## Principios de Diseño del Código

### DRY (Don't Repeat Yourself)
- El número de WhatsApp se define **una sola vez** en `js/config.js`.
- En el HTML, los enlaces usan `data-wa-link` + `data-wa-product` o `data-wa-message`.
- El servicio `whatsapp.js` genera las URLs automáticamente al cargar la página.
- **Para cambiar el número, solo se modifica `config.js`.** Cero riesgo de error humano.

### SOLID
- **S – Responsabilidad Única**: cada archivo JS tiene una sola responsabilidad.
  - `whatsapp.js` → solo construye URLs y vincula al DOM.
  - `header.js` → solo gestiona la sombra del header.
  - `filters.js` → solo filtra productos.
  - `animations.js` → solo anima elementos al hacer scroll.
- **O – Abierto/Cerrado**: se pueden agregar nuevos módulos UI sin modificar `app.js` (solo agregar a la lista).
- **D – Inversión de Dependencias**: los módulos dependen de la configuración abstracta (`config.js`), no de valores hardcodeados.

### Métodos Pequeños y Documentados
- Cada función pública tiene documentación JSDoc.
- Los métodos son cortos y con nombre descriptivo.
- Se favorecen helpers privados pequeños sobre funciones largas.

---

## ¿Cómo cambiar el número de WhatsApp?

Edita **únicamente** el archivo `js/config.js`:

```javascript
export const CONTACT = Object.freeze({
  WHATSAPP_NUMBER: '573153855543',  // ← Cambia solo aquí
  // ...
});
```

Todos los enlaces de la página se actualizarán automáticamente.

---

## ¿Cómo agregar un nuevo producto?

1. Agrega una nueva tarjeta en `index.html` dentro de `#productsGrid`.
2. Usa el atributo `data-wa-product` con el nombre del producto:

```html
<a href="#" data-wa-link data-wa-product="Nombre del Producto"
   class="btn btn--whatsapp btn--full">
  <i class="fab fa-whatsapp"></i> Comprar por WhatsApp
</a>
```

No necesitas escribir el número de teléfono ni la URL completa.

---

## Tecnologías

| Tecnología       | Uso                                           |
|------------------|-----------------------------------------------|
| HTML5            | Estructura semántica                          |
| CSS3             | Custom Properties, Grid, Flexbox, animaciones |
| JavaScript ES6+  | Módulos ES, Intersection Observer, JSDoc      |
| Google Fonts     | Inter, Playfair Display                       |
| Font Awesome 6   | Iconografía                                   |

---

## Despliegue en GitHub Pages

1. Sube el código a un repositorio en GitHub.
2. Ve a **Settings → Pages**.
3. Selecciona la rama `main` y carpeta `/ (root)`.
4. El sitio estará disponible en `https://<usuario>.github.io/<repo>/`.

---

## Desarrollo Local

Abre `index.html` con un servidor local (necesario para ES Modules):

```bash
# Con Python
python3 -m http.server 8000

# Con Node.js
npx serve .
```

Luego abre `http://localhost:8000` en tu navegador.

> **Nota:** Abrir el archivo directamente (`file://`) no funcionará debido a las restricciones CORS de ES Modules.

---

## Contacto

- **WhatsApp:** +57 315 385 5543
- **Email:** telemercadeo@purifilinternacional.com
- **Web oficial:** [purifil.net](https://purifil.net)

---

## Licencia

Proyecto privado – Purifil Internacional © 2026
