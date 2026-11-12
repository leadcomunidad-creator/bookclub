BOOKCLUB es la herramienta de lectura de El College. Reúne resúmenes de libros elegidos para leer con propósito, y su fin último es conectar con Jesús a través de la lectura. Visualmente es una biblioteca de noche: libros como objetos, una lámpara encendida (`lumbre`) y un único color de acción, el índigo (`accent`).

## Propósito y voz

- **El centro es Jesús, no la productividad lectora.** Cada pantalla principal debe decir, en palabras o en luz, que leer aquí es un camino hacia Él. Mensaje central: «Libros que te acercan a Jesús.». La frase guía es «Lámpara es a mis pies tu palabra.».
- **Español neutro, tuteo y tono sereno:** frases cortas, sin exclamaciones ni urgencia. Por ejemplo: «Lee con propósito, no con prisa.», «Una buena página puede ser un encuentro.» y «No todo libro merece el mismo tiempo.».
- **Titulares:** frases completas con punto final, en minúscula tipo oración. Puedes destacar una sola palabra: «Jesús» en `lumbre`, o una idea en `accent`.
- **Nombres:** BOOKCLUB va en mayúsculas en la marca y la navegación; «BookClub» solo dentro de un botón. «Mi estante», «Mi Biblioteca» y «El College» van con mayúsculas iniciales. Los planes son Free, Premium y VIP.
- **Clasificación:** cada libro pertenece a exactamente una expedición de THE WAY. Las etiquetas visibles son Identidad, Sanidad y Renovación (Mentalidad); Inteligencia Espiritual, Emocional y Física (Capacidad); y Personal, Relacional y Vocacional (Habilidad).
- **Sin emojis en la interfaz.** Solo se permiten los glifos funcionales ☰ (menú), ☽ (tema) y 📖 (modo lectura).

## Ingreso y acceso

Las etiquetas son siempre las mismas, como en THE WAY: **Empezar hoy** (la acción principal de la landing), **Ingresar** (en la barra de la landing) y **Cerrar sesión** (en el menú de la cuenta). Quien ya entró ve «Ir a mi biblioteca» en lugar de «Ingresar». Nunca uses «Entrar», «Salir» ni «Entrar con Google».

### Hoy

- **Quién entra:** cualquier cuenta de Google entra y ve todo.
- **Cómo:** «Ingresar» y «Empezar hoy» abren directo la ventana de Google, sin pantalla de ingreso propia. Mientras tanto el botón dice «Abriendo Google…». Al entrar, la persona llega a **Hoy**.
- **Si falla:** aparece un `Aviso` de error. Si la persona cierra la ventana de Google, no se muestra nada.
- **Recordatorio:** debajo de los botones va la línea «Entras con tu cuenta de Google de El College.».

### A futuro, con los planes de El College

- **Registro:** «Empezar hoy» lleva al registro de El College, que consiste en elegir un plan, no en pagar. «Ingresar» sigue abriendo Google.
- **Qué abre cada plan:**
  - **Free:** solo *Jesús es _____.* (insignia «Gratis»).
  - **Premium:** todos los libros.
  - **VIP:** todo, más las mentorías de El College.
- **Libro fuera del plan:** se ve cerrado («Incluido en Premium») e invita a «Ver planes de El College».
- **Estados de la persona en la landing:** Visitante y Con acceso; con planes pagos se suma «En revisión», como en THE WAY.

### Contacto

- **«Escríbenos por WhatsApp»** (en el cierre de la landing) abre wa.me/573173708570.
- **«Comunidad · WhatsApp»** (en el pie) abre el grupo de la comunidad.

## La experiencia

- **Landing:** `BarraLanding` → `Portada` → La invitación → Cómo funciona → La colección → Cierre → Versículo → `Pie`. Es la misma estructura que THE WAY (ver `Landing`).
- **Dentro de la app:** `BarraApp` arriba, limpia, con la marca y el botón [iniciales ☰]. En celular y tablet, la `TabBar` abajo con Hoy, Descubrir, Biblioteca e Ideas. En escritorio esas pestañas van en la barra superior. La app no lleva pie.
- **Hoy:** sigue leyendo, práctica de hoy y una idea en 1 minuto.
- **Descubrir:** una idea por libro, a pantalla completa y con el color del libro. Se desliza hacia arriba.
- **Biblioteca:** dos secciones, Mi estante (repisas por estado bajo la lámpara; al tocar un lomo pasa a `LibroEnLaMano`) y Disponibles (pasillos por expedición), más Buscar.
- **Ideas:** frases y notas guardadas desde la lectura.
- **Lectura:** el contenido a la izquierda, el capítulo al centro y las ideas y la práctica a la derecha. Al seleccionar texto aparece la barra Guardar idea · Nota · Compartir. Abajo va el audio.
- **Audio:** usa la voz del dispositivo (Web Speech API), en español y párrafo por párrafo. Solo arranca al tocar ▶, y tiene velocidades de 0,85× a 1,5×. Si no hay voz, el botón no aparece.
- **Desplazamiento:** no hay barras de desplazamiento visibles. Los rieles se mueven con el dedo, arrastrando con el mouse o con la rueda.
- **Libro:** cada resumen conserva su identidad visual. En el lector, `--libro` toma el `color_acento` del libro.

## Color

- **Temas:** Noche es el tema por defecto, como el resto de El College; Día es papel cálido. Los dos están completos, y la persona cambia de tema con el `icon-btn` ☽. Nunca uses colores fijos para el texto.
- **Superficies:** la página va en `bg`, los paneles y la ficha del libro en `surface`, y el pie, el estante y las portadas en carga en `sunk`. Las secciones se separan con 1px de `line`, nunca con sombras.
- **Texto:** el principal en `ink`, el secundario en `ink-2` y los metadatos en `ink-3`. Todos alcanzan 4.5:1 sobre `bg`, `surface` y `sunk` en los dos temas.
- **`accent` (índigo) es la acción:** «Empezar hoy», «Ingresar», «Seguir leyendo», CLUB en el nombre, enlaces, el foco, el avance de lectura y la insignia Premium. Encima va `on-accent`. Es el color propio de BOOKCLUB, como el dorado lo es de THE WAY.
- **`lumbre` es la luz:** «Jesús» en el titular, la frase guía, el libro de entrada («Gratis»), la insignia VIP, la lámpara y su halo (`lumbre-halo`). Nunca rellena un botón de acción. `lumbre-soft` es el fondo de «Empieza aquí»; sobre un relleno `lumbre` va `on-lumbre`.
- **`estante`** es la madera de la tabla del estante. Es decorativa: su canto se dibuja en `ink-3`.
- **Colores de cada libro:** los de `libros.json` solo pintan su propio lomo y su portada.

## Tipografía

- **Serif:** Newsreader (eje óptico 6–72, pesos 400/500/600 y cursiva) para títulos, títulos de libros y la voz editorial.
- **Sans:** DM Sans (400/500/600/700) para la interfaz, la misma fuente de texto que THE WAY, Mayor que mi Realidad y LHSCOL.
- **Carga:** `https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=DM+Sans:wght@400;500;600;700&display=swap`.
- **Títulos:** van en serif 400 con `text-wrap: balance` y tracking negativo en `titular`, `cierre` y `seccion`. Los títulos de tarjeta, de pasillo y de libro van en 500 (`tarjeta`, `pasillo`).
- **Cursiva serif** (`frase`, `ordinal`): es la voz de la marca. En `lumbre` para la frase guía y en `accent` para los ordinales.
- **Texto e interfaz:** el cuerpo va en `cuerpo` (16px / 1.55) y el párrafo de entrada en `lead`, con un máximo de 62ch. Las etiquetas en mayúsculas (`eyebrow`, `nav`, `insignia`) llevan tracking de .1 a .13em.
- **Tamaños fluidos:** los títulos grandes usan `clamp()`; cada estilo registra su máximo.

## Espacio y composición

- **Columna:** el contenido vive en una columna de ancho máximo `wrap`, con margen lateral `gutter`.
- **Escala de espacio:** `space-1` a `space-6`.
- **Secciones:** usan `space-6` en vertical, y los pasillos de Disponibles se separan con `space-5`.
- **Cabeceras de sección:** son asimétricas, con el título a la izquierda y el `lead` a la derecha. Pasan a una columna bajo 900px.
- **Puntos de quiebre:** 1099, 900, 640 y 480px. En móvil, los rieles de portadas y la fila del estante se desplazan en horizontal.

## Formas, bordes y elevación

- **`r-btn`:** los botones grandes de la landing y de Descubrir, como en THE WAY.
- **`r-pill`:** botones compactos de la app, el botón «Ingresar», los selectores y las etiquetas.
- **`r-sm`:** insignias y barra de progreso.
- **`r-md`:** notas.
- **`r-lg`:** la ficha del libro, el estante, los avisos y el recuadro «Empieza aquí».
- **`r-spine`:** la esquina del lomo. Las portadas llevan siempre el lomo a la izquierda (`3px 8px 8px 3px`).
- **Sombras:** en reposo, nada. `lift` aparece en hover (botones -1/-2px, portadas -6px, lomos -10px). `float` es solo para lo que flota: la ficha, el menú de cuenta y el aviso.
- **Foco:** un contorno sólido de 2px en `accent`, a 3px de distancia, siempre visible.

## Movimiento

- **Transiciones:** cortas, .15s en botones y .3–.45s `cubic-bezier(.2,.8,.2,1)` en portadas y lomos.
- **Momentos con movimiento:** la entrada de los lomos de la portada (`rise`, 70ms entre lomos), el libro que sale del estante y la portada que gira desde el canto (.7s).
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` todo aparece sin desplazarse ni girar.

## Iconografía y marca

- **Logo de BOOKCLUB:** tres lomos sobre una base, el central más alto y en `accent`. Usa `bookclub-icono-oscuro` en Noche y `bookclub-icono` en Día. En la barra se dibuja en CSS (`.mark`) junto al nombre en estilo `marca`.
- **Logo de El College:** cuadrados concéntricos, solo en el `Pie`, a 52px.
- **Íconos:** SVG en línea con trazo `currentColor` de 1.5–2px y extremos redondeados (flecha de 16px, candado de 14px, menú de 26px). La lámpara del estante se dibuja con `ink-3` y `lumbre`. No hay librería de íconos.

## Componentes

- **Ecosistema:** `BarraLanding`, `BarraApp`, `TabBar`, `Pie`, `Aviso`.
- **Acciones y acceso:** `Boton`, `PlanInsignia`.
- **Colección:** `TarjetaLibro`, `Estanteria`, `Etiqueta`, `NotaLateral`.
- **Páginas de muestra:** `Portada`, `Landing`, `Hoy`, `Descubrir`, `MiBiblioteca`, `LibroEnLaMano`, `Disponibles`, `Ideas`, `Lector`, `LectorMovil`.

Todos se construyen con las clases de `components/bundle.css`. Las vistas previas son la captura estática del prototipo navegable.
