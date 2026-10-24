import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import { webcrypto } from 'node:crypto'
import { createRequire } from 'node:module'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const { NextRequest, NextResponse } = require('next/server')
const helper = fs.readFileSync(new URL('../lib/security/request-protection.js', import.meta.url), 'utf8').replace(/^export /gm, '')
const origin = 'https://security.example.invalid'

function harness({ shared = new Map(), env: overrides = {}, fetcher } = {}) {
  const env = { NODE_ENV: 'production', VERCEL: '1', KV_REST_API_URL: 'https://synthetic-request-protection.invalid', KV_REST_API_TOKEN: 'synthetic-kv-token', RATE_LIMIT_SECRET: 'synthetic-private-hmac-key', ADMIN_SECRET: 'synthetic-admin-password', ...overrides }
  const calls = []
  let now = 1_800_000_000_000
  const context = vm.createContext({
    process: { env, cwd: () => '/tmp/synthetic-no-files-written' },
    crypto: webcrypto, TextEncoder, Uint8Array, URL, Headers, AbortController, setTimeout, clearTimeout,
    Date: class extends Date { static now() { return now } },
    fetch: async (url, options) => {
      calls.push({ url, options })
      assert.equal(new URL(url).hostname, 'synthetic-request-protection.invalid', 'Never contact a real service')
      if (fetcher) return fetcher(url, options)
      const [command, script, count, bucket, windowMs] = JSON.parse(options.body)
      assert.equal(command, 'EVAL'); assert.equal(count, '1')
      assert.match(script, /redis.call\('INCR'/); assert.match(script, /redis.call\('PEXPIRE'/)
      assert.match(bucket, /^request-limit:v1:[a-f0-9]{64}$/)
      let record = shared.get(bucket)
      if (!record || record.resetAt <= now) record = { count: 0, resetAt: now + Number(windowMs) }
      record.count++
      shared.set(bucket, record)
      return { ok: true, json: async () => ({ result: [record.count, record.resetAt - now] }) }
    },
  })
  vm.runInContext(helper, context)
  return { env, context, calls, shared, advance(ms) { now += ms },
    run: code => vm.runInContext(code, context),
    limit: (key = 'login:192.0.2.1', limit = 3, windowMs = 60_000) => context.checkRateLimit(key, limit, windowMs),
  }
}

test('independent server instances share the same atomic limit and counters expire', async () => {
  const shared = new Map(), a = harness({ shared }), b = harness({ shared })
  const results = await Promise.all(Array.from({ length: 8 }, (_, i) => (i % 2 ? a : b).limit()))
  assert.equal(results.filter(result => result.allowed).length, 3)
  assert.equal(shared.size, 1)
  a.advance(60_000)
  assert.equal((await a.limit()).allowed, true)
  assert.equal((await a.limit('another-route:192.0.2.1')).allowed, true)
  assert.equal((await a.limit('login:192.0.2.2')).allowed, true)
})

test('only keyed opaque digests reach KV; rotating the private key changes bucket names', async () => {
  const a = harness()
  await a.limit('login:192.0.2.123:member@example.invalid')
  const command = a.calls[0].options
  assert.equal(command.cache, 'no-store'); assert.equal(command.redirect, 'error')
  assert.doesNotMatch(command.body, /192\.0\.2\.123|member@example|synthetic-private-hmac-key/)
  assert.equal(command.headers.Authorization, 'Bearer synthetic-kv-token')
  const b = harness({ env: { RATE_LIMIT_SECRET: 'another-synthetic-private-key' } })
  await b.limit('login:192.0.2.123:member@example.invalid')
  assert.notEqual(JSON.parse(a.calls[0].options.body)[3], JSON.parse(b.calls[0].options.body)[3])
})

test('production configuration errors, upstream failures and malformed replies fail closed', async () => {
  for (const settings of [
    { env: { KV_REST_API_URL: undefined, KV_REST_API_TOKEN: undefined } },
    { env: { KV_REST_API_URL: 'http://untrusted.invalid' } },
    { fetcher: async () => { throw new Error('Synthetic outage') } },
    { fetcher: async () => ({ ok: false }) },
    ...[null, { error: 'wrong credential' }, { result: ['1', 1000] }, { result: [1, -1] }, { result: [1, 60_001] }].map(data => ({ fetcher: async () => ({ ok: true, json: async () => data }) })),
  ]) {
    const h = harness(settings), result = await h.limit()
    assert.equal(result.allowed, false); assert.equal(result.unavailable, true)
    const response = h.context.rateLimitError(result)
    assert.equal(response.status, 503); assert.match(response.headers['Cache-Control'], /no-store/)
  }
})

test('a stalled KV request is aborted within the fixed deadline', async () => {
  let signal
  const h = harness({ fetcher: async (_url, options) => { signal = options.signal; return new Promise(() => {}) } })
  const start = Date.now(), result = await h.limit()
  assert.equal(result.unavailable, true); assert.equal(signal.aborted, true)
  assert.ok(Date.now() - start < 2500)
})

test('memory fallback is restricted to development and also enforces its window', async () => {
  const h = harness({ env: { NODE_ENV: 'development', VERCEL: undefined, KV_REST_API_URL: undefined, KV_REST_API_TOKEN: undefined } })
  assert.equal((await h.limit()).allowed, true)
  assert.equal((await h.limit()).allowed, true)
  assert.equal((await h.limit()).allowed, true)
  assert.equal((await h.limit()).allowed, false)
  assert.equal(h.calls.length, 0)
  h.advance(60_000)
  assert.equal((await h.limit()).allowed, true)
})

test('Vercel IP extraction ignores alternate spoofed headers and normalizes addresses', () => {
  const h = harness()
  assert.equal(h.context.getClientIp(new Headers({ 'x-vercel-forwarded-for': '192.0.2.20', 'x-forwarded-for': '192.0.2.99' })), '192.0.2.20')
  assert.equal(h.context.getClientIp({ 'x-vercel-forwarded-for': '2001:0DB8:0:0::1' }), '2001:db8::1')
  assert.equal(h.context.getClientIp({ 'x-forwarded-for': 'not-an-ip', 'x-real-ip': '192.0.2.99' }), 'unknown')
  delete h.env.VERCEL
  assert.equal(h.context.getClientIp({ 'x-forwarded-for': '192.0.2.99' }), 'unknown')
  assert.equal(h.context.getClientIp({ 'x-forwarded-for': '192.0.2.99' }, '::ffff:192.0.2.3'), '::ffff:c000:203')
})

test('origin protection blocks explicit cross-origin, null and browser same-site writes', () => {
  const h = harness()
  for (const headers of [{ origin: 'https://attacker.invalid' }, { origin: 'null' }, { origin: origin + '/path' }, { 'sec-fetch-site': 'cross-site' }, { 'sec-fetch-site': 'same-site' }]) {
    assert.equal(h.context.isAllowedWriteOrigin(headers, origin), false)
  }
  for (const headers of [{ origin }, {}, { 'sec-fetch-site': 'same-origin' }]) assert.equal(h.context.isAllowedWriteOrigin(headers, origin), true)
})

test('Pages helper returns correct denial status and does not expose bucket identity', async () => {
  const h = harness(), response = { headers: {}, statusCode: 200 }
  const res = { setHeader(name, value) { response.headers[name] = value }, status(status) { response.statusCode = status; return this }, json(body) { response.body = body } }
  const req = { headers: { 'x-vercel-forwarded-for': '192.0.2.10' }, socket: { remoteAddress: '127.0.0.1' } }
  assert.equal(await h.context.applyPagesRateLimit(req, res, 'exchange', 1, 1000), true)
  assert.equal(await h.context.applyPagesRateLimit(req, res, 'exchange', 1, 1000), false)
  assert.equal(response.statusCode, 429); assert.equal(response.headers['Retry-After'], '1')
  assert.doesNotMatch(JSON.stringify(response.body), /192\.0\.2|request-limit/)
  delete h.env.KV_REST_API_URL
  assert.equal(await h.context.applyPagesRateLimit(req, res, 'exchange', 1, 1000), false)
  assert.equal(response.statusCode, 503)
})

function routeHarness(file, settings) {
  const h = harness(settings), writes = { files: 0, upstream: 0 }
  const shared = h.run('({checkRateLimit,getClientIp,isAllowedWriteOrigin,rateLimitError})')
  const fsStub = { constants: { O_WRONLY: 1, O_CREAT: 2, O_TRUNC: 4, O_NOFOLLOW: 8 }, existsSync: () => false, lstatSync: () => undefined, openSync: () => 100, closeSync() {}, writeFileSync() { writes.files++ } }
  const context = vm.createContext({
    exports: {}, process: { env: h.env, cwd: () => '/tmp/synthetic-no-files-written' },
    require(name) {
      if (name === 'next/server') return { NextResponse }
      if (name === '@/lib/rate-limit') return shared
      if (name === '@/lib/admin-auth') return { ADMIN_COOKIE_NAME: 'admin_token', ADMIN_SESSION_MAX_AGE_SECONDS: 21600, createAdminSession: async () => 'synthetic-signed-session' }
      if (name === '@/lib/periop-auth') return { getPeriopSigningSecret: () => 'synthetic-private-key', createPeriopQrGrant: async () => ({ grant: 'synthetic-grant', expiresAt: Date.now() / 1000 + 600 }) }
      if (name === 'fs') return fsStub
      if (name === 'path') return require('node:path')
      throw new Error('Unexpected route import ' + name)
    },
    setTimeout: callback => setTimeout(callback, 0), URL, URLSearchParams, AbortSignal, console: { error() {} },
    fetch: async () => { writes.upstream++; return { ok: true } },
  })
  const source = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8')
  vm.runInContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, context)
  return { ...h, writes, context, request: (method, body, headers = {}) => context.exports[method](new NextRequest(origin + '/api/synthetic', { method, headers: { 'Content-Type': 'application/json', 'x-vercel-forwarded-for': '192.0.2.30', ...headers }, body: JSON.stringify(body) }), { params: Promise.resolve({ slug: 'synthetic-article' }) }) }
}

test('admin login, article writes, QR and consultations deny cross-origin requests before KV or application writes', async () => {
  for (const [file, method] of [['app/api/admin-login/route.ts', 'POST'], ['app/api/admin/articles/[slug]/route.ts', 'PUT'], ['app/api/admin/periop-qr/route.ts', 'POST'], ['app/api/consult/route.ts', 'POST']]) {
    const h = routeHarness(file)
    const response = await h.request(method, {}, { Origin: 'https://attacker.invalid' })
    assert.equal(response.status, 403, file)
    assert.equal(h.calls.length, 0); assert.equal(h.writes.files + h.writes.upstream, 0)
  }
})

test('normal writes work with shared protection; an outage blocks every write before side effects', async () => {
  for (const [file, method, body] of [
    ['app/api/admin-login/route.ts', 'POST', { password: 'synthetic-admin-password' }],
    ['app/api/admin/articles/[slug]/route.ts', 'PUT', { content: '# Synthetic article' }],
    ['app/api/admin/periop-qr/route.ts', 'POST', {}],
    ['app/api/consult/route.ts', 'POST', { name: 'Synthetic', question: 'Synthetic consultation', contact: 'synthetic@example.invalid' }],
  ]) {
    const h = routeHarness(file)
    assert.equal((await h.request(method, body, { Origin: origin })).status, 200, file)
    const denied = routeHarness(file, { fetcher: async () => { throw new Error('Synthetic outage') } })
    const response = await denied.request(method, body, { Origin: origin })
    assert.equal(response.status, 503, file)
    assert.equal(denied.writes.files + denied.writes.upstream, 0)
  }
  const consult = routeHarness('app/api/consult/route.ts')
  assert.equal((await consult.request('POST', null)).status, 400)
  assert.equal(consult.writes.upstream, 0)
})

test('a sixth login or consultation is denied before credentials or upstream submission are processed', async () => {
  const login = routeHarness('app/api/admin-login/route.ts')
  for (let i = 0; i < 5; i++) assert.equal((await login.request('POST', { password: 'incorrect-synthetic-password' })).status, 401)
  const deniedLogin = await login.request('POST', { password: 'synthetic-admin-password' })
  assert.equal(deniedLogin.status, 429)
  assert.equal(deniedLogin.cookies.get('admin_token'), undefined)
  assert.ok(Number(deniedLogin.headers.get('Retry-After')) > 0)
  const consult = routeHarness('app/api/consult/route.ts')
  const body = { question: 'Synthetic consultation', contact: 'synthetic@example.invalid' }
  for (let i = 0; i < 5; i++) assert.equal((await consult.request('POST', body)).status, 200)
  assert.equal((await consult.request('POST', body)).status, 429)
  assert.equal(consult.writes.upstream, 5)
})
