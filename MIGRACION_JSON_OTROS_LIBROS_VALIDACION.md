# BOOKCLUB — Conversión JSON de los otros libros

Fecha: 23 de octubre de 2026. Alcance local; sin commit, push ni despliegue.

## Libros convertidos

- Elimina la prisa de tu vida → `libros/elimina-la-prisa-json.html` y `libros/elimina-la-prisa-json.json`
- Enciende tu cerebro → `libros/enciende-tu-cerebro-json.html` y `libros/enciende-tu-cerebro-json.json`
- Practica el camino → `libros/practica-el-camino-json.html` y `libros/practica-el-camino-json.json`

Los HTML originales siguen siendo las referencias oficiales e independientes. Cada versión JSON usa una ruta y una clave de progreso propias.

## Verificaciones realizadas

- Los tres JSON se analizan correctamente.
- El `body_html` de cada JSON coincide por SHA-256 con el cuerpo de su HTML original.
- Páginas preservadas: 18, 21 y 12 respectivamente.
- Las seis rutas locales (HTML JSON y JSON de datos) responden HTTP 200.
- El catálogo y la caché PWA incluyen las nuevas rutas.
- No hay diferencias locales en los tres HTML originales.

## Diferencias intencionales

- Cada copia JSON carga el contenido mediante `json-reader-engine.js`.
- Las entradas nuevas del catálogo muestran la etiqueta `JSON`.
- El progreso se guarda con claves nuevas y no reemplaza el de los originales.

La prueba de sincronización real con una sesión Google/Firebase queda pendiente de una validación manual autenticada.
