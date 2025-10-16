
//PLantilla de un Service Worker minimo
// 1- nombre del service worker y los archivos a cachear

const { cache } = require("react");

const CACHE_NAME = "mi-cache";
const BASE_PATH = "pwa-ejemplo/"
const urlToCache = [
    `${BASE_PATH}index.html`,
    `${BASE_PATH}manifest.json`,
    `${BASE_PATH}style.css`,
    `${BASE_PATH}app.js`,
    `${BASE_PATH}offline.html`,
    `${BASE_PATH}login.html`
    `${BASE_PATH}icons/icon-192x192.png`,
    `${BASE_PATH}icons/icon-512x512.png`,
]

// 2 Install -> se ejecuta al instalar el service worker
// se cachean (se meten a cache )los recursos de la PWA
self.addEventListener('install', event => {
    console.log("Service worker: Instalando....");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache=>{
            console.log("Archivos cacheados");
            return cache.addAll(urlToCache)
        })
    );
})

//3 ACTIVATE -> Se ejecuta al activarse el service worker
// limpiar la memoria del cache viejo para mantener solo laversion actual de la cache
self.addEventListener("activate", event =>{
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.filter( key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            )
        )
    )
})

//4 FETCH -> intercepta peticiones de la app 
//Intercepta cada petición de la PWA
// Buscar primero el cache, si no esta busca en la red
// En caso de falla muestra la pagina offline.html
self.addEventListener("fetch", event =>{
    event.respondWidth(
        caches.match(event.request).then(response =>{
            return response || fetch(event.request).catch(()=> caches.match(`${BASE_PATH}offline.html`,));
        })
    );
});

//5 PUSH -> notificaciones en segundo plano
// 
self.addEventListener("push", event =>{
    const data = event.data ? event.data.text() : "Notifacion sin texto"
    event .waitUntil(
        self.ServiceWorkerRegistration.showNotification("MI PWA", {body: data})
    );
});