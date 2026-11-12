# Rediseño BOOKCLUB: instrucciones para Claude Code

Implementa en este repositorio (`leadcomunidad-creator/bookclub`) el rediseño que ya está aprobado. El sitio es estático: HTML, CSS y JS sin paso de compilación, publicado en Netlify, con Firebase (proyecto `stars-plus`) para el ingreso con Google y la sincronización.

## Material de referencia (en esta carpeta, `docs/rediseno/`)

- `prototipo/app.html`: el **prototipo navegable**, que es la fuente de verdad visual. Ábrelo en el navegador. Su objeto `window.BC.set({...})` muestra cada pantalla, por ejemplo `BC.set({user:1, view:'biblioteca', vista:'estante'})`. Las vistas son: `inicio`, `hoy`, `descubrir`, `biblioteca`, `disponibles`, `buscar`, `ideas` y `lector`.
- `tokens.json`: los tokens del sistema (colores Noche y Día, tipografía, espacios, radios y sombras).
- `GUIA_DE_MARCA.md`: las reglas de uso (voz, ingreso, colores y comportamiento).
- El sistema de diseño completo, con una ficha por componente, está publicado como artefacto «BOOKCLUB» (Design System) en claude.ai.

Copia las clases y el marcado del prototipo; no reinventes. Los valores exactos están en el `<style>` de `app.html`.

## Reglas que no se negocian

1. **No modificar el contenido de los resúmenes.** El texto de `libros/*-json.json` y de los HTML de libros no se reescribe.
2. **Noche es el tema por defecto** y Día es opcional. Cada tema se guarda en `localStorage` y se aplica con `data-theme` en `<html>`.
3. **Fuentes:** DM Sans para la interfaz y Newsreader para los títulos y la lectura.
4. **Etiquetas fijas:**
   - Landing: «Ingresar» en la barra; «Leer la invitación» y «Empezar hoy» en el hero; «Ir a mi biblioteca» si ya hay sesión.
   - App: «Cerrar sesión», nunca «Salir» ni «Entrar con Google».
5. **Nada de `alert()`, `confirm()` ni `prompt()`.** Usa el `Aviso`: abajo al centro, desaparece a los 6 segundos y es el mismo patrón de THE WAY.
6. **Sin barras de desplazamiento visibles.** Los rieles se mueven con el dedo, arrastrando con el mouse o con la rueda.
7. **Accesibilidad:** texto con contraste de 4.5:1 en los dos temas, foco visible y `prefers-reduced-motion` respetado.
8. Trabaja en una rama `rediseno-v3` y haz **un commit por fase**. Prueba cada fase a 390 px y 1440 px de ancho antes de seguir.

## Fase 1: Landing (`index.html`)

Reemplaza la página por la estructura del prototipo (`BC.set({view:'inicio'})`):

1. **Barra:** marca; al centro «La invitación · Cómo funciona · La colección» (anclas); a la derecha «Ingresar».
2. **Hero:**
   - Escritorio: «BOOK**CLUB**», la frase «Libros que te acercan a Jesús.», un párrafo y los botones «Leer la invitación» (con contorno) y «Empezar hoy». A la derecha, la lámpara colgando sobre la estantería de lomos, generada desde `libros.json`.
   - Celular: el orden es nombre, frase, estantería, párrafo y botones.
3. **La invitación:** las tarjetas «BOOKCLUB no es» y «BOOKCLUB es».
4. **Cómo funciona:** tres tarjetas (Descubre, Lee o escucha, Conserva).
5. **La colección:** tres repisas, una por expedición de THE WAY.
6. **Cierre:** el celular de muestra, «Empezar hoy» y «¿Tienes preguntas sobre BOOKCLUB? Escríbenos por WhatsApp», que abre `https://wa.me/573173708570?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20BOOKCLUB`.
7. **Versículo:** Salmo 119:105.
8. **Pie igual al de THE WAY,** en tres filas:
   - LHSCOL · EL COLLEGE
   - MAYOR QUE MI REALIDAD · S.T.A.R.S. · THE WAY · BOOKCLUB · STAFF
   - LINKTREE · INSTAGRAM · YOUTUBE · COMUNIDAD · WHATSAPP (`https://chat.whatsapp.com/Cns0HVMBa3C1PztdvhEn55`)

**Ingreso:** «Ingresar» y «Empezar hoy» llaman directo a `BookclubSync.signInWithGoogle()`, dentro del gesto del clic y sin ninguna promesa antes. Mantén el mecanismo actual que abre `/biblioteca/` en `#bookclub-app` y la sesión recordada. El botón muestra «Abriendo Google…» mientras abre. Si falla, aparece el aviso «No pudimos completar el ingreso. Inténtalo de nuevo.».

## Fase 2: App (`biblioteca/index.html`)

1. **Tokens:** `:root` lleva los valores de Noche y `[data-theme="light"]` los de Día, copiados del prototipo.
2. **Barra superior limpia:** la marca y el botón [iniciales ☰]. Ese botón abre un panel con:
   - Nombre y «Cuenta de Google de El College».
   - Tema Noche/Día.
   - Entradas de El College (Temporada 2026, S.T.A.R.S., THE WAY, Staff, Volver a LHSCOL).
   - «Cerrar sesión», que avisa a la landing con `postMessage({type:'bookclub-signout'})`, como ya existe.

   En escritorio, las pestañas Hoy · Descubrir · Biblioteca · Ideas van en el centro de esta barra.
3. **Barra inferior** (≤1024 px y con sesión): Hoy, Descubrir, Biblioteca e Ideas, con los íconos del prototipo y la pestaña activa en blanco y negrita.
4. **Vistas:**
   - **Hoy:**
     - El libro en curso: el de avance más reciente según las claves `bookclub-<slug>-progreso`.
     - La práctica del capítulo en curso.
     - La idea del día.
   - **Descubrir:** una tarjeta a pantalla completa por libro, con scroll-snap vertical. El texto sale del campo nuevo `idea_1min` (Fase 4).
   - **Biblioteca:** un selector con dos secciones y una lupa que abre **Buscar** (por título, autor o tema, con filtro por expedición).
     - **Mi estante:** repisas por estado, en este orden: Leyendo (bajo la lámpara), Por leer y Leídos. Las repisas se arman según el ancho. Al tocar un lomo, el libro sale y muestra su portada grande («libro en la mano»). También tiene la vista Clásica.
     - **Disponibles:** «Empieza aquí» con *Jesús es _____.* y los pasillos Capacidad, Mentalidad y Habilidad, con hasta 12 libros más «Ver los N».
   - **Ideas:** las frases y notas guardadas, agrupadas por libro, con «Compartir» (copia la cita).
5. **Estado de cada libro:** Por leer (guardado sin avance), Leyendo (avance mayor que 0 y menor que 100) y Leído (avance 100). «Guardar» usa el `setLibraryState` que ya existe en `bookclub-firebase.js`.
6. **Libros de 100 en adelante:** la app debe funcionar bien con 100 libros en el catálogo y 50 en el estante. El prototipo lo simula con `BC.set({..., grande:true})`.

## Fase 3: Lector (`libros/json-reader-engine.js` y `libros/*-json.html`)

1. **Escritorio (≥960 px), tres zonas:**
   - Izquierda: el contenido, con ✓ en lo leído y el capítulo actual en el tono del libro.
   - Centro: el capítulo, sin cambiar su diseño.
   - Derecha: «Tus ideas guardadas · N» y «Práctica de hoy» (con «Me comprometo hoy»).
   - Barra superior: «‹ Biblioteca», título · autor, Aa (tres tamaños) y el tema. Debajo, la línea de avance.

   En celular es una sola columna y el contenido se abre con un botón.
2. **El color del libro:** `--libro` sale de `color_acento`. En Noche usa `identidad_visual.tokens_resueltos['--mark-ink']`.
3. **Al seleccionar texto:** aparece la barra «Guardar idea · Nota · Compartir».
   - Guardar subraya la frase y la guarda.
   - Nota abre un recuadro con un campo de texto.
   - Compartir copia «cita» — Libro, Autor · BOOKCLUB.
   - Las ideas se guardan en `localStorage` con la clave `bookclub-ideas` y se sincronizan en `bookclub-firebase.js`, igual que el progreso, dentro del documento `usuarios/{uid}`.
4. **Audio con la voz del dispositivo (Web Speech API):**
   - Barra fija abajo: ▶/❚❚, «Escuchar capítulo · 1,0×» (velocidades 0,85, 1, 1,25 y 1,5, recordadas), el avance, el tiempo restante y «Siguiente: … →».
   - Lee **párrafo por párrafo**, con una `SpeechSynthesisUtterance` por párrafo, porque Chrome corta los textos largos.
   - Busca una voz `es-CO`, `es-419` o `es-US` y, si no hay, cualquier voz `es`.
   - Solo arranca al tocar ▶. Si no existe `speechSynthesis`, el botón no aparece.

## Fase 4: Contenido en `libros.json`

Agrega a cada libro:

```json
"idea_1min": {"titular": "…", "texto": "…", "fondo": "#hex oscuro con contraste 4.5:1 para texto blanco"}
```

Propuesta del prototipo, para que Juan la revise antes de publicar:

| slug | titular | fondo |
| --- | --- | --- |
| jesus-es | Jesús se acerca antes de que cambies. | #1d1a19 |
| elimina-la-prisa | La prisa no es un problema de agenda. Es de carácter. | #a52620 |
| enciende-tu-cerebro | Observa tus pensamientos antes de creerlos. | #0b5f7b |
| gana-la-guerra-en-tu-mente | Cambiar la vida empieza por cambiar lo que crees. | #6b4c16 |
| como-esta-tu-alma | Una vida plena empieza por dentro. | #1f5a62 |
| practica-el-camino | Estar con Jesús, ser como él, hacer lo que él hizo. | #4e4226 |
| asegure-el-exito-en-su-matrimonio-antes-de-casarse | Prepara el matrimonio, no solo la boda. | #196a66 |

Los textos completos están en el arreglo `IDEAS` del prototipo. Actualiza también `INSTRUCCIONES_PROYECTO.md` para que cada libro nuevo traiga su `idea_1min`.

## Para cerrar cada fase

- Revisa a 390, 768, 1024 y 1440 px, en Noche y en Día.
- Sin desbordes horizontales, sin errores en la consola y sin ventanas del navegador.
- Al final, haz un resumen corto de lo que cambió y de lo que quedó pendiente.
