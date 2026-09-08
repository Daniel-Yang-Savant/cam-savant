import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const section = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)))
const plain = value => JSON.parse(JSON.stringify(value))
function parser() {
  const elements = new Map()
  const context = vm.createContext({
    FREQ_ZH_A: {}, FREQ_ZH_B: {}, FREQ_A_MAP: {}, FREQ_B_MAP: {},
    $: id => { if (!elements.has(id)) elements.set(id, {}); return elements.get(id) },
    escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
  })
  vm.runInContext(section('function isValidFrequency(', 'function fmtTime('), context)
  vm.runInContext(section('function parseImportText(', '// ── Modal wiring'), context)
  return { context, elements, parse: input => plain(context.parseImportText(input)) }
}

test('decimal frequencies and durations survive plain text, numbered and table imports', () => {
  const { parse } = parser()
  for (const input of [
    '0.1/10 交流 Medium 4min',
    '1. 0.1/10 交流 Medium 4min',
    '| 0.1/10 | 交流 | Medium | 4min |',
    '0．1／10 交流 Medium 4min',
  ]) {
    const result = parse(input)
    assert.equal(result.errors.length, 0, input)
    assert.equal(result.steps[0].freq_a, 0.1, input)
    assert.equal(result.steps[0].freq_b, 10, input)
  }
  const result = parse('40/0.5 交流 Medium 0.5min')
  assert.equal(result.errors.length, 0)
  assert.equal(result.steps[0].freq_b, 0.5)
  assert.equal(result.steps[0].duration, 0.5)
  assert.equal(parse('40/10 交流 Medium .5min').steps[0].duration, 0.5)
})

test('multi-B values retain decimals and multiple A/B pairs retain their own A value', () => {
  const { parse } = parser()
  assert.deepEqual(parse('40/0.5, 10.2, 116 交流 Medium 4min').steps.map(s => [s.freq_a, s.freq_b]), [[40, 0.5], [40, 10.2], [40, 116]])
  assert.deepEqual(parse('40/116, 0.1/10 交流 Medium 4min').steps.map(s => [s.freq_a, s.freq_b]), [[40, 116], [0.1, 10]])
})

test('invalid frequencies and ambiguous durations cannot be silently executed', () => {
  const { parse, context, elements } = parser()
  for (const line of ['0/10 交流 Medium 4min', '-40/10 交流 Medium 4min', '9999/10 交流 Medium 4min', '40/10 交流 Medium 0min', '40/10 交流 Medium -2min', '40/10 交流 Medium 4-6min', '40/10 交流 Medium 61min', '40/0.01 交流 Medium 4min']) {
    const result = parse('40/116 交流 Medium 4min\n' + line)
    assert.ok(result.errors.length, line)
    context.renderImportPreview(result)
    assert.equal(elements.get('importLoad').disabled, true, line)
    assert.equal(elements.get('importSave').disabled, true, line)
  }
})

test('parser retains existing integer imports and labels missing default settings', () => {
  const { parse } = parser()
  const result = parse('Protocol: Example\n40/32, 26, 536\n91/77 交流 Gentle 2min')
  assert.equal(result.name, 'Example')
  assert.equal(result.errors.length, 0)
  assert.equal(result.steps.length, 4)
  assert.match(result.steps[0].warn, /預設/)
  assert.equal(result.steps[3].wave, 'Gentle')
})

test('malformed duration tokens or sibling pairs never become plausible partial values', () => {
  const { parse } = parser()
  for (const input of ['40/116 交流 Medium 1e2min', '40/116 交流 Medium 1.2.3min', '40/116, 40/abc 交流 Medium 4min', '40/116, 0.5.5 交流 Medium 4min', '40/116/10 交流 Medium 4min']) {
    assert.ok(parse(input).errors.length, input)
  }
})

test('import preview treats pasted names, notes and rejected rows as text', () => {
  const { context, elements, parse } = parser()
  const result = parse('40/116 交流 Medium 4min - <img src=x>\n99 invalid <b>')
  result.name = '<img src=x>'
  context.renderImportPreview(result)
  assert.doesNotMatch(elements.get('importPreview').innerHTML, /<img|<b>/)
  assert.match(elements.get('importPreview').innerHTML, /&lt;img/)
})

test('gain labels reflect the same factor used by the legacy audio engine', () => {
  const { context } = parser()
  assert.equal(context.formatAudioGain(200), '×1.20')
  assert.equal(context.formatAudioGain(100), '×0.60')
  assert.equal(context.formatAudioGain(500), '×3.00')
})

function recentLibrary() {
  const storage = new Map()
  const protocols = Array.from({ length: 10 }, (_, index) => ({ id: 'p' + index, name: 'Example ' + index }))
  const context = vm.createContext({
    auth: { user: { email: 'a@example.test' } }, PROTOCOLS_FULL: protocols, USER_PROTOCOLS: [],
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    $: () => null,
  })
  vm.runInContext(section('function recentProtocolStorageKey(', 'function renderProtocolList('), context)
  return { context, protocols, storage }
}

test('recent protocols are unique, bounded and isolated by account', () => {
  const { context, protocols } = recentLibrary()
  protocols.forEach(protocol => context.rememberRecentProtocol(protocol))
  context.rememberRecentProtocol(protocols[5])
  assert.deepEqual(plain(context.loadRecentProtocolIds()), ['p5', 'p9', 'p8', 'p7', 'p6', 'p4', 'p3', 'p2'])
  context.auth.user.email = 'b@example.test'
  assert.equal(context.getRecentProtocols().length, 0)
  context.auth.user = null
  assert.equal(context.getRecentProtocols().length, 0)
})

test('recent shortcuts resolve current library records and do not retain temporary or deleted protocols', () => {
  const { context, protocols, storage } = recentLibrary()
  context.rememberRecentProtocol({ id: 'temporary', name: 'Not in library' })
  assert.equal(storage.size, 0)
  context.rememberRecentProtocol({ id: 'group', recentProtocolIds: ['p0', 'p2'] })
  protocols[0].name = 'Updated example'
  assert.equal(context.getRecentProtocols()[0].name, 'Updated example')
  context.PROTOCOLS_FULL = protocols.filter(p => p.id !== 'p0')
  assert.deepEqual(plain(context.getRecentProtocols()).map(p => p.id), ['p2'])
  storage.set(context.recentProtocolStorageKey(), '{broken')
  assert.equal(context.getRecentProtocols().length, 0)
})
