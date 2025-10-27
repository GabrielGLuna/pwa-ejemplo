// /pwa-ejemplo/sw.js
const CACHE_NAME = 'mi-cache-v1';
const BASE_PATH = '/pwa-ejemplo/';
const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}style.css`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}offline.html`,
  `${BASE_PATH}login.html`,
  `${BASE_PATH}icons/icon-192x192.png`,
  `${BASE_PATH}icons/icon-512x512.png`
];

self.addEventListener('install', event => {
  console.log('[SW] instalando...');
  self.skipWaiting(); // opcional, fuerza activación más rápido
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] activando...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Manejo preferente: si es navegación (HTML) -> network-first con fallback a cached offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(resp => {
        // opcional: actualizar cache de la página navegada
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resp.clone()).catch(() => {});
          return resp;
        });
      }).catch(() => {
        return caches.match(`${BASE_PATH}offline.html`);
      })
    );
    return;
  }

  // Para otros recursos: cache-first, luego network
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(networkResp => {
        // opcional: cachear respuestas estáticas
        return networkResp;
      });
    }).catch(() => {
      // fallback para imágenes u otros si quieres
      return caches.match(`${BASE_PATH}offline.html`);
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.text() : 'Notificación sin texto';
  event.waitUntil(
    self.registration.showNotification('Mi PWA', { body: data })
  );
});
