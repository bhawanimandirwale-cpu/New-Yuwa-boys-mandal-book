// MandalBook PWA Service Worker
const CACHE_NAME = 'mandalbook-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/login',
  '/join'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW cache add error (non-fatal):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first with cache fallback strategy for HTML/pages, cache-first for static icons
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Don't intercept API requests, NextAuth, or non-GET requests
  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.includes('/_next/webpack-hmr') ||
    request.url.startsWith('chrome-extension://')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful GET responses for static assets
        if (
          networkResponse.status === 200 &&
          (request.url.includes('/icon.svg') || request.url.includes('/manifest.json'))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails, serve from cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.mode === 'navigate') {
            return caches.match('/login');
          }
          return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
  );
});
