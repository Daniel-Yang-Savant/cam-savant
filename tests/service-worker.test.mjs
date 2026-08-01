import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const listeners = new Map()
const context = vm.createContext({
  URL,
  self: {
    location: { origin: 'https://camsavant.com' },
    addEventListener(type, listener) {
      listeners.set(type, listener)
    },
    skipWaiting() {},
    clients: { claim() {} },
  },
  caches: {},
})

const serviceWorkerSource = readFileSync(
  new URL('../public/sw.js', import.meta.url),
  'utf8'
)
vm.runInContext(serviceWorkerSource, context)

function evaluate(expression) {
  return vm.runInContext(expression, context)
}

test('private and authentication routes are excluded from offline caching', () => {
  const privatePaths = [
    '/api',
    '/api/search',
    '/admin',
    '/admin/editor',
    '/admin-login',
    '/perioperative-rehab',
    '/perioperative-rehab/acl-reconstruction-rehab',
    '/en/perioperative-rehab',
    '/en/perioperative-rehab/acl-reconstruction-rehab',
    '/ak-google-auth',
    '/fsm/studio',
    '/login',
    '/workspace/sports-medicine',
    '/apply',
    '/patient/example-token',
  ]

  for (const pathname of privatePaths) {
    assert.equal(evaluate(`isPrivatePath(${JSON.stringify(pathname)})`), true)
  }

  assert.equal(evaluate("isPrivatePath('/posts')"), false)
  assert.equal(evaluate("isPrivatePath('/en/about')"), false)
  assert.equal(evaluate("isPrivatePath('/administration-guide')"), false)
})

test('private referrers prevent related assets from entering the offline cache', () => {
  context.privateReferrerRequest = {
    referrer: 'https://camsavant.com/perioperative-rehab/acl-reconstruction-rehab',
  }
  context.publicReferrerRequest = {
    referrer: 'https://camsavant.com/posts/acl-rupture-treatment-decision',
  }
  context.englishPrivateReferrerRequest = {
    referrer: 'https://camsavant.com/en/perioperative-rehab/tkr-rehab',
  }

  assert.equal(evaluate('hasPrivateReferrer(privateReferrerRequest)'), true)
  assert.equal(evaluate('hasPrivateReferrer(publicReferrerRequest)'), false)
  assert.equal(evaluate('hasPrivateReferrer(englishPrivateReferrerRequest)'), true)
})

test('private, no-store, and redirected protected responses are not cacheable', () => {
  context.privateResponse = {
    ok: true,
    url: 'https://camsavant.com/posts/example',
    headers: new Headers({ 'cache-control': 'private, no-store' }),
  }
  context.redirectedProtectedResponse = {
    ok: true,
    url: 'https://camsavant.com/perioperative-rehab/example',
    headers: new Headers(),
  }
  context.publicResponse = {
    ok: true,
    url: 'https://camsavant.com/posts/example',
    headers: new Headers({ 'cache-control': 'public, max-age=60' }),
  }
  context.redirectedEnglishProtectedResponse = {
    ok: true,
    url: 'https://camsavant.com/en/perioperative-rehab/example',
    headers: new Headers(),
  }

  assert.equal(evaluate('isPublicCacheableResponse(privateResponse)'), false)
  assert.equal(
    evaluate('isPublicCacheableResponse(redirectedProtectedResponse)'),
    false
  )
  assert.equal(evaluate('isPublicCacheableResponse(publicResponse)'), true)
  assert.equal(
    evaluate('isPublicCacheableResponse(redirectedEnglishProtectedResponse)'),
    false
  )
})

test('fetch handler leaves private routes on the network without an offline fallback', () => {
  const fetchListener = listeners.get('fetch')
  assert.ok(fetchListener)

  let intercepted = false
  fetchListener({
    request: {
      url: 'https://camsavant.com/perioperative-rehab/example',
      method: 'GET',
      referrer: '',
      headers: new Headers(),
    },
    respondWith() {
      intercepted = true
    },
  })

  assert.equal(intercepted, false)
})
