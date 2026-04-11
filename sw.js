// MyRight Service Worker v9 — Offline-first PWA
const CACHE = 'myright-v9';
const STATIC = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/css/main.css',
  '/js/main.js',
  '/js/sw-register.js',
  '/js/local-auth.js',
  '/js/firebase.js',
  '/js/docs-catalog.js',
  '/js/forms-fields.js',
  '/js/templates.js',
  '/icons/favicon.ico',
  '/icons/favicon.svg',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  '/pages/login.html',
  '/pages/forgot.html',
  '/pages/dashboard.html',
  '/pages/generate.html',
  '/pages/history.html',
  '/pages/vault.html',
  '/pages/legal-advisor.html',
  '/pages/legal-chat.html',
  '/pages/risk-analyzer.html',
  '/pages/profile.html',
  '/pages/subscription.html',
  '/pages/terms.html',
  '/pages/privacy.html',
  '/pages/disclaimer.html',
  '/pages/admin.html',
  '/pages/admin-chat.html'
];

// Install — cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

// Activate — remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never cache external APIs or non-GET
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('anthropic') ||
    url.hostname.includes('razorpay') ||
    url.hostname.includes('workers.dev') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('fonts.') ||
    e.request.method !== 'GET'
  ) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Network-first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/404.html')))
  );
});
