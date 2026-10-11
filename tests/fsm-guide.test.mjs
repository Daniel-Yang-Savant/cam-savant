import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const serverGuide = JSON.parse(fs.readFileSync(new URL('../data/fsm/studio-guide.json', import.meta.url), 'utf8'))
const guideStart = html.indexOf('let infoRequestGeneration =')
const guideEnd = html.indexOf('// PDF EXPORT', guideStart)
assert.ok(guideStart >= 0 && guideEnd > guideStart)
const extractFunction = name => {
  const start = html.indexOf(`function ${name}(`)
  assert.ok(start >= 0, `${name} must exist`)
  return html.slice(start, html.indexOf('\n}', start) + 2)
}
const escapeFunction = html.match(/function escapeHtml\(s\) \{[^\n]+\}/)?.[0]
assert.ok(escapeFunction)
const source = [html.slice(guideStart, guideEnd), extractFunction('switchToView'),
  extractFunction('updateAuthUI'), escapeFunction].join('\n')
const member = () => ({ email: 'member@example.invalid', token: 'synthetic-member-token' })
const guide = {
  zh: { title: '會員說明', intro: '中文介紹', sections: [{ title: '第一節', body: '中文內容' }] },
  en: { title: 'Member guide', intro: 'English introduction', sections: [{ title: 'First section', body: 'English content' }] },
}
const response = (payload = { guide }, status = 200) => ({
  ok: status >= 200 && status < 300, status, jsonCalls: 0,
  async json() { this.jsonCalls++; return payload },
})
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function harness({ user = member(), lang = 'en', fetchResult = () => response() } = {}) {
  const nodes = new Map(), requests = [], gates = []
  let saved = 0, resets = 0, protectedLoads = 0, fetcher = fetchResult
  function node(id, classes = []) {
    const names = new Set(classes)
    return {
      id, innerHTML: '', textContent: '', style: {}, events: {},
      classList: { add: name => names.add(name), remove: name => names.delete(name), contains: name => names.has(name) },
      addEventListener(event, callback) { this.events[event] = callback },
      fire(event) { return this.events[event]?.() },
      getAttribute(name) { return name === 'data-view' ? id.replace('tab-', '') : null },
    }
  }
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, node(id))
    return nodes.get(id)
  }
  const views = ['manual', 'info', 'music', 'protocols', 'library', 'records']
  const tabs = views.map(view => node('tab-' + view, view === 'info' ? ['active'] : []))
  for (const view of views) nodes.set('view-' + view, node('view-' + view, view === 'info' ? ['active'] : []))
  const context = vm.createContext({
    LANG: lang, API_BASE: '/api', ADMIN_EMAIL: 'admin@example.invalid',
    CHANNEL_A: null, PROTOCOLS_CURATED: null,
    auth: { user, isAuthed() { return !!this.user }, save() { saved++ } },
    $: get,
    document: {
      getElementById: get,
      querySelectorAll(selector) {
        if (selector === '.view') return views.map(view => get('view-' + view))
        if (selector === '.tab.locked') return tabs.filter(tab => tab.classList.contains('locked'))
        if (selector === '.tab[data-requires-auth]') return tabs.filter(tab => tab.id !== 'tab-manual')
        if (selector === '.tab[data-view]') return tabs
        throw new Error('Unexpected selector: ' + selector)
      },
      querySelector(selector) {
        if (selector === '.tab.active') return tabs.find(tab => tab.classList.contains('active'))
        const match = selector.match(/^\.tab\[data-view="([^"]+)"\]$/)
        if (match) return tabs.find(tab => tab.id === 'tab-' + match[1])
        throw new Error('Unexpected selector: ' + selector)
      },
    },
    fetch(url, options) { requests.push({ url, options }); return Promise.resolve().then(() => fetcher(url, options)) },
    renderGate(id) { gates.push(id); get(id).innerHTML = '<div data-member-gate>Sign in</div>' },
    resetPersonalProtocolState() { resets++ },
    syncMusicDownload() {}, syncMusicPreviewOwner() {}, checkPendingCount() {}, stopMusicPreview() {},
    loadProtectedData() { protectedLoads++; return Promise.resolve(true) },
    renderProtocolsView() {}, renderLibraryView() {}, renderMusicView() {}, renderRecordsView() {},
  })
  vm.runInContext(source, context)
  return { context, nodes, requests, gates,
    get markup() { return get('view-info').innerHTML },
    get saved() { return saved }, get resets() { return resets }, get protectedLoads() { return protectedLoads },
    setFetch(fn) { fetcher = fn },
  }
}

test('guests and local profiles without a token only see the gate and make no request', async () => {
  for (const user of [null, {}, { email: 'member@example.invalid' }, { token: '' }]) {
    const h = harness({ user })
    await h.context.renderInfoView()
    assert.equal(h.requests.length, 0)
    assert.deepEqual(h.gates, ['view-info'])
    assert.match(h.markup, /data-member-gate/)
  }
})

test('the info tab is membership-gated and does not load the protocol library', async () => {
  const guest = harness({ user: null })
  guest.context.switchToView('manual')
  assert.equal(guest.gates.length, 0, 'manual stays public')
  guest.context.switchToView('info')
  assert.deepEqual(guest.gates, ['view-info'])
  assert.equal(guest.requests.length, 0)
  assert.equal(guest.protectedLoads, 0)

  const signedIn = harness()
  signedIn.context.switchToView('info')
  await Promise.resolve()
  assert.equal(signedIn.requests.length, 1)
  assert.equal(signedIn.protectedLoads, 0, 'guide must not depend on loading frequency/protocol data')
})

test('every visit authenticates with the current bearer token, guide resource and no-store cache', async () => {
  const h = harness()
  await h.context.renderInfoView()
  await h.context.renderInfoView()
  assert.equal(h.requests.length, 2)
  for (const { url, options } of h.requests) {
    assert.equal(url, '/api/protected-data')
    assert.equal(options.method, 'POST')
    assert.equal(options.cache, 'no-store')
    assert.equal(options.headers.Authorization, 'Bearer synthetic-member-token')
    assert.equal(options.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(options.body), { resource: 'guide' })
  }
})

test('guide rendering chooses the requested language and falls back to Chinese when absent', async () => {
  for (const lang of ['zh', 'en']) {
    const h = harness({ lang })
    await h.context.renderInfoView()
    assert.ok(h.markup.includes(guide[lang].title))
    assert.ok(h.markup.includes(guide[lang].intro))
    assert.ok(h.markup.includes(guide[lang].sections[0].body))
    assert.ok(!h.markup.includes(guide[lang === 'zh' ? 'en' : 'zh'].title))
  }
  const fallback = harness({ fetchResult: () => response({ guide: { zh: guide.zh } }) })
  await fallback.context.renderInfoView()
  assert.ok(fallback.markup.includes(guide.zh.title))
})

test('all server-provided guide fields are escaped before insertion into HTML', async () => {
  const unsafe = '<img src=x onerror="alert(1)"> & <script>run()</script>'
  const h = harness({ fetchResult: () => response({ guide: { en: {
    title: unsafe, intro: unsafe, sections: [{ title: unsafe, body: unsafe }],
  } } }) })
  await h.context.renderInfoView()
  assert.doesNotMatch(h.markup, /<img|<script>/)
  assert.equal((h.markup.match(/&lt;img/g) || []).length, 4)
  assert.equal((h.markup.match(/&quot;alert\(1\)&quot;/g) || []).length, 4)
  assert.equal((h.markup.match(/&amp;/g) || []).length, 4)
})

test('expired or revoked membership removes the stored session and returns to the gate', async () => {
  for (const status of [401, 403]) {
    const denied = response({ guide }, status)
    const h = harness({ fetchResult: () => denied })
    await h.context.renderInfoView()
    assert.equal(h.context.auth.user, null, String(status))
    assert.equal(h.saved, 1)
    assert.equal(h.resets, 1)
    assert.equal(denied.jsonCalls, 0, 'unauthorized bodies must never be rendered')
    assert.deepEqual(h.gates, ['view-info'])
    assert.doesNotMatch(h.markup, /Member guide|English content/)
  }
})

test('logout and account replacement clear already-visible guide content immediately', async () => {
  for (const nextUser of [null, { ...member(), token: 'replacement-token' }]) {
    const h = harness()
    await h.context.renderInfoView()
    assert.match(h.markup, /Member guide/)
    h.context.auth.user = nextUser
    h.context.updateAuthUI()
    assert.equal(h.markup, '')
  }
})

test('late responses cannot overwrite content after clearing, switching accounts or leaving the info tab', async () => {
  for (const invalidate of ['clear', 'account', 'navigation', 'inactive']) {
    const waiting = deferred()
    const h = harness({ fetchResult: () => waiting.promise })
    const loading = h.context.renderInfoView()
    await Promise.resolve()
    if (invalidate === 'clear') h.context.clearInfoView()
    else if (invalidate === 'account') { h.context.auth.user = member(); h.context.updateAuthUI() }
    else if (invalidate === 'navigation') h.context.switchToView('manual')
    else h.nodes.get('view-info').classList.remove('active')
    const before = h.markup
    const stale = response()
    waiting.resolve(stale)
    await loading
    assert.equal(h.markup, before, invalidate)
    assert.equal(stale.jsonCalls, 0, invalidate)
  }
})

test('a stale authorization denial cannot revoke a newer member session', async () => {
  const waiting = deferred()
  const h = harness({ fetchResult: () => waiting.promise })
  const loading = h.context.renderInfoView()
  const newUser = { ...member(), token: 'new-token' }
  h.context.auth.user = newUser
  h.context.updateAuthUI()
  waiting.resolve(response({}, 403))
  await loading
  assert.equal(h.context.auth.user, newUser)
  assert.equal(h.saved, 0)
  assert.equal(h.gates.length, 0)
})

test('a late JSON body and an older concurrent request cannot replace the newest guide', async () => {
  const body = deferred(), readingBody = deferred()
  const h = harness({ fetchResult: () => ({ ok: true, status: 200,
    json() { readingBody.resolve(); return body.promise },
  }) })
  const older = h.context.renderInfoView()
  await readingBody.promise
  h.setFetch(() => response({ guide: { en: { ...guide.en, title: 'Fresh guide' } } }))
  await h.context.renderInfoView()
  assert.match(h.markup, /Fresh guide/)
  body.resolve({ guide })
  await older
  assert.match(h.markup, /Fresh guide/)
  assert.doesNotMatch(h.markup, /<h2[^>]*>Member guide/)
})

test('network, server and malformed-guide failures offer a retry that authenticates again', async () => {
  const failures = [
    () => Promise.reject(new Error('offline')),
    () => response({}, 500),
    () => response({}),
    () => response({ guide: { en: { ...guide.en, sections: [] } } }),
    () => response({ guide: { en: { ...guide.en, sections: [{ title: 'bad', body: 42 }] } } }),
  ]
  for (const fetchResult of failures) {
    const h = harness({ fetchResult })
    await h.context.renderInfoView()
    assert.match(h.markup, /id="retryInfoGuide"/)
    assert.ok(h.context.auth.user, 'transient errors must not revoke membership')
    h.setFetch(() => response())
    await h.nodes.get('retryInfoGuide').fire('click')
    assert.equal(h.requests.length, 2)
    assert.match(h.markup, /Member guide/)
    assert.doesNotMatch(h.markup, /retryInfoGuide/)
  }
})

test('the public studio file contains neither the member guide bodies nor old embedded technical explanations', () => {
  assert.doesNotMatch(html, /\binfo_(?:[a-z_]+_)?body\b/)
  assert.doesNotMatch(html, /200\s*Hz/i, 'keep the old 200 Hz explanatory prose out of the public page')
  for (const locale of ['zh', 'en']) {
    for (const { body } of serverGuide[locale].sections) assert.ok(!html.includes(body), `${locale} guide body must be server-only`)
  }
})
