# BOOKCLUB
## Instrucciones del proyecto
### Versión 3.0 · rediseño v3 (noviembre de 2026)

---

## QUÉ ES ESTO

BOOKCLUB es la biblioteca de El College: resúmenes de libros elegidos para leer con propósito. Su fin es conectar con Jesús a través de la lectura («Libros que te acercan a Jesús.»).

El sitio es estático (HTML, CSS y JS sin compilación), vive en GitHub (`leadcomunidad-creator/bookclub`) y se publica en Netlify. Firebase (proyecto `stars-plus`) se usa para el ingreso con Google y para sincronizar el avance, el estante y las ideas de cada persona.

Las reglas de marca, voz y diseño están en `docs/rediseno/GUIA_DE_MARCA.md`, y la referencia visual en `docs/rediseno/prototipo/app.html`.

---

## ESTRUCTURA DE ARCHIVOS

```
bookclub/
├── index.html                  ← Landing (Ingresar · Empezar hoy)
├── biblioteca/index.html       ← App: Hoy · Descubrir · Biblioteca · Ideas
├── libros.json                 ← Catálogo: una ficha por libro
├── bookclub-firebase.js        ← Ingreso con Google y sincronización
├── sw.js                       ← Uso sin conexión
├── libros/
│   ├── <slug>.html                         ← Resumen editorial original (referencia)
│   ├── <slug>-json.html                    ← Página de lectura (la que abre la app)
│   ├── <slug>-json.json                    ← Contenido del resumen para el lector
│   ├── bookclub-editorial-template.v1.json ← Plantilla editorial (estructura fija)
│   ├── json-reader-engine.js               ← Motor de lectura compartido
│   └── lector-v3.js                        ← Capa del lector v3 (se carga sola)
├── assets/previews/            ← Portadas
└── docs/rediseno/              ← Plan, guía de marca, tokens y prototipo
```

---

## SISTEMA DE CLASIFICACIÓN — THE WAY

Cada libro pertenece a una sola expedición y a una sola sub-expedición.

| expedicion | sub_expedicion | Etiqueta visible        |
|------------|----------------|-------------------------|
| mentalidad | identidad      | Identidad               |
| mentalidad | sanidad        | Sanidad                 |
| mentalidad | renovacion     | Renovación              |
| capacidad  | espiritual     | Inteligencia Espiritual |
| capacidad  | emocional      | Inteligencia Emocional  |
| capacidad  | fisica         | Inteligencia Física     |
| habilidad  | personal       | Personal                |
| habilidad  | relacional     | Relacional              |
| habilidad  | vocacional     | Vocacional              |

---

## FLUJO DE TRABAJO — CADA VEZ QUE HAY UN NUEVO LIBRO

### Paso 1 — Entregar el resumen a Claude
Pegar el resumen con esta instrucción:

> "Genera el resumen para BOOKCLUB siguiendo las instrucciones del proyecto. El libro es [TÍTULO] de [AUTOR]. Expedición: [EXPEDICIÓN]. Sub-expedición: [SUB-EXPEDICIÓN]. Propón la identidad visual y la idea en 1 minuto."

### Paso 2 — Recibir las entregas
1. **El resumen editorial** → `libros/<slug>.html`, con su identidad visual y la estructura de la plantilla editorial.
2. **La edición para el lector** → `libros/<slug>-json.html` y `libros/<slug>-json.json`. El JSON lleva el cuerpo del resumen en `reader.body_html`, sin cambios de contenido, y la página carga `json-reader-engine.js`.
3. **La portada** → `assets/previews/<slug>.jpg` (proporción 3:4).
4. **La ficha para `libros.json`**, con su `idea_1min` (ver abajo).

### Paso 3 — Revisar y publicar
Revisar la idea en 1 minuto y la ficha, y luego:

```bash
git add .
git commit -m "Agrega: Título del libro"
git push
```

Netlify publica en menos de un minuto. El libro aparece solo en la landing (estantería y repisas), en Disponibles, en Buscar y en Descubrir, y queda disponible sin conexión. No hace falta editar ningún otro archivo.

---

## FICHA EN libros.json

```json
{
  "tipo": "resumen",
  "edicion": "JSON",
  "titulo": "",
  "subtitulo": "",
  "autor": "",
  "anio": 0,
  "expedicion": "",
  "sub_expedicion": "",
  "temas": [],
  "quiero": [],
  "color_acento": "#",
  "color_portada_inicio": "#",
  "color_portada_fin": "#",
  "tiempo_lectura_min": 0,
  "capitulos": 0,
  "paginas_virtuales": 0,
  "archivo": "libros/<slug>-json.html",
  "clave_progreso": "bookclub-<slug>-json-progreso",
  "descripcion": "Una o dos frases con la tesis central del libro.",
  "preview_titulo": "",
  "preview_subtitulo": "",
  "preview_imagen": "assets/previews/<slug>.jpg",
  "idea_1min": {
    "titular": "",
    "texto": "",
    "fondo": "#"
  }
}
```

Notas:
- **`clave_progreso` no se cambia nunca** después de publicar un libro: es donde vive el avance de cada persona.
- `color_acento` pinta el lomo, el color del libro en el lector y el botón «Siguiente».
- `color_portada_inicio` y `color_portada_fin` forman el degradado del lomo en las estanterías.
- `tiempo_lectura_min` y `capitulos` definen la altura y el grosor del lomo.

### La idea en 1 minuto (`idea_1min`)
Es la tarjeta de Descubrir y la idea del día en Hoy.
- **titular:** una frase completa, en minúscula tipo oración y con punto final. Sin exclamaciones. Máximo unas 12 palabras. Ejemplo: «La prisa no es un problema de agenda. Es de carácter.»
- **texto:** una o dos frases que desarrollan el titular (unas 25 a 40 palabras).
- **fondo:** un color oscuro de la familia del libro, con contraste de al menos 4.5:1 para texto blanco.

Si un libro no tiene `idea_1min`, Descubrir usa su subtítulo y su descripción, y calcula un fondo oscuro a partir de `color_acento`.

---

## REGLAS PARA GENERAR UN RESUMEN

### Contenido
- No modificar, resumir ni reescribir ninguna parte del resumen entregado.
- Incluir todo el contenido tal como fue entregado, sin omitir secciones.
- Cada capítulo es una página virtual independiente.
- El orden lo fija `bookclub-editorial-template.v1.json`: Contenido y mapa → Resumen ejecutivo → Introducción → Capítulos → Curaduría → Comunicador → Consolidación.
- **Cada capítulo lleva su tarjeta «Acción concreta»** (componente `accion-card`, con `accion-text`). De ahí sale la «Práctica de hoy» en la app y en el lector.

### Identidad visual (cada libro es único)
Cada libro tiene una identidad que refleja su contenido y su portada: paleta (un color principal con variaciones), degradado de portada, tipografía de portada y personalidad general. No se copia la de otro libro.

Lo que no cambia entre libros: los componentes del resumen (`tesis-block`, `dato-card`, `accion-card`, `idea`, `filtro-header`, `veredicto-card`), el modo oscuro con `body.dark`, el bloque `libro-meta` y la compatibilidad desde 320 px.

En `reader.identidad_visual.tokens_resueltos` del JSON, `--mark-ink` es el color del libro en el tema Noche. Debe ser claro y legible sobre fondo oscuro.

### Lo que ya resuelve el lector (no se programa en cada libro)
El lector v3 (`lector-v3.js`) se monta solo sobre cualquier página que use `json-reader-engine.js`:
- La barra superior: «‹ Biblioteca», título · autor, Aa (tres tamaños) y tema (Noche por defecto).
- El contenido a la izquierda en escritorio, o con un botón en celular.
- «Tus ideas guardadas» y la «Práctica de hoy».
- Seleccionar texto para Guardar idea · Nota · Compartir.
- Escuchar el capítulo con la voz del dispositivo.
- El avance de lectura y su sincronización.

### Técnicas
- La página `<slug>-json.html` contiene el `<style>` del libro y carga `../bookclub-firebase.js` y `./json-reader-engine.js`.
- No usar `alert()`, `confirm()` ni `prompt()`.
- Sin dependencias externas, salvo Google Fonts.

---

## CONVENCIONES DE NOMBRES

- Minúsculas, palabras separadas por guion, sin tildes ni caracteres especiales.
- El slug es el mismo en todos los archivos del libro: `libros/<slug>.html`, `libros/<slug>-json.html`, `libros/<slug>-json.json` y `assets/previews/<slug>.jpg`.
- Ejemplos: `elimina-la-prisa`, `como-esta-tu-alma`, `asegure-el-exito-en-su-matrimonio-antes-de-casarse`.

---

## CHECKLIST ANTES DE HACER PUSH

- [ ] `libros/<slug>-json.html` abre la portada y el botón para empezar lleva a la primera página.
- [ ] El contenido (izquierda o botón) navega a todos los capítulos.
- [ ] Cada capítulo muestra su «Práctica de hoy» en el lector.
- [ ] El tema Noche y el tema Día se leen bien, incluido el color del libro.
- [ ] La ficha está en `libros.json` con `expedicion`, `sub_expedicion`, `clave_progreso` e `idea_1min`.
- [ ] La portada existe en `assets/previews/`.
- [ ] El libro aparece en la landing, en Disponibles y en Descubrir.

---

*BOOKCLUB · El College · v3.0*
