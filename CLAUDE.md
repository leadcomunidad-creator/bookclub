# CLAUDE.md — BOOKCLUB

Guía para trabajar en este repositorio. Léela antes de tocar código.

## Qué es

BOOKCLUB es la biblioteca de El College: resúmenes de libros para leer con propósito. Mensaje central: «Libros que te acercan a Jesús.».

- Sitio estático: HTML, CSS y JS sin compilación ni dependencias de npm.
- Publicación: Netlify, sitio `bookclublhscol`, en https://bookclublhscol.netlify.app. Cada push a `main` se publica solo.
- Firebase, proyecto `stars-plus`: ingreso con Google (`signInWithPopup`) y sincronización en Firestore, en `usuarios/{uid}` → campo `bookclub`.
- Dueño: Juan (El College). Escríbele en español, con tuteo y sin tecnicismos innecesarios.

Estado actual: `estado.md`. Estado del diseño: `estado_diseño.md`.

## Mapa de archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Landing. Si hay sesión, abre `/biblioteca/` dentro de `#bookclub-app` (iframe). |
| `biblioteca/index.html` | App: Hoy · Descubrir · Biblioteca (Mi estante / Disponibles / Buscar) · Ideas. Solo funciona dentro del iframe; si se abre sola, redirige a `/`. |
| `libros.json` | Catálogo. Una ficha por libro (ver `INSTRUCCIONES_PROYECTO.md`). |
| `bookclub-firebase.js` | `window.BookclubSync`: `signInWithGoogle`, `signOut`, `setLibraryState`, `resetProgress`, `flush`, `ready`. Une y sincroniza el avance, el estante y las ideas. |
| `libros/<slug>-json.html` + `.json` | Página de lectura de cada libro. El contenido va en `reader.body_html`. |
| `libros/json-reader-engine.js` | Motor de lectura: páginas virtuales, avance, menú. Al final carga `lector-v3.js`. |
| `libros/lector-v3.js` | Capa del rediseño sobre el motor: tres zonas, barra superior, selección (Guardar idea · Nota · Compartir) y audio. |
| `libros/<slug>.html` | Resumen editorial original (referencia). La app no lo abre. |
| `sw.js` | Uso sin conexión. Guarda los archivos base y además todos los libros de `libros.json`. |
| `docs/rediseno/` | Plan del rediseño (4 fases), `GUIA_DE_MARCA.md`, `tokens.json` y el prototipo `prototipo/app.html`. |
| `INSTRUCCIONES_PROYECTO.md` | Cómo se crea y se publica un libro nuevo (v3.0). |

## Datos de las personas (no romper)

Viven en `localStorage` y se sincronizan con Firestore. **Nunca cambies estas claves ni su formato.**

- `bookclub-<…>-progreso`: avance de cada libro, `{ult, r, p:{pagina:ratio}, t, resetAt?}`. La clave exacta es `clave_progreso` en `libros.json`. Hay una excepción heredada en `SLUG_PROGRESO` (`gana-guerra`).
- `bookclub-biblioteca`: estante, `{ "<archivo>": {e:'porleer'|'leyendo'|'leido'|'no', t} }`. La llave es la ruta `archivo` del libro. `'no'` significa que la persona lo quitó.
- `bookclub-ideas`: lista de ideas `{id, libro, titulo, autor, q, n, pag, page, t, borrada?}`. Borrar = marcar `borrada:true` con un `t` nuevo, nunca eliminar.
- `bookclub-theme` (`dark`/`light`; sin valor = Noche), `bookclub-fuente` (0–3), `bookclub-audio-vel`, `bookclub-compromiso`, `bc-vista`, `bookclub-sesion-recordada`.

La app solo **lee** el avance. Los estados del estante se calculan igual que antes (`syncAuto`): avance > 0 → Leyendo, todas las páginas al 95 % → Leído.

## Reglas que no se negocian

1. **No modificar el contenido de los resúmenes** (`libros/*.html`, `libros/*-json.json`). Los cambios de presentación van en `lector-v3.js`.
2. **Noche es el tema por defecto.** Día es opcional y se aplica con `data-theme="light"` en `<html>` (landing y app) o con `body.dark` en el lector.
3. Fuentes: **DM Sans** para la interfaz y **Newsreader** para títulos y lectura.
4. Etiquetas fijas: «Ingresar», «Empezar hoy», «Leer la invitación», «Ir a mi biblioteca», «Cerrar sesión». Nunca «Entrar», «Salir» ni «Entrar con Google».
5. **Nada de `alert()`, `confirm()` ni `prompt()`.** Usa el aviso: abajo al centro, 6 segundos.
6. Sin barras de desplazamiento visibles. Los rieles se mueven con el dedo, arrastrando o con la rueda.
7. Accesibilidad: contraste de 4.5:1 en los dos temas, foco visible (2px `accent`) y `prefers-reduced-motion`.
8. Sin emojis en la interfaz, salvo ☰ ☽ ☼ 📖.
9. Copia las clases y los valores del prototipo (`docs/rediseno/prototipo/app.html`); no reinventes.

## Cómo trabajar

- **Rama:** trabaja en una rama (hoy, `rediseno-v3`), abre un PR hacia `main` y únelo cuando Juan lo apruebe. Usa la API REST (`gh api repos/leadcomunidad-creator/bookclub/pulls ...`), porque GraphQL no está disponible.
- **Service worker:** si cambias un archivo que se guarda sin conexión, sube `CACHE_VERSION` en `sw.js`.
- **Prueba antes de publicar:** a 390, 768, 1024 y 1440 px, en Noche y en Día. Sin desbordes horizontales ni errores en la consola.
  - Para probar la app fuera del iframe, sirve una copia sin la línea `if(window.top===window)…`.
  - `/biblioteca/?grande=1` simula 100 libros y 44 en el estante. Solo cambia la pantalla y no guarda nada.
- **Vistas previas de Netlify** (`deploy-preview-N--bookclublhscol.netlify.app`): el ingreso con Google falla ahí, salvo que se agregue ese dominio en Firebase → Authentication → Authorized domains. Dominios autorizados hoy: `bookclublhscol.netlify.app`, `localhost` y los de STARS y THE WAY.
- **Libros nuevos:** sigue `INSTRUCCIONES_PROYECTO.md`. No hace falta tocar código: la landing, la app, el lector y la caché leen `libros.json`.

## Cómo se engancha el lector v3

`json-reader-engine.js` pone `reader.body_html` en el `<body>`, inyecta el motor (variables globales `irA`, `PAGINAS`, `paginaActual`, `prog`, `ratioDe`, `avanceLibro`, `guardarProg`, `fuenteIdx`, `aplicarFuente`, `toggleDark`, `toggleConfig`) y luego carga `lector-v3.js` con `window.BOOKCLUB_LECTOR_META` y `window.BOOKCLUB_LECTOR_READER`.

`lector-v3.js` envuelve `window.irA` para reaccionar a cada cambio de página. Oculta la barra vieja con CSS, sin borrarla, y reubica `.pagina` con `top/left/right/bottom`. La «Práctica de hoy» sale de `.accion-text` de cada capítulo.
