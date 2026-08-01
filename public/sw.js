// CAM Savant Service Worker — offline-first for public pages only
const CACHE_PREFIX = 'cam-savant-'
const CACHE_VERSION = 'cam-savant-v3'
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

// Never intercept or cache authenticated, protected, login, or patient routes.
// Some prefixes are defensive for current/future routes hosted on this origin.
const PRIVATE_PATH_PREFIXES = [
  '/api',
  '/admin',
  '/admin-login',
  '/perioperative-rehab',
  '/en/perioperative-rehab',
  '/ak-google-auth',
  '/fsm/studio',
  '/login',
  '/workspace',
  '/apply',
  '/patient',
]

function isPrivatePath(pathname) {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function hasPrivateReferrer(request) {
  if (!request.referrer) return false

  try {
    const referrerUrl = new URL(request.referrer)
    return (
      referrerUrl.origin === self.location.origin &&
      isPrivatePath(referrerUrl.pathname)
    )
  } catch {
    return false
  }
}

function isPublicCacheableResponse(response) {
  if (!response.ok) return false

  const cacheControl = response.headers.get('cache-control')?.toLowerCase() ?? ''
  if (cacheControl.includes('private') || cacheControl.includes('no-store')) {
    return false
  }

  // A public-looking URL can redirect to a protected page. Inspect the final
  // response URL so an authenticated redirect is never stored under an alias.
  try {
    const responseUrl = new URL(response.url)
    if (
      responseUrl.origin === self.location.origin &&
      isPrivatePath(responseUrl.pathname)
    ) {
      return false
    }
  } catch {
    return false
  }

  return true
}

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
    caches.keys().then(async (keys) => {
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )

      // Defense in depth: remove private entries if a future route changes
      // classification without also changing the cache version.
      const cache = await caches.open(CACHE_VERSION)
      const requests = await cache.keys()
      await Promise.all(
        requests
          .filter((request) => isPrivatePath(new URL(request.url).pathname))
          .map((request) => cache.delete(request))
      )
    })
  )
  self.clients.claim()
})

// ── Fetch strategy ────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Let the browser use the network directly for cross-origin, non-GET, and
  // all private requests. Private pages intentionally have no offline fallback.
  if (
    url.origin !== self.location.origin ||
    request.method !== 'GET' ||
    isPrivatePath(url.pathname) ||
    hasPrivateReferrer(request) ||
    request.headers.has('authorization')
  ) return

  // ── Static assets (_next/static): Cache-first, long TTL ──
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            if (isPublicCacheableResponse(res)) {
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
            if (isPublicCacheableResponse(res)) {
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
          if (isPublicCacheableResponse(res)) {
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
