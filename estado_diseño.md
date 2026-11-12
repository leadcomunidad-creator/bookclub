# Estado del diseño — BOOKCLUB v3

Última actualización: 12 de noviembre de 2026.

Fuente de verdad visual: `docs/rediseno/prototipo/app.html` (`BC.set({...})` muestra cada pantalla). Reglas de marca: `docs/rediseno/GUIA_DE_MARCA.md`. Tokens: `docs/rediseno/tokens.json`. Sistema de diseño completo: artefacto «BOOKCLUB» (Design System) en claude.ai.

## Identidad

- Una biblioteca de noche: libros como objetos, una lámpara encendida (`lumbre`) y un solo color de acción, el índigo (`accent`).
- Mensaje: «Libros que te acercan a Jesús.». Frase guía: «Lámpara es a mis pies tu palabra.» (Salmo 119:105).
- Voz: español neutro, tuteo, tono sereno, frases completas con punto final y sin exclamaciones.

## Tokens implementados

| Token | Noche (por defecto) | Día |
|---|---|---|
| `bg` | #0b0c10 | #f4f1ea |
| `surface` | #15171e | #fffdf8 |
| `sunk` | #101217 | #eae5da |
| `line` / `line-2` | #23262f / #626a7c | #ddd6c8 / #8f8778 |
| `ink` / `ink-2` / `ink-3` | #eceef3 / #a6acb9 / #8a90a0 | #17171a / #4a4b52 / #62646c |
| `accent` / `on-accent` | #9ca0ff / #0b0c10 | #3b3fd8 / #fff |
| `lumbre` / `lumbre-soft` | #f2c879 / #2a2214 | #8a5a0b / #f6ebd3 |
| `estante` | #2b251d | #cbbfa6 |

Están definidos igual en `index.html` y en `biblioteca/index.html` (`:root` = Noche, `:root[data-theme="light"]` = Día). El lector usa los colores propios de cada libro y `--libro` (de `color_acento`; en Noche, `tokens_resueltos['--mark-ink']`).

## Pantallas

| Pantalla | Archivo | Estado |
|---|---|---|
| Landing (barra, hero con lámpara y estantería, La invitación, Cómo funciona, La colección, Cierre, Versículo, Pie) | `index.html` | Hecha, igual al prototipo |
| Hoy (sigue leyendo, práctica de hoy, idea en 1 minuto) | `biblioteca/index.html` | Hecha |
| Descubrir (tarjetas a pantalla completa, scroll-snap vertical) | `biblioteca/index.html` | Hecha |
| Mi estante (repisas Leyendo / Por leer / Leídos, lámpara, libro en la mano, vista Clásica) | `biblioteca/index.html` | Hecha |
| Disponibles (Empieza aquí, pasillos con hasta 12 y «Ver los N») y pasillo por expedición | `biblioteca/index.html` | Hecha |
| Buscar (título, autor o tema; filtro por expedición) | `biblioteca/index.html` | Hecha |
| Ideas (agrupadas por libro, Compartir, Borrar) | `biblioteca/index.html` | Hecha |
| Menú de cuenta (nombre, tema Noche/Día, El College, Cerrar sesión) | `biblioteca/index.html` | Hecho |
| Lector (contenido · capítulo · ideas y práctica; selección; audio) | `libros/lector-v3.js` | Hecho |

## Componentes

- **BarraLanding:** marca · «La invitación · Cómo funciona · La colección» · «Ingresar». Las anclas se ocultan bajo 860 px.
- **BarraApp:** marca · pestañas en el centro (≥1025 px) · [iniciales ☰].
- **TabBar:** Hoy · Descubrir · Biblioteca · Ideas, fija abajo en ≤1024 px. La activa va en `ink` y negrita.
- **Aviso:** abajo al centro, 6 s. En la app sube por encima de la TabBar; en el lector, por encima del audio.
- **Estanterías:** lomo con alto `140 + min × 0.85` y ancho `30 + capítulos × 1.8`, degradado de `color_portada_inicio` a `color_portada_fin`. El texto del lomo es blanco o `color_acento`, según la claridad del lomo.
- **Libro en la mano:** el lomo sube y la portada gira desde el canto (.75 s).
- **Selección en el lector:** «Guardar idea» en índigo, «Nota», «Compartir». Arriba de la selección con mouse y debajo en pantallas táctiles.
- **Audio:** ▶/❚❚, «Escuchar capítulo · 1,0×», línea de avance, tiempo restante y «Siguiente: … →». El texto del botón es blanco o tinta según el contraste con el color del libro.

## Diferencias con el prototipo (intencionales)

- La insignia «Gratis» de *Jesús es _____.* se muestra hoy, aunque los planes todavía no existen; así está en el prototipo con el plan «Hoy».
- Sin nombre de usuario (antes de cargar la sesión), el saludo es «Buenas tardes.» y el avatar muestra «·».
- En el libro en la mano se agregó «Quitar del estante» (no está en el prototipo).
- En el lector, «Ajustes de lectura» (al final del contenido) abre el panel antiguo del libro.
- En celular, «Tus ideas guardadas» y la «Práctica de hoy» van al final de cada capítulo.
- Si un libro no tiene `idea_1min`, Descubrir usa el subtítulo y la descripción, con un fondo oscuro calculado desde `color_acento`.

## Puntos de quiebre usados

1099 · 1024 (TabBar y pestañas) · 960 (lector en tres zonas) · 900 (columnas → una) · 860 (anclas de la landing, Hoy en una columna) · 700 (libro en la mano) · 640 · 520 · 480 · 420.

## Pendientes de diseño

- Estados de los planes (Free / Premium / VIP): libro cerrado, «Ver planes de El College», insignias Premium/VIP y «En revisión». Los estilos `insignia.premium`, `insignia.vip` y `.candado` están en el prototipo, pero no en el sitio.
- Descubrir con paso hacia los lados (opcional, más adelante).
- Revisar en iPhone la barra de selección del lector.
