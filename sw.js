const CACHE_NAME = "tripmate-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./core/app.js",
  "./core/auth.js",
  "./core/supabase.js"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  /**
   * NO interceptar Supabase auth
   */
  if (
    url.pathname.includes("/auth") ||
    url.hostname.includes("supabase.co")
  ) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match("./index.html");
        });
    })
  );
});
