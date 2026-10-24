import assert from 'node:assert/strict'
import { createHmac, webcrypto } from 'node:crypto'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const apiSource = fs.readFileSync(new URL('../pages/api/protected-data.js', import.meta.url), 'utf8')
const guide = JSON.parse(fs.readFileSync(new URL('../data/fsm/studio-guide.json', import.meta.url), 'utf8'))
const source = apiSource.replace(/^import .+;\r?$/gm, '').replace('export default async function handler', 'async function handler')
const authSource = fs.readFileSync(new URL('../lib/fsm/session-auth.js', import.meta.url), 'utf8').replace(/^export /gm, '')
const fixtureEmail = 'member@example.invalid'
const fixtureSecret = 'synthetic-guide-test-secret'
const now = 1_800_000_000_000
const validPayload = { email: fixtureEmail, exp: now + 60_000 }

function sessionToken(payload = validPayload, secret = fixtureSecret) {
  const encoded = Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload)).toString('base64url')
  return encoded + '.' + createHmac('sha256', secret).update(encoded).digest('base64url')
}

function harness({ authorizedEmails = fixtureEmail, approvedEmails = [] } = {}) {
  const calls = []
  let approved = approvedEmails
  let protocolTransforms = 0
  const env = {
    SESSION_SECRET: fixtureSecret,
    AUTHORIZED_EMAILS: authorizedEmails,
    KV_REST_API_URL: 'https://synthetic-kv.invalid',
    KV_REST_API_TOKEN: 'synthetic-kv-token',
  }
  const context = vm.createContext({
    Buffer, TextEncoder, crypto: webcrypto,
    Date: class extends Date { static now() { return now } },
    process: { env }, STUDIO_GUIDE: guide,
    MB_REFERENCE: [{ id: 'synthetic-reference', steps: [] }],
    toPublicReferenceProtocols(protocols) { protocolTransforms++; return protocols },
    fetch: async (url, options) => {
      const key = decodeURIComponent(new URL(url).pathname.split('/').at(-1))
      calls.push({ key, options })
      if (key === 'approved_emails') {
        if (approved instanceof Error) throw approved
        return { ok: true, json: async () => ({ result: JSON.stringify(approved) }) }
      }
      if (key === 'reference_protocols_v3') return { ok: true, json: async () => ({ result: null }) }
      throw new Error('Unexpected synthetic KV request: ' + key)
    },
  })
  vm.runInContext(authSource, context)
  vm.runInContext(source, context)
  return {
    calls, env,
    get protocolTransforms() { return protocolTransforms },
    setApproved(value) { approved = value },
    async request({ token = sessionToken(), method = 'POST', body = { resource: 'guide' } } = {}) {
      const response = { status: undefined, headers: {}, body: undefined }
      const req = { method, body, headers: { origin: 'https://synthetic-studio.invalid' } }
      if (token !== null) req.headers.authorization = 'Bearer ' + token
      const res = {
        setHeader(name, value) { response.headers[name.toLowerCase()] = value },
        status(value) { response.status = value; return this },
        json(value) { response.body = JSON.parse(JSON.stringify(value)); return this },
        end() { return this },
      }
      await context.handler(req, res)
      assert.equal(response.headers['cache-control'], 'private, no-store', 'every response must prohibit caching')
      return response
    },
  }
}

test('guide rejects missing, malformed, extra-part, and incorrectly signed tokens before any KV access', async () => {
  for (const token of [null, '', 'not-a-token', '.signature', 'payload.', sessionToken() + '.extra', sessionToken(validPayload, 'wrong-synthetic-secret')]) {
    const h = harness()
    const response = await h.request({ token })
    assert.equal(response.status, 401)
    assert.equal(Object.hasOwn(response.body, 'guide'), false)
    assert.equal(h.calls.length, 0)
    assert.equal(h.protocolTransforms, 0)
  }
})

test('signed sessions require a valid email and a finite numeric expiration strictly in the future', async () => {
  const invalidPayloads = [
    { ...validPayload, exp: now - 1 },
    { ...validPayload, exp: now },
    { email: fixtureEmail },
    { ...validPayload, exp: String(now + 60_000) },
    { ...validPayload, exp: null },
    `{"email":"${fixtureEmail}","exp":1e999}`,
    { ...validPayload, email: '' },
    { ...validPayload, email: '   ' },
    { ...validPayload, email: 'not-an-email' },
    { ...validPayload, email: 'member@@example.invalid' },
    { ...validPayload, email: true },
    { exp: now + 60_000 },
    null,
    [],
  ]
  for (const payload of invalidPayloads) {
    const h = harness()
    const response = await h.request({ token: sessionToken(payload) })
    assert.equal(response.status, 401, JSON.stringify(payload))
    assert.equal(Object.hasOwn(response.body, 'guide'), false)
    assert.equal(h.calls.length, 0)
  }
})

test('missing or blank session secrets fail closed even for a token signed with the former fallback', async () => {
  for (const missingSecret of [undefined, '', '   ']) {
    const h = harness()
    if (missingSecret === undefined) delete h.env.SESSION_SECRET
    else h.env.SESSION_SECRET = missingSecret
    const response = await h.request({ token: sessionToken(validPayload, 'CHANGE_ME_IN_PRODUCTION') })
    assert.equal(response.status, 503)
    assert.equal(h.calls.length, 0)
  }
})

test('authorized members receive both complete guide locales without loading protocol data', async () => {
  const h = harness({ authorizedEmails: `other@example.invalid, ${fixtureEmail}` })
  const response = await h.request()
  assert.equal(response.status, 200)
  assert.equal(response.body.email, fixtureEmail)
  assert.deepEqual(Object.keys(response.body).sort(), ['email', 'guide'])
  assert.deepEqual(Object.keys(response.body.guide).sort(), ['en', 'zh'])
  for (const locale of ['zh', 'en']) {
    const localized = response.body.guide[locale]
    assert.equal(typeof localized.title, 'string')
    assert.ok(localized.title.trim())
    assert.equal(typeof localized.intro, 'string')
    assert.ok(localized.intro.trim())
    assert.equal(localized.sections.length, 5)
    for (const section of localized.sections) {
      assert.equal(typeof section.title, 'string')
      assert.ok(section.title.trim())
      assert.equal(typeof section.body, 'string')
      assert.ok(section.body.trim())
    }
  }
  assert.equal(h.calls.length, 0)
  assert.equal(h.protocolTransforms, 0)
})

test('KV membership is checked on every guide request and a revoked member receives no guide', async () => {
  const h = harness({ authorizedEmails: '', approvedEmails: [fixtureEmail] })
  const allowed = await h.request()
  assert.equal(allowed.status, 200)
  assert.ok(allowed.body.guide.zh && allowed.body.guide.en)
  assert.deepEqual(h.calls.map(call => call.key), ['approved_emails'])
  assert.equal(h.protocolTransforms, 0)

  h.setApproved([])
  const revoked = await h.request()
  assert.equal(revoked.status, 403)
  assert.equal(Object.hasOwn(revoked.body, 'guide'), false)
  assert.deepEqual(h.calls.map(call => call.key), ['approved_emails', 'approved_emails'])
  assert.equal(h.protocolTransforms, 0)
})

test('unapproved membership and unavailable membership storage fail closed', async () => {
  for (const approvedEmails of [[], ['someone-else@example.invalid'], new Error('Synthetic membership outage')]) {
    const h = harness({ authorizedEmails: '', approvedEmails })
    const response = await h.request()
    assert.equal(response.status, approvedEmails instanceof Error ? 503 : 403)
    assert.equal(Object.hasOwn(response.body, 'guide'), false)
    assert.deepEqual(h.calls.map(call => call.key), ['approved_emails'])
    assert.equal(h.protocolTransforms, 0)
  }
})

test('the default protected payload does not bundle the guide and retains protocol loading', async () => {
  const h = harness()
  const response = await h.request({ body: {} })
  assert.equal(response.status, 200)
  assert.ok(response.body.data)
  assert.equal(Object.hasOwn(response.body, 'guide'), false)
  assert.equal(Object.hasOwn(response.body.data, 'guide'), false)
  assert.deepEqual(h.calls.map(call => call.key), ['reference_protocols_v3'])
  assert.equal(h.protocolTransforms, 1)
})

test('preflight and unsupported methods also prevent caching and never return guide content', async () => {
  const h = harness()
  const preflight = await h.request({ token: null, method: 'OPTIONS' })
  assert.equal(preflight.status, 200)
  assert.equal(preflight.body, undefined)
  const unsupported = await h.request({ token: null, method: 'GET' })
  assert.equal(unsupported.status, 405)
  assert.equal(Object.hasOwn(unsupported.body, 'guide'), false)
  assert.equal(h.calls.length, 0)
})
