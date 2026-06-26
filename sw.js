const CACHE_NAME = "tripmate-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (offline fallback)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((res) => res || caches.match("./index.html")))
  );
});
