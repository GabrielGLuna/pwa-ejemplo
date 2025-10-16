//Ejemplo mas practico de un service worker para una PWA

//t.Nombre sw y los archivos a cachear
const CACHE_NAME= "mi-cache";
const BASE_PATH= "/pwa-ejemplo/"; 
const urlsToCache = [
    `${BASE_PATH}index.html`,
    `${BASE_PATH}style.css`,
    `${BASE_PATH}manifest.json`,
    `${BASE_PATH}offline.html`,
    `${BASE_PATH}login.html`,
    `${BASE_PATH}icons/logox192.png`,
    `${BASE_PATH}icons/logox512.png`,
];

// INSTALL -> Se ejecuta al instalar el service worker
// se cachean los rescursos bases de la PWA

self.addEventListener('install', event => {
    console.log("Service Worker: instalando....");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Service Worker: cacheando....");
            return cache.addAll(urlsToCache)
        })
    );
});

// ACTIVATE -> Se ejecuta cuando se activa el service worker
// se eliminan los caches antiguos

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            )
        )
    );
});

// FETCH -> Se ejecuta cuando se hace una peticion
// se responde con el recurso cacheado o se hace la peticion a la red
// caso de falla muestra la pagina offline.tml

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => caches.match(`${BASE_PATH}offline.html`));
        })
    );
});

//PUSH -> notfiaciones en segundo plano 
// Manejo de notificaciones push (Opcional)

self.addEventListener('push', event => {
    const data = event.data ? event.data.text() : 'Notificación sin texto';
    event.waitUntil(
        self.registration.showNotification("Mi PWA",{body: data})
    );
});