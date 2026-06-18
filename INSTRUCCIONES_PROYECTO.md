# MENTOR DE CONOCIMIENTO
## Instrucciones completas del proyecto
### Versión 2.0

---

## QUÉ ES ESTO

Un sistema de lectura interactiva para resúmenes de libros. Cada resumen es un archivo HTML independiente con identidad visual propia (colores, tipografía, personalidad). Una página principal (biblioteca) los agrupa y permite buscarlos y filtrarlos por expedición del sistema THE WAY. El proyecto vive en GitHub y se publica automáticamente en Netlify.

---

## ESTRUCTURA DE ARCHIVOS

```
mentor-de-conocimiento/
├── index.html               ← Biblioteca principal
├── libros.json              ← Base de datos de todos los libros
└── libros/
    ├── el-regreso-del-hijo-prodigo.html
    └── (cada nuevo libro va aquí)
```

---

## SISTEMA DE CLASIFICACIÓN — THE WAY

Cada libro pertenece a una sola Expedición y una sola Sub-expedición.
Un libro no puede pertenecer a más de una.

### Expediciones y sub-expediciones válidas:

| expedicion    | sub_expedicion  | Etiqueta visible         |
|---------------|-----------------|--------------------------|
| mentalidad    | identidad       | Identidad                |
| mentalidad    | sanidad         | Sanidad                  |
| mentalidad    | renovacion      | Renovación               |
| capacidad     | espiritual      | Inteligencia Espiritual  |
| capacidad     | emocional       | Inteligencia Emocional   |
| capacidad     | fisica          | Inteligencia Física      |
| habilidad     | personal        | Personal                 |
| habilidad     | relacional      | Relacional               |
| habilidad     | vocacional      | Vocacional               |

---

## FLUJO DE TRABAJO — CADA VEZ QUE HAY UN NUEVO LIBRO

### Paso 1 — Entregar el resumen a Claude
Pegar el resumen del libro en el chat con esta instrucción exacta:

> "Genera el HTML completo para este resumen siguiendo las instrucciones del proyecto Mentor de Conocimiento. El libro es [TÍTULO] de [AUTOR]. Expedición: [EXPEDICIÓN]. Sub-expedición: [SUB-EXPEDICIÓN]. Propón la identidad visual."

### Paso 2 — Recibir dos entregas
Claude entregará siempre dos cosas:
1. El archivo HTML completo → guardarlo en `/libros/nombre-del-libro.html`
2. Un bloque JSON listo → pegarlo dentro del array `"libros": [...]` en `libros.json`

### Paso 3 — Publicar
```bash
git add .
git commit -m "Agrega: Título del libro"
git push
```
Netlify detecta el push y publica en 30 segundos.

---

## INSTRUCCIONES PARA CLAUDE — GENERAR UN HTML DE LIBRO

Cuando Claude reciba un resumen, debe seguir estas reglas sin excepción:

---

### REGLAS DE CONTENIDO
- No modificar, resumir ni reescribir ninguna parte del resumen entregado
- Incluir todo el contenido tal como fue entregado, sin omitir secciones
- Si el resumen tiene capítulos, cada uno es una página virtual independiente
- El orden de páginas siempre es: Portada → Filtro de Lectura → Introducción → Capítulos → Conclusión → Resumen Final
- Si alguna de esas secciones no existe en el resumen, simplemente omitirla

---

### REGLAS DE NAVEGACIÓN (obligatorias en todos los libros)
- Sistema de páginas virtuales: solo una página visible a la vez, sin scroll entre secciones
- Menú hamburguesa (☰) fijo en esquina superior izquierda — oculto en portada
- El menú tiene secciones: "Resumen" (Filtro + Intro), "Capítulos", "Consolidación" (Resumen Final)
- El Resumen Final siempre va al final del menú, en su propia sección "Consolidación"
- Botones Anterior / Siguiente en cada página
- Swipe izquierda/derecha para navegar entre páginas en móvil (bloqueado cuando el menú está abierto)
- Botón modo oscuro fijo en esquina inferior derecha — siempre visible, nunca blanco sobre blanco — fondo oscuro en modo día, fondo claro en modo oscuro
- Botón modo lectura (📖) que oculta header, footer y navegación — fijo encima del botón de modo oscuro
- Barra de progreso de lectura en la parte superior — aparece al entrar a cualquier página que no sea la portada
- Tiempo estimado de lectura en el header de cada página

---

### REGLAS DE IDENTIDAD VISUAL (cada libro es único)

Claude debe proponer para cada libro una identidad que refleje el contenido, el tono y el tema del libro. No puede ser una copia del libro de referencia.

**Lo que cambia en cada libro:**
- Paleta de color: 1 color principal + variaciones (claro, medio, oscuro, pálido)
- Gradiente de portada: coherente con el tema y tono
- Tipografía de portada: puede variar (Playfair Display, Cormorant Garamond, Libre Baskerville, Lora, DM Serif Display, etc.)
- Animaciones de entrada en portada: pueden variar en estilo y ritmo
- Personalidad general: un libro de espiritualidad ≠ un libro de negocios ≠ un libro de historia

**Lo que NO cambia entre libros (estructura invisible):**
- Los componentes: tesis-block, dato-card, accion-card, idea, filtro-header, veredicto-card
- El sistema de navegación completo
- El bloque de metadatos JSON en el `<head>`
- El comportamiento del modo oscuro
- La responsividad (compatible desde 320px)

---

### REGLAS TÉCNICAS
- Un solo archivo HTML, todo autocontenido (CSS + JS incluidos)
- Variables CSS centralizadas en `:root` al inicio del `<style>`
- Bloque `<script type="application/json" id="libro-meta">` con metadatos al inicio del `<head>`
- Modo oscuro implementado con clase `body.dark`
- Sin dependencias externas excepto Google Fonts
- Compatible con móvil desde 320px de ancho

---

### VARIABLES CSS CLAVE

```css
:root {
  /* ── Cambiar en cada libro ── */
  --c-acento:        #312C8A;
  --c-acento-medio:  #5048A6;
  --c-acento-suave:  #7066CC;
  --c-acento-claro:  #ABA5E8;
  --c-acento-palido: #ECEAF9;
  --c-acento-bg:     #C9C4F2;
  --portada-grad:    linear-gradient(160deg, #0F0D33 0%, #1E1860 35%, #312C8A 65%, #4E3DBB 100%);
  --header-grad:     linear-gradient(135deg, #1B1747 0%, #312C8A 100%);
  --font-serif:      'Playfair Display', Georgia, serif;
  --font-body:       'EB Garamond', Georgia, serif;

  /* ── Fijos en todos los libros ── */
  --c-accion:     #1E9E75;
  --c-accion-bg:  #062E26;
  --c-accion-txt: #D9F3EB;
  --c-bg:         #F5F3EE;
  --c-surface:    #FDFCF9;
  --c-border:     #E3E0F0;
  --c-texto:      #1C1A2E;
  --c-texto-2:    #4A4660;
  --c-texto-3:    #8880C8;
  --radio:        8px;
  --radio-lg:     10px;
}
```

---

### METADATOS JSON (bloque dentro del HTML, en el `<head>`)

```json
{
  "titulo": "",
  "subtitulo": "",
  "autor": "",
  "anio": 0,
  "anio_autor": "",
  "paginas_virtuales": 0,
  "capitulos": 0,
  "expedicion": "",
  "sub_expedicion": "",
  "color_acento": "",
  "color_portada_inicio": "",
  "color_portada_fin": "",
  "tiempo_lectura_total_min": 0,
  "archivo": "libros/nombre-del-archivo.html"
}
```

---

### BLOQUE JSON PARA libros.json (segunda entrega de Claude)

Claude siempre entrega este bloque listo para pegar en el array `"libros"` de `libros.json`:

```json
{
  "titulo": "",
  "autor": "",
  "anio": 0,
  "expedicion": "",
  "sub_expedicion": "",
  "color_acento": "",
  "color_portada_inicio": "",
  "color_portada_fin": "",
  "tiempo_lectura_min": 0,
  "capitulos": 0,
  "archivo": "libros/nombre-del-archivo.html",
  "descripcion": "Una línea que describe la tesis central del libro."
}
```

---

## ESTRUCTURA DE libros.json

```json
{
  "proyecto": "Mentor de Conocimiento",
  "version": "1.0",
  "libros": [
    {
      "titulo": "El Regreso del Hijo Pródigo",
      "autor": "Henri J. M. Nouwen",
      "anio": 1992,
      "expedicion": "mentalidad",
      "sub_expedicion": "identidad",
      "color_acento": "#312C8A",
      "color_portada_inicio": "#0F0D33",
      "color_portada_fin": "#4E3DBB",
      "tiempo_lectura_min": 48,
      "capitulos": 12,
      "archivo": "libros/el-regreso-del-hijo-prodigo.html",
      "descripcion": "El camino espiritual recorrido a través de los tres personajes de la parábola: el hijo que huye, el hijo que juzga y el padre que ama sin condición."
    }
  ]
}
```

---

## CONVENCIONES DE NOMBRES DE ARCHIVO

- Minúsculas siempre
- Palabras separadas por guion (kebab-case)
- Sin tildes ni caracteres especiales
- Siempre dentro de la carpeta `/libros/`

**Ejemplos:**
- `el-regreso-del-hijo-prodigo.html`
- `el-nombre-de-la-rosa.html`
- `pensar-rapido-pensar-despacio.html`
- `el-hombre-en-busca-de-sentido.html`

---

## LIBRO DE REFERENCIA

El archivo `libros/el-regreso-del-hijo-prodigo.html` es el libro de referencia del proyecto. Cualquier duda sobre estructura de componentes, sistema de navegación o comportamiento debe resolverse mirando ese archivo. La identidad visual (colores morados, gradiente oscuro) es exclusiva de ese libro — no se repite.

---

## CÓMO FUNCIONA LA BIBLIOTECA (index.html)

- Lee `libros.json` automáticamente al cargar
- Construye tarjetas con el color y gradiente de cada libro
- Búsqueda en tiempo real por título o autor
- Filtro por Expedición (Mentalidad / Capacidad / Habilidad)
- Subfiltros por sub-expedición al seleccionar una Expedición
- Modo oscuro propio
- Al hacer clic en una tarjeta abre el HTML del libro

---

## CHECKLIST ANTES DE HACER PUSH

- [ ] El HTML abre correctamente en el navegador
- [ ] La portada carga con animación de entrada
- [ ] El botón "Leer resumen" navega a la primera página de contenido
- [ ] El menú hamburguesa abre, navega y cierra correctamente
- [ ] Todos los capítulos son accesibles desde el menú
- [ ] El Resumen Final está al final del menú en la sección "Consolidación"
- [ ] El modo oscuro funciona y el botón es siempre visible en ambos modos
- [ ] El botón de modo oscuro tiene fondo oscuro en modo día y fondo claro en modo oscuro
- [ ] El swipe funciona en móvil
- [ ] La barra de progreso aparece al entrar a páginas de contenido
- [ ] El tiempo de lectura aparece en el header de cada página
- [ ] El archivo está en `/libros/` con nombre en kebab-case
- [ ] El bloque JSON fue agregado a `libros.json` con `expedicion` y `sub_expedicion` correctos
- [ ] La tarjeta aparece correctamente en `index.html`

---

*Mentor de Conocimiento · The Way College · v2.0*
