const CACHE_NAME = 'nk-architect-v2-cache-2026';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/docs.html',
  '/manifest.json',
  '/assets/css/variables.css',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/markdown.css',
  '/assets/js/theme.js',
  '/assets/js/github.js',
  '/assets/js/search.js',
  '/assets/js/command-palette.js',
  '/assets/js/docs.js',
  '/assets/js/router.js',
  '/assets/js/app.js',
  '/data/projects.json',
  '/docs/mkapk.md',
  '/docs/heurily.md',
  '/docs/tos.md',
  '/docs/worklog.md'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh asset in background to update cache (Stale-While-Revalidate)
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {/* Ignore network errors offline */});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});