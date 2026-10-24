import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import { webcrypto } from 'node:crypto'
import { parseDocument } from 'htmlparser2'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const application = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).filter(Boolean).at(-1)
const passphrase = 'synthetic vault password'
const backupPassword = 'synthetic backup password'
const record = (id = 'record_1', patch = {}) => ({
  id, date: '2026-10-24T01:00:00.000Z', modified: '2026-10-24T01:00:00.000Z', patient: 'Synthetic Patient',
  complaint: 'Synthetic complaint', protocol: 'Reference protocol', response: '', notes: 'Private clinical note', painBefore: 4, painAfter: 2,
  protoSteps: [{ freq_a: 40, freq_b: 116, duration: 4, polarity: 'Alternating', wave: 'Medium' }], ...patch,
})
const plain = value => JSON.parse(JSON.stringify(value))
const flush = () => new Promise(resolve => setImmediate(resolve))
function harness({ entries = new Map(), email = 'a@example.invalid', confirm = () => true } = {}) {
  const elements = new Map(), windowEvents = new Map(), requests = [], alerts = []
  const element = id => {
    if (!elements.has(id)) {
      const classes = new Set()
      elements.set(id, {
        id, value: '', innerHTML: '', textContent: '', disabled: false, style: {}, dataset: {}, listeners: {},
        classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name), toggle() {} },
        addEventListener(event, handler) { (this.listeners[event] ||= []).push(handler) },
        querySelectorAll: () => [], querySelector: () => null, setAttribute() {}, getAttribute() { return null }, setCustomValidity() {},
      })
    }
    return elements.get(id)
  }
  entries.set('fsm_auth', JSON.stringify({ email, token: 'synthetic-token' }))
  const localStorage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) }
  const context = vm.createContext({
    console: { log() {}, error() {}, warn() {} },
    window: { location: { hash: '', pathname: '/fsm/studio/', search: '' }, addEventListener(type, handler) { windowEvents.set(type, handler) } },
    document: { getElementById: element, querySelectorAll: () => [], querySelector: selector => selector.startsWith('.tab[data-view=') ? element('tab') : null, addEventListener() {}, documentElement: { style: { setProperty() {} } } },
    localStorage, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    navigator: { userAgent: 'synthetic-test', mediaSession: null },
    setTimeout, clearTimeout, setInterval, clearInterval, URL, URLSearchParams, TextEncoder, TextDecoder, Uint8Array, btoa, atob,
    performance: { now: () => 0 }, crypto: webcrypto, confirm, alert: message => alerts.push(message), prompt: () => backupPassword,
    fetch: async (url, options = {}) => {
      requests.push({ url, options })
      if (url.endsWith('/protected-data')) return { ok: true, json: async () => ({ data: { channel_a: [], channel_b: [], curated: [], full: [] } }) }
      if (url.endsWith('/protocols')) return { ok: true, json: async () => ({ protocols: [], favorite_protocol_ids: [] }) }
      if (url.endsWith('/pending-users')) return { ok: true, json: async () => ({ pending: [], approved: [] }) }
      throw new Error('Unexpected API in records test')
    },
  })
  vm.runInContext(application, context)
  return { context, entries, requests, alerts, element, windowEvents,
    run: code => vm.runInContext(code, context),
    async unlock(password = passphrase) { return vm.runInContext(`unlockRecordsVault(${JSON.stringify(password)}, ${JSON.stringify(password)})`, context) },
    async save(value) { context.recordsFixture = value; return vm.runInContext('saveSessions(recordsFixture)', context) },
    setAccount(email) { context.nextAccount = { email, token: 'synthetic-new-token' }; vm.runInContext('auth.user = nextAccount; updateAuthUI()', context) },
  }
}
function assertSafeMarkup(markup) {
  const visit = node => {
    assert.ok(!['script', 'iframe', 'svg', 'img', 'object'].includes(node.name), node.name)
    for (const name of Object.keys(node.attribs || {})) assert.ok(!/^on/i.test(name), name)
    for (const child of node.children || []) visit(child)
  }
  visit(parseDocument(markup))
}
async function encryptedBackup(sessions, patch = {}) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16)), iv = webcrypto.getRandomValues(new Uint8Array(12))
  const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(backupPassword), 'PBKDF2', false, ['deriveKey'])
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt'])
  const data = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify({ version: 1, sessions, ...patch })))
  const combined = Buffer.concat([Buffer.from(salt), Buffer.from(iv), Buffer.from(data)])
  const text = JSON.stringify({ format: 'fsm-encrypted-backup-v1', data: combined.toString('base64') })
  return { size: Buffer.byteLength(text), text: async () => text }
}

test('records require a separate passphrase; legacy data is never silently read or reassigned', async () => {
  const legacy = JSON.stringify([record()]), entries = new Map([['fsm_sessions_v1', legacy]])
  const app = harness({ entries, confirm: () => false })
  await flush()
  assert.deepEqual(plain(app.run('loadSessions()')), [])
  assert.throws(() => app.run('validateSessionRecords(null)'))
  await assert.rejects(app.unlock('short'))
  assert.equal(entries.has('fsm_records_vault_v1:a@example.invalid'), false)
  await app.unlock()
  assert.deepEqual(plain(app.run('loadSessions()')), [])
  assert.equal(await app.run('migrateLegacyRecords()'), false)
  assert.equal(entries.get('fsm_sessions_v1'), legacy)
  assert.equal(entries.has('fsm_records_legacy_owner_v1'), false)
  assert.equal(app.requests.some(request => request.options.body?.includes('Synthetic Patient')), false)
})

test('explicit migration verifies an encrypted complete archive before removing legacy plaintext', async () => {
  const legacy = JSON.stringify([record()]), entries = new Map([['fsm_sessions_v1', legacy]])
  const app = harness({ entries })
  await app.unlock()
  assert.equal(await app.run('migrateLegacyRecords()'), true)
  assert.equal(app.run('loadSessions()[0].patient'), 'Synthetic Patient')
  const encrypted = entries.get('fsm_records_vault_v1:a@example.invalid')
  assert.ok(encrypted)
  assert.doesNotMatch(encrypted, /Synthetic Patient|Private clinical note|synthetic vault password/)
  assert.equal(entries.has('fsm_sessions_v1'), false)
  assert.ok(entries.get('fsm_records_legacy_archive_v1:a@example.invalid'))
  assert.equal(await app.run('decryptLegacyArchive(JSON.parse(localStorage.getItem(recordsArchiveKey(recordVault.owner))), recordVault.key, recordVault.owner)'), legacy)
  assert.equal(entries.get('fsm_records_legacy_owner_v1'), 'a@example.invalid')
  app.setAccount('b@example.invalid')
  assert.equal(app.run('recordsAreUnlocked()'), false)
  assert.deepEqual(plain(app.run('loadSessions()')), [])
  await app.unlock('different synthetic password')
  await assert.rejects(app.run('migrateLegacyRecords()'), /其他帳號/)
  assert.deepEqual(plain(app.run('loadSessions()')), [])
  assert.equal(entries.get('fsm_records_vault_v1:a@example.invalid'), encrypted)
})

test('reload and logout lock ciphertext; wrong password and copying a vault to another account cannot decrypt', async () => {
  const app = harness()
  await app.unlock(); await app.save([record()])
  app.run('renderRecordsView(); openSessionModal(loadSessions()[0]); recordFollowUp(loadSessions()[0])')
  app.element('modalTitle').textContent = 'Synthetic Patient'
  await app.run('auth.logout()')
  assert.equal(app.run('recordVault.key'), null)
  assert.equal(app.run('recordVault.records.length'), 0)
  for (const id of ['view-records', 'recordList', 'followupInfo', 'followupStepInfo']) assert.equal(app.element(id).innerHTML, '', id)
  assert.equal(app.element('sessionPatient').value, '')
  assert.equal(app.element('sessionNotes').value, '')
  const original = app.entries.get('fsm_records_vault_v1:a@example.invalid')
  const reloaded = harness({ entries: app.entries })
  assert.equal(reloaded.run('recordsAreUnlocked()'), false)
  await assert.rejects(reloaded.unlock('incorrect synthetic password'))
  assert.equal(reloaded.entries.get('fsm_records_vault_v1:a@example.invalid'), original)
  await reloaded.unlock()
  assert.equal(reloaded.run('loadSessions()[0].notes'), 'Private clinical note')
  reloaded.entries.set('fsm_records_vault_v1:b@example.invalid', original)
  reloaded.setAccount('b@example.invalid')
  await assert.rejects(reloaded.unlock())
  assert.equal(reloaded.run('recordsAreUnlocked()'), false)
})

test('logout/account replacement cancels an asynchronous unlock and another tab changes lock immediately', async () => {
  const app = harness()
  const pending = app.unlock()
  app.setAccount('b@example.invalid')
  assert.equal(await pending, false)
  assert.equal(app.run('recordVault.key'), null)
  assert.equal(app.entries.has('fsm_records_vault_v1:a@example.invalid'), false)
  await app.unlock()
  await app.save([record()])
  app.windowEvents.get('storage')({ key: 'fsm_records_vault_v1:b@example.invalid' })
  assert.equal(app.run('recordsAreUnlocked()'), false)
  assert.equal(app.run('recordVault.records.length'), 0)
})

test('an in-flight encrypted save cannot restore records or write after logout', async () => {
  const app = harness()
  await app.unlock()
  const before = app.entries.get('fsm_records_vault_v1:a@example.invalid')
  const pending = app.save([record()])
  // encrypt() yields before any localStorage write; change session in that interval.
  await app.run('auth.logout()')
  await assert.rejects(pending, /登入已變更/)
  assert.equal(app.entries.get('fsm_records_vault_v1:a@example.invalid'), before)
  assert.equal(app.run('recordVault.key'), null)
})

test('another tab vault revision and storage quota failures preserve the previous records', async () => {
  const app = harness()
  await app.unlock(); await app.save([record()])
  const previous = app.entries.get('fsm_records_vault_v1:a@example.invalid')
  app.run('localStorage.setItem = () => { throw new Error("QuotaExceededError") }')
  await assert.rejects(app.save([record('record_2')]), /QuotaExceededError/)
  assert.equal(app.run('loadSessions()[0].id'), 'record_1')
  assert.equal(app.entries.get('fsm_records_vault_v1:a@example.invalid'), previous)
  app.entries.set('fsm_records_vault_v1:a@example.invalid', previous + ' ')
  await assert.rejects(app.save([]), /另一個分頁/)
  assert.equal(app.run('recordsAreUnlocked()'), false)
})

test('backup schema rejects malformed ids, dates, ratings, steps, oversized text and duplicate records', () => {
  const app = harness()
  for (const value of [null, {}, [null], [record('bad" id')], [record('one', { date: 'not a date' })], [record('one', { patient: {} })], [record('one', { painBefore: '<img>' })], [record('one', { painAfter: 11 })], [record('one', { notes: 'x'.repeat(10001) })], [record('one', { protoSteps: [{ freq_a: '40', freq_b: 116, duration: 4 }] })], [record('one', { protoSteps: [{ freq_a: 0, freq_b: 116, duration: 4 }] })], [record(), record()]]) {
    app.context.invalidFixture = value
    assert.throws(() => app.run('validateSessionRecords(invalidFixture)'), JSON.stringify(value)?.slice(0, 90))
  }
})

test('valid encrypted backup merges only after complete validation; malformed backup never changes existing vault', async () => {
  const app = harness()
  await app.unlock(); await app.save([record('existing')])
  const original = app.entries.get('fsm_records_vault_v1:a@example.invalid')
  for (const file of [await encryptedBackup([record('bad', { painBefore: 'malicious' })]), await encryptedBackup([record('bad')], { version: 2 }), { size: 3000000, text: async () => { throw new Error('Must reject before reading') } }]) {
    app.context.importFixture = { target: { files: [file], value: 'selected' } }
    await app.run('importEncryptedRecords(importFixture)')
    assert.equal(app.entries.get('fsm_records_vault_v1:a@example.invalid'), original)
    assert.equal(app.context.importFixture.target.value, '')
  }
  app.context.importFixture = { target: { files: [await encryptedBackup([record('imported')])], value: 'selected' } }
  await app.run('importEncryptedRecords(importFixture)')
  assert.deepEqual(plain(app.run('loadSessions().map(record => record.id).sort()')), ['existing', 'imported'])
})

test('record cards, follow-up details and PDFs render malicious text without creating HTML handlers', async () => {
  const attack = '<img src=x onerror="alert(1)"><script>bad()</script>\'"'
  const app = harness(); await app.unlock()
  await app.save([record('attack', { patient: attack, complaint: attack, protocol: attack, response: attack, notes: attack })])
  app.run('renderRecordList(""); recordFollowUp(loadSessions()[0])')
  for (const markup of [app.element('recordList').innerHTML, app.element('followupInfo').innerHTML, app.run('generateSessionHTML(loadSessions()[0])')]) {
    assertSafeMarkup(markup)
    assert.match(markup, /&lt;img/)
  }
  assert.equal(app.run('_followupProto.note'), '')
  assert.equal(app.run('_followupProto.condition'), '')
  assert.equal(app.run('_followupProto.name'), app.run('loadSessions()[0].protocol'))
})

test('pending users and approval buttons escape identity values and never interpolate executable event attributes', async () => {
  const app = harness({ email: 'hermiterudite@gmail.com' }); await flush()
  app.context.adminFixture = { pending: [{ email: 'bad\'"@example.invalid', name: '<img src=x onerror=alert(1)>', picture: 'javascript:alert(1)', requestedAt: '<script>bad()</script>' }], approved: ['bad\'"@example.invalid'] }
  app.run('_adminData = adminFixture; _adminTab = "pending"; _renderAdminList()')
  assertSafeMarkup(app.element('adminModalList').innerHTML)
  assert.match(app.element('adminModalList').innerHTML, /data-user-action="approve"/)
  assert.doesNotMatch(app.element('adminModalList').innerHTML, /<[^>]+(?:onclick=|onerror=|javascript:)/)
  app.run('_adminTab = "approved"; _renderAdminList()')
  assertSafeMarkup(app.element('adminModalList').innerHTML)
  assert.match(app.element('adminModalList').innerHTML, /data-user-action="revoke"/)
  assert.equal(app.run('safeAvatarUrl("https://evil.invalid/tracker")'), '')
  assert.equal(app.run('safeAvatarUrl("https://lh3.googleusercontent.com/a/avatar")'), 'https://lh3.googleusercontent.com/a/avatar')
})

test('migration failure and an account switch during migration keep the original plaintext recovery data', async () => {
  for (const failure of ['archive-quota', 'account-change']) {
    const legacy = JSON.stringify([record('legacy', { legacyExtra: 'Full original field retained' })])
    const app = harness({ entries: new Map([['fsm_sessions_v1', legacy]]) })
    await app.unlock()
    if (failure === 'archive-quota') {
      app.run('const originalSetItem = localStorage.setItem; localStorage.setItem = (key, value) => { if (key.startsWith("fsm_records_legacy_archive")) throw new Error("Archive quota"); originalSetItem(key, value) }')
      await assert.rejects(app.run('migrateLegacyRecords()'), /Archive quota/)
    } else {
      const pending = app.run('migrateLegacyRecords()')
      app.setAccount('b@example.invalid')
      assert.equal(await pending, false)
    }
    assert.equal(app.entries.get('fsm_sessions_v1'), legacy)
    assert.equal(app.entries.has('fsm_records_legacy_owner_v1'), false)
  }
})

test('clearing storage from another tab clears the visible vault and signed-in state', async () => {
  const app = harness(); await app.unlock(); await app.save([record()])
  app.windowEvents.get('storage')({ key: null })
  assert.equal(app.run('auth.user'), null)
  assert.equal(app.run('recordVault.key'), null)
  assert.equal(app.run('recordVault.records.length'), 0)
})

function oauthHarness() {
  const entries = new Map(), calls = [], errors = [], cleanedUrls = []
  const source = html.slice(html.indexOf('function clearOAuthRequest()'), html.indexOf('// CUSTOM PROTOCOLS', html.indexOf('function clearOAuthRequest()')))
  const context = vm.createContext({
    crypto: webcrypto, Uint8Array, URLSearchParams, TextDecoder, atob, GOOGLE_CLIENT_ID: 'synthetic-client',
    window: { location: { href: 'https://synthetic.invalid/fsm/studio/', hash: '', pathname: '/fsm/studio/', search: '' }, handleGoogleCredential: data => calls.push(data) },
    sessionStorage: { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) },
    history: { replaceState: (_state, _title, url) => cleanedUrls.push(url) }, showGateError: message => errors.push(message),
  })
  vm.runInContext(source, context)
  return { context, entries, calls, errors, cleanedUrls }
}
const fakeIdToken = nonce => 'synthetic_header.' + Buffer.from(JSON.stringify({ nonce, email: 'synthetic@example.invalid' })).toString('base64url') + '.synthetic_signature'

test('implicit OAuth uses independent cryptographic state/nonce and only accepts the matching outstanding request once', () => {
  const app = oauthHarness()
  app.context.beginOAuthRedirect()
  const redirect = new URL(app.context.window.location.href)
  const state = redirect.searchParams.get('state'), nonce = redirect.searchParams.get('nonce')
  assert.match(state, /^[a-f0-9]{64}$/)
  assert.match(nonce, /^[a-f0-9]{64}$/)
  assert.notEqual(state, nonce)
  app.context.window.location.hash = '#id_token=' + fakeIdToken(nonce) + '&state=' + state
  assert.equal(app.context.checkOAuthCallback(), true)
  assert.equal(app.calls.length, 1)
  assert.equal(app.entries.size, 0)
  assert.deepEqual(app.cleanedUrls, ['/fsm/studio/'])
  assert.equal(app.context.checkOAuthCallback(), false, 'a replay cannot reuse consumed state')
  assert.equal(app.calls.length, 1)
})

test('implicit OAuth rejects unsolicited credentials, incorrect state/nonce, expired requests, duplicates and error responses', () => {
  for (const invalid of ['unsolicited', 'state', 'nonce', 'expired', 'duplicate', 'error']) {
    const app = oauthHarness()
    if (invalid !== 'unsolicited') app.context.beginOAuthRedirect()
    const state = app.entries.get('fsm_oauth_state') || 'a'.repeat(64)
    const nonce = app.entries.get('fsm_oauth_nonce') || 'b'.repeat(64)
    if (invalid === 'expired') app.entries.set('fsm_oauth_started', String(Date.now() - 11 * 60 * 1000))
    app.context.window.location.hash = invalid === 'error' ? '#error=access_denied&state=' + state
      : '#id_token=' + fakeIdToken(invalid === 'nonce' ? 'wrong' : nonce) + '&state=' + (invalid === 'state' ? 'wrong' : state) + (invalid === 'duplicate' ? '&state=' + state : '')
    assert.equal(app.context.checkOAuthCallback(), false, invalid)
    assert.equal(app.calls.length, 0, invalid)
    assert.equal(app.entries.size, 0, invalid)
    assert.equal(app.errors.length, 1, invalid)
  }
})

test('redirect POST credentials are processed only after the callback and application state exist', () => {
  const callbackIndex = application.indexOf('window.handleGoogleCredential = async function')
  const vaultIndex = application.indexOf('const recordVault =')
  const pendingIndex = application.indexOf('(function processPendingCredential()')
  assert.ok(callbackIndex >= 0 && vaultIndex > callbackIndex && pendingIndex > vaultIndex)
})

function signInGateHarness({ loaded = true, userAgent = 'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36' } = {}) {
  const views = new Map(), sdkEvents = new Map(), initialized = [], rendered = []
  let redirects = 0
  const identity = {
    initialize(options) { initialized.push(options) },
    renderButton(container, options) { rendered.push({ container, options }) },
    prompt() { throw new Error('Explicit sign-in must not depend on One Tap or its FedCM notifications') },
  }
  const getView = id => {
    if (!views.has(id)) {
      const button = { addEventListener(type, listener) { this[type] = listener } }
      const container = { innerHTML: '', querySelector: () => button }
      const error = { textContent: '', style: {} }
      views.set(id, { innerHTML: '', button, container, error, querySelector: selector => selector === '.gate-gsi-container' ? container : error })
    }
    return views.get(id)
  }
  const context = vm.createContext({
    window: { google: loaded ? { accounts: { id: identity } } : undefined, handleGoogleCredential() {} },
    document: { getElementById: getView, querySelector: () => ({ addEventListener: (type, listener) => sdkEvents.set(type, listener) }) },
    navigator: { userAgent }, GOOGLE_CLIENT_ID: 'synthetic-client',
    t: key => key, beginOAuthRedirect: () => { redirects += 1 },
  })
  const source = html.slice(html.indexOf('function renderGate(viewId)'), html.indexOf('// ── Bind redirect login'))
  vm.runInContext(source, context)
  return { context, getView, initialized, rendered, sdkEvents, get redirects() { return redirects },
    load() { context.window.google = { accounts: { id: identity } }; sdkEvents.get('load')() },
  }
}

test('desktop, iOS and Android Chrome render the explicit Google button without waiting for One Tap notifications', () => {
  for (const userAgent of ['Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36', 'Mozilla/5.0 Firefox/130.0', 'Mozilla/5.0 iPhone Version/18.0 Mobile Safari/604.1', 'Mozilla/5.0 Android Chrome/130.0.0.0 Mobile Safari/537.36']) {
    const app = signInGateHarness({ userAgent })
    app.context.renderGate('view-records')
    assert.equal(app.rendered.length, 1, userAgent)
    assert.equal(app.rendered[0].container, app.getView('view-records').container)
    assert.equal(app.initialized[0].ux_mode, 'popup')
    assert.equal(app.initialized[0].callback, app.context.window.handleGoogleCredential)
    app.context.renderGate('view-info')
    assert.equal(app.initialized.length, 1, 'all locked tabs share one Google client initialization')
    assert.equal(app.rendered.length, 2)
  }
})

test('a delayed Google SDK replaces the temporary control as soon as it loads and reports load failures', () => {
  const app = signInGateHarness({ loaded: false })
  app.context.renderGate('view-records')
  assert.equal(app.rendered.length, 0)
  app.getView('view-records').button.click()
  assert.match(app.getView('view-records').error.textContent, /尚未載入/)
  app.load()
  assert.equal(app.rendered.length, 1)
  assert.equal(app.getView('view-records').error.style.display, 'none')
  const blocked = signInGateHarness({ loaded: false })
  blocked.context.renderGate('view-records')
  blocked.sdkEvents.get('error')()
  assert.match(blocked.getView('view-records').error.textContent, /載入失敗/)
})

test('non-Chrome Android keeps the existing secure redirect sign-in flow', () => {
  const app = signInGateHarness({ userAgent: 'Mozilla/5.0 Android SamsungBrowser/26.0 Chrome/124.0 Mobile Safari/537.36' })
  app.context.renderGate('view-records')
  assert.equal(app.initialized.length, 0)
  assert.equal(app.rendered.length, 0)
  app.getView('view-records').button.click()
  assert.equal(app.redirects, 1)
})
