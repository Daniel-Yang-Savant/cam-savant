// Exercise a production build against synthetic local configuration and a read-only KV fixture.
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const adminSecret = 'local-smoke-admin-password-only'
const sessionSecret = 'local-smoke-session-signing-secret-only'
const patientCode = 'local-smoke-patient-code-only'
const member = 'smoke-member@example.invalid'
const adminEmail = 'hermiterudite@gmail.com' // The application's existing FSM admin role.
const keepOpen = process.argv.includes('--keep-open')
let next
let output = ''
let passed = 0

const kv = http.createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json')
  if (request.method !== 'GET') {
    response.writeHead(405).end(JSON.stringify({ error: 'Smoke fixture is read-only' }))
    return
  }
  const key = decodeURIComponent(new URL(request.url, 'http://localhost').pathname.split('/').at(-1))
  const value = ['approved_emails', 'pending_list'].includes(key) ? '[]' : null
  response.end(JSON.stringify({ result: value }))
})

function session(email) {
  const now = Date.now()
  const encoded = Buffer.from(JSON.stringify({ email, iat: now, exp: now + 60_000 })).toString('base64url')
  return `${encoded}.${createHmac('sha256', sessionSecret).update(encoded).digest('base64url')}`
}

function check(name, callback) {
  return Promise.resolve().then(callback).then(() => { passed += 1; console.log(`PASS ${name}`) })
}

try {
  await new Promise(resolve => kv.listen(0, '127.0.0.1', resolve))
  const probe = http.createServer()
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve))
  const port = probe.address().port
  await new Promise(resolve => probe.close(resolve))
  const base = `http://localhost:${port}`
  next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
      ADMIN_SECRET: adminSecret, SESSION_SECRET: sessionSecret,
      PERIOP_ACCESS_TOKEN: patientCode, PERIOP_SIGNING_SECRET: 'local-smoke-private-patient-signing-only',
      GOOGLE_CLIENT_ID: 'local-smoke-client-only', AUTHORIZED_EMAILS: `${member},${adminEmail}`,
      KV_REST_API_URL: `http://127.0.0.1:${kv.address().port}`, KV_REST_API_TOKEN: 'local-smoke-kv-token-only',
    },
  })
  next.stdout.on('data', chunk => { output = (output + chunk).slice(-32_000) })
  next.stderr.on('data', chunk => { output = (output + chunk).slice(-32_000) })
  let ready = false
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (next.exitCode !== null) throw new Error('Production server exited before becoming ready')
    try { const response = await fetch(`${base}/api/search`); if (response.ok) { ready = true; break } } catch { /* Startup. */ }
    await delay(200)
  }
  assert.ok(ready, 'Production server must start')
  const request = (url, options = {}) => fetch(base + url, { redirect: 'manual', ...options })
  const json = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  await check('public home, English home, article directory, exercise guides and care locations render', async () => {
    for (const url of ['/', '/en', '/posts', '/exercise-guides', '/locations', '/rehab-resources', '/fsm/studio/index.html']) {
      const response = await request(url)
      assert.equal(response.status, 200, url)
      assert.match(response.headers.get('content-type'), /text\/html/)
      assert.ok((await response.text()).length > 1000, url)
    }
  })
  await check('published article and search data remain available', async () => {
    const slug = fs.readdirSync('content/posts').find(name => /\.mdx?$/.test(name) && /^category:\s*["']?sports-medicine["']?\s*$/m.test(fs.readFileSync(path.join('content/posts', name), 'utf8'))).replace(/\.mdx?$/, '')
    assert.equal((await request(`/posts/${slug}`)).status, 200)
    assert.ok((await (await request('/api/search')).json()))
  })
  await check('anonymous private routes deny access', async () => {
    assert.equal((await request('/admin/editor')).status, 404)
    for (const url of ['/api/admin/session', '/api/admin/articles', '/api/pending-users', '/api/protocols', '/api/my-protocols', '/api/reference-protocols']) assert.equal((await request(url)).status, 401, url)
    const response = await request('/perioperative-rehab')
    assert.equal(response.status, 307)
    assert.ok(response.headers.get('location').endsWith('/perioperative-rehab/locked'))
  })
  let adminCookie
  await check('normal admin login issues a signed session and opens editor plus templates', async () => {
    const response = await request('/api/admin-login', json({ password: adminSecret }))
    assert.equal(response.status, 200)
    adminCookie = response.headers.get('set-cookie').split(';')[0]
    assert.match(adminCookie, /^admin_token=v1\./)
    assert.ok(!adminCookie.includes(adminSecret))
    for (const url of ['/admin/editor', '/api/admin/session', '/api/admin/articles', '/api/admin/opd/templates']) assert.equal((await request(url, { headers: { Cookie: adminCookie } })).status, 200, url)
    assert.equal((await request('/api/admin/session', { headers: { Cookie: `admin_token=${adminSecret}` } })).status, 401)
  })
  await check('admin QR grant and legacy patient link issue safe patient sessions', async () => {
    const response = await request('/api/admin/periop-qr', { method: 'POST', headers: { Cookie: adminCookie } })
    assert.equal(response.status, 200)
    const grantUrl = new URL((await response.json()).url)
    const grantResponse = await request(grantUrl.pathname + grantUrl.search)
    assert.equal(grantResponse.status, 307)
    const cookie = grantResponse.headers.get('set-cookie').split(';')[0]
    assert.match(cookie, /^periop_access=v2\./)
    assert.equal((await request('/perioperative-rehab', { headers: { Cookie: cookie } })).status, 200)
    assert.equal((await request('/en/perioperative-rehab', { headers: { Cookie: cookie } })).status, 200)
    assert.equal((await request(`/perioperative-rehab/access?token=${patientCode}`)).status, 307)
    assert.equal((await request('/api/admin/session', { headers: { Cookie: cookie } })).status, 401)
  })
  await check('normal FSM member and admin read APIs work with local read-only KV', async () => {
    for (const url of ['/api/protocols', '/api/my-protocols', '/api/reference-protocols']) assert.equal((await request(url, { headers: { Authorization: `Bearer ${session(member)}` } })).status, 200, url)
    assert.equal((await request('/api/pending-users', { headers: { Authorization: `Bearer ${session(adminEmail)}` } })).status, 200)
    assert.equal((await request('/api/protected-data', { ...json({ resource: 'guide' }), headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session(member)}` } })).status, 200)
  })
  await check('Google callback rejects missing CSRF and accepts valid-shaped same-flow handoff', async () => {
    assert.equal((await request('/api/fsm-auth-callback', json({ credential: 'header.payload.signature' }))).status, 400)
    const response = await request('/api/fsm-auth-callback', { ...json({ credential: 'header.payload.signature', g_csrf_token: 'synthetic-csrf' }), headers: { 'Content-Type': 'application/json', Cookie: 'g_csrf_token=synthetic-csrf' } })
    assert.equal(response.status, 200)
    assert.match(await response.text(), /fsm_pending_credential/)
    assert.equal((await request('/api/auth', json({ credential: '<invalid>' }))).status, 400)
  })
  await check('article traversal and invalid consultation inputs are rejected', async () => {
    assert.equal((await request('/api/admin/articles/..%2F..%2FAGENTS', { headers: { Cookie: adminCookie } })).status, 400)
    const response = await request('/api/consult', { ...json({}), headers: { 'Content-Type': 'application/json', Origin: base } })
    assert.equal(response.status, 400)
  })
  console.log(`${passed}/${passed} production smoke checks passed. Local preview: ${base}`)
  if (keepOpen) {
    console.log('Synthetic local preview remains open until interrupted; no production data is used.')
    await Promise.race([once(process, 'SIGINT'), once(process, 'SIGTERM')])
  }
} catch (error) {
  console.error(error)
  console.error(output)
  process.exitCode = 1
} finally {
  next?.kill('SIGTERM')
  kv.closeAllConnections()
  await new Promise(resolve => kv.close(resolve))
}
