// sw.js

// Nombre del caché y los archivos a cachear
const CACHE_NAME = "mi-cache-v1"; // Se recomienda versionar el nombre del caché
const BASE_PATH = "/pwa-ejemplo/";
const urlsToCache = [
    `${BASE_PATH}`, // <- AÑADIDO: Para cachear la ruta raíz
    `${BASE_PATH}index.html`,
    `${BASE_PATH}style.css`,
    `${BASE_PATH}manifest.json`,
    `${BASE_PATH}offline.html`,
    `${BASE_PATH}login.html`,
    `${BASE_PATH}icons/icon-192x192.png`,
    `${BASE_PATH}icons/icon-512x512.png`,
];

// INSTALL -> Se ejecuta al instalar el service worker
// Se cachean los recursos base de la PWA
self.addEventListener('install', event => {
    console.log("Service Worker: instalando....");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Service Worker: cacheando archivos base....");
            return cache.addAll(urlsToCache);
        })
    );
});

// ACTIVATE -> Se ejecuta cuando se activa el service worker
// Se eliminan los cachés antiguos para evitar conflictos
self.addEventListener('activate', event => {
    console.log("Service Worker: activando y limpiando caché antiguo....");
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            )
        )
    );
});

// FETCH -> Se ejecuta cuando la aplicación hace una petición (e.g., a una página o un recurso)
// Responde con el recurso cacheado o, si falla, muestra la página offline.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Si la respuesta está en la caché, la retorna.
            // Si no, intenta obtenerla de la red.
            return response || fetch(event.request).catch(() => {
                // Si la petición a la red falla (sin conexión), muestra la página offline.
                return caches.match(`${BASE_PATH}offline.html`);
            });
        })
    );
});

// PUSH -> Manejo de notificaciones push (Opcional)
self.addEventListener('push', event => {
    const data = event.data ? event.data.text() : 'Notificación sin texto';
    event.waitUntil(
        self.registration.showNotification("Mi PWA", { body: data })
    );
});