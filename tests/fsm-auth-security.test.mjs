import assert from 'node:assert/strict'
import { createHash, createHmac, webcrypto } from 'node:crypto'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const now = 1_800_000_000_000
const secret = 'synthetic-fsm-security-secret-only'
const member = 'member@example.invalid'
const admin = 'hermiterudite@gmail.com'
const credential = 'syntheticHeader.syntheticPayload.syntheticSignature'
const maxAge = 7 * 24 * 60 * 60 * 1000
const helperSource = fs.readFileSync(new URL('../lib/fsm/session-auth.js', import.meta.url), 'utf8').replace(/^import .+;\r?$/gm, '').replace(/^export /gm, '')
const protectedRoutes = ['protected-data', 'protocols', 'my-protocols', 'reference-protocols', 'pending-users']
const protocol = { id: 'synthetic-reference', name: 'Synthetic reference', steps: [{ freq_a: 40, freq_b: 116, duration: 4 }] }

function token(payload = { email: member, exp: now + 60_000 }, signingSecret = secret) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) payload = { v: 2, iat: now, ...payload }
  const encoded = Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload)).toString('base64url')
  return encoded + '.' + createHmac('sha256', signingSecret).update('fsm-cookie-session:v2:' + encoded).digest('base64url')
}

function harness(route, { env: overrides = {}, approved = [], google = {}, membershipUnavailable = false } = {}) {
  const env = { NODE_ENV: 'production', SESSION_SECRET: secret, GOOGLE_CLIENT_ID: 'synthetic-client', AUTHORIZED_EMAILS: `${member},${admin}`, KV_REST_API_URL: 'https://synthetic-kv.invalid', KV_REST_API_TOKEN: 'synthetic-kv-token', ...overrides }
  const store = new Map([['approved_emails', approved], ['pending_list', []], ['reference_protocols_v3', [protocol]]])
  const calls = []
  const context = vm.createContext({
    applyPagesRateLimit: async () => true, Buffer, TextEncoder, URL, createHash, crypto: webcrypto, console: { error() {} },
    Date: class extends Date { static now() { return now } }, process: { env },
    MB_REFERENCE: [protocol], STUDIO_GUIDE: { zh: { title: '說明' }, en: { title: 'Guide' } },
    toPublicReferenceProtocols: value => value,
    fetch: async (url, options = {}) => {
      calls.push({ url, method: options.method || 'GET' })
      const parsed = new URL(url)
      if (parsed.hostname === 'oauth2.googleapis.com') return { ok: true, json: async () => ({ aud: env.GOOGLE_CLIENT_ID, iss: 'https://accounts.google.com', exp: String(now / 1000 + 3600), email: member, email_verified: 'true', name: 'Synthetic member', ...google }) }
      assert.equal(parsed.hostname, 'synthetic-kv.invalid', 'never contact a real service')
      const key = decodeURIComponent(parsed.pathname.split('/').at(-1))
      if (key === 'approved_emails' && membershipUnavailable) throw new Error('Synthetic membership outage')
      if (options.method === 'POST') {
        store.set(key, JSON.parse(JSON.parse(options.body)))
        return { ok: true, json: async () => ({ result: 'OK' }) }
      }
      return { ok: true, json: async () => ({ result: store.has(key) ? JSON.stringify(store.get(key)) : null }) }
    },
  })
  vm.runInContext(helperSource, context)
  const source = fs.readFileSync(new URL(`../pages/api/${route}.js`, import.meta.url), 'utf8')
    .replace(/^import .+;\r?$/gm, '').replace('export default async function handler', 'async function handler').replace('export default function handler', 'function handler')
  vm.runInContext(source, context)
  return {
    env, store, calls, context,
    async request({ method = route === 'protected-data' || route === 'auth' || route === 'fsm-auth-callback' ? 'POST' : 'GET', bearer = token(), body = route === 'auth' ? { credential } : {}, cookies = {}, headers: overrides = {} } = {}) {
      const response = { status: 200, headers: {}, body: undefined }
      let account
      try { account = JSON.parse(Buffer.from(bearer.split('.')[0], 'base64url').toString()).email } catch {}
      const headers = { host: 'synthetic-studio.invalid', origin: 'https://synthetic-studio.invalid', 'x-fsm-csrf': '1', ...(account ? { 'x-fsm-account': account } : {}), ...overrides }
      const sessionCookies = bearer === null ? cookies : { '__Host-fsm_session': bearer, ...cookies }
      const res = {
        setHeader(key, value) { response.headers[key.toLowerCase()] = value },
        status(value) { response.status = value; return this },
        json(value) { response.body = JSON.parse(JSON.stringify(value)); return this },
        send(value) { response.body = value; return this },
        redirect(status, location) { response.status = status; response.headers.location = location; return this },
        end() { return this },
      }
      await context.handler({ method, headers, body, cookies: sessionCookies }, res)
      return response
    },
  }
}

test('every protected FSM API fails closed without a configured secret, including the former public fallback', async () => {
  for (const route of [...protectedRoutes, 'auth']) {
    for (const value of [undefined, '', '   ', 'CHANGE_ME_IN_PRODUCTION']) {
      const h = harness(route, { env: { SESSION_SECRET: value } })
      const response = await h.request({ bearer: token({ email: admin, exp: now + 60_000 }, 'CHANGE_ME_IN_PRODUCTION') })
      assert.equal(response.status, 503, route)
      assert.equal(response.body.code, 'session_configuration_unavailable')
      assert.equal(h.calls.length, 0)
      assert.match(response.headers['cache-control'], /no-store/)
    }
  }
})

test('all protected routes strictly reject malformed, expired, overlong, or invalid-claim sessions before storage', async () => {
  const invalid = [null, 'garbage', token() + '.extra', token({}, secret), token({ email: member, exp: '1800000060000' }), token({ email: member, exp: null }), token({ email: member, exp: now }), token({ email: member, exp: now + maxAge + 1 }), token({ email: member, exp: now + 60_000, iat: now + 1 }), token({ email: member, exp: now + 60_000, iat: now - maxAge }), token({ email: 'not-an-email', exp: now + 60_000 }), token({ email: member.toUpperCase(), exp: now + 60_000 }), token({ email: member, exp: now + 60_000 }, 'wrong-synthetic-secret'), 'a'.repeat(4097) + '.b']
  for (const route of protectedRoutes) for (const bearer of invalid) {
    const h = harness(route)
    const response = await h.request({ bearer })
    assert.equal(response.status, 401, route)
    assert.equal(h.calls.length, 0)
  }
})

test('fresh seven-day cookie sessions retain normal authorized read behavior', async () => {
  for (const route of protectedRoutes) {
    const h = harness(route)
    const email = route === 'pending-users' ? admin : member
    const legacy = await h.request({ bearer: token({ email, exp: now + maxAge }), body: { resource: 'guide' } })
    assert.equal(legacy.status, 200, route)
    const freshToken = await h.context.createSessionToken(email)
    const fresh = await h.request({ bearer: freshToken, body: { resource: 'guide' } })
    assert.equal(fresh.status, 200, route)
    const payload = JSON.parse(Buffer.from(freshToken.split('.')[0], 'base64url').toString())
    assert.equal(payload.exp - payload.iat, maxAge)
  }
})

test('revoking approved membership immediately blocks existing sessions on every route and prevents writes', async () => {
  for (const route of protectedRoutes) {
    const h = harness(route, { env: { AUTHORIZED_EMAILS: '' }, approved: [admin] })
    const bearer = token({ email: admin, exp: now + 60_000 })
    assert.equal((await h.request({ bearer, body: { resource: 'guide' } })).status, 200, route)
    h.store.set('approved_emails', [])
    const revoked = await h.request({ bearer, body: { resource: 'guide' } })
    assert.equal(revoked.status, 403, route)
    const write = await h.request({ bearer, method: 'POST', body: { protocols: [protocol], action: 'approve', email: member } })
    assert.equal(write.status, 403, route)
    assert.equal(h.calls.some(call => call.method === 'POST'), false)
  }
})

test('membership outages and missing membership configuration return 503 without exposing data', async () => {
  for (const route of protectedRoutes) for (const settings of [{ membershipUnavailable: true }, { env: { KV_REST_API_URL: undefined } }]) {
    const h = harness(route, { ...settings, env: { AUTHORIZED_EMAILS: '', ...settings.env } })
    const response = await h.request()
    assert.equal(response.status, 503, route)
    assert.equal(response.body.code, 'membership_verification_unavailable')
    assert.equal(Object.hasOwn(response.body, 'protocols'), false)
    assert.equal(Object.hasOwn(response.body, 'data'), false)
    assert.equal(h.calls.some(call => call.method === 'POST'), false)
  }
})

test('ordinary users cannot manage approvals or overwrite shared reference protocols', async () => {
  for (const route of ['pending-users', 'reference-protocols']) {
    const h = harness(route)
    const response = await h.request({ method: 'POST', body: { protocols: [protocol], action: 'approve', email: member } })
    assert.equal(response.status, 403)
    assert.equal(h.calls.length, 0)
  }
})

test('authorized personal saves and admin approval/reference saves still work with synthetic storage', async () => {
  for (const route of ['protocols', 'my-protocols']) {
    const h = harness(route)
    const response = await h.request({ method: 'POST', body: { protocols: [protocol] } })
    assert.equal(response.status, 200, route)
    assert.deepEqual(h.store.get(`${route === 'protocols' ? 'protocols' : 'my_protocols'}:${member}`), [protocol])
  }
  const approvals = harness('pending-users')
  assert.equal((await approvals.request({ bearer: token({ email: admin, exp: now + 60_000 }), method: 'POST', body: { action: 'approve', email: member } })).status, 200)
  assert.deepEqual(approvals.store.get('approved_emails'), [member])
  const references = harness('reference-protocols')
  assert.equal((await references.request({ bearer: token({ email: admin, exp: now + 60_000 }), method: 'POST', body: { protocols: [protocol] } })).status, 200)
  assert.deepEqual(references.store.get('reference_protocols_v3'), [protocol])
})

test('Google sign-in verifies issuer, audience, expiration and verified email before issuing sessions', async () => {
  const h = harness('auth')
  const response = await h.request()
  assert.equal(response.status, 200)
  assert.equal(response.body.authorized, true)
  assert.equal(Object.hasOwn(response.body, 'token'), false)
  const cookie = response.headers['set-cookie']
  assert.match(cookie, /^__Host-fsm_session=/)
  for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(cookie.includes(attribute))
  const session = await h.context.verifySessionToken(cookie.split(';')[0].split('=')[1])
  assert.equal(session.email, member)
  assert.equal(session.exp - session.iat, maxAge)
  for (const google of [{ iss: 'https://attacker.invalid' }, { aud: 'wrong-client' }, { exp: String(now / 1000) }, { exp: 'not-a-date' }, { email_verified: false }, { email: null }]) {
    const rejected = await harness('auth', { google }).request()
    assert.equal(rejected.status, 401)
    assert.equal(Object.hasOwn(rejected.body, 'token'), false)
  }
  assert.equal((await harness('auth', { env: { GOOGLE_CLIENT_ID: undefined } }).request()).status, 503)
})

test('valid unapproved Google users retain the approval queue flow without receiving a session', async () => {
  const h = harness('auth', { env: { AUTHORIZED_EMAILS: '' } })
  const response = await h.request()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(response.status, 403)
  assert.equal(response.body.error, 'pending_approval')
  assert.equal(Object.hasOwn(response.body, 'token'), false)
  assert.equal(h.store.get('pending_list')[0].email, member)
})

test('Google redirect callback rejects missing/mismatched CSRF and malicious or oversized credentials', async () => {
  const cases = [
    { body: { credential } },
    { body: { credential, g_csrf_token: 'body' }, cookies: { g_csrf_token: 'cookie' } },
    ...['</script><script>window.__auditMarker=1</script>', 'a.b', {}, 'a'.repeat(16_385) + '.b.c'].map(value => ({ body: { credential: value, g_csrf_token: 'synthetic-csrf' }, cookies: { g_csrf_token: 'synthetic-csrf' } })),
  ]
  for (const input of cases) {
    const h = harness('fsm-auth-callback')
    const response = await h.request(input)
    assert.equal(response.status, 400)
    assert.equal(typeof response.body, 'object')
    assert.equal(JSON.stringify(response.body).includes('__auditMarker'), false)
    assert.equal(h.calls.length, 0)
  }
})

test('a valid Google redirect stores the credential in one safe script and returns to Studio', async () => {
  const h = harness('fsm-auth-callback')
  const response = await h.request({ body: { credential, g_csrf_token: 'synthetic-csrf' }, cookies: { g_csrf_token: 'synthetic-csrf' } })
  assert.equal(response.status, 200)
  assert.equal(response.headers['content-type'], 'text/html; charset=utf-8')
  const scripts = [...response.body.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  assert.equal(scripts.length, 1)
  const hash = createHash('sha256').update(scripts[0][1]).digest('base64')
  assert.ok(response.headers['content-security-policy'].includes(`script-src 'sha256-${hash}'`))
  assert.equal(response.headers['content-security-policy'].split(';').find(value => value.trim().startsWith('script-src')).includes('unsafe-inline'), false)
  assert.equal(response.headers['referrer-policy'], 'no-referrer')
  const stored = new Map()
  let redirect
  vm.runInNewContext(scripts[0][1], { sessionStorage: { setItem: (key, value) => stored.set(key, value) }, window: { location: { replace: value => { redirect = value } } } })
  assert.equal(stored.get('fsm_pending_credential'), credential)
  assert.equal(redirect, '/fsm/studio/')
  assert.equal((await h.request({ method: 'GET' })).headers.location, '/fsm/studio/')
})

test('all cookie-authenticated writes require a matching origin and non-simple CSRF header', async () => {
  for (const route of [...protectedRoutes, 'auth', 'fsm-logout']) {
    for (const headers of [{ origin: 'https://attacker.invalid' }, { origin: undefined }, { origin: 'null' }, { 'x-fsm-csrf': undefined }, { 'sec-fetch-site': 'cross-site' }, { host: 'attacker.invalid' }]) {
      const h = harness(route)
      const response = await h.request({ method: 'POST', headers, body: route === 'auth' ? { credential } : { protocols: [protocol] } })
      assert.equal(response.status, 403, `${route} ${JSON.stringify(headers)}`)
      assert.equal(h.calls.length, 0)
      assert.equal(response.headers['set-cookie'], undefined)
      assert.equal(response.headers['access-control-allow-origin'], undefined)
    }
  }
})

test('session restore returns only a verified profile; bearer-only and legacy sessions cannot authenticate', async () => {
  const h = harness('fsm-session')
  const response = await h.request()
  assert.equal(response.status, 200)
  assert.equal(response.body.authorized, true)
  assert.equal(response.body.email, member)
  assert.equal(Object.hasOwn(response.body, 'token'), false)
  assert.equal(response.headers['set-cookie'], undefined, 'a read must never race with a newer login by changing its cookie')
  assert.equal((await h.request({ bearer: null, headers: { authorization: 'Bearer ' + token() } })).status, 401)
  const legacyPayload = Buffer.from(JSON.stringify({ email: member, exp: now + 60_000 })).toString('base64url')
  const legacy = legacyPayload + '.' + createHmac('sha256', secret).update(legacyPayload).digest('base64url')
  assert.equal((await h.request({ bearer: legacy })).status, 401)
  assert.equal((await h.request({ headers: { origin: 'https://attacker.invalid' } })).status, 403)
  assert.equal((await h.request({ headers: { 'sec-fetch-site': 'cross-site' } })).status, 403)
  const revoked = harness('fsm-session', { env: { AUTHORIZED_EMAILS: '' } })
  assert.equal((await revoked.request()).status, 403)
})

test('same-origin logout clears the HttpOnly cookie even when the session, membership or config is unavailable', async () => {
  const h = harness('fsm-logout', { env: { SESSION_SECRET: undefined } })
  const response = await h.request({ method: 'POST', bearer: null })
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { ok: true })
  assert.match(response.headers['set-cookie'], /^__Host-fsm_session=;/)
  for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Max-Age=0']) assert.ok(response.headers['set-cookie'].includes(attribute))
  assert.equal(h.calls.length, 0)
  assert.equal((await h.request({ method: 'GET' })).status, 405)
})

test('a cookie account change cannot read or overwrite the old tab profile data', async () => {
  for (const route of protectedRoutes) {
    const h = harness(route)
    for (const method of route === 'protected-data' ? ['POST'] : ['GET', 'POST']) {
      const response = await h.request({ method, headers: { 'x-fsm-account': 'old-tab@example.invalid' }, body: { protocols: [protocol] } })
      assert.equal(response.status, 409, route)
      assert.equal(response.body.code, 'session_account_changed')
      assert.equal(h.calls.length, 0)
    }
  }
})

test('pre-migration bearer tabs cannot use another account cookie or write without an explicit account binding', async () => {
  for (const route of protectedRoutes) {
    const h = harness(route)
    const cookieB = token({ email: admin, exp: now + 60_000 })
    for (const method of route === 'protected-data' ? ['POST'] : ['GET', 'POST']) {
      const legacy = await h.request({ method, bearer: cookieB, headers: { authorization: 'Bearer ' + token(), 'x-fsm-account': undefined }, body: { protocols: [protocol] } })
      assert.equal(legacy.status, 401, route)
      assert.equal(legacy.body.code, 'legacy_session_expired')
      assert.equal(h.calls.length, 0, 'neither membership nor application storage is accessed')
    }
    const missingBinding = await h.request({ method: 'POST', bearer: cookieB, headers: { 'x-fsm-account': undefined }, body: { protocols: [protocol] } })
    assert.equal(missingBinding.status, 409, route)
    assert.equal(h.calls.length, 0)
  }
  const restore = harness('fsm-session')
  assert.equal((await restore.request({ headers: { 'x-fsm-account': undefined } })).status, 200, 'cookie session restoration does not require a previously known profile')
})

test('shared request-protection denial prevents Google verification or protected storage access', async () => {
  for (const route of ['auth', ...protectedRoutes]) {
    const h = harness(route)
    h.context.applyPagesRateLimit = async (_req, res) => { res.status(503).json({ error: 'Synthetic protection outage', code: 'request_protection_unavailable' }); return false }
    const response = await h.request()
    assert.equal(response.status, 503, route)
    assert.equal(h.calls.length, 0)
    assert.equal(response.headers['set-cookie'], undefined)
  }
})

test('verified members have separate account-and-IP rate scopes while sign-in and callbacks retain their IP scopes', async () => {
  const scopes = []
  const capture = async (_req, _res, scope, limit, windowMs) => { scopes.push({ scope, limit, windowMs }); return true }
  const h = harness('protected-data')
  h.context.applyPagesRateLimit = capture
  for (const email of [member, admin]) {
    const response = await h.request({ bearer: token({ email, exp: now + 60_000 }), body: { resource: 'guide' } })
    assert.equal(response.status, 200)
  }
  assert.deepEqual(scopes, [member, admin].map(email => ({ scope: `fsm-member:${email}`, limit: 300, windowMs: 15 * 60 * 1000 })))
  const invalid = await h.request({ bearer: 'invalid' })
  assert.equal(invalid.status, 401)
  assert.equal(scopes.length, 2, 'unverified identities cannot choose a member rate scope')
  const signIn = harness('auth')
  signIn.context.applyPagesRateLimit = capture
  assert.equal((await signIn.request()).status, 200)
  const callback = harness('fsm-auth-callback')
  callback.context.applyPagesRateLimit = capture
  assert.equal((await callback.request({ body: { credential, g_csrf_token: 'synthetic-csrf' }, cookies: { g_csrf_token: 'synthetic-csrf' } })).status, 200)
  assert.deepEqual(scopes.slice(2).map(value => value.scope), ['fsm-sign-in', 'fsm-google-callback'])
})
