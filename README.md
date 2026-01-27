# 🎬 TV Tracker - Buscador y Gestor de Series & Películas

¡Bienvenido a **TV Tracker**! Una Single Page Application (SPA) desarrollada con **JavaScript Vanilla** que te permite explorar el catálogo de TMDB, filtrar entre cine y series, y gestionar tu biblioteca personal.

🔗 **[VER PROYECTO ONLINE AQUÍ](https://flopypalma-16-11.github.io/tv-tracker-portfolio/)**

<<<<<<< HEAD

=======

> > > > > > > 496fadd4d2622bb4b46a991e435fac3b1f945ede

## 🚀 Funcionalidades Principales

- **🔍 Buscador Híbrido:** Conexión a la API de TMDB para buscar tanto **Series** como **Películas** en tiempo real.
- **⚡ Filtros Inteligentes:** Clasifica los resultados al instante: "Todo", "Solo Series" o "Solo Películas".
- **💾 Persistencia de Datos:** Tus favoritos se guardan en el navegador (`localStorage`), así que no los pierdes al cerrar la pestaña.
- **✅ Gestión de Capítulos:** Sistema para marcar episodios vistos en tus series guardadas.
- **🎨 UI "Netflix Style":** Diseño moderno en modo oscuro, con maquetación **CSS Grid** y **Flexbox** totalmente responsiva (móvil y escritorio).
- **📂 Modal de Detalles:** Ventana emergente con información detallada, temporadas y gestión de episodios.

## 🛠️ Tecnologías Utilizadas

- **Lenguaje:** JavaScript (ES6+) - _Sin frameworks, puro Vanilla JS._
- **Asincronía:** Uso de `async/await` y `fetch` para el consumo de APIs.
- **Maquetación:** HTML5 & CSS3 (Variables CSS, Media Queries).
- **Control de Versiones:** Git & GitHub (Manejo de ramas y conflictos).
- **API Externa:** [The Movie Database (TMDB)](https://www.themoviedb.org/).

## 💻 Instalación y Uso Local

Si quieres probar el código en tu ordenador:

1.  Clona el repositorio:
    ```bash
    git clone [https://github.com/flopypalma-16-11/tv-tracker-portfolio.git](https://github.com/flopypalma-16-11/tv-tracker-portfolio.git)
    ```
2.  Abre el archivo `index.html` en tu navegador.
3.  ¡Disfruta!

---

## 🚀 Retos y Aprendizajes (Challenges & Learnings)

Este proyecto ha sido mi gran escuela de JavaScript y Git. Durante el desarrollo me encontré con varios obstáculos técnicos que tuve que resolver:

### 1. Integración de Pasarela de Pago (Stripe)

- **El Problema:** Al principio intenté usar `stripe.redirectToCheckout` directamente en el frontend. La consola me devolvía errores de integración (`IntegrationError`) porque las cuentas nuevas de Stripe tienen restricciones de seguridad para integraciones "client-only".
- **La Solución:** Cambié la estrategia a **Stripe Payment Links**. Aprendí a pasar parámetros en la URL (`?redirect_url=...`) desde JavaScript para forzar que, tras el pago, el usuario sea redirigido automáticamente de vuelta a mi aplicación, mejorando la experiencia de usuario (UX).

### 2. Seguridad y Gestión de Claves

- **El Error:** Durante las pruebas, confundí la _Secret Key_ con la _Publishable Key_.
- **El Aprendizaje:** Entendí la importancia crítica de no exponer claves secretas (`sk_...`) en el frontend. Realicé la rotación de claves en el Dashboard de Stripe para asegurar la cuenta y limpié el código para usar solo enlaces públicos seguros.

### 3. Control de Versiones (Git)

- **El Reto:** Al trabajar entre varios archivos y hacer cambios rápidos, me encontré con conflictos de fusión (_Merge Conflicts_) en el `README.md`.
- **La Solución:** Aprendí a usar la interfaz de VS Code para comparar los cambios entrantes vs. locales, decidir con qué versión quedarme y resolver el conflicto manualmente antes de hacer el push final.

---

👩‍💻 **Autora:** Florencia Palma
_Desarrolladora de Aplicaciones Multiplataforma (DAM)._
_Construyendo y aprendiendo en público._ 🚀
