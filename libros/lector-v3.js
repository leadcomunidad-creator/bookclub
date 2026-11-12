/* BOOKCLUB · Lector v3 (rediseño, Fase 3).
   Capa sobre json-reader-engine.js: no cambia el texto ni el diseño de las páginas
   ni la forma de guardar el avance. Agrega:
   - Escritorio (≥960 px): contenido a la izquierda, capítulo al centro, ideas y práctica a la derecha.
   - Barra superior: ‹ Biblioteca, título · autor, Aa (tres tamaños) y tema; debajo, la línea de avance.
   - Al seleccionar texto: Guardar idea · Nota · Compartir (ideas en localStorage «bookclub-ideas»).
   - Audio con la voz del dispositivo (Web Speech API), párrafo por párrafo. */
(function () {
  'use strict';
  if (window.__bookclubLectorV3) return;
  window.__bookclubLectorV3 = true;
  if (!document.querySelector('.pagina') || typeof window.irA !== 'function') return;

  var META = window.BOOKCLUB_LECTOR_META || {};
  var RD = window.BOOKCLUB_LECTOR_READER || {};
  var LIBRO = 'libros/' + ((location.pathname || '').split('/').pop() || '');
  var TITULO = META.titulo || document.title, AUTOR = META.autor || '';
  var IDEAS_KEY = 'bookclub-ideas', COMP_KEY = 'bookclub-compromiso', VEL_KEY = 'bookclub-audio-vel';
  var VELS = [0.85, 1, 1.25, 1.5];
  var HAY_VOZ = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
  var DESKTOP = window.matchMedia('(min-width: 960px)');
  var TACTIL = window.matchMedia('(pointer: coarse)');
  var REDUCIDO = window.matchMedia('(prefers-reduced-motion: reduce)');

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function hoyISO() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function limpio(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  function $(id) { return document.getElementById(id); }
  function paginaActualId() { return window.paginaActual || 'portada'; }
  function paginaEl() { return document.querySelector('.pagina.visible'); }

  /* ── Fuentes y estilos ── */
  var fuentes = document.createElement('link');
  fuentes.rel = 'stylesheet';
  fuentes.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap';
  document.head.appendChild(fuentes);

  var css = document.createElement('style');
  css.id = 'bookclub-lector-v3';
  css.textContent = [
    'body.bc3{--bc3-sans:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;--bc3-serif:"Newsreader",Georgia,serif;--bc3-top:calc(63px + env(safe-area-inset-top,0px));--bc3-bot:0px;--bc3-l:0px;--bc3-r:0px;--libro-soft:color-mix(in srgb,var(--libro) 16%,transparent)}',
    'body.bc3.bc3-voz{--bc3-bot:calc(76px + env(safe-area-inset-bottom,0px))}',
    'body.bc3 #topbar,body.bc3 #menu-btn,body.bc3 #btn-config,body.bc3 #tb-info,body.bc3 #barra-progreso{display:none!important}',
    'body.bc3:not(.en-portada) #bookclub-home{display:none!important}',
    'body.bc3:not(.en-portada) .pagina{top:var(--bc3-top);bottom:var(--bc3-bot);left:var(--bc3-l);right:var(--bc3-r);scrollbar-width:none}',
    'body.bc3 .pagina::-webkit-scrollbar{display:none}',
    'body.bc3:not(.en-portada) .page{padding-top:.25rem}',
    'body.bc3.en-portada .bc3-top,body.bc3.en-portada .bc3-toc,body.bc3.en-portada .bc3-lado,body.bc3.en-portada .bc3-audio{display:none!important}',
    '@media(min-width:960px){body.bc3{--bc3-l:240px;--bc3-r:290px}}',
    '@media(min-width:1280px){body.bc3{--bc3-l:280px;--bc3-r:330px}}',
    /* Barra superior */
    '.bc3-top{position:fixed;top:0;left:0;right:0;z-index:9993;padding-top:env(safe-area-inset-top,0px);background:var(--paper);border-bottom:1px solid var(--rule);font-family:var(--bc3-sans)}',
    '.bc3-top-in{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:12px;min-height:62px;padding:0 max(16px,env(safe-area-inset-right,0px)) 0 max(16px,env(safe-area-inset-left,0px))}',
    '.bc3-atras{justify-self:start;display:inline-flex;align-items:center;gap:6px;border:0;background:none;color:var(--text);font:600 .95rem/1 var(--bc3-sans);cursor:pointer;padding:8px 0}',
    '.bc3-tit{font:600 .92rem/1.2 var(--bc3-sans);color:var(--text);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52vw}',
    '.bc3-tit span{color:var(--text-3);font-weight:500}',
    '.bc3-der{justify-self:end;display:flex;gap:8px}',
    '.bc3-ib{width:42px;height:42px;border-radius:50%;border:1px solid var(--rule-2);background:var(--card);color:var(--text);display:grid;place-items:center;font:600 .95rem/1 var(--bc3-sans);cursor:pointer;padding:0}',
    '.bc3-ib:hover{border-color:var(--text-2)}',
    '.bc3-prog{height:3px;background:var(--rule)}',
    '.bc3-prog i{display:block;height:100%;width:0;background:var(--libro);transition:width .3s ease}',
    '.bc3-solo-movil{display:none}',
    '@media(max-width:959px){.bc3-solo-movil{display:grid}.bc3-tit{max-width:46vw}}',
    '@media(max-width:640px){.bc3-tit{display:none}.bc3-top-in{grid-template-columns:auto 1fr}}',
    /* Contenido */
    '.bc3-toc{position:fixed;top:var(--bc3-top);bottom:var(--bc3-bot);left:0;width:var(--bc3-l);z-index:9992;overflow-y:auto;scrollbar-width:none;padding:26px 14px 30px max(18px,env(safe-area-inset-left,0px));display:grid;gap:2px;align-content:start;font-family:var(--bc3-sans);background:var(--paper);border-right:1px solid var(--rule)}',
    '.bc3-toc::-webkit-scrollbar{display:none}',
    '.bc3-toc h4{margin:0 0 10px;font:700 11px/1 var(--bc3-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--text-3)}',
    '.bc3-toc .g{margin:12px 0 4px;padding:0 10px;font:700 .74rem/1.3 var(--bc3-sans);color:var(--text-3)}',
    '.bc3-toc button.it{display:grid;grid-template-columns:18px minmax(0,1fr);gap:8px;align-items:start;text-align:left;border:0;background:none;padding:8px 10px;border-radius:10px;color:var(--text-2);font:500 .88rem/1.3 var(--bc3-sans);cursor:pointer}',
    '.bc3-toc button.it .n{color:var(--text-3);font-variant-numeric:tabular-nums}',
    '.bc3-toc button.it.hecho .n{color:#3fae6a}',
    '.bc3-toc button.it[aria-current="true"]{background:var(--libro-soft);color:var(--text);font-weight:600;box-shadow:inset 3px 0 0 var(--libro)}',
    '.bc3-toc button.it[aria-current="true"] .n{color:var(--text)}',
    '.bc3-toc button.it:hover{color:var(--text)}',
    '.bc3-toc .ajustes{margin-top:16px;justify-self:start;border:0;background:none;padding:8px 10px;color:var(--text-2);font:600 .85rem/1 var(--bc3-sans);cursor:pointer;text-decoration:underline;text-underline-offset:3px}',
    '.bc3-velo{position:fixed;inset:0;z-index:9994;background:rgba(5,6,8,.5)}',
    '@media(max-width:959px){.bc3-toc{display:none;width:min(340px,88vw);bottom:0;box-shadow:0 24px 60px -12px rgba(0,0,0,.6)}.bc3-toc.abierto{display:grid;z-index:9995}}',
    /* Lado derecho */
    '.bc3-lado{display:grid;gap:16px;align-content:start;font-family:var(--bc3-sans);font-size:16px;line-height:1.5}',
    '@media(min-width:960px){.bc3-lado{position:fixed;top:var(--bc3-top);bottom:var(--bc3-bot);right:0;width:var(--bc3-r);z-index:9992;overflow-y:auto;scrollbar-width:none;padding:26px max(18px,env(safe-area-inset-right,0px)) 30px 18px;background:var(--paper);border-left:1px solid var(--rule)}}',
    '.bc3-lado::-webkit-scrollbar{display:none}',
    '@media(max-width:959px){.bc3-lado{margin:2rem var(--gut,1.25rem) 1.5rem}}',
    '.bc3-guardadas{padding:18px;border-radius:16px;border:1px solid var(--rule);background:var(--card);display:grid;gap:12px}',
    '.bc3-guardadas h4{margin:0;font:700 11px/1 var(--bc3-sans);letter-spacing:.14em;text-transform:uppercase;color:var(--text-2)}',
    '.bc3-guardadas q{display:block;font:400 1rem/1.5 var(--bc3-serif);color:var(--text);quotes:"«" "»";padding-bottom:12px;border-bottom:1px solid var(--rule)}',
    '.bc3-guardadas q:last-child{border-bottom:0;padding-bottom:0}',
    '.bc3-guardadas .vacio{font-size:.86rem;color:var(--text-3)}',
    '.bc3-practica{display:grid;gap:12px;padding:20px;border-radius:16px;background:#14161c;color:#eceef3;box-shadow:0 0 0 1px var(--rule)}',
    '.bc3-practica .k{font:700 11px/1 var(--bc3-sans);letter-spacing:.14em;text-transform:uppercase;color:#9ca0ff}',
    '.bc3-practica p{margin:0;font:400 .96rem/1.55 var(--bc3-sans)}',
    '.bc3-practica .meta{font-size:.8rem;color:#8a90a0}',
    '.bc3-practica button{justify-self:stretch;display:inline-flex;justify-content:center;align-items:center;gap:.4rem;min-height:42px;border-radius:99px;border:1px solid #9ca0ff;background:#9ca0ff;color:#0b0c10;font:600 .9rem/1 var(--bc3-sans);cursor:pointer}',
    '.bc3-practica button[aria-pressed="true"]{background:transparent;color:#9ca0ff}',
    /* Marcas */
    'mark.bc3-mark{background:var(--libro-soft);color:inherit;box-shadow:0 2px 0 var(--libro);border-radius:2px;padding:0 1px}',
    '.bc3-leyendo{background:color-mix(in srgb,var(--libro) 9%,transparent);border-radius:6px;box-shadow:0 0 0 6px color-mix(in srgb,var(--libro) 9%,transparent)}',
    /* Barra de selección y nota */
    '.bc3-sel{position:fixed;z-index:10001;display:flex;gap:2px;padding:6px;border-radius:16px;background:#14161c;box-shadow:0 14px 40px -10px rgba(0,0,0,.6);transform:translate(-50%,-100%);font-family:var(--bc3-sans)}',
    '.bc3-sel.abajo{transform:translate(-50%,0)}',
    '.bc3-sel button{display:inline-flex;align-items:center;gap:8px;border:0;background:none;color:#fff;padding:10px 14px;border-radius:11px;font:700 .95rem/1 var(--bc3-sans);cursor:pointer;white-space:nowrap}',
    '.bc3-sel button:first-child{background:#3b3fd8}',
    '.bc3-sel button:focus-visible{outline:2px solid #9ca0ff;outline-offset:1px}',
    '.bc3-nota{position:fixed;z-index:10001;width:min(320px,90vw);transform:translateX(-50%);padding:14px;border-radius:14px;background:var(--card);color:var(--text);box-shadow:0 24px 60px -12px rgba(0,0,0,.6),0 0 0 1px var(--rule);display:grid;gap:10px;font-family:var(--bc3-sans)}',
    '.bc3-nota q{font:italic .95rem/1.4 var(--bc3-serif)}',
    '.bc3-nota label{font-size:.82rem;color:var(--text-3)}',
    '.bc3-nota textarea{width:100%;min-height:80px;resize:vertical;border-radius:10px;border:1px solid var(--rule-2);background:var(--paper);color:var(--text);font:400 .95rem/1.45 var(--bc3-sans);padding:10px}',
    '.bc3-nota .fila{display:flex;justify-content:flex-end;align-items:center;gap:14px}',
    '.bc3-nota .cancelar{border:0;background:none;color:var(--text-2);font:600 .9rem/1 var(--bc3-sans);cursor:pointer}',
    '.bc3-nota .ok{border:0;border-radius:99px;padding:.6rem 1rem;background:#3b3fd8;color:#fff;font:600 .9rem/1 var(--bc3-sans);cursor:pointer}',
    /* Audio */
    '.bc3-audio{position:fixed;left:0;right:0;bottom:0;z-index:9993;background:var(--paper);border-top:1px solid var(--rule);font-family:var(--bc3-sans)}',
    '.bc3-audio-in{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:18px;min-height:76px;max-width:1180px;margin:0 auto;padding:0 max(16px,env(safe-area-inset-right,0px)) env(safe-area-inset-bottom,0px) max(16px,env(safe-area-inset-left,0px))}',
    '.bc3-play{width:52px;height:52px;border-radius:50%;border:0;background:var(--text);color:var(--paper);display:grid;place-items:center;cursor:pointer}',
    '.bc3-pista{display:grid;gap:8px;min-width:0}',
    '.bc3-fila{display:flex;justify-content:space-between;gap:10px;font-size:.85rem;color:var(--text-3);font-variant-numeric:tabular-nums}',
    '.bc3-vel{border:0;background:none;padding:0;color:var(--text-2);font:600 .85rem/1 var(--bc3-sans);cursor:pointer;text-align:left}',
    '.bc3-linea{height:4px;border-radius:3px;background:var(--rule);overflow:hidden}',
    '.bc3-linea i{display:block;height:100%;width:0;background:var(--libro);transition:width .3s linear}',
    '.bc3-sig{min-height:52px;max-width:300px;padding:0 22px;border:0;border-radius:14px;background:var(--libro);color:var(--libro-tx,#fff);font:700 .95rem/1.2 var(--bc3-sans);cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '@media(max-width:640px){.bc3-audio-in{grid-template-columns:auto minmax(0,1fr);gap:14px}.bc3-sig{display:none}}',
    /* Aviso */
    '.bc3-aviso{position:fixed;left:50%;bottom:calc(var(--bc3-bot) + 20px);transform:translateX(-50%);z-index:10002;display:flex;align-items:center;gap:.75rem;width:max-content;max-width:min(92vw,440px);padding:12px 18px;border-radius:12px;background:var(--card);color:var(--text);font:500 14px/1.4 var(--bc3-sans);box-shadow:0 24px 60px -12px rgba(0,0,0,.6),0 0 0 1px var(--rule)}',
    '.bc3-aviso i{flex:none;width:8px;height:8px;border-radius:50%;background:var(--libro)}',
    '@media (prefers-reduced-motion:reduce){.bc3-prog i,.bc3-linea i{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  /* ── Tema: Noche por defecto, como el resto de BOOKCLUB ── */
  if (lsGet('bookclub-theme') === null && !document.body.classList.contains('dark')) {
    document.body.classList.add('dark');
    var tg = $('toggle-dark'); if (tg) tg.checked = true;
  }
  function oscuro() { return document.body.classList.contains('dark'); }
  function colorLibro() {
    var tok = (RD.identidad_visual || {}).tokens_resueltos || {};
    var c = oscuro() ? (tok['--mark-ink'] || META.color_acento) : META.color_acento;
    c = /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#3b3fd8';
    document.body.style.setProperty('--libro', c);
    /* Texto sobre el color del libro: blanco o tinta, el que tenga contraste ≥ 4.5:1 */
    var l = [1, 3, 5].map(function (i) { var v = parseInt(c.slice(i, i + 2), 16) / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    var lum = 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
    document.body.style.setProperty('--libro-tx', 1.05 / (lum + 0.05) >= 4.5 ? '#fff' : '#0b0c10');
  }
  document.body.classList.add('bc3');
  colorLibro();

  /* ── Aviso ── */
  var avisoT;
  function aviso(msg) {
    var el = $('bc3-aviso');
    if (!el) { el = document.createElement('div'); el.id = 'bc3-aviso'; el.className = 'bc3-aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = '<i aria-hidden="true"></i>'; el.appendChild(document.createTextNode(msg));
    el.hidden = false; clearTimeout(avisoT); avisoT = setTimeout(function () { el.hidden = true; }, 6000);
  }
  function copiar(t, ok) {
    function plan() { aviso('Cita lista: selecciónala y cópiala.'); }
    try { navigator.clipboard.writeText(t).then(function () { aviso(ok || 'Cita copiada para compartir.'); }, plan); } catch (e) { plan(); }
  }
  function citaCompartir(q) { return '«' + q + '» — ' + TITULO + (AUTOR ? ', ' + AUTOR : '') + ' · BOOKCLUB'; }

  /* ── Estructura: barra superior, contenido, lado y audio ── */
  var ICO_ATRAS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var ICO_TOC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h9"/></svg>';
  var CHECK = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PLAY = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
  var PAUSA = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';

  var top = document.createElement('header');
  top.className = 'bc3-top';
  top.innerHTML = '<div class="bc3-top-in"><button class="bc3-atras" type="button" id="bc3-atras">' + ICO_ATRAS + 'Biblioteca</button>' +
    '<div class="bc3-tit">' + esc(TITULO) + (AUTOR ? ' <span>· ' + esc(AUTOR) + '</span>' : '') + '</div>' +
    '<div class="bc3-der"><button class="bc3-ib bc3-solo-movil" type="button" id="bc3-btn-toc" aria-label="Contenido" aria-expanded="false" aria-controls="bc3-toc">' + ICO_TOC + '</button>' +
    '<button class="bc3-ib" type="button" id="bc3-aa" aria-label="Tamaño de letra">Aa</button>' +
    '<button class="bc3-ib" type="button" id="bc3-tema" aria-label="Cambiar tema"></button></div></div>' +
    '<div class="bc3-prog" aria-hidden="true"><i id="bc3-prog"></i></div>';
  document.body.appendChild(top);

  var toc = document.createElement('nav');
  toc.className = 'bc3-toc'; toc.id = 'bc3-toc'; toc.setAttribute('aria-label', 'Contenido');
  document.body.appendChild(toc);

  var lado = document.createElement('aside');
  lado.className = 'bc3-lado'; lado.id = 'bc3-lado'; lado.setAttribute('aria-label', 'Tus ideas y la práctica');
  lado.innerHTML = '<section class="bc3-guardadas" id="bc3-guardadas"></section><section class="bc3-practica" id="bc3-practica" hidden></section>';
  document.body.appendChild(lado);

  if (HAY_VOZ) {
    var audio = document.createElement('div');
    audio.className = 'bc3-audio'; audio.id = 'bc3-audio';
    audio.innerHTML = '<div class="bc3-audio-in"><button class="bc3-play" type="button" id="bc3-play" aria-label="Escuchar capítulo">' + PLAY + '</button>' +
      '<div class="bc3-pista"><div class="bc3-fila"><button class="bc3-vel" type="button" id="bc3-vel"></button><span id="bc3-tiempo"></span></div><div class="bc3-linea"><i id="bc3-linea"></i></div></div>' +
      '<button class="bc3-sig" type="button" id="bc3-sig"></button></div>';
    document.body.appendChild(audio);
    document.body.classList.add('bc3-voz');
  }

  /* Contenido: se arma con el índice que ya tiene el libro */
  var TITULOS = {}, NUMS = {};
  function armarToc() {
    var panel = $('menu-panel');
    var h = '<h4>Contenido</h4>';
    if (panel) {
      Array.prototype.forEach.call(panel.querySelectorAll('.menu-seccion-label, .menu-item'), function (el) {
        if (el.classList.contains('menu-seccion-label')) { h += '<p class="g">' + esc(limpio(el.textContent)) + '</p>'; return; }
        var id = el.dataset.page, n = el.querySelector('.menu-item-num'), t = el.querySelector('.menu-item-titulo');
        TITULOS[id] = t ? limpio(t.textContent) : id; NUMS[id] = n ? limpio(n.textContent) : '';
        h += '<button type="button" class="it" data-pag="' + esc(id) + '"><span class="n">' + esc(NUMS[id] || '·') + '</span><span>' + esc(TITULOS[id]) + '</span></button>';
      });
    }
    h += '<button type="button" class="ajustes" id="bc3-ajustes">Ajustes de lectura</button>';
    toc.innerHTML = h;
  }
  function pintarToc() {
    var actual = paginaActualId();
    Array.prototype.forEach.call(toc.querySelectorAll('button.it'), function (b) {
      var id = b.dataset.pag, r = typeof window.ratioDe === 'function' ? window.ratioDe(id) : 0, hecho = r >= 0.95;
      b.classList.toggle('hecho', hecho);
      b.querySelector('.n').innerHTML = hecho ? CHECK : esc(NUMS[id] || '·');
      if (id === actual) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }
  function abrirToc(abrir) {
    var velo = $('bc3-velo');
    toc.classList.toggle('abierto', !!abrir);
    $('bc3-btn-toc').setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (abrir && !velo) { velo = document.createElement('div'); velo.className = 'bc3-velo'; velo.id = 'bc3-velo'; velo.onclick = function () { abrirToc(false); }; document.body.appendChild(velo); }
    if (!abrir && velo) velo.remove();
    if (abrir) { var c = toc.querySelector('[aria-current="true"]') || toc.querySelector('button'); if (c) c.focus({ preventScroll: false }); }
  }

  /* ── Ideas guardadas ── */
  function leerIdeas() { try { var x = JSON.parse(lsGet(IDEAS_KEY)); return Array.isArray(x) ? x : []; } catch (e) { return []; } }
  function misIdeas() { return leerIdeas().filter(function (i) { return i && i.q && !i.borrada && i.libro === LIBRO; }).sort(function (a, b) { return (+b.t || 0) - (+a.t || 0); }); }
  function pasoActual() { var p = paginaEl(), e = p && p.querySelector('.libro-header-paso'); return e ? limpio(e.textContent) : (TITULOS[paginaActualId()] || ''); }
  function guardarIdea(q, nota) {
    var xs = leerIdeas();
    xs.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), libro: LIBRO, titulo: TITULO, autor: AUTOR, q: q, n: nota || '', pag: pasoActual(), page: paginaActualId(), t: Date.now() });
    lsSet(IDEAS_KEY, JSON.stringify(xs));
    pintarGuardadas();
  }
  function pintarGuardadas() {
    var xs = misIdeas(), g = $('bc3-guardadas');
    g.innerHTML = '<h4>Tus ideas guardadas · ' + xs.length + '</h4>' + (xs.length ? xs.slice(0, 6).map(function (x) { return '<q>' + esc(x.q) + '</q>'; }).join('') : '<p class="vacio">Selecciona una frase del texto para guardarla aquí.</p>');
  }

  /* Subrayado: funciona aunque la frase cruce varias etiquetas del texto */
  function nodosTexto(root) {
    var out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentElement && n.parentElement.closest('.bc3-lado,script,style,svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }
  function marcarRango(range) {
    var root = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentNode;
    var nodos = nodosTexto(root).filter(function (n) { return range.intersectsNode(n); });
    nodos.forEach(function (n) {
      var ini = n === range.startContainer ? range.startOffset : 0, fin = n === range.endContainer ? range.endOffset : n.length;
      if (fin <= ini || !limpio(n.data.slice(ini, fin))) return;
      if (n.parentElement.closest('mark.bc3-mark')) return;
      var medio = n.splitText(ini); medio.splitText(fin - ini);
      var m = document.createElement('mark'); m.className = 'bc3-mark';
      medio.parentNode.insertBefore(m, medio); m.appendChild(medio);
    });
  }
  function marcarTexto(root, q) {
    var nodos = nodosTexto(root), txt = '', mapa = [], espacio = false;
    nodos.forEach(function (n) {
      for (var i = 0; i < n.data.length; i++) {
        var c = n.data[i];
        if (/\s/.test(c)) { if (espacio) continue; espacio = true; c = ' '; } else espacio = false;
        txt += c; mapa.push([n, i]);
      }
    });
    var i = txt.indexOf(q); if (i < 0) return false;
    var a = mapa[i], z = mapa[i + q.length - 1]; if (!a || !z) return false;
    var r = document.createRange(); r.setStart(a[0], a[1]); r.setEnd(z[0], z[1] + 1);
    marcarRango(r); return true;
  }
  function marcarGuardadas() {
    var p = paginaEl(), body = p && p.querySelector('.body'); if (!body) return;
    misIdeas().forEach(function (x) { if (!x.page || x.page === paginaActualId()) marcarTexto(body, x.q); });
  }

  /* Barra de selección: Guardar idea · Nota · Compartir */
  var sel = null, selT;
  function quitarSel(tambienNota) { var b = $('bc3-sel'); if (b) b.remove(); if (tambienNota) { var n = $('bc3-nota'); if (n) n.remove(); } }
  function posicion(el, rc, abajo) {
    var w = document.documentElement.clientWidth, x = Math.min(Math.max(rc.left + rc.width / 2, 170), w - 170);
    el.style.left = x + 'px';
    if (abajo) { el.classList.add('abajo'); el.style.top = Math.max(76, Math.min(rc.bottom + 12, window.innerHeight - 140)) + 'px'; }
    else el.style.top = Math.min(Math.max(rc.top - 10, 130), window.innerHeight - 20) + 'px';
  }
  function revisarSel() {
    if ($('bc3-nota')) return;
    var s = window.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) { quitarSel(); sel = null; return; }
    var r = s.getRangeAt(0), p = paginaEl(), body = p && p.querySelector('.body');
    var nodo = r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentNode;
    if (!body || !body.contains(nodo) || nodo.closest('.bc3-lado,.nav-final')) { quitarSel(); return; }
    var q = limpio(s.toString()); if (q.length < 3 || q.length > 900) { quitarSel(); return; }
    sel = { q: q, range: r.cloneRange() };
    var rc = r.getBoundingClientRect(); quitarSel();
    var bar = document.createElement('div'); bar.className = 'bc3-sel'; bar.id = 'bc3-sel'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Acciones con la selección');
    bar.innerHTML = '<button type="button" data-acc="guardar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0012 3z"/></svg>Guardar idea</button><button type="button" data-acc="nota">Nota</button><button type="button" data-acc="compartir">Compartir</button>';
    posicion(bar, rc, TACTIL.matches);
    bar.addEventListener('mousedown', function (e) { e.preventDefault(); });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-acc]'); if (!b || !sel) return;
      var actual = sel, acc = b.dataset.acc;
      if (acc === 'guardar') { marcarRango(actual.range); guardarIdea(actual.q, ''); limpiarSeleccion(); aviso('Idea guardada en Ideas.'); }
      else if (acc === 'compartir') { limpiarSeleccion(); copiar(citaCompartir(actual.q)); }
      else if (acc === 'nota') abrirNota(actual, rc);
    });
    document.body.appendChild(bar);
  }
  function limpiarSeleccion() { try { window.getSelection().removeAllRanges(); } catch (e) {} quitarSel(true); sel = null; }
  function abrirNota(actual, rc) {
    quitarSel();
    var nb = document.createElement('div'); nb.className = 'bc3-nota'; nb.id = 'bc3-nota'; nb.setAttribute('role', 'dialog'); nb.setAttribute('aria-label', 'Agregar una nota');
    nb.innerHTML = '<q>' + esc(actual.q.length > 90 ? actual.q.slice(0, 90) + '…' : actual.q) + '</q><label for="bc3-nota-t">Tu nota</label><textarea id="bc3-nota-t" placeholder="¿Qué te dice esta frase?"></textarea><div class="fila"><button type="button" class="cancelar" data-n="x">Cancelar</button><button type="button" class="ok" data-n="ok">Guardar nota</button></div>';
    var w = document.documentElement.clientWidth;
    nb.style.left = Math.min(Math.max(rc.left + rc.width / 2, 170), w - 170) + 'px';
    nb.style.top = Math.max(76, Math.min(rc.bottom + 12, window.innerHeight - 260)) + 'px';
    document.body.appendChild(nb);
    nb.addEventListener('click', function (e) {
      var b = e.target.closest('[data-n]'); if (!b) return;
      if (b.dataset.n === 'ok') { marcarRango(actual.range); guardarIdea(actual.q, limpio($('bc3-nota-t').value)); aviso('Nota guardada en Ideas.'); }
      limpiarSeleccion();
    });
    nb.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); limpiarSeleccion(); } });
    $('bc3-nota-t').focus({ preventScroll: true });
  }
  document.addEventListener('selectionchange', function () { clearTimeout(selT); selT = setTimeout(revisarSel, 280); });

  /* ── Práctica de hoy (tarjeta «acción» del propio resumen) ── */
  function practica() {
    var pags = window.PAGINAS || [], i = pags.indexOf(paginaActualId());
    function de(id) { var d = $(id), a = d && d.querySelector('.accion-text'); return a && limpio(a.textContent) ? { texto: limpio(a.textContent), pag: id } : null; }
    var r = de(paginaActualId());
    for (var k = i + 1; !r && k > 0 && k < pags.length; k++) r = de(pags[k]);
    for (var j = i - 1; !r && j > 0; j--) r = de(pags[j]);
    return r;
  }
  function pintarPractica() {
    var box = $('bc3-practica'), p = practica();
    if (!p) { box.hidden = true; return; }
    var c = null; try { c = JSON.parse(lsGet(COMP_KEY)); } catch (e) {}
    var ok = !!(c && c.fecha === hoyISO() && c.libro === LIBRO && c.pag === p.pag);
    var paso = $(p.pag) && $(p.pag).querySelector('.libro-header-paso');
    box.innerHTML = '<span class="k">Práctica de hoy</span><p>' + esc(p.texto) + '</p>' + (paso && p.pag !== paginaActualId() ? '<span class="meta">De ' + esc(limpio(paso.textContent).toLowerCase()) + '</span>' : '') + '<button type="button" id="bc3-comp" aria-pressed="' + ok + '">' + (ok ? 'Comprometido hoy ✓' : 'Me comprometo hoy') + '</button>';
    box.hidden = false;
    $('bc3-comp').onclick = function () {
      var on = this.getAttribute('aria-pressed') !== 'true';
      if (on) lsSet(COMP_KEY, JSON.stringify({ fecha: hoyISO(), libro: LIBRO, pag: p.pag }));
      else { try { localStorage.removeItem(COMP_KEY); } catch (e) {} }
      this.setAttribute('aria-pressed', on); this.textContent = on ? 'Comprometido hoy ✓' : 'Me comprometo hoy';
      if (on) aviso('Anotado. Que sea un buen paso hoy.');
    };
  }

  /* El lado vive a la derecha en escritorio y al final del capítulo en celular */
  function ubicarLado() {
    if (DESKTOP.matches) { if (lado.parentNode !== document.body) document.body.appendChild(lado); return; }
    var p = paginaEl(); if (!p || p.id === 'portada') return;
    var nav = p.querySelector('.nav-final'), cont = nav ? nav.parentNode : p.querySelector('.page');
    if (cont) cont.insertBefore(lado, nav || null);
  }

  /* ── Línea de avance del libro ── */
  var progT;
  function pintarAvance() {
    var pct = typeof window.avanceLibro === 'function' ? window.avanceLibro() : 0;
    $('bc3-prog').style.width = pct + '%';
  }
  document.addEventListener('scroll', function (e) {
    if (!e.target.classList || !e.target.classList.contains('pagina')) return;
    if (!$('bc3-nota')) quitarSel();
    clearTimeout(progT); progT = setTimeout(function () { pintarAvance(); pintarToc(); }, 250);
  }, true);

  /* ── Audio con la voz del dispositivo ── */
  var voz = { on: false, i: 0, ps: [], vel: 1, voice: null, token: 0 };
  var velGuardada = parseFloat(lsGet(VEL_KEY)); if (VELS.indexOf(velGuardada) > -1) voz.vel = velGuardada;
  function velTxt(v) { return v.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 2 }); }
  function elegirVoz() {
    if (!HAY_VOZ) return;
    var vs = speechSynthesis.getVoices() || [], norm = function (v) { return String(v.lang || '').replace('_', '-').toLowerCase(); };
    voz.voice = ['es-co', 'es-419', 'es-us'].reduce(function (hallada, l) { return hallada || vs.filter(function (v) { return norm(v) === l; })[0] || null; }, null) ||
      vs.filter(function (v) { return /^es\b/.test(norm(v)); })[0] || null;
  }
  if (HAY_VOZ) { elegirVoz(); if ('onvoiceschanged' in speechSynthesis) speechSynthesis.addEventListener('voiceschanged', elegirVoz); }
  var SEL_PARRAFOS = 'h1,h2,h3,h4,p,li,blockquote,.filtro-title,.subtitulo,.destacado,.tesis-text,.idea-text,.accion-text,.alerta-text,.dato-text';
  function parrafos() {
    var p = paginaEl(), body = p && p.querySelector('.body'); if (!body) return [];
    var out = [], tomados = [];
    Array.prototype.forEach.call(body.querySelectorAll(SEL_PARRAFOS), function (el) {
      if (el.closest('.nav-final,.bc3-lado,.toc,button,[aria-hidden="true"],svg')) return;
      if (tomados.some(function (t) { return t.contains(el); })) return;
      var t = limpio(el.textContent); if (t.length < 2) return;
      tomados.push(el); out.push({ el: el, t: t, w: t.split(' ').length });
    });
    return out;
  }
  function fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function pintarAudio() {
    if (!HAY_VOZ) return;
    var total = 0, antes = 0; voz.ps.forEach(function (p, i) { total += p.w; if (i < voz.i) antes += p.w; });
    var pct = total ? antes / total : 0;
    $('bc3-linea').style.width = (pct * 100) + '%';
    $('bc3-tiempo').textContent = fmt((total - antes) / (2.6 * voz.vel));
    $('bc3-vel').textContent = 'Escuchar capítulo · ' + velTxt(voz.vel) + '×';
    $('bc3-vel').setAttribute('aria-label', 'Velocidad ' + velTxt(voz.vel) + ', cambiar');
    var play = $('bc3-play'); play.innerHTML = voz.on ? PAUSA : PLAY; play.setAttribute('aria-label', voz.on ? 'Pausar' : 'Escuchar capítulo');
    var pags = window.PAGINAS || [], sig = pags[pags.indexOf(paginaActualId()) + 1], b = $('bc3-sig');
    if (sig && TITULOS[sig]) { b.hidden = false; b.dataset.pag = sig; b.textContent = 'Siguiente: ' + TITULOS[sig] + ' →'; } else b.hidden = true;
  }
  function resaltar(el) {
    Array.prototype.forEach.call(document.querySelectorAll('.bc3-leyendo'), function (x) { x.classList.remove('bc3-leyendo'); });
    if (!el) return;
    el.classList.add('bc3-leyendo');
    var p = paginaEl(), r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
    if (r.top < pr.top + 40 || r.bottom > pr.bottom - 40) el.scrollIntoView({ block: 'center', behavior: REDUCIDO.matches ? 'auto' : 'smooth' });
  }
  function hablar(i) {
    var token = voz.token;
    if (i >= voz.ps.length) { voz.on = false; voz.i = 0; resaltar(null); pintarAudio(); return; }
    voz.i = i; pintarAudio(); resaltar(voz.ps[i].el);
    var u = new SpeechSynthesisUtterance(voz.ps[i].t);
    u.lang = voz.voice ? voz.voice.lang : 'es-419'; if (voz.voice) u.voice = voz.voice; u.rate = voz.vel;
    u.onend = function () { if (token !== voz.token || !voz.on) return; hablar(i + 1); };
    u.onerror = function (e) {
      if (token !== voz.token || e.error === 'interrupted' || e.error === 'canceled') return;
      pararVoz(); aviso('No pudimos usar la voz de este dispositivo.');
    };
    speechSynthesis.speak(u);
  }
  function pararVoz() {
    if (!HAY_VOZ) return;
    voz.token++; voz.on = false;
    try { speechSynthesis.cancel(); } catch (e) {}
    resaltar(null); pintarAudio();
  }
  function reproducir() {
    if (!voz.ps.length) voz.ps = parrafos();
    if (!voz.ps.length) { aviso('Esta página no tiene texto para escuchar.'); return; }
    if (voz.i >= voz.ps.length) voz.i = 0;
    voz.token++; voz.on = true;
    try { speechSynthesis.cancel(); } catch (e) {}
    hablar(voz.i);
  }
  if (HAY_VOZ) {
    $('bc3-play').onclick = function () { if (voz.on) pararVoz(); else reproducir(); };
    $('bc3-vel').onclick = function () {
      voz.vel = VELS[(VELS.indexOf(voz.vel) + 1) % VELS.length]; lsSet(VEL_KEY, String(voz.vel));
      if (voz.on) { voz.token++; try { speechSynthesis.cancel(); } catch (e) {} voz.on = true; hablar(voz.i); } else pintarAudio();
    };
    $('bc3-sig').onclick = function () { if (this.dataset.pag) window.irA(this.dataset.pag); };
    window.addEventListener('pagehide', pararVoz);
  }

  /* ── Controles de la barra ── */
  var NOMBRES_TAM = ['pequeño', 'mediano', 'grande'];
  function pintarControles() {
    $('bc3-tema').textContent = oscuro() ? '☼' : '☽';
    $('bc3-tema').setAttribute('aria-label', oscuro() ? 'Cambiar a tema Día' : 'Cambiar a tema Noche');
    var f = Math.min(+window.fuenteIdx || 0, 2);
    $('bc3-aa').setAttribute('aria-label', 'Tamaño de letra: ' + NOMBRES_TAM[f] + '. Cambiar');
  }
  $('bc3-aa').onclick = function () {
    var f = +window.fuenteIdx || 0, n = f >= 2 ? 0 : f + 1;
    window.fuenteIdx = n;
    if (typeof window.aplicarFuente === 'function') window.aplicarFuente();
    lsSet('bookclub-fuente', String(n));
    pintarControles(); aviso('Letra ' + NOMBRES_TAM[n] + '.');
  };
  $('bc3-tema').onclick = function () {
    if (typeof window.toggleDark === 'function') window.toggleDark();
    else { document.body.classList.toggle('dark'); lsSet('bookclub-theme', oscuro() ? 'dark' : 'light'); }
    colorLibro(); pintarControles();
  };
  $('bc3-atras').onclick = function () {
    pararVoz();
    try { if (typeof window.guardarProg === 'function') { window.sucio = true; window.guardarProg(); } } catch (e) {}
    var ir = function () { window.location.assign('../biblioteca/'); };
    var s = window.BookclubSync;
    if (s && typeof s.flush === 'function') Promise.race([s.flush(), new Promise(function (r) { setTimeout(r, 1500); })]).then(ir, ir); else ir();
  };
  $('bc3-btn-toc').onclick = function () { abrirToc(!toc.classList.contains('abierto')); };
  toc.addEventListener('click', function (e) {
    var b = e.target.closest('button.it'); if (b) { abrirToc(false); window.irA(b.dataset.pag); return; }
    if (e.target.closest('#bc3-ajustes')) { abrirToc(false); if (typeof window.toggleConfig === 'function') window.toggleConfig(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (toc.classList.contains('abierto')) { abrirToc(false); $('bc3-btn-toc').focus(); }
    quitarSel(true);
  });
  DESKTOP.addEventListener('change', function () { abrirToc(false); ubicarLado(); });

  /* ── Al cambiar de página ── */
  function despuesDePagina() {
    quitarSel(true);
    voz.i = 0; voz.ps = HAY_VOZ && paginaActualId() !== 'portada' ? parrafos() : [];
    ubicarLado(); pintarToc(); pintarGuardadas(); pintarPractica(); pintarAvance(); pintarControles();
    setTimeout(marcarGuardadas, 60);
    if (HAY_VOZ) pintarAudio();
  }
  var irOriginal = window.irA;
  window.irA = function () {
    pararVoz(); voz.i = 0;
    var r = irOriginal.apply(this, arguments);
    despuesDePagina();
    return r;
  };
  window.addEventListener('storage', function (e) { if (e.key === IDEAS_KEY) { pintarGuardadas(); marcarGuardadas(); } });
  window.addEventListener('bookclub-sync-ready', function () { pintarGuardadas(); marcarGuardadas(); pintarAvance(); pintarToc(); });

  armarToc();
  despuesDePagina();
})();
