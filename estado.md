# Estado del proyecto — BOOKCLUB

Última actualización: 12 de noviembre de 2026.

## En una línea

El rediseño v3 está **publicado y funcionando** en https://bookclublhscol.netlify.app: landing, app, lector con ideas y audio, e ideas en 1 minuto.

## Historial reciente

| Fecha | Qué | Dónde |
|---|---|---|
| 12 nov 2026 | Fase 1: landing nueva | commit `804e560` |
| 12 nov 2026 | Fase 2: app nueva (Hoy, Descubrir, Biblioteca, Ideas) | commit `64dfd55` |
| 12 nov 2026 | Fase 3: lector v3 (tres zonas, ideas guardadas, audio) | commit `f5f22b2` |
| 12 nov 2026 | Fase 4: `idea_1min` en los 7 libros, instrucciones v3 y caché automática | commit `22078a5` |
| 12 nov 2026 | Publicación del rediseño | PR #1 → `main` (`5bb6b45`) |
| 12 nov 2026 | Lector: voces latinas antes que la de España (incluida México, para Samsung) | PR #2 (`7c35763`) |

## Catálogo actual (7 libros)

| Libro | Expedición |
|---|---|
| Jesús es _____. (libro de entrada) | Capacidad · Inteligencia Espiritual |
| Elimina la prisa de tu vida | Capacidad · Inteligencia Espiritual |
| Practica el camino | Capacidad · Inteligencia Espiritual |
| Enciende tu cerebro | Mentalidad · Renovación |
| Gana la guerra en tu mente | Mentalidad · Renovación |
| ¿Cómo está tu alma? | Mentalidad · Sanidad |
| Asegure el éxito en su matrimonio antes de casarse | Habilidad · Relacional |

Las 7 «ideas en 1 minuto» las aprobó Juan tal como venían en el prototipo.

## Verificado en vivo

- [x] Landing nueva publicada.
- [x] Ingreso con Google en el sitio real.
- [x] Lectura hablada con voz latina en Android (Samsung, español de México).
- [x] Descubrir con deslizamiento vertical (decisión: se queda así por ahora).

## Pendiente de verificar

- [ ] **Sincronización de ideas entre dispositivos.** Guardar una idea en el celular y verla en Ideas desde el PC. Si no aparece, revisar que las reglas de Firestore acepten el campo `bookclub.ideas` en `usuarios/{uid}`.
- [ ] Selección de texto en iPhone: la barra «Guardar idea · Nota · Compartir» aparece debajo de la selección.
- [ ] Una cuenta con avance anterior ve su libro en Hoy y su estante igual que antes.

## Decisiones tomadas

- **Descubrir** se desliza hacia arriba, como en el plan. Pasar hacia los lados queda para más adelante.
- **Se quitaron «Exportar respaldo» e «Importar respaldo»** de la app vieja: Firebase ya sincroniza todo.
- **Se agregó «Quitar del estante»** en el libro en la mano, para no perder esa opción de la app vieja.
- **El panel antiguo del lector** (A−/A+, modo oscuro, «Borrar» avance) sigue disponible desde «Ajustes de lectura», al final del contenido.
- **Ideas:** se borran con doble toque y quedan marcadas como borradas para que no regresen al sincronizar.
- **La caché sin conexión** incluye sola cada libro de `libros.json`; ya no hay que editar `sw.js` por cada libro.

## A futuro (no empezado)

- Planes de El College (Free / Premium / VIP): «Empezar hoy» llevaría al registro, los libros fuera del plan se verían cerrados («Incluido en Premium») y se agregaría el estado «En revisión». Ver `docs/rediseno/GUIA_DE_MARCA.md` → «A futuro».
- Pasar las tarjetas de Descubrir hacia los lados, además de hacia arriba.

## Deuda técnica conocida

- En `libros/` siguen los HTML editoriales originales (`<slug>.html`) y el piloto `gana-la-guerra-en-tu-mente-json-piloto.*`. La app no los usa.
- `MIGRACION_JSON_OTROS_LIBROS_VALIDACION.md` y `PILOTO_JSON_GANA_LA_GUERRA_VALIDACION.md` describen la migración a JSON de octubre; son históricos.
- La excepción `SLUG_PROGRESO` (`gana-guerra`) se mantiene por compatibilidad con avances antiguos.
- `acceso.html` y `README.md` no se revisaron en el rediseño.
