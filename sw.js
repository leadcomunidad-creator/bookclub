const CACHE_VERSION = 'bookclub-v3-20261009';
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const CORE_ASSETS = [
  './',
  './index.html',
  './libros.json',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/previews/bookclub.jpg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CORE_CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![CORE_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request) || await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./index.html');
    throw error;
  }
}
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' || url.pathname.endsWith('/libros.json') || url.pathname.includes('/libros/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (url.pathname.includes('/assets/icons/') || url.pathname.includes('/assets/previews/') || url.pathname.endsWith('/manifest.webmanifest')) {
    event.respondWith(cacheFirst(request));
  }
});
