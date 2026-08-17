// Service Worker - QuizzizSam PWA
const CACHE_NAME = "quizzizsam-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./main.js",
  "./manifest.json",
  "./Fondo.jpeg",
  "./icons/logoQui.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./img/0.jpeg",
  "./img/1.jpeg",
  "./img/2.jpeg",
  "./img/3.jpeg",
  "./img/4.jpeg",
  "./img/5.jpeg",
  "./img/6.jpeg",
  "./img/7.jpeg",
  "./img/8.jpeg",
  "./img/9.jpeg",
];

// Instalación: cachear todos los recursos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Ignora fallos individuales para no romper la instalación
      Promise.allSettled(ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// Activación: limpiar cachés viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// Fetch: cache-first con fallback a red
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
