// CAM Savant Service Worker — offline-first for key pages
const CACHE_VERSION = 'cam-savant-v1'
const STATIC_URLS = [
  '/',
  '/posts',
  '/about',
  '/contact',
  '/sports-medicine',
  '/rehabilitation-medicine',
  '/functional-medicine',
  '/fsm',
  '/bookmarks',
  '/offline',
]

// ── Install: pre-cache shell pages ────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.addAll(STATIC_URLS).catch(() => {
        // Some pages may not exist yet — silently ignore
      })
    )
  )
  self.skipWaiting()
})

// ── Activate: purge old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch strategy ────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // Skip API routes and admin pages (always network)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin')
  ) return

  // ── Static assets (_next/static): Cache-first, long TTL ──
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            if (res.ok) {
              caches.open(CACHE_VERSION).then((c) => c.put(request, res.clone()))
            }
            return res
          })
      )
    )
    return
  }

  // ── Images: Cache-first ──
  if (
    url.pathname.startsWith('/images/') ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            if (res.ok) {
              caches.open(CACHE_VERSION).then((c) => c.put(request, res.clone()))
            }
            return res
          })
      )
    )
    return
  }

  // ── HTML pages: Network-first, fall back to cache ──
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(CACHE_VERSION).then((c) => c.put(request, res.clone()))
          }
          return res
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached ?? caches.match('/offline')
          )
        )
    )
    return
  }

  // ── Everything else: Network-first ──
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})
