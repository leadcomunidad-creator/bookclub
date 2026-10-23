# BOOKCLUB — Piloto JSON: Gana la guerra en tu mente

Fecha: 2026-10-22  
Estado: experimental; el lector HTML original continúa siendo la referencia oficial.

## Rutas comparadas

- Original HTML: `libros/gana-la-guerra-en-tu-mente.html`
- Piloto JSON: `libros/gana-la-guerra-en-tu-mente-json-piloto.html`
- Contenido del piloto: `libros/gana-la-guerra-en-tu-mente-json-piloto.json`

## Resultado de fidelidad

- Las 18 páginas virtuales se conservaron sin cambios editoriales.
- El `body_html` del JSON coincide byte a byte con el cuerpo visual del HTML original.
- Hash SHA-256 de ambos cuerpos: `017f83ea0c68762d620e11aceb471dbfb2d9e6b6a9189f951fffdaed267871b8`.
- El piloto reutiliza el mismo CSS, tipografías, colores, SVG, menú, controles, navegación por botones, teclado y gesto táctil del lector original.

## Progreso y sincronización

- HTML original: `bookclub-gana-la-guerra-en-tu-mente-progreso`
- JSON piloto: `bookclub-gana-la-guerra-en-tu-mente-json-piloto-progreso`

Las dos claves cumplen el patrón que sincroniza `bookclub-firebase.js`, por lo que se guardan localmente y en Firebase como registros separados. Ninguna clave existente se modifica.

## Diferencias detectadas

1. El piloto hace una lectura local adicional del archivo JSON antes de montar el lector. Es la única diferencia de carga; la PWA precarga tanto la página como el JSON y el motor.
2. El título de documento del piloto incorpora `JSON Piloto` y el catálogo muestra las etiquetas `ORIGINAL · HTML` y `PILOTO · JSON`. Esto permite comparar ambas versiones sin ambigüedad.
3. Si el JSON no pudiera cargarse, el piloto muestra un enlace de recuperación al HTML original. El lector original no necesita ese paso adicional.

No se detectaron diferencias de contenido, estructura visual o navegación respecto de la versión original.
