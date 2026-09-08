import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import { webcrypto } from 'node:crypto'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const application = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).filter(Boolean).at(-1)
const protocol = id => ({ id, name: id, _custom: true, steps: [{ freq_a: 40, freq_b: 116, duration: 4, polarity: 'Alternating', wave: 'Medium' }] })
const jsonResponse = (value, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => value })
const flush = () => new Promise(resolve => setImmediate(resolve))

function studio({ protocols = [protocol('existing')], favorites = ['reference-1'], storage, fetchOverride } = {}) {
  const entries = storage || new Map()
  if (!entries.has('fsm_auth')) entries.set('fsm_auth', JSON.stringify({ email: 'audit@example.invalid', token: 'synthetic-token' }))
  const requests = []
  const alerts = []
  const elements = new Map()
  const element = id => {
    if (!elements.has(id)) {
      const classes = new Set()
      elements.set(id, {
        value: '', innerHTML: '', textContent: '', disabled: false, hidden: false, style: {}, dataset: {}, listeners: {},
        classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle() {} },
        addEventListener(event, handler) { (this.listeners[event] ||= []).push(handler) }, querySelectorAll: () => [], querySelector: () => null, setAttribute() {}, setCustomValidity() {},
      })
    }
    return elements.get(id)
  }
  const storageApi = { getItem: key => entries.get(key) || null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) }
  const context = vm.createContext({
    console: { log() {}, error() {}, warn() {} },
    window: { location: { hash: '', pathname: '/fsm/studio/', search: '' }, addEventListener() {} },
    document: { getElementById: element, querySelectorAll: () => [], querySelector: selector => selector.startsWith('.tab[data-view=') ? element('tab') : null, addEventListener() {}, documentElement: { style: { setProperty() {} } } },
    localStorage: storageApi, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    navigator: { userAgent: 'synthetic-test', mediaSession: null },
    setTimeout, clearTimeout, setInterval, clearInterval, URLSearchParams, Map, Set,
    performance: { now: () => 0 }, crypto: webcrypto,
    alert: message => alerts.push(message), confirm: () => true,
    fetch: async (url, options = {}) => {
      requests.push({ url, options })
      if (fetchOverride) {
        const response = await fetchOverride(url, options)
        if (response) return response
      }
      if (url.endsWith('/protected-data')) return jsonResponse({ data: { channel_a: [], channel_b: [], curated: [], full: [] } })
      if (url.endsWith('/protocols') && options.method !== 'POST') return jsonResponse({ protocols, favorite_protocol_ids: favorites })
      return jsonResponse({ ok: true })
    },
  })
  vm.runInContext(application, context)
  return { run: code => vm.runInContext(code, context), requests, alerts, entries, element, context }
}

test('a remembered login loads personal protocols and favorites before allowing mutation', async () => {
  const app = studio()
  await flush()
  assert.deepEqual(app.requests.map(request => request.url).sort(), ['/api/protected-data', '/api/protocols'])
  assert.equal(app.run('personalSync.ready'), true)
  assert.equal(app.run('USER_PROTOCOLS[0].id'), 'existing')
  assert.equal(app.run('FAVORITE_PROTOCOL_IDS.has("reference-1")'), true)
  const saved = await app.run('saveUserProtocols([...USER_PROTOCOLS, { id: "new", steps: [] }])')
  assert.equal(saved, true)
  const write = app.requests.find(request => request.options.method === 'POST' && request.url === '/api/protocols')
  assert.deepEqual(JSON.parse(write.options.body).protocols.map(item => item.id), ['existing', 'new'])
})

test('a failed initial read never becomes an empty library or permits a write', async () => {
  const app = studio({ fetchOverride: (url, options) => url === '/api/protocols' && options.method !== 'POST' ? jsonResponse({}, 503) : null })
  await flush()
  assert.equal(app.run('personalSync.ready'), false)
  assert.equal(app.run('personalSync.status'), 'error')
  assert.equal(app.run('USER_PROTOCOLS'), null)
  assert.equal(await app.run('saveUserProtocols([])'), false)
  assert.equal(app.requests.some(request => request.url === '/api/protocols' && request.options.method === 'POST'), false)
})

test('failed saves retain account-scoped drafts across reload and retry the same contents', async () => {
  let failWrite = true
  const entries = new Map()
  const fetchOverride = (url, options) => url === '/api/protocols' && options.method === 'POST' && failWrite ? jsonResponse({}, 503) : null
  const app = studio({ storage: entries, fetchOverride })
  await flush()
  assert.equal(await app.run('saveUserProtocols([...USER_PROTOCOLS, {id:"draft",steps:[]}])'), false)
  assert.equal(app.run('personalSync.status'), 'error')
  assert.equal(app.run('USER_PROTOCOLS.length'), 2)
  assert.ok(entries.has('fsm_personal_pending_v1:audit@example.invalid'))
  const reloaded = studio({ storage: entries, fetchOverride })
  await flush()
  assert.equal(reloaded.run('USER_PROTOCOLS[1].id'), 'draft')
  assert.equal(reloaded.run('personalSync.conflict'), false)
  failWrite = false
  assert.equal(await reloaded.run('retryPersonalSync()'), true)
  assert.equal(reloaded.run('personalSync.status'), 'saved')
  assert.equal(entries.has('fsm_personal_pending_v1:audit@example.invalid'), false)
})

test('favorites and batch operations use the same recoverable save flow', async () => {
  const app = studio({ fetchOverride: (url, options) => url === '/api/protocols' && options.method === 'POST' ? jsonResponse({}, 503) : null })
  await flush()
  await app.run('toggleFavoriteProtocol("reference-2")')
  assert.equal(app.run('FAVORITE_PROTOCOL_IDS.has("reference-2")'), true)
  assert.deepEqual(JSON.parse(app.entries.get('fsm_personal_pending_v1:audit@example.invalid')).patch.favorite_protocol_ids, ['reference-1', 'reference-2'])
  await app.run('deleteCustomProtocol("existing")')
  const draft = JSON.parse(app.entries.get('fsm_personal_pending_v1:audit@example.invalid'))
  assert.deepEqual(draft.patch.protocols, [])
  assert.deepEqual(draft.patch.favorite_protocol_ids, ['reference-1', 'reference-2'], 'a later change preserves all unsynced fields')
})

test('a late response after logout cannot restore another session data', async () => {
  let finishRead
  const pending = new Promise(resolve => { finishRead = resolve })
  const app = studio({ fetchOverride: (url, options) => url === '/api/protocols' && options.method !== 'POST' ? pending : null })
  await flush()
  await app.run('auth.logout()')
  finishRead(jsonResponse({ protocols: [protocol('old-session')], favorite_protocol_ids: [] }))
  await flush()
  assert.equal(app.run('USER_PROTOCOLS'), null)
  assert.equal(app.run('personalSync.ready'), false)
})

async function apiHandler({ kvResponses, method = 'GET', body }) {
  const calls = []
  let response
  const secret = 'synthetic-test-secret'
  const payload = Buffer.from(JSON.stringify({ email: 'audit@example.invalid', exp: Date.now() + 60000 })).toString('base64url')
  const key = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = Buffer.from(await webcrypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))).toString('base64url')
  const context = vm.createContext({
    Buffer, TextEncoder, crypto: webcrypto, console: { error() {} },
    process: { env: { SESSION_SECRET: secret, KV_REST_API_URL: 'https://synthetic.invalid', KV_REST_API_TOKEN: 'fake-kv-token' } },
    fetch: async (url, options = {}) => {
      calls.push({ url, options })
      const next = kvResponses.shift()
      if (next instanceof Error) throw next
      if (!next) throw new Error('Unexpected KV write/read')
      return next
    },
  })
  const source = fs.readFileSync(new URL('../pages/api/protocols.js', import.meta.url), 'utf8').replace('export default async function handler', 'async function handler')
  vm.runInContext(source, context)
  const req = { method, headers: { authorization: 'Bearer ' + payload + '.' + signature }, body }
  const res = { setHeader() {}, status(status) { this.statusCode = status; return this }, json(data) { response = { status: this.statusCode, data }; return this }, end() {} }
  await context.handler(req, res)
  return { calls, response }
}

test('KV read failure/corruption never triggers a migration write or empty success', async () => {
  for (const response of [jsonResponse({}, 503), jsonResponse({ result: 'not-json' }), jsonResponse({ error: 'Unavailable' })]) {
    const result = await apiHandler({ kvResponses: [response] })
    assert.equal(result.response.status, 500)
    assert.equal(result.calls.length, 1)
    assert.equal(result.calls[0].options.method, undefined)
  }
})

test('legacy protocols are read without migration writes and an explicitly empty library stays empty', async () => {
  const legacy = await apiHandler({ kvResponses: [jsonResponse({ result: null }), jsonResponse({ result: JSON.stringify([protocol('legacy')]) }), jsonResponse({ result: null })] })
  assert.equal(legacy.response.status, 200)
  assert.equal(legacy.response.data.protocols[0].id, 'legacy')
  assert.equal(legacy.calls.every(call => call.options.method !== 'POST'), true)
  const empty = await apiHandler({ kvResponses: [jsonResponse({ result: '[]' }), jsonResponse({ result: '[]' })] })
  assert.equal(empty.response.status, 200)
  assert.equal(empty.response.data.protocols.length, 0)
  assert.equal(empty.calls.length, 2)
})

test('a second save is blocked while a write is in flight', async () => {
  let finishWrite
  const write = new Promise(resolve => { finishWrite = resolve })
  const app = studio({ fetchOverride: (url, options) => url === '/api/protocols' && options.method === 'POST' ? write : null })
  await flush()
  const first = app.run('saveUserProtocols([...USER_PROTOCOLS, {id:"new",steps:[]}])')
  await flush()
  assert.equal(await app.run('saveUserProtocols([])'), false)
  assert.equal(app.requests.filter(request => request.url === '/api/protocols' && request.options.method === 'POST').length, 1)
  finishWrite(jsonResponse({ ok: true }))
  assert.equal(await first, true)
})

test('reference editor keeps its form and never posts after a failed library read', async () => {
  const app = studio({ fetchOverride: url => url === '/api/reference-protocols' ? jsonResponse({}, 503) : null })
  await flush()
  app.run("auth.user.email = ADMIN_EMAIL; _cpEditTarget = 'reference'; _cpEditId = 'reference-1'")
  app.element('cpName').value = 'Synthetic reference'
  const fields = { '.cp-freqa': '40', '.cp-freqb': '116', '.cp-dur': '4', '.cp-polarity': 'Alternating', '.cp-wave': 'Medium' }
  app.element('cpStepsList').querySelectorAll = () => [{ querySelector: selector => ({ value: fields[selector] }) }]
  app.element('customProtocolModal').classList.add('show')
  await app.run('saveCpProtocol()')
  await flush()
  assert.equal(app.requests.some(request => request.url === '/api/reference-protocols' && request.options.method === 'POST'), false)
  assert.equal(app.element('customProtocolModal').classList.contains('show'), true)
  assert.equal(app.element('cpName').value, 'Synthetic reference')
})

test('drafts cannot be restored into another signed-in account', async () => {
  const entries = new Map([
    ['fsm_auth', JSON.stringify({ email: 'other@example.invalid', token: 'synthetic-other-token' })],
    ['fsm_personal_pending_v1:audit@example.invalid', JSON.stringify({ patch: { protocols: [protocol('private-draft')] }, base: { protocols: [] } })],
  ])
  const app = studio({ storage: entries, protocols: [protocol('other-user-protocol')] })
  await flush()
  assert.equal(app.run('USER_PROTOCOLS[0].id'), 'other-user-protocol')
  assert.equal(app.run('personalSync.pending'), null)
})

test('recovering a draft detects that the cloud version changed', async () => {
  const entries = new Map([
    ['fsm_personal_pending_v1:audit@example.invalid', JSON.stringify({ patch: { protocols: [protocol('draft')] }, base: { protocols: [protocol('old-cloud')] } })],
  ])
  const app = studio({ storage: entries, protocols: [protocol('new-cloud')] })
  await flush()
  assert.equal(app.run('personalSync.conflict'), true)
  app.context.confirm = () => false
  assert.equal(await app.run('retryPersonalSync()'), false)
  assert.equal(app.requests.some(request => request.url === '/api/protocols' && request.options.method === 'POST'), false)
  assert.ok(entries.has('fsm_personal_pending_v1:audit@example.invalid'))
})

test('the personal editor stays open on failure and a second save updates its draft without duplication', async () => {
  let failWrite = true
  const app = studio({ fetchOverride: (url, options) => url === '/api/protocols' && options.method === 'POST' && failWrite ? jsonResponse({}, 503) : null })
  await flush()
  app.run("_cpEditTarget = 'user'; _cpEditId = null")
  app.element('cpName').value = 'New draft'
  const fields = { '.cp-freqa': '40', '.cp-freqb': '116', '.cp-dur': '0.5', '.cp-polarity': 'Alternating', '.cp-wave': 'Medium' }
  app.element('cpStepsList').querySelectorAll = () => [{ querySelector: selector => ({ value: fields[selector] }) }]
  app.element('customProtocolModal').classList.add('show')
  await app.run('saveCpProtocol()')
  assert.equal(app.element('customProtocolModal').classList.contains('show'), true)
  assert.equal(app.run('USER_PROTOCOLS.length'), 2)
  assert.equal(app.run('USER_PROTOCOLS[0].steps[0].duration'), 0.5)
  const id = app.run('_cpEditId')
  app.element('cpName').value = 'Corrected draft'
  failWrite = false
  await app.run('saveCpProtocol()')
  assert.equal(app.element('customProtocolModal').classList.contains('show'), false)
  assert.equal(app.run('USER_PROTOCOLS.length'), 2)
  assert.equal(app.run('USER_PROTOCOLS[0].id'), id)
  assert.equal(app.run('USER_PROTOCOLS[0].name'), 'Corrected draft')
})

test('text-import save waits for success and retries without adding a duplicate protocol', async () => {
  let failWrite = true
  const app = studio({ fetchOverride: (url, options) => url === '/api/protocols' && options.method === 'POST' && failWrite ? jsonResponse({}, 503) : null })
  await flush()
  app.element('importModal').classList.add('show')
  app.element('importTextarea').value = '40/116 Alternating Medium 4min'
  app.element('importProtoName').value = 'Imported draft'
  app.element('importTextarea').listeners.input[0]()
  await app.element('importSave').listeners.click[0]()
  assert.equal(app.element('importModal').classList.contains('show'), true)
  assert.equal(app.run('USER_PROTOCOLS.length'), 2)
  failWrite = false
  await app.element('importSave').listeners.click[0]()
  assert.equal(app.element('importModal').classList.contains('show'), false)
  assert.equal(app.run('USER_PROTOCOLS.length'), 2)
})

test('pending saves disable every editor mutation control and row handlers cannot mutate the snapshot', async () => {
  let finishWrite
  const pendingWrite = new Promise(resolve => { finishWrite = resolve })
  const app = studio({ fetchOverride: (url, options) => url === '/api/protocols' && options.method === 'POST' ? pendingWrite : null })
  await flush()
  const rows = []
  const baseControls = ['cpName', 'cpIndication', 'cpCategory', 'cpFolder', 'cpGroup'].map(id => {
    const node = app.element(id)
    Object.assign(node, { id, tag: 'input', inEditor: true, classes: [] })
    return node
  })
  const addButton = app.element('cpAddStep')
  Object.assign(addButton, { id: 'cpAddStep', tag: 'button', inEditor: true, classes: [] })
  baseControls.push(addButton)
  const matches = (node, selector) => {
    const tokens = selector.trim().split(/\s+/)
    if (tokens.length > 1 && (tokens[0] !== '#customProtocolModal' || !node.inEditor)) return false
    const leaf = tokens.at(-1)
    return leaf.startsWith('#') ? node.id === leaf.slice(1)
      : leaf.startsWith('.') ? node.classes.includes(leaf.slice(1)) : node.tag === leaf
  }
  const editorNodes = () => [...baseControls, ...rows.flatMap(row => row.children)]
  app.context.document.querySelectorAll = selector => editorNodes().filter(node => selector.split(',').some(part => matches(node, part)))
  app.element('cpStepsList').appendChild = row => { row.parentNode = app.element('cpStepsList'); rows.push(row) }
  app.element('cpStepsList').querySelectorAll = selector => selector === '.cp-step-row' ? rows : []
  app.context.document.createElement = () => {
    const row = {
      children: [], parentNode: null,
      querySelector(selector) { return this.children.find(node => matches(node, selector)) || null },
      remove() { const index = rows.indexOf(this); if (index >= 0) rows.splice(index, 1) },
      insertAdjacentElement(position, next) {
        next.parentNode = this.parentNode
        rows.splice(rows.indexOf(this) + (position === 'afterend' ? 1 : 0), 0, next)
      },
    }
    Object.defineProperty(row, 'innerHTML', { set(markup) {
      this.children = [...markup.matchAll(/<(input|select|button|span)\b([^>]*)>/g)].map(([, tag, attrs]) => {
        const classes = (attrs.match(/class="([^"]*)"/)?.[1] || '').split(/\s+/)
        const selected = tag === 'select' ? (classes.includes('cp-polarity') ? 'Alternating' : 'Medium') : ''
        return {
          tag, classes, inEditor: true, disabled: false, listeners: {}, textContent: '',
          value: attrs.match(/value="([^"]*)"/)?.[1] || selected,
          addEventListener(event, handler) { (this.listeners[event] ||= []).push(handler) }, focus() {},
        }
      })
    } })
    return row
  }
  app.run("_cpEditTarget = 'user'; _cpEditId = null; addCpStepRow({freq_a:40,freq_b:116,duration:4,polarity:'Alternating',wave:'Medium'})")
  app.element('cpName').value = 'Pending draft'
  app.element('customProtocolModal').classList.add('show')
  const saving = app.run('saveCpProtocol()')
  await flush()
  const mutationButtons = rows[0].children.filter(node => node.tag === 'button')
  assert.equal(mutationButtons.length, 3)
  assert.equal(addButton.disabled, true)
  assert.equal(mutationButtons.every(node => node.disabled), true)
  assert.equal(editorNodes().filter(node => node.tag === 'input' || node.tag === 'select').every(node => node.disabled), true)
  for (const button of mutationButtons) button.listeners.click[0]()
  assert.equal(app.run('addCpStepRow(null)'), null)
  assert.equal(rows.length, 1, 'insert, remove, and add handlers cannot change a pending save')
  finishWrite(jsonResponse({}, 503))
  await saving
  assert.equal(app.element('customProtocolModal').classList.contains('show'), true)
  assert.equal(addButton.disabled, false)
  assert.equal(mutationButtons.every(node => !node.disabled), true)
  mutationButtons.find(node => node.classes.includes('cp-ins-below-step')).listeners.click[0]()
  assert.equal(rows.length, 2, 'the retained draft can be edited once the failed request finishes')
})
