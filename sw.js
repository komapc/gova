/**
 * sw.js — Service Worker por Gova
 *
 * Strategio:
 * - Statikaj dosieroj: Cache-unue (cache-first)
 * - opentopodata.org (ter-alteco): Reto-nur (network-only)
 * - Nekonata: Reto kun kaŝmemor-retropaŝo
 */

const CACHE_NAME = 'gova-v3.13';

const STATIC_ASSETS = [
  './',
  './index.html',
  './about.html',
  './history.html',
  './points.html',
  './css/main.css',
  './css/history.css',
  './js/coords.js',
  './js/gestures.js',
  './js/geoid.js',
  './js/app.js',
  './js/gps.js',
  './js/units.js',
  './js/storage.js',
  './js/i18n.js',
  './js/analytics.js',
  './js/history.js',
  './js/history-page.js',
  './js/saved-points.js',
  './js/chart.js',
  './js/theme.js',
  './js/install.js',
  './js/sw-register.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/favicon.ico',
];

// URLoj kiuj neniam estas kaŝmemorataj (retaj servoj)
const NETWORK_ONLY_PATTERNS = [
  'api.opentopodata.org',
];

// --- Instali: antaŭkaŝmemori statikajn dosierojn ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Kelkaj dosieroj ne kaŝmemorigeblaj:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// --- Aktivigi: forigi malnovajn kaŝmemordosierojn ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// --- Fetch: respondas al petoj ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Reto-nur por eksteraj API-oj
  const isNetworkOnly = NETWORK_ONLY_PATTERNS.some((p) =>
    url.hostname.includes(p)
  );
  if (isNetworkOnly) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Preter nur GET-petoj
  if (event.request.method !== 'GET') {
    return;
  }

  // Kaŝmemor-unue por statikaj dosieroj
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        const revalidation = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
          })
          .catch(() => null);

        // Redonu tuj el kaŝmemoro, ĝisdatigu malantaŭe
        event.waitUntil(revalidation);
        return cached;
      }

      // Ne kaŝmemorita — provu la reton
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
        }
        return response;
      }).catch(() => {
        // Ofline kaj ne kaŝmemorita — provu `index.html` ambaŭ formatojn
        if (url.pathname.endsWith('.html') || url.pathname === '/') {
          return caches.match('./index.html') || caches.match('/index.html');
        }
        return new Response('Ofline — enhavo ne disponebla', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
    })
  );
});
