// Offline cache for the Divan invoice app.
// Strategy: cache-first for everything after the first successful online
// visit, so the app (and its already-saved invoice data in localStorage)
// keeps working with no network at all — e.g. in airplane mode.
const CACHE_NAME = "divan-offline-v1";
const APP_SHELL_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(APP_SHELL_URL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !url.hostname.includes("fonts")) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);

      // Navigations: try cache first (instant, works offline). Everything
      // else: prefer cache too, but keep refreshing it in the background.
      if (cached) {
        network.catch(() => {});
        return cached;
      }
      return network;
    }),
  );
});
