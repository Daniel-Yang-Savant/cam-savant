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
  assert.equal(evaluate("isPrivatePath('/administration-guide')"), false)
})

test('private referrers prevent related assets from entering the offline cache', () => {
  context.privateReferrerRequest = {
    referrer: 'https://camsavant.com/perioperative-rehab/acl-reconstruction-rehab',
  }
  context.publicReferrerRequest = {
    referrer: 'https://camsavant.com/posts/acl-rupture-treatment-decision',
  }

  assert.equal(evaluate('hasPrivateReferrer(privateReferrerRequest)'), true)
  assert.equal(evaluate('hasPrivateReferrer(publicReferrerRequest)'), false)
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

  assert.equal(evaluate('isPublicCacheableResponse(privateResponse)'), false)
  assert.equal(
    evaluate('isPublicCacheableResponse(redirectedProtectedResponse)'),
    false
  )
  assert.equal(evaluate('isPublicCacheableResponse(publicResponse)'), true)
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
