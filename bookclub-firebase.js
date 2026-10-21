/* BOOKCLUB — identidad y biblioteca personal unificadas en Firebase. */
(function () {
  'use strict';

  var CONFIG = {
    apiKey: 'AIzaSyAqS3sMT0tsOm2G5eINckrLGA-1Qj4u6Y8',
    authDomain: 'stars-plus.firebaseapp.com',
    projectId: 'stars-plus',
    storageBucket: 'stars-plus.firebasestorage.app',
    messagingSenderId: '138459401399',
    appId: '1:138459401399:web:aaee2ce217192390ae5132'
  };
  var auth, db, fbAuth, fbStore, user = null, active = false, resolveReady, timer, stopListening = null;
  var ready = new Promise(function (resolve) { resolveReady = resolve; });
  var originalSetItem = Storage.prototype.setItem;

  function rawGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function rawSet(key, value) { try { originalSetItem.call(localStorage, key, value); } catch (e) {} }
  function parse(value, fallback) { try { return JSON.parse(value); } catch (e) { return fallback; } }
  function progressKey(key) { return /^bookclub-.+-(?:curso-)?progreso$/.test(key); }
  function notify(name) { window.dispatchEvent(new CustomEvent(name, { detail: api })); }
  function ref() { return fbStore.doc(db, 'usuarios', user.uid); }

  function mergeProgress(localValue, cloudValue) {
    var local = parse(localValue, {}) || {}, cloud = cloudValue || {}, result = {};
    Object.keys(cloud).forEach(function (key) { result[key] = cloud[key]; });
    Object.keys(local).forEach(function (key) { if (key !== 'p') result[key] = local[key]; });
    result.p = {};
    var pages = Object.assign({}, cloud.p || {}, local.p || {});
    Object.keys(pages).forEach(function (page) { result.p[page] = Math.max(+((cloud.p || {})[page]) || 0, +((local.p || {})[page]) || 0); });
    var localRatio = +local.r || 0, cloudRatio = +cloud.r || 0;
    result.r = Math.max(localRatio, cloudRatio);
    result.ult = cloudRatio > localRatio ? (cloud.ult || null) : (local.ult || cloud.ult || null);
    return result;
  }

  function localState() {
    var progreso = {};
    try { Object.keys(localStorage).forEach(function (key) { if (progressKey(key)) progreso[key] = parse(rawGet(key), {}); }); } catch (e) {}
    return { biblioteca: parse(rawGet('bookclub-biblioteca'), {}) || {}, progreso: progreso };
  }

  function mergeState(local, cloud) {
    local = local || { biblioteca: {}, progreso: {} };
    cloud = cloud || { biblioteca: {}, progreso: {} };
    var merged = { biblioteca: {}, progreso: {} };
    var libraryKeys = Object.keys(Object.assign({}, cloud.biblioteca || {}, local.biblioteca || {}));
    libraryKeys.forEach(function (key) {
      var localItem = (local.biblioteca || {})[key];
      var cloudItem = (cloud.biblioteca || {})[key];
      if (!cloudItem || (localItem && (+localItem.t || 0) >= (+cloudItem.t || 0))) merged.biblioteca[key] = localItem;
      else merged.biblioteca[key] = cloudItem;
    });
    var progressKeys = Object.keys(Object.assign({}, cloud.progreso || {}, local.progreso || {}));
    progressKeys.forEach(function (key) {
      merged.progreso[key] = mergeProgress(JSON.stringify((local.progreso || {})[key] || {}), (cloud.progreso || {})[key] || {});
    });
    return merged;
  }

  function applyState(state) {
    Object.keys(state.progreso || {}).forEach(function (key) { rawSet(key, JSON.stringify(state.progreso[key])); });
    rawSet('bookclub-biblioteca', JSON.stringify(state.biblioteca || {}));
  }

  async function saveMerged(state) {
    var saved;
    await fbStore.runTransaction(db, async function (transaction) {
      var snapshot = await transaction.get(ref());
      var cloud = (snapshot.data() || {}).bookclub || {};
      saved = mergeState(state, cloud);
      transaction.set(ref(), { bookclub: { biblioteca: saved.biblioteca, progreso: saved.progreso, actualizadoEn: Date.now() } }, { merge: true });
    });
    applyState(saved);
    return saved;
  }

  async function pull() {
    if (!active || !user) return;
    var snapshot = await fbStore.getDoc(ref());
    var cloud = (snapshot.data() || {}).bookclub || {};
    var merged = mergeState(localState(), cloud);
    applyState(merged);
    await saveMerged(merged);
  }

  function listenForChanges() {
    if (stopListening) stopListening();
    stopListening = fbStore.onSnapshot(ref(), function (snapshot) {
      if (!active || !snapshot.exists()) return;
      applyState(mergeState(localState(), (snapshot.data() || {}).bookclub || {}));
    }, function (error) { console.error('No fue posible recibir cambios de BookClub.', error); });
  }

  async function push() {
    if (!active || !user) return;
    await saveMerged(localState());
  }

  function schedule() {
    if (!active || !db) return;
    clearTimeout(timer); timer = setTimeout(function () { push().catch(function (error) { console.error('No fue posible guardar BookClub.', error); }); }, 500);
  }

  async function refresh(currentUser) {
    if (stopListening) { stopListening(); stopListening = null; }
    user = currentUser || null; active = !!user;
    if (active) { try { await pull(); listenForChanges(); } catch (error) { console.error('No fue posible sincronizar BookClub.', error); } }
    resolveReady(api); notify('bookclub-auth-change'); notify('bookclub-sync-ready');
  }

  async function signInWithGoogle() {
    if (!auth) throw new Error('No se pudo iniciar el servicio de acceso.');
    return fbAuth.signInWithPopup(auth, new fbAuth.GoogleAuthProvider());
  }
  async function signOut() {
    if (auth) await fbAuth.signOut(auth);
    if (stopListening) { stopListening(); stopListening = null; }
    active = false; user = null; notify('bookclub-auth-change');
    if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'bookclub-signout' }, window.location.origin);
  }

  Storage.prototype.setItem = function (key, value) {
    var output = originalSetItem.apply(this, arguments);
    try { if (this === localStorage && (progressKey(key) || key === 'bookclub-biblioteca')) schedule(); } catch (e) {}
    return output;
  };

  var api = window.BookclubSync = {
    ready: ready,
    isAuthorized: function () { return active; },
    getUser: function () { return user; },
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    openPrivateBook: function (path) { if (!active) return Promise.reject(new Error('Inicia sesión con Google para abrir los libros completos.')); window.location.assign(path); return Promise.resolve(); }
  };

  Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js')
  ]).then(function (modules) {
    fbAuth = modules[1]; fbStore = modules[2];
    var app = modules[0].initializeApp(CONFIG, 'bookclub');
    auth = fbAuth.getAuth(app);
    db = fbStore.getFirestore(app);
    fbAuth.onAuthStateChanged(auth, refresh);
  }).catch(function (error) {
    console.error('No fue posible iniciar Firebase para BookClub.', error);
    resolveReady(api); notify('bookclub-auth-change'); notify('bookclub-sync-ready');
  });
})();
