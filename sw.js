// MyRight Service Worker v16 — Production-hardened PWA
// Changes from v14:
//   - Cache version bumped (forces update on existing installs)
//   - Removed /pages/admin-chat.html (file does not exist — was breaking install)
//   - Removed /pages/mr-panel-9x7k.html from cache (admin page must not be cached)
//   - Added /pages/delete-account.html
//   - Added /js/entitlement.js and /js/audit-log.js

const CACHE = 'myright-v16';

const STATIC = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/css/main.css',
  '/js/main.js',
  '/js/sw-register.js',
  '/js/firebase-auth.js',
  '/js/firebase-config.js',
  '/js/entitlement.js',
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
  '/pages/delete-account.html',
  '/pages/admin.html'
  // NOTE: /pages/mr-panel-9x7k.html is intentionally NOT cached — admin pages
  // must always be fetched fresh from the network and must not be served offline.
];

// Install — pre-cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
      .catch(err => {
        // Log which file caused the failure to make debugging easier
        console.error('SW install failed:', err);
      })
  );
});

// Activate — remove old cache versions
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy: Network-first, cache fallback for static; always-network for dynamic
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always fetch from network (no caching):
  // - Firebase / Firestore
  // - Razorpay
  // - Cloudflare Worker API calls
  // - Anthropic
  // - Google Fonts/APIs
  // - Non-GET requests (POST etc.)
  // - Admin panel pages
  const neverCache =
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('anthropic') ||
    url.hostname.includes('razorpay') ||
    url.hostname.includes('workers.dev') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('fonts.') ||
    e.request.method !== 'GET' ||
    url.pathname.includes('mr-panel') ||
    url.pathname.includes('admin-chat');

  if (neverCache) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('', { status: 503 }))
    );
    return;
  }

  // Network-first for all other GET requests, cache fallback for offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(e.request)
          .then(cached => cached || caches.match('/404.html'))
      )
  );
});
