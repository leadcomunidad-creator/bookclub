/* BOOKCLUB JSON Reader Engine v1 — motor compartido de lectura. */
(function () {
  'use strict';
  var DATA_URL = window.BOOKCLUB_JSON_READER_DATA_URL || './gana-la-guerra-en-tu-mente-json-piloto.json';
  var FALLBACK_URL = window.BOOKCLUB_JSON_READER_FALLBACK_URL || './gana-la-guerra-en-tu-mente.html';
  function fail() {
    document.body.innerHTML = '<main id="json-reader-error"><p>No se pudo cargar esta versión JSON.</p><a href="' + FALLBACK_URL + '">Abrir HTML original</a></main>';
  }
  function agruparMenu(groups) {
    var panel = document.getElementById('menu-panel'); if (!panel || !groups) return;
    var sections = Array.prototype.filter.call(panel.children, function (s) { var l=s.querySelector('.menu-seccion-label'), label=l ? l.textContent.trim().toLocaleLowerCase('es') : ''; return label==='capítulos'; });
    var cap = sections[0]; if (!cap) return;
    var porPagina = {}; Array.prototype.forEach.call(cap.querySelectorAll('.menu-item'), function (b) { porPagina[b.dataset.page] = b; });
    var frag = document.createDocumentFragment();
    groups.forEach(function (group) {
      var section = document.createElement('div'); section.className='menu-seccion';
      var label = document.createElement('div'); label.className='menu-seccion-label'; label.textContent=group.label; section.appendChild(label);
      group.pages.forEach(function (id) { if (porPagina[id]) section.appendChild(porPagina[id]); });
      if (section.querySelector('.menu-item')) frag.appendChild(section);
    });
    cap.parentNode.replaceChild(frag, cap);
  }
  function agregarEstilosPlantilla() {
    if (document.getElementById('bookclub-editorial-template-styles')) return;
    var style = document.createElement('style');
    style.id = 'bookclub-editorial-template-styles';
    style.textContent = '' +
      '.bc-canonical{display:block;clear:both}' +
      '.bc-canonical-slot{display:block;position:relative}' +
      '.bc-canonical-slot + .bc-canonical-slot{margin-top:1.65rem}' +
      '.bc-canonical--introduccion{margin-top:.2rem}' +
      '.bc-canonical--introduccion .bc-canonical-slot + .bc-canonical-slot{margin-top:2rem}' +
      '.bc-content-page{padding-top:1.1rem}' +
      '.bc-content-mark{width:4.6rem;height:4.2rem;display:grid;place-items:center;color:var(--bc-title-color,#fff184);margin-bottom:1.45rem}' +
      '.bc-content-mark svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}' +
      '.bc-content-kicker{display:flex;align-items:center;gap:.8rem;color:var(--bc-label-color,#91d3ee);font:700 .72rem/1 var(--font-ui,Arial,sans-serif);letter-spacing:.22em;text-transform:uppercase}' +
      '.bc-content-kicker:after{content:"";height:1px;background:color-mix(in srgb,var(--bc-label-color,#91d3ee) 48%,transparent);flex:1}' +
      '.bc-content-title{margin:.75rem 0 2.25rem;color:var(--bc-title-color,#fff184);font-family:var(--bc-title-font,var(--font-display));font-size:clamp(2rem,7vw,3.3rem);font-weight:800;line-height:.95;letter-spacing:.01em;text-transform:uppercase}' +
      '.bc-content-map-title{margin:2.25rem 0 1rem;color:var(--bc-label-color,#91d3ee);font:700 .72rem/1 var(--font-ui,Arial,sans-serif);letter-spacing:.22em;text-transform:uppercase}' +
      '.bc-content-page .toc{margin:0}' +
      '.bc-content-page .nav-final{margin-top:2.5rem}';
    document.head.appendChild(style);
  }
  function hijoDirecto(body, element) {
    var node = element;
    while (node && node.parentElement !== body) node = node.parentElement;
    return node && node.parentElement === body ? node : null;
  }
  function montarSeccionCanonica(pageId, nombre, slots) {
    var page = document.getElementById(pageId);
    var body = page && page.querySelector(':scope > .page > .body, :scope .page > .body');
    if (!body || body.querySelector('[data-bookclub-canonical="' + nombre + '"]')) return false;
    var anclas = slots.map(function (slot) {
      return hijoDirecto(body, body.querySelector('[data-bookclub-component="' + slot + '"]'));
    });
    if (anclas.some(function (anchor) { return !anchor; })) return false;
    var children = Array.prototype.slice.call(body.children);
    var first = children.indexOf(anclas[0]);
    if (first < 0) return false;
    var section = document.createElement('section');
    section.className = 'bc-canonical bc-canonical--' + nombre;
    section.setAttribute('data-bookclub-canonical', nombre);
    section.setAttribute('data-bookclub-template', 'bookclub.editorial-template.v1');
    body.insertBefore(section, anclas[0]);
    slots.forEach(function (slot, index) {
      var start = anclas[index], stop = anclas[index + 1] || null;
      var wrapper = document.createElement('div');
      wrapper.className = 'bc-canonical-slot bc-canonical-slot--' + slot;
      wrapper.setAttribute('data-bookclub-slot', slot);
      section.appendChild(wrapper);
      var node = start;
      while (node && node !== stop) {
        var next = node.nextElementSibling;
        if (node.classList && (node.classList.contains('nav-final') || node.classList.contains('lectura-meta'))) break;
        if (node.classList && node.classList.contains('toc')) {
          node.setAttribute('data-bookclub-utility', 'indice');
          section.parentNode.insertBefore(node, section.nextSibling);
        } else {
          wrapper.appendChild(node);
        }
        node = next;
      }
    });
    return true;
  }
  function textoSeguro(value) { return value == null ? '' : String(value); }
  function campoFicha(label, value) {
    var field = document.createElement('div'); field.className = 'campo';
    var key = document.createElement('span'); key.className = 'campo-l'; key.textContent = label + ':';
    var content = document.createElement('span'); content.className = 'campo-v'; content.textContent = textoSeguro(value);
    field.appendChild(key); field.appendChild(content); return field;
  }
  function normalizarResumenEjecutivo(payload, pageId) {
    var page = document.getElementById(pageId);
    if (!page) return;
    var ficha = page.querySelector('[data-bookclub-slot="ficha"]');
    if (ficha && !ficha.querySelector('.sec-titulo')) {
      var heading = document.createElement('h2'); heading.className = 'sec-titulo hdr-sec'; heading.textContent = textoSeguro(payload.meta && payload.meta.titulo);
      var fields = document.createElement('div'); fields.className = 'campos';
      var meta = payload.meta || {};
      fields.appendChild(campoFicha('Subtítulo', meta.subtitulo));
      fields.appendChild(campoFicha('Autor', meta.autor));
      fields.appendChild(campoFicha('Publicación', meta.anio));
      fields.appendChild(campoFicha('Ruta', [meta.categoria || meta.expedicion, meta.subcategoria || meta.sub_expedicion].filter(Boolean).join(' → ').replace(/\b\w/g, function (letter) { return letter.toUpperCase(); })));
      var credit = ficha.querySelector('.credito');
      if (credit) credit.remove();
      ficha.insertBefore(fields, ficha.firstChild);
      ficha.insertBefore(heading, ficha.firstChild);
    }
    var author = page.querySelector('[data-bookclub-slot="autor"]');
    var card = author && author.querySelector('.author-card');
    if (author && card) {
      var copy = card.textContent.replace(/^\s*SOBRE\s+LA\s+AUTORA\s*/i, '').trim();
      var label = document.createElement('span'); label.className = 'eyebrow'; label.textContent = 'Autor';
      var paragraph = document.createElement('p'); paragraph.textContent = copy;
      card.remove(); author.appendChild(label); author.appendChild(paragraph);
    }
  }
  function crearPaginaContenido(payload, paginaEjecutiva, plantilla) {
    var indiceRule = plantilla.utilities && plantilla.utilities.indice;
    var sections = payload.editorial && payload.editorial.sections || [];
    var section = sections.filter(function (item) { return item.kind === 'indice'; })[0];
    if (!indiceRule || indiceRule.section !== 'contenido_y_mapa' || !section || document.getElementById(section.id)) return;
    var executive = document.getElementById(paginaEjecutiva);
    var executiveBody = executive && executive.querySelector('.page > .body');
    var toc = executiveBody && executiveBody.querySelector('.toc');
    var mapa = document.querySelector('#intro [data-bookclub-component="mapa"]');
    if (!executive || !executiveBody || !toc || !mapa) throw new Error('Faltan tabla de contenido o mapa para construir la página canónica.');
    var page = document.createElement('div'); page.id = section.id; page.className = 'pagina oculta';
    var hoja = document.createElement('section'); hoja.className = 'hoja';
    var pageInner = document.createElement('div'); pageInner.className = 'page';
    var header = document.createElement('div'); header.className = 'libro-header';
    header.innerHTML = '<div class="libro-header-titulo">' + textoSeguro(payload.meta && payload.meta.titulo) + '</div><div class="libro-header-paso">Contenido y mapa</div>';
    var lectura = document.createElement('div'); lectura.className = 'lectura-meta'; lectura.innerHTML = '⏱ Tiempo estimado: <span></span>';
    var body = document.createElement('div'); body.className = 'body fuente-m';
    var content = document.createElement('section'); content.className = 'bc-content-page';
    if (payload.reader && payload.reader.indice_incluido === true && !payload.reader.identidad_visual) throw new Error('Falta la identidad visual del libro.');
    var visual = Object.assign({}, plantilla.visual_identity && plantilla.visual_identity.content_page || {}, payload.reader && payload.reader.identidad_visual || {});
    ['title_font_token', 'title_color_token', 'label_color_token'].forEach(function (field) {
      var token = visual[field];
      if (payload.reader && payload.reader.indice_incluido === true && (!token || token.indexOf('--') !== 0 || !getComputedStyle(document.documentElement).getPropertyValue(token).trim())) throw new Error('No se pudo resolver el token visual: ' + (token || field));
    });
    if (visual.title_font_token) content.style.setProperty('--bc-title-font', visual.title_font_token.indexOf('--') === 0 ? 'var(' + visual.title_font_token + ')' : visual.title_font_token);
    if (visual.title_color_token) content.style.setProperty('--bc-title-color', visual.title_color_token.indexOf('--') === 0 ? 'var(' + visual.title_color_token + ')' : visual.title_color_token);
    if (visual.label_color_token) content.style.setProperty('--bc-label-color', visual.label_color_token.indexOf('--') === 0 ? 'var(' + visual.label_color_token + ')' : visual.label_color_token);
    var mark = document.createElement('div'); mark.className = 'bc-content-mark'; mark.setAttribute('aria-hidden', 'true');
    if (visual.symbol === 'cerebro-mini' && document.getElementById('cerebro-mini')) mark.innerHTML = '<svg viewBox="0 0 400 320"><use href="#cerebro-mini"></use></svg>';
    else if (visual.symbol === 'cover_art') {
      var coverArt = document.querySelector('#portada .arte');
      if (coverArt) { var artClone = coverArt.cloneNode(true); artClone.removeAttribute('id'); mark.appendChild(artClone); }
    } else if (visual.symbol && document.getElementById(visual.symbol)) mark.innerHTML = '<svg viewBox="0 0 400 320"><use href="#' + visual.symbol + '"></use></svg>';
    else if (visual.symbol) throw new Error('El símbolo visual declarado no existe: ' + visual.symbol);
    if (!mark.children.length) mark.remove();
    var kicker = document.createElement('div'); kicker.className = 'bc-content-kicker'; kicker.textContent = 'Contenido y mapa del libro';
    var title = document.createElement('h2'); title.className = 'bc-content-title'; title.textContent = 'Contenido del libro';
    var mapTitle = document.createElement('div'); mapTitle.className = 'bc-content-map-title'; mapTitle.textContent = 'Mapa del libro';
    var labels = plantilla.navigation || {};
    var nav = document.createElement('div'); nav.className = 'nav-final';
    nav.innerHTML = '<button class="btn-nav btn-regresar" onclick="irA(\'portada\')">← Portada</button><button class="btn-nav btn-siguiente" onclick="irA(\'' + paginaEjecutiva + '\')">Resumen ejecutivo →</button>';
    toc.removeAttribute('data-bookclub-utility');
    if (mark.children.length) content.appendChild(mark); content.appendChild(kicker); content.appendChild(title); content.appendChild(toc); content.appendChild(mapTitle); content.appendChild(mapa); content.appendChild(nav);
    body.appendChild(content); pageInner.appendChild(header); pageInner.appendChild(lectura); pageInner.appendChild(body); hoja.appendChild(pageInner); page.appendChild(hoja);
    executive.parentNode.insertBefore(page, executive);
    var firstMenu = document.querySelector('.menu-item[data-page="' + paginaEjecutiva + '"]');
    if (firstMenu) {
      var summaryMenuTitle = firstMenu.querySelector('.menu-item-titulo');
      if (summaryMenuTitle) summaryMenuTitle.textContent = labels.summary_menu_label || 'Resumen ejecutivo';
    }
    if (firstMenu && !document.querySelector('.menu-item[data-page="' + section.id + '"]')) {
      var menuItem = firstMenu.cloneNode(true); menuItem.dataset.page = section.id;
      menuItem.setAttribute('onclick', "irA('" + section.id + "')");
      var num = menuItem.querySelector('.menu-item-num'); if (num) num.textContent = '·';
      var menuTitle = menuItem.querySelector('.menu-item-titulo'); if (menuTitle) menuTitle.textContent = labels.content_page_label || 'Contenido y mapa';
      firstMenu.parentNode.insertBefore(menuItem, firstMenu);
    }
    var tocSummary = Array.prototype.filter.call(toc.querySelectorAll('.toc-btn'), function (button) {
      return (button.getAttribute('onclick') || '').indexOf("irA('" + paginaEjecutiva + "')") >= 0;
    })[0];
    if (tocSummary) tocSummary.innerHTML = '<span class="toc-num">R</span>' + (labels.summary_menu_label || 'Resumen ejecutivo') + '<span class="toc-arrow">→</span>';
    var summaryBack = executive.querySelector('.nav-final .btn-regresar');
    if (summaryBack) {
      summaryBack.setAttribute('onclick', "irA('" + section.id + "')");
      summaryBack.textContent = '← ' + (labels.summary_back_label || 'Contenido y mapa');
    }
    var readButton = document.getElementById('btn-leer');
    if (readButton) readButton.setAttribute('onclick', "irA('" + section.id + "')");
  }
  function aplicarPlantillaCanonica(payload, plantilla) {
    if (payload.reader && payload.reader.indice_incluido === true && !payload.reader.identidad_visual) throw new Error('Falta la identidad visual del libro.');
    if (!payload.reader || payload.reader.plantilla !== 'bookclub.editorial-template.v1') return;
    if (!plantilla || plantilla.schema !== 'bookclub.editorial-template.v1') throw new Error('Plantilla editorial JSON no disponible');
    var estructura = payload.reader.estructura || {};
    var ejecutivo = estructura.filtro && estructura.filtro.componentes || [];
    var introduccion = estructura.introduccion && estructura.introduccion.componentes || [];
    var slotsEjecutivo = plantilla.resumen_ejecutivo && plantilla.resumen_ejecutivo.slots || [];
    var slotsIntroduccion = plantilla.introduccion_y_mapa && plantilla.introduccion_y_mapa.slots || [];
    var indice = estructura.indice && estructura.indice.componentes || [];
    var slotsIndice = plantilla.contenido_y_mapa && plantilla.contenido_y_mapa.slots || [];
    if (ejecutivo.join('|') !== slotsEjecutivo.join('|') || introduccion.join('|') !== slotsIntroduccion.join('|') || indice.join('|') !== slotsIndice.slice(1).map(function (slot) { return slot === 'indice' ? 'tabla' : slot; }).join('|')) {
      throw new Error('El resumen no cumple el contrato editorial JSON');
    }
    agregarEstilosPlantilla();
    var secciones = payload.editorial && payload.editorial.sections || [];
    var seccionEjecutiva = secciones.filter(function (section) { return section.kind === 'filtro'; })[0];
    var paginaEjecutiva = seccionEjecutiva ? seccionEjecutiva.id : (payload.reader.paginas || [])[1];
    if (!montarSeccionCanonica(paginaEjecutiva, 'resumen-ejecutivo', slotsEjecutivo)) throw new Error('No se pudo montar el resumen ejecutivo canónico');
    normalizarResumenEjecutivo(payload, paginaEjecutiva);
    var seccionIntroduccion = secciones.filter(function (section) { return section.kind === 'introduccion'; })[0];
    var paginaIntroduccion = seccionIntroduccion && seccionIntroduccion.id;
    if (!montarSeccionCanonica(paginaIntroduccion, 'introduccion', slotsIntroduccion)) throw new Error('No se pudo montar la introducción canónica');
    var seccionIndice = secciones.filter(function (section) { return section.kind === 'indice'; })[0];
    if (payload.reader.indice_incluido === true) {
      var paginaIndice = seccionIndice && document.getElementById(seccionIndice.id);
      var partesIndice = paginaIndice && paginaIndice.querySelectorAll('[data-bookclub-component]');
      var componentesIndice = partesIndice ? Array.prototype.map.call(partesIndice, function (node) { return node.getAttribute('data-bookclub-component'); }) : [];
      if (!paginaIndice || componentesIndice.join('|') !== 'tabla|mapa') throw new Error('Falta la página «Contenido y mapa» o sus componentes.');
    } else crearPaginaContenido(payload, paginaEjecutiva, plantilla);
    document.documentElement.setAttribute('data-bookclub-template', plantilla.schema);
  }
  function iniciar(payload, plantilla) {
    if (!payload || !payload.reader || !payload.reader.body_html) { fail(); return; }
    window.BOOKCLUB_JSON_READER_CONFIG = payload.reader;
    document.title = payload.meta && payload.meta.titulo ? payload.meta.titulo + ' — ' + payload.meta.autor : document.title;
    var meta = document.getElementById('libro-meta'); if (meta && payload.meta) meta.textContent = JSON.stringify(payload.meta, null, 2);
    document.body.className = payload.reader.body_class || '';
    document.body.innerHTML = payload.reader.body_html;
    var cleanToggle = document.getElementById('toggle-lectura');
    if (cleanToggle) {
      var cleanRow = cleanToggle.closest('.config-row');
      if (cleanRow) {
        var previous = cleanRow.previousElementSibling, next = cleanRow.nextElementSibling;
        cleanRow.remove();
        if (previous && previous.classList.contains('config-sep')) previous.remove();
        if (next && next.classList.contains('config-sep')) next.remove();
      }
    }
    document.body.classList.remove('modo-lectura');
    aplicarPlantillaCanonica(payload, plantilla);
    if (payload.reader.cover_image) {
      var cover = document.querySelector('#portada .cv');
      if (cover) {
        var image = document.createElement('img');
        image.className = 'cv-cover'; image.src = payload.reader.cover_image;
        image.alt = 'Portada de ' + (payload.reader.titulo || document.title);
        cover.replaceWith(image);
        document.getElementById('portada').classList.add('con-portada-imagen');
        var coverStyle = document.createElement('style');
        coverStyle.textContent = '#portada.con-portada-imagen .portada-inner{max-width:31rem}#portada.con-portada-imagen .p-eyebrow{margin-bottom:.9rem}#portada.con-portada-imagen .cv-cover{display:block;width:min(100%,28rem);max-height:52vh;object-fit:contain;margin:0 auto 1rem;box-shadow:0 18px 42px -22px rgba(0,0,0,.7)}#portada.con-portada-imagen .p-continuar .btn-cont{background:#272421;color:#f5f2ea;border:1px solid rgba(255,255,255,.18);box-shadow:none}@media(max-height:760px){#portada.con-portada-imagen .cv-cover{max-height:44vh}}';
        document.head.appendChild(coverStyle);
      }
    }
    var enlaceBookclub = document.getElementById('bookclub-home');
    if (enlaceBookclub) enlaceBookclub.setAttribute('href', '../biblioteca/');
    var motor = document.createElement('script'); motor.text = "var FUENTES = ['fuente-s','fuente-m','fuente-l','fuente-xl'];\n  var FUENTE_LABELS = ['S','M','L','XL'];\n  var fuenteIdx = 1;\n\n  var PAGINAS = window.BOOKCLUB_JSON_READER_CONFIG.paginas;\n  var paginaActual = 'portada';\n  var TIEMPOS = window.BOOKCLUB_JSON_READER_CONFIG.tiempos;\n  var ultimoScroll = 0;\n\n  function leerPref(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }\n  function guardarPref(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }\n\n  function toggleConfig() {\n    var panel = document.getElementById('config-panel');\n    var overlay = document.getElementById('config-overlay');\n    if (panel.classList.contains('abierto')) {\n      cerrarConfig();\n    } else {\n      panel.classList.add('visible');\n      overlay.classList.add('activo');\n      requestAnimationFrame(function() { panel.classList.add('abierto'); });\n    }\n  }\n\n  function cerrarConfig() {\n    var panel = document.getElementById('config-panel');\n    panel.classList.remove('abierto');\n    document.getElementById('config-overlay').classList.remove('activo');\n    setTimeout(function() { panel.classList.remove('visible'); }, 200);\n  }\n\n  function toggleDark() {\n    var dark = document.body.classList.toggle('dark');\n    document.getElementById('toggle-dark').checked = dark;\n    guardarPref('bookclub-theme', dark ? 'dark' : 'light');\n  }\n\n  function aplicarFuente() {\n    document.querySelectorAll('.body').forEach(function(b) {\n      FUENTES.forEach(function(c) { b.classList.remove(c); });\n      b.classList.add(FUENTES[fuenteIdx]);\n    });\n    document.getElementById('fuente-nivel').textContent = FUENTE_LABELS[fuenteIdx];\n  }\n\n  function cambiarFuente(dir) {\n    var nuevo = Math.max(0, Math.min(FUENTES.length - 1, fuenteIdx + dir));\n    if (nuevo === fuenteIdx) return;\n    fuenteIdx = nuevo;\n    aplicarFuente();\n    guardarPref('bookclub-fuente', String(fuenteIdx));\n  }\n\n  function abrirMenu() {\n    document.getElementById('menu-panel').classList.add('abierto');\n    document.getElementById('menu-overlay').classList.add('activo');\n    cerrarConfig();\n    setTimeout(function() {\n      var a = document.querySelector('#menu-panel .menu-item.activo');\n      if (a && a.scrollIntoView) a.scrollIntoView({ block: 'center' });\n    }, 80);\n  }\n\n  function cerrarMenu() {\n    document.getElementById('menu-panel').classList.remove('abierto');\n    document.getElementById('menu-overlay').classList.remove('activo');\n  }\n\n  function actualizarInfo(id, d) {\n    var idx = PAGINAS.indexOf(id), total = PAGINAS.length - 1;\n    var paso = d.querySelector('.libro-header-paso');\n    var lab = document.querySelector('#tb-info .tb-label'), pos = document.querySelector('#tb-info .tb-pos');\n    if (lab) lab.textContent = paso ? paso.textContent : '';\n    if (pos) pos.innerHTML = idx + '<i> / ' + total + '</i>';\n  }\n\n  function irA(id) {\n    var d = document.getElementById(id);\n    if (!d) return;\n    document.querySelectorAll('.pagina').forEach(function(p) {\n      p.classList.remove('visible'); p.classList.add('oculta');\n    });\n    d.classList.remove('oculta'); d.classList.add('visible'); d.scrollTop = 0;\n    paginaActual = id;\n    var esPortada = id === 'portada';\n    document.body.classList.toggle('en-portada', esPortada);\n    document.body.classList.remove('bar-oculta');\n    ultimoScroll = 0;\n    document.getElementById('menu-btn').style.display = esPortada ? 'none' : 'flex';\n    document.getElementById('btn-config').style.display = esPortada ? 'none' : 'flex';\n    var barra = document.getElementById('barra-progreso');\n    barra.style.display = esPortada ? 'none' : 'block';\n    barra.style.width = '0%';\n    if (TIEMPOS[id]) { var m = d.querySelector('.lectura-meta span'); if (m) m.textContent = TIEMPOS[id]; }\n    document.querySelectorAll('.menu-item').forEach(function(b) { b.classList.toggle('activo', b.dataset.page === id); });\n    if (!esPortada) actualizarInfo(id, d);\n    cerrarMenu();\n    cerrarConfig();\n    d.onscroll = function() {\n      if (paginaActual !== id) return;\n      var y = d.scrollTop, s = d.scrollHeight - d.clientHeight;\n      barra.style.width = s <= 0 ? '100%' : Math.min(100, Math.round((y / s) * 100)) + '%';\n      registrarAvance(id, s <= 0 ? 1 : y / s);\n      var dy = y - ultimoScroll;\n      if (y < 60) { document.body.classList.remove('bar-oculta'); ultimoScroll = y; }\n      else if (Math.abs(dy) > 8) {\n        document.body.classList.toggle('bar-oculta', dy > 0 && y > 140);\n        ultimoScroll = y;\n      }\n    };\n  }\n\n  var sx = 0, sy = 0, sm = false;\n  document.addEventListener('touchstart', function(e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; sm = false; }, { passive: true });\n  document.addEventListener('touchmove', function() { sm = true; }, { passive: true });\n  document.addEventListener('touchend', function(e) {\n    if (!sm) return;\n    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;\n    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;\n    if (document.getElementById('menu-panel').classList.contains('abierto')) return;\n    if (document.getElementById('config-panel').classList.contains('abierto')) return;\n    var idx = PAGINAS.indexOf(paginaActual);\n    if (dx < 0 && idx < PAGINAS.length - 1) irA(PAGINAS[idx + 1]);\n    else if (dx > 0 && idx > 0) irA(PAGINAS[idx - 1]);\n  }, { passive: true });\n\n  document.addEventListener('keydown', function(e) {\n    if (e.metaKey || e.ctrlKey || e.altKey) return;\n    var tag = e.target && e.target.tagName;\n    if (tag === 'INPUT' || tag === 'TEXTAREA') return;\n    if (e.key === 'Escape') { cerrarMenu(); cerrarConfig(); return; }\n    if (document.getElementById('menu-panel').classList.contains('abierto')) return;\n    if (document.getElementById('config-panel').classList.contains('abierto')) return;\n    var idx = PAGINAS.indexOf(paginaActual);\n    if (e.key === 'ArrowRight' && idx < PAGINAS.length - 1) irA(PAGINAS[idx + 1]);\n    else if (e.key === 'ArrowLeft' && idx > 0) irA(PAGINAS[idx - 1]);\n  });\n\n  document.addEventListener('click', function(e) {\n    var a = e.target.closest('a[href^=\"#\"]');\n    if (!a) return;\n    var h = a.getAttribute('href');\n    if (h === '#') return;\n    var t = document.querySelector(h);\n    if (t) {\n      e.preventDefault();\n      var pv = document.querySelector('.pagina.visible');\n      if (!pv) return;\n      pv.scrollTo({ top: t.getBoundingClientRect().top - pv.getBoundingClientRect().top + pv.scrollTop - 16, behavior: 'smooth' });\n    }\n  });\n\n  /* Inicio: tema (compartido con la Home), tamaño de letra y rótulos de navegación */\n  (function() {\n    var tema = leerPref('bookclub-theme');\n    var oscuro = tema === 'dark' || (!tema && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);\n    if (oscuro) { document.body.classList.add('dark'); document.getElementById('toggle-dark').checked = true; }\n    var f = parseInt(leerPref('bookclub-fuente'), 10);\n    if (f >= 0 && f < FUENTES.length) fuenteIdx = f;\n    aplicarFuente();\n    var titulos = {};\n    document.querySelectorAll('.menu-item').forEach(function(b) {\n      var t = b.querySelector('.menu-item-titulo');\n      if (t) titulos[b.dataset.page] = t.textContent;\n    });\n    document.querySelectorAll('.nav-final .btn-nav').forEach(function(b) {\n      var m = /irA\\('([^']+)'\\)/.exec(b.getAttribute('onclick') || '');\n      if (m && m[1] !== 'portada' && titulos[m[1]]) {\n        var sm2 = document.createElement('small'); sm2.textContent = titulos[m[1]]; b.appendChild(sm2);\n      }\n    });\n  })();\n  /* ═══ Avance de lectura: dónde ibas, qué has leído, cuánto llevas ═══ */\n  var CLAVE_PROG = window.BOOKCLUB_JSON_READER_CONFIG.clave_progreso;\n  var CONT_PAGS = PAGINAS.slice(1);\n  var prog = { ult: null, r: 0, p: {} };\n  var guardaT = null, restauro = null, resetT = null, tituloDe = {}, numDe = {};\n\n  function cargarProg() {\n    try {\n      var j = JSON.parse(localStorage.getItem(CLAVE_PROG));\n      if (j && typeof j === 'object' && j.p) { prog = { ult: j.ult || null, r: +j.r || 0, p: j.p }; }\n    } catch (e) {}\n  }\n  var sucio = false;\n  function guardarProg() { if (!sucio) return; sucio = false; try { localStorage.setItem(CLAVE_PROG, JSON.stringify(prog)); } catch (e) {} }\n  function guardarPronto() { sucio = true; if (guardaT) return; guardaT = setTimeout(function() { guardaT = null; guardarProg(); }, 500); }\n  function ratioDe(id) { return Math.min(1, prog.p[id] || 0); }\n  function avanceLibro() {\n    var t = 0; CONT_PAGS.forEach(function(id) { t += ratioDe(id); });\n    return Math.floor((t / CONT_PAGS.length) * 100);\n  }\n  function etiquetaPag(id) {\n    var n = numDe[id];\n    return (/^\\d+$/.test(n || '') ? 'Capítulo ' + n + ' · ' : '') + (tituloDe[id] || '');\n  }\n  function destinoContinuar() {\n    var id = prog.ult, r = prog.r || 0;\n    if (!id || CONT_PAGS.indexOf(id) < 0) return null;\n    var i = CONT_PAGS.indexOf(id);\n    if (r >= 0.95 && i < CONT_PAGS.length - 1) return { id: CONT_PAGS[i + 1], r: 0 };\n    return { id: id, r: r };\n  }\n  function hayAvance() {\n    var d = destinoContinuar();\n    if (!d) return false;\n    return avanceLibro() > 0 || d.id !== 'p1' || d.r > 0.02;\n  }\n\n  function pintarProg() {\n    var pct = avanceLibro(), actual = PAGINAS.indexOf(paginaActual) > 0 ? paginaActual : null;\n    var set = function(id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; };\n    set('ma-pct', pct + ' %'); set('tb-book-pct', pct + ' %'); set('bc-pct', pct + ' %');\n    var fill = document.getElementById('bc-fill'); if (fill) fill.style.width = pct + '%';\n    var riel = document.getElementById('ma-riel');\n    if (riel) {\n      if (!riel.children.length) CONT_PAGS.forEach(function() { riel.appendChild(document.createElement('i')); });\n      CONT_PAGS.forEach(function(id, i) {\n        var seg = riel.children[i];\n        seg.style.setProperty('--f', Math.round(ratioDe(id) * 100) + '%');\n        seg.classList.toggle('act', id === actual);\n      });\n    }\n    document.querySelectorAll('.menu-item').forEach(function(b) {\n      var id = b.dataset.page, r = ratioDe(id), est = b.querySelector('.menu-item-estado');\n      b.style.setProperty('--pr', r >= 0.95 ? 0 : r);\n      b.classList.toggle('leido', r >= 0.95);\n      b.classList.toggle('parcial', r > 0.02 && r < 0.95);\n      if (est) est.textContent = (r > 0.02 && r < 0.95) ? Math.round(r * 100) + ' %' : '';\n    });\n    var d = hayAvance() ? destinoContinuar() : null;\n    var pc = document.getElementById('p-continuar'), bl = document.getElementById('btn-leer'), mc = document.getElementById('ma-cont');\n    if (pc) pc.classList.toggle('visible', !!d);\n    if (bl) bl.classList.toggle('sec', !!d);\n    if (mc) mc.classList.toggle('visible', !!d);\n    if (d) {\n      var sub = etiquetaPag(d.id) + (d.r > 0.02 ? ' · ' + Math.round(d.r * 100) + ' %' : '');\n      set('bc-sub', sub); set('ma-cont-sub', sub);\n    }\n  }\n\n  function registrarAvance(id, ratio) {\n    ratio = Math.max(0, Math.min(1, ratio));\n    var cambio = false;\n    if (ratio > (prog.p[id] || 0) + 0.004 || (ratio >= 0.95 && (prog.p[id] || 0) < 1)) {\n      prog.p[id] = ratio >= 0.95 ? 1 : ratio; cambio = true;\n    }\n    if (prog.ult === id && Math.abs((prog.r || 0) - ratio) > 0.004) { prog.r = ratio; cambio = true; }\n    if (cambio) { set_tb(); guardarPronto(); }\n  }\n  function set_tb() { var e = document.getElementById('tb-book-pct'); if (e) e.textContent = avanceLibro() + ' %'; }\n\n  function restaurarPos(id, r) {\n    restauro = { id: id, r: r, t: Date.now(), tocado: false };\n    var ap = function() {\n      if (!restauro || restauro.id !== id || restauro.tocado || paginaActual !== id) return;\n      var d = document.getElementById(id), sc = d.scrollHeight - d.clientHeight;\n      if (sc > 0) { d.scrollTop = sc * r; ultimoScroll = d.scrollTop; document.body.classList.remove('bar-oculta'); }\n    };\n    requestAnimationFrame(ap); setTimeout(ap, 200); setTimeout(ap, 700);\n    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function() { if (Date.now() - restauro.t < 2500) ap(); });\n  }\n  ['touchstart', 'wheel', 'keydown', 'pointerdown'].forEach(function(ev) {\n    document.addEventListener(ev, function() { if (restauro) restauro.tocado = true; }, { passive: true });\n  });\n\n  function continuar() {\n    var d = destinoContinuar();\n    if (!d) { irA('p1'); return; }\n    irA(d.id, d.r);\n  }\n\n  function reiniciarAvance() {\n    var b = document.getElementById('btn-reset');\n    if (!b.classList.contains('confirmar')) {\n      b.classList.add('confirmar'); b.textContent = '¿Seguro? Toca otra vez';\n      resetT = setTimeout(function() { b.classList.remove('confirmar'); b.textContent = 'Borrar'; }, 3500);\n      return;\n    }\n    clearTimeout(resetT); b.classList.remove('confirmar'); b.textContent = 'Borrado ✓';\n    prog = { ult: null, r: 0, p: {} }; sucio = true; guardarProg(); pintarProg();\n    setTimeout(function() { b.textContent = 'Borrar'; }, 1800);\n  }\n\n  var irAOrig = irA;\n  irA = function(id, r) {\n    irAOrig(id);\n    if (id !== 'portada') {\n      prog.ult = id; prog.r = r || 0; guardarPronto();\n      setTimeout(function() {\n        var d = document.getElementById(id), sc = d.scrollHeight - d.clientHeight;\n        if (sc <= 0 && paginaActual === id) registrarAvance(id, 1);\n      }, 350);\n      if (r > 0) restaurarPos(id, r); else restauro = null;\n    } else { restauro = null; }\n    pintarProg();\n  };\n  var abrirMenuOrig = abrirMenu;\n  abrirMenu = function() { pintarProg(); abrirMenuOrig(); };\n\n  window.addEventListener('pagehide', guardarProg);\n  document.addEventListener('visibilitychange', function() { if (document.hidden) guardarProg(); });\n\n  (function() {\n    cargarProg();\n    document.querySelectorAll('.menu-item').forEach(function(b) {\n      var t = b.querySelector('.menu-item-titulo'), n = b.querySelector('.menu-item-num');\n      tituloDe[b.dataset.page] = t ? t.textContent : ''; numDe[b.dataset.page] = n ? n.textContent : '';\n      var e = document.createElement('span'); e.className = 'menu-item-estado'; b.appendChild(e);\n    });\n    pintarProg();\n  })();\n"; document.body.appendChild(motor);
    var mejoras = document.createElement('script');
    mejoras.text = "(function () {\n" +
      "  function volverABiblioteca() {\n" +
      "    window.location.assign('../biblioteca/');\n" +
      "  }\n" +
      "  var guardarOriginal = guardarProg;\n" +
      "  guardarProg = function () { prog.t = Date.now(); guardarOriginal(); };\n" +
      "  function guardarInmediatamente() { sucio = true; guardarProg(); }\n" +
      "  function marcarPorLeer() {\n" +
      "    var archivo = (window.location.pathname || '').split('/').pop() || '';\n" +
      "    var clave = 'libros/' + archivo, ahora = Date.now(), biblioteca = {};\n" +
      "    try { biblioteca = JSON.parse(localStorage.getItem('bookclub-biblioteca') || '{}') || {}; } catch (error) {}\n" +
      "    biblioteca[clave] = { e: 'porleer', t: ahora };\n" +
      "    try { localStorage.setItem('bookclub-biblioteca', JSON.stringify(biblioteca)); } catch (error) {}\n" +
      "    if (window.BookclubSync && typeof window.BookclubSync.setLibraryState === 'function') return window.BookclubSync.setLibraryState(clave, 'porleer', ahora);\n" +
      "    return Promise.resolve();\n" +
      "  }\n" +
      "  hayAvance = function () {\n" +
      "    var destino = destinoContinuar();\n" +
      "    if (!destino) return false;\n" +
      "    return avanceLibro() > 0 || destino.id !== CONT_PAGS[0] || destino.r > 0.02;\n" +
      "  };\n" +
      "  function terminarLibro(event) {\n" +
      "    if (event) { event.preventDefault(); event.stopImmediatePropagation(); }\n" +
      "    CONT_PAGS.forEach(function (id) { prog.p[id] = 1; });\n" +
      "    prog.ult = PAGINAS[PAGINAS.length - 1]; prog.r = 1; prog.t = Date.now(); delete prog.resetAt;\n" +
      "    guardarInmediatamente(); pintarProg();\n" +
      "    var salir = function () { volverABiblioteca(); };\n" +
      "    if (window.BookclubSync && typeof window.BookclubSync.flush === 'function') window.BookclubSync.flush().then(salir, salir); else salir();\n" +
      "  }\n" +
      "  var inicio = document.getElementById('bookclub-home');\n" +
      "  if (inicio) inicio.setAttribute('href', '../biblioteca/');\n" +
      "  var ultima = document.getElementById(PAGINAS[PAGINAS.length - 1]);\n" +
      "  var finalizar = ultima && ultima.querySelector('.nav-final .btn-siguiente, .nav-final button:last-child, .nav-final a:last-child');\n" +
      "  if (finalizar) {\n" +
      "    finalizar.classList.remove('btn-regresar'); finalizar.classList.add('btn-siguiente');\n" +
      "    var navegacion = finalizar.parentNode, anterior = navegacion.querySelector('.btn-regresar');\n" +
      "    if (!anterior) { anterior = document.createElement('button'); anterior.type = 'button'; anterior.className = 'btn-nav btn-regresar'; anterior.textContent = '← Anterior'; anterior.addEventListener('click', function () { irA(PAGINAS[PAGINAS.length - 2]); }); navegacion.insertBefore(anterior, finalizar); }\n" +
      "    finalizar.textContent = 'Terminar ✓'; finalizar.setAttribute('aria-label', 'Terminar libro y volver a BookClub'); finalizar.addEventListener('click', terminarLibro, true);\n" +
      "  }\n" +
      "  var resetOriginal = reiniciarAvance;\n" +
      "  reiniciarAvance = function () {\n" +
      "    var boton = document.getElementById('btn-reset');\n" +
      "    if (!boton.classList.contains('confirmar')) { resetOriginal(); return; }\n" +
      "    clearTimeout(resetT); boton.classList.remove('confirmar');\n" +
      "    var ahora = Date.now(); prog = { ult: null, r: 0, p: {}, t: ahora, resetAt: ahora }; sucio = false;\n" +
      "    try { localStorage.setItem(CLAVE_PROG, JSON.stringify(prog)); } catch (error) {}\n" +
      "    pintarProg(); boton.textContent = 'Borrado ✓';\n" +
      "    var salir = function () { volverABiblioteca(); };\n" +
      "    var terminado = function () { marcarPorLeer().then(salir, salir); };\n" +
      "    if (window.BookclubSync && typeof window.BookclubSync.resetProgress === 'function') window.BookclubSync.resetProgress(CLAVE_PROG, JSON.stringify(prog)).then(terminado, terminado); else terminado();\n" +
      "  };\n" +
      "  pintarProg();\n" +
      "})();";
    document.body.appendChild(mejoras);
    agruparMenu(payload.reader.menu_groups);
    if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('../sw.js').catch(function () {}); });
    function refrescar() { if (typeof cargarProg==='function') { cargarProg(); if (typeof pintarProg==='function') pintarProg(); } }
    window.addEventListener('bookclub-sync-ready', refrescar);
    if (window.BookclubSync && window.BookclubSync.ready) window.BookclubSync.ready.then(refrescar);
  }
  fetch(DATA_URL, { cache: 'no-store' }).then(function (response) {
    if (!response.ok) throw new Error('JSON no disponible'); return response.json();
  }).then(function (payload) {
    if (!payload.reader || !payload.reader.plantilla) {
      if (payload && payload.reader && payload.reader.indice_incluido === true) throw new Error('Falta la plantilla editorial para este lector JSON.');
      return iniciar(payload, null);
    }
    if (payload.reader.plantilla !== 'bookclub.editorial-template.v1') throw new Error('Plantilla editorial no compatible.');
    return fetch('./bookclub-editorial-template.v1.json', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('Plantilla JSON no disponible'); return response.json();
    }).then(function (plantilla) { return iniciar(payload, plantilla); });
  }).catch(fail);
})();
