/* BOOKCLUB — sesión y sincronización personal.
   La clave publicable es segura en el navegador: las políticas RLS protegen los datos. */
(function () {
  'use strict';

  var CONFIG = {
    url: 'https://dgllysqskzpjtmflfnew.supabase.co',
    publishableKey: 'sb_publishable_In8S8O4wx4mPdR75-jrRSg_fu6MWbqv',
    redirectTo: 'https://bookclublhscol.netlify.app',
    bucket: 'bookclub-private'
  };
  var client = null, active = false, user = null, readyResolve;
  var ready = new Promise(function (resolve) { readyResolve = resolve; });
  var originalSetItem = Storage.prototype.setItem;
  var pending = {};

  function rawGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function rawSet(key, value) { try { originalSetItem.call(localStorage, key, value); } catch (e) {} }
  function parse(value, fallback) { try { return JSON.parse(value); } catch (e) { return fallback; } }
  function notify(name) { window.dispatchEvent(new CustomEvent(name, { detail: api })); }
  function progressKey(key) { return /^bookclub-.+-(?:curso-)?progreso$/.test(key); }

  function getClient() {
    if (client || !window.supabase) return client;
    client = window.supabase.createClient(CONFIG.url, CONFIG.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return client;
  }

  function mergeProgress(localValue, remoteValue) {
    var local = parse(localValue, {}) || {}, remote = remoteValue || {}, merged = {};
    Object.keys(remote).forEach(function (key) { merged[key] = remote[key]; });
    Object.keys(local).forEach(function (key) { if (key !== 'p') merged[key] = local[key]; });
    merged.p = {};
    var pages = Object.assign({}, remote.p || {}, local.p || {});
    Object.keys(pages).forEach(function (page) {
      merged.p[page] = Math.max(+((remote.p || {})[page]) || 0, +((local.p || {})[page]) || 0);
    });
    var localRatio = +local.r || 0, remoteRatio = +remote.r || 0;
    if (remoteRatio > localRatio) { merged.ult = remote.ult || merged.ult || null; merged.r = remoteRatio; }
    else { merged.ult = local.ult || remote.ult || null; merged.r = localRatio; }
    return merged;
  }

  function schedule(key, value) {
    if (!active || !client) return;
    clearTimeout(pending[key]);
    pending[key] = setTimeout(function () {
      if (progressKey(key)) pushProgress(key, value);
      if (key === 'bookclub-biblioteca') pushLibrary(value);
    }, 450);
  }

  async function pushProgress(key, value) {
    var progress = parse(value, null);
    if (!progress || !user) return;
    await client.from('bookclub_progress').upsert({
      user_id: user.id, content_key: key, progress: progress, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,content_key' });
  }

  async function pushLibrary(value) {
    var library = parse(value, {}) || {};
    if (!user) return;
    var rows = Object.keys(library).map(function (contentKey) {
      var item = library[contentKey] || {};
      return {
        user_id: user.id,
        content_key: contentKey,
        state: item.e || 'no',
        updated_at: new Date(+item.t || Date.now()).toISOString()
      };
    });
    if (rows.length) await client.from('bookclub_library_state').upsert(rows, { onConflict: 'user_id,content_key' });
  }

  async function pull() {
    if (!active || !user) return;
    var result = await Promise.all([
      client.from('bookclub_progress').select('content_key,progress').eq('user_id', user.id),
      client.from('bookclub_library_state').select('content_key,state,updated_at').eq('user_id', user.id)
    ]);
    var progressRows = result[0].data || [];
    progressRows.forEach(function (row) {
      var local = rawGet(row.content_key);
      rawSet(row.content_key, JSON.stringify(mergeProgress(local, row.progress)));
    });
    var remoteLibrary = result[1].data || [];
    var library = parse(rawGet('bookclub-biblioteca'), {}) || {};
    remoteLibrary.forEach(function (row) {
      var local = library[row.content_key], remoteTime = new Date(row.updated_at).getTime();
      if (!local || (+local.t || 0) <= remoteTime) library[row.content_key] = { e: row.state, t: remoteTime };
    });
    rawSet('bookclub-biblioteca', JSON.stringify(library));
  }

  async function refreshSession() {
    var db = getClient();
    if (!db) return;
    var sessionResult = await db.auth.getSession();
    user = sessionResult.data && sessionResult.data.session ? sessionResult.data.session.user : null;
    active = false;
    if (user) {
      var allowed = await db.rpc('is_bookclub_reader');
      active = allowed.data === true;
      if (active) await pull();
    }
    readyResolve(api);
    notify('bookclub-auth-change');
    notify('bookclub-sync-ready');
  }

  async function signInWithGoogle() {
    var db = getClient();
    if (!db) throw new Error('No se pudo iniciar el servicio de acceso.');
    var result = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: CONFIG.redirectTo }
    });
    if (result.error) throw result.error;
  }

  async function signOut() {
    var db = getClient();
    if (db) await db.auth.signOut();
    active = false; user = null; notify('bookclub-auth-change');
  }

  function injectBook(html) {
    var sync = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script><script src="https://bookclublhscol.netlify.app/bookclub-sync.js"><\/script>';
    var home = '<script>(function(){var a=document.getElementById("bookclub-home");if(a)a.href="https://bookclublhscol.netlify.app/";window.addEventListener("bookclub-sync-ready",function(){if(typeof cargarProg==="function"){cargarProg();if(typeof pintarProg==="function")pintarProg();}});})();<\/script>';
    return html.replace('</head>', sync + '</head>').replace('</body>', home + '</body>');
  }

  async function openPrivateBook(path) {
    if (!active) throw new Error('Inicia sesión con tu correo autorizado para abrir los libros completos.');
    var tab = window.open('about:blank', '_blank');
    var signed = await client.storage.from(CONFIG.bucket).createSignedUrl(path, 60);
    if (signed.error) { if (tab) tab.close(); throw signed.error; }
    var response = await fetch(signed.data.signedUrl, { cache: 'no-store' });
    if (!response.ok) { if (tab) tab.close(); throw new Error('No fue posible cargar el libro privado.'); }
    var html = injectBook(await response.text());
    if (tab) { tab.document.open(); tab.document.write(html); tab.document.close(); }
    else {
      var blob = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      window.location.assign(blob);
    }
  }

  Storage.prototype.setItem = function (key, value) {
    var out = originalSetItem.apply(this, arguments);
    try { if (this === localStorage) schedule(key, value); } catch (e) {}
    return out;
  };

  var api = window.BookclubSync = {
    ready: ready,
    isAuthorized: function () { return active; },
    getUser: function () { return user; },
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    openPrivateBook: openPrivateBook
  };

  function start() {
    var db = getClient();
    if (!db) { readyResolve(api); return; }
    db.auth.onAuthStateChange(function () { setTimeout(refreshSession, 0); });
    refreshSession();
  }
  if (window.supabase) start();
  else window.addEventListener('load', start, { once: true });
})();
