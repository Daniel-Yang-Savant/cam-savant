import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const extract = name => {
  const marker = `${name === 'loadProtectedData' ? 'async ' : ''}function ${name}(`
  const start = html.indexOf(marker)
  assert.ok(start >= 0, `${name} must exist`)
  return html.slice(start, html.indexOf('\n}', start) + 2)
}
const libraryStart = html.indexOf('function frequencyLibraryEntries(')
const libraryEnd = html.indexOf('// PROTECTED: RECORDS VIEW', libraryStart)
const librarySource = html.slice(libraryStart, libraryEnd)
const escapeSource = html.match(/function escapeHtml\(s\) \{[^\n]+\}/)[0]
const groupPayload = {
  chakra: {
    title_zh: '脈輪', title_en: 'Chakras', note_zh: '圖片對照；官方差異待核對。', note_en: 'Photo mapping; comparison pending.',
    entries: [
      { id: 'root', freq: 396, name: 'Root chakra', name_zh: '海底輪', aliases: ['根輪'], source_label: '圖片來源', source_url: 'https://example.invalid/photo' },
      { id: 'solar', freq: 528, name: 'Solar plexus chakra', name_zh: '太陽神經叢脈輪', note_zh: '此值來自圖片，非 FSM 組織頻率。' },
    ],
  },
  solfeggio: {
    title_zh: 'Solfeggio', title_en: 'Solfeggio', note_zh: '獨立頻率表。', note_en: 'Separate reference list.',
    entries: [{ id: 'solfeggio_396', freq: 396, name: 'Solfeggio 396', name_zh: 'Solfeggio 恐懼主題' }],
  },
  energy_pairs: {
    title_zh: '能量配對', title_en: 'Energy pairs', note_zh: '使用者提供的配對與名稱。', note_en: 'User-provided pairs and labels.',
    entries: [
      { id: 'user_family_karma_550_687', freq_a: 550, freq_b: 687, name: 'Family karma', name_zh: '家族業力', aliases: ['家族'], source_label: '使用者提供' },
      { id: 'user_clear_illness_energy_6_2_74', freq_a: 6.2, freq_b: 74, name: 'Clearing illness energy', name_zh: '排除病氣', aliases: ['病氣'], source_label: '使用者提供' },
    ],
  },
}

function harness({ groups = groupPayload, lang = 'zh', authenticated = true } = {}) {
  const nodes = new Map(), views = []
  let updates = 0
  function node(attributes = {}) {
    const classes = new Set((attributes.class || '').split(/\s+/))
    let markup = '', children = null
    return {
      value: '', hidden: false, textContent: '', events: {}, style: {},
      get innerHTML() { return markup },
      set innerHTML(value) { markup = value; children = null },
      getAttribute: name => attributes[name],
      classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
      addEventListener(event, callback) { this.events[event] = callback },
      fire(event, payload) { return this.events[event]?.(payload) },
      remove() {},
      querySelectorAll(selector) {
        if (!children) children = [...markup.matchAll(/<[a-z][a-z0-9]*\b([^>]*)>/gi)].map(match => {
          const attrs = Object.fromEntries([...match[1].matchAll(/([a-z][a-z0-9-]*)="([^"]*)"/gi)].map(m => [m[1], m[2]]))
          return node(attrs)
        })
        const className = selector.match(/^\.([a-z-]+)/)?.[1]
        const attribute = selector.match(/\[([a-z-]+)\]/)?.[1]
        return children.filter(child => (!className || child.classList.contains(className)) && (!attribute || child.getAttribute(attribute) !== undefined))
      },
    }
  }
  const get = id => {
    if (!nodes.has(id)) nodes.set(id, node())
    return nodes.get(id)
  }
  const context = vm.createContext({
    LANG: lang, FREQUENCY_GROUPS: groups,
    CHANNEL_A: [{ freq: 40, name: 'Inflammation' }], CHANNEL_B: [{ freq: 396, name: 'Nerves' }],
    FREQ_A_MAP: { 40: 'Inflammation' }, FREQ_B_MAP: { 396: 'Nerves' },
    FREQ_ZH_A: { 40: '發炎' }, FREQ_ZH_B: { 396: '神經' },
    state: { freqA: 40, freqB: 116, running: false },
    auth: { user: authenticated ? { email: 'member@example.invalid' } : null, isAuthed() { return !!this.user } },
    $: get, t: () => '搜尋頻率',
    isValidFrequency: value => Number.isFinite(Number(value)) && Number(value) >= 0.1 && Number(value) <= 999,
    updateFreqDisplay() { updates++ }, switchToView(view) { views.push(view) },
    showPairDrawer() {},
    startRun() { throw new Error('A library selection must not start playback') },
  })
  vm.runInContext(librarySource + '\n' + escapeSource, context)
  return { context, get, views, get updates() { return updates }, run: source => vm.runInContext(source, context) }
}

test('overlapping Hz values retain independent clinical, chakra and Solfeggio names', () => {
  const app = harness()
  assert.equal(app.run('frequencyLibraryEntries("B")[0].name'), 'Nerves')
  assert.equal(app.run('frequencyLibraryEntries("chakra")[0].name'), 'Root chakra')
  assert.equal(app.run('frequencyLibraryEntries("solfeggio")[0].name'), 'Solfeggio 396')
  assert.equal(app.run('FREQ_B_MAP[396]'), 'Nerves')
  assert.equal(app.run('frequencyLibraryMatches(frequencyLibraryEntries("B")[0], "神經", "B")'), true)
  assert.equal(app.run('frequencyLibraryMatches(frequencyLibraryEntries("chakra")[0], "海底輪", "chakra")'), true)
  assert.equal(app.run('frequencyLibraryMatches(frequencyLibraryEntries("chakra")[0], "根輪", "chakra")'), true)
  assert.equal(app.run('frequencyLibraryMatches(frequencyLibraryEntries("chakra")[0], "神經", "chakra")'), false)
})

test('reference tabs expose source differences, Chinese search and explicit channel controls', () => {
  const app = harness()
  app.context.renderLibraryView()
  const tabs = app.get('view-library').querySelectorAll('.libtab')
  assert.deepEqual(tabs.map(tab => tab.getAttribute('data-libtab')), ['A', 'B', 'chakra', 'solfeggio', 'energy_pairs'])
  tabs.find(tab => tab.getAttribute('data-libtab') === 'chakra').fire('click')
  assert.equal(app.get('libraryGroupNote').textContent, groupPayload.chakra.note_zh)
  assert.equal(app.get('libCatChips').hidden, true)
  assert.match(app.get('libraryList').innerHTML, /396<small> Hz/)
  assert.match(app.get('libraryList').innerHTML, /圖片來源/)
  assert.match(app.get('libraryList').innerHTML, /此值來自圖片，非 FSM 組織頻率/)
  app.get('librarySearch').value = '太陽'
  app.get('librarySearch').fire('input', { target: { value: '太陽' } })
  assert.match(app.get('libraryList').innerHTML, /Solar plexus chakra/)
  assert.doesNotMatch(app.get('libraryList').innerHTML, /Root chakra/)
  const buttons = app.get('libraryList').querySelectorAll('.library-use-frequency')
  assert.equal(buttons.length, 2)
  assert.equal(app.run('state.freqA'), 40, 'search does not apply a frequency')
  buttons.find(button => button.getAttribute('data-channel') === 'B').fire('click')
  assert.equal(app.run('state.freqA'), 40)
  assert.equal(app.run('state.freqB'), 528)
  assert.equal(app.run('state.running'), false)
  assert.deepEqual(app.views, ['manual'])
  assert.equal(app.updates, 1)
})

test('selecting A preserves B, validates values and does not permit guest changes', () => {
  const app = harness()
  assert.equal(app.context.selectLibraryFrequency(396, 'A'), true)
  assert.equal(app.run('state.freqA'), 396)
  assert.equal(app.run('state.freqB'), 116)
  for (const [value, channel] of [[0, 'A'], [1000, 'B'], [NaN, 'A'], [528, 'C']]) {
    assert.equal(app.context.selectLibraryFrequency(value, channel), false)
  }
  assert.equal(app.updates, 1)
  const guest = harness({ authenticated: false })
  assert.equal(guest.context.selectLibraryFrequency(528, 'A'), false)
  assert.equal(guest.run('state.freqA'), 40)
})

test('reference descriptions and source URLs cannot inject executable markup', () => {
  const app = harness()
  const rendered = app.context.librarySourceMarkup({ source_label: '<img onerror=alert(1)>', source_url: 'javascript:alert(1)' })
  assert.doesNotMatch(rendered, /href|<img/)
  assert.match(rendered, /&lt;img/)
  const link = app.context.librarySourceMarkup({ source_label: 'Source', source_url: 'https://example.invalid/?q="x"' })
  assert.match(link, /rel="noopener noreferrer"/)
  assert.match(link, /&quot;x&quot;/)
})

test('new groups load only with protected data and clear when membership is lost', async () => {
  const app = harness({ groups: null })
  Object.assign(app.context, {
    protectedDataRequest: null, PROTOCOLS_CURATED: null, PROTOCOLS_FULL: null,
    personalSync: { epoch: 0 }, USER_PROTOCOLS: [], FAVORITE_PROTOCOL_IDS: new Set(),
    fsmFetch: async () => ({ ok: true, json: async () => ({ data: {
      channel_a: [{ freq: 40, name: 'Inflammation' }], channel_b: [{ freq: 396, name: 'Nerves' }],
      curated: [], full: [], frequency_groups: groupPayload,
    } }) }),
  })
  vm.runInContext(extract('loadProtectedData') + '\n' + extract('resetPersonalProtocolState'), app.context)
  assert.equal(await app.context.loadProtectedData(), true)
  assert.equal(app.run('FREQUENCY_GROUPS.chakra.entries[0].name'), 'Root chakra')
  assert.equal(app.run('FREQ_B_MAP[396]'), 'Nerves')
  app.context.auth.user = null
  app.context.resetPersonalProtocolState()
  assert.equal(app.run('FREQUENCY_GROUPS'), null)
  assert.equal(await app.context.loadProtectedData(), false)
})

test('missing protocol timing stays visible as pending and is not eligible for execution or music', () => {
  const app = harness()
  vm.runInContext(['totalProtocolMinutes', 'normalizeStep', 'stepDurationLabel', 'protocolDurationLabel', 'protocolHasVerifiedSettings'].map(extract).join('\n'), app.context)
  const complete = { steps: [{ freq_a: 40, freq_b: 84, duration: 2, polarity: 'Alternating', wave: 'Medium' }] }
  assert.equal(app.context.protocolHasVerifiedSettings(complete), true)
  assert.equal(app.context.protocolDurationLabel(complete), '2 min')
  for (const duration of [null, undefined, 0, -1, 61, 'not-a-duration']) {
    const pending = { steps: [{ ...complete.steps[0], duration }] }
    assert.equal(app.context.protocolHasVerifiedSettings(pending), false)
    assert.equal(app.context.protocolDurationLabel(pending), '時間待設定')
    assert.equal(app.context.stepDurationLabel(pending.steps[0]), '時間待設定')
  }
  app.context.LANG = 'en'
  assert.equal(app.context.protocolDurationLabel({ steps: [{ ...complete.steps[0], duration: null }] }), 'Time not set')
})

test('copying a source with missing settings keeps blank fields instead of adopting defaults', () => {
  const app = harness()
  const rows = []
  Object.assign(app.context, {
    personalSync: { saving: false },
    document: { createElement() {
      return { className: '', innerHTML: '', querySelector() { return { addEventListener() {} } } }
    } },
    updateCpStepNums() {},
  })
  app.get('cpStepsList').appendChild = row => rows.push(row)
  vm.runInContext(extract('addCpStepRow'), app.context)
  app.context.addCpStepRow({ freq_a: 40, freq_b: 84, duration: null, polarity: null, wave: null })
  assert.match(rows[0].innerHTML, /cp-dur[^>]+value=""/)
  assert.match(rows[0].innerHTML, /option value="" selected>極性\?/)
  assert.match(rows[0].innerHTML, /option value="" selected>波形\?/)
  app.context.addCpStepRow()
  assert.match(rows[1].innerHTML, /cp-dur[^>]+value="4"/, 'new authored steps retain the existing four-minute default')
  assert.match(rows[1].innerHTML, /option value="Alternating" selected/)
  assert.match(rows[1].innerHTML, /option value="Medium" selected/)

  const copied = []
  Object.assign(app.context, {
    USER_PROTOCOLS: [], ensurePersonalProtocolsReady: () => true, renderPersonalSyncStatus() {},
    addCpStepRow: row => copied.push(row),
  })
  vm.runInContext(['totalProtocolMinutes', 'normalizeStep', 'protocolHasVerifiedSettings', 'showCustomProtocolEditor'].map(extract).join('\n'), app.context)
  app.context.showCustomProtocolEditor({ id: 'course-reference', name_zh: '課程參考', steps: [{ freq_a: 40, freq_b: 84, duration: null, polarity: null, wave: null }] }, 'copy')
  assert.equal(copied[0].duration, null)
  assert.equal(copied[0].polarity, null)
  assert.equal(copied[0].wave, null)
  assert.match(app.get('cpSourceWarning').textContent, /確認頻率、時間、極性與波形/)
  assert.doesNotMatch(app.get('cpSourceWarning').textContent, /極性已確認/)
})

test('incomplete source protocol modal hides execution and never claims source settings are verified', () => {
  const app = harness()
  let starts = 0
  Object.assign(app.context, {
    getProtocolName: p => p.name, exportProtocolPDF() {},
    startStep() { starts++ }, rememberRecentProtocol() {}, renderProtocolList() {},
    t: key => key === 'modal_load_body' ? '{n} steps · {t}' : key,
  })
  vm.runInContext(['normalizeStep', 'totalProtocolMinutes', 'protocolDurationLabel', 'protocolHasVerifiedSettings', 'protocolSettingsPendingMessage', 'askLoadProtocol'].map(extract).join('\n'), app.context)
  const complete = { name: 'Complete', steps: [{ freq_a: 40, freq_b: 84, duration: 2, polarity: 'Alternating', wave: 'Medium' }] }
  app.context.askLoadProtocol(complete)
  assert.equal(app.get('modalConfirm').style.display, '')
  assert.equal(typeof app.get('modalConfirm').onclick, 'function')
  const pending = { name: 'Pending', steps: [{ freq_a: 40, freq_b: 84, duration: null, polarity: null, wave: null }] }
  app.context.askLoadProtocol(pending)
  assert.equal(app.get('modalConfirm').style.display, 'none')
  assert.equal(app.get('modalConfirm').onclick, null, 'an earlier valid confirmation handler is removed')
  assert.match(app.get('modalBody').innerHTML, /頻率、時間、極性或波形/)
  assert.doesNotMatch(app.get('modalBody').innerHTML, /已核對|已確認/)
  assert.equal(starts, 0)
  app.context.LANG = 'en'
  app.context.askLoadProtocol(pending)
  assert.match(app.get('modalBody').innerHTML, /missing or invalid frequencies, durations, polarity or waveform/)
  assert.equal(app.get('modalConfirm').onclick, null)
})

test('protocol PDF source preserves pending duration and settings without inventing polarity', () => {
  const app = harness()
  Object.assign(app.context, {
    getProtocolName: p => p.name, getProtocolIndication: () => '', pdfStyle: () => '', t: key => key,
  })
  vm.runInContext(['normalizeStep', 'totalProtocolMinutes', 'stepDurationLabel', 'protocolDurationLabel', 'protocolHasVerifiedSettings', 'protocolSettingsPendingMessage', 'generateProtocolHTML'].map(extract).join('\n'), app.context)
  const pending = { name: 'Pending', steps: [{ freq_a: 40, freq_b: 84, duration: null, polarity: null, wave: null }] }
  const zh = app.context.generateProtocolHTML(pending)
  assert.match(zh, /總時長:<\/span> 時間待設定/)
  assert.match(zh, /<td>待設定<\/td><td>待設定<\/td><td>時間待設定<\/td>/)
  assert.doesNotMatch(zh, /null|0 min|\+\/-|已核對|已確認/)
  app.context.LANG = 'en'
  const en = app.context.generateProtocolHTML(pending)
  assert.match(en, /Total duration:<\/span> Time not set/)
  assert.match(en, /<td>Not set<\/td><td>Not set<\/td><td>Time not set<\/td>/)
  const partial = app.context.generateProtocolHTML({ name: 'Positive only', steps: [{ ...pending.steps[0], polarity: 'Positive' }] })
  assert.match(partial, /<td>\+→<\/td><td>Not set<\/td>/)
  assert.doesNotMatch(partial, /\+\/-/)
})


test('energy pair tab shows named Hz pairs and applies both channels only after an explicit click', () => {
  const app = harness()
  app.context.renderLibraryView()
  const pairTab = app.get('view-library').querySelectorAll('.libtab').find(tab => tab.getAttribute('data-libtab') === 'energy_pairs')
  assert.ok(pairTab)
  pairTab.fire('click')
  assert.equal(app.get('libraryGroupNote').textContent, groupPayload.energy_pairs.note_zh)
  assert.equal(app.get('libCatChips').hidden, true)
  const markup = app.get('libraryList').innerHTML
  const text = markup.replace(/<[^>]*>/g, ' ')
  assert.match(text, /550\s*\/\s*687\s*Hz/)
  assert.match(text, /6\.2\s*\/\s*74\s*Hz/)
  assert.match(text, /家族業力/)
  assert.match(text, /排除病氣/)
  assert.match(text, /使用者提供/)
  assert.equal(app.get('libraryList').querySelectorAll('.library-use-frequency').length, 0, 'a paired row never offers independent A/B controls')
  const buttons = app.get('libraryList').querySelectorAll('.library-use-pair')
  assert.equal(buttons.length, 2)
  assert.equal(app.run('state.freqA'), 40)
  assert.equal(app.run('state.freqB'), 116)
  assert.equal(app.updates, 0)
  for (const entry of groupPayload.energy_pairs.entries) {
    const button = buttons.find(item => item.getAttribute('data-entry-id') === entry.id)
    assert.equal(button.getAttribute('data-group'), 'energy_pairs')
    button.fire('click')
    assert.equal(app.run('state.freqA'), entry.freq_a)
    assert.equal(app.run('state.freqB'), entry.freq_b)
    assert.equal(app.run('state.running'), false, 'selecting a pair does not start playback')
  }
  assert.equal(app.updates, 2)
  assert.deepEqual(app.views, ['manual', 'manual'])
  assert.equal(app.run('FREQ_B_MAP[396]'), 'Nerves', 'pair selection does not change clinical labels')
})

test('pair search matches either channel, spaced pair text, Chinese names and aliases', () => {
  const app = harness()
  const [family, clearing] = groupPayload.energy_pairs.entries
  for (const query of ['550', '687', '550/687', '550 / 687', '家族業力', '家族', 'Family karma']) {
    assert.equal(app.context.frequencyLibraryMatches(family, query, 'energy_pairs'), true, query)
  }
  for (const query of ['6.2', '74', '6.2/74', '6.2 / 74', '排除病氣', '病氣']) {
    assert.equal(app.context.frequencyLibraryMatches(clearing, query, 'energy_pairs'), true, query)
  }
  assert.equal(app.context.frequencyLibraryMatches(clearing, '687', 'energy_pairs'), false)
  assert.equal(app.context.frequencyLibraryMatches(family, '排除病氣', 'energy_pairs'), false)
  app.context.renderLibraryView()
  app.get('view-library').querySelectorAll('.libtab').find(tab => tab.getAttribute('data-libtab') === 'energy_pairs').fire('click')
  app.get('librarySearch').fire('input', { target: { value: '74' } })
  assert.match(app.get('libraryList').innerHTML, /排除病氣/)
  assert.doesNotMatch(app.get('libraryList').innerHTML, /家族業力/)
})

test('pair selection rejects unknown, invalid and guest data before changing either channel', () => {
  const invalidEntries = [
    { id: 'invalid_b', freq_a: 550, freq_b: NaN },
    { id: 'invalid_a', freq_a: 0, freq_b: 74 },
    { id: 'over_limit', freq_a: 6.2, freq_b: 1000 },
    { id: 'missing_b', freq_a: 550 },
  ]
  const app = harness({ groups: { ...groupPayload, energy_pairs: { ...groupPayload.energy_pairs, entries: invalidEntries } } })
  for (const entry of invalidEntries) {
    assert.equal(app.context.selectLibraryFrequencyPair('energy_pairs', entry.id), false)
    assert.equal(app.run('state.freqA'), 40, entry.id)
    assert.equal(app.run('state.freqB'), 116, entry.id)
  }
  assert.equal(app.context.selectLibraryFrequencyPair('energy_pairs', 'unknown'), false)
  assert.equal(app.context.selectLibraryFrequencyPair('unknown_group', 'user_family_karma_550_687'), false)
  assert.equal(app.context.selectLibraryFrequencyPair('chakra', 'root'), false)
  assert.equal(app.updates, 0)
  assert.deepEqual(app.views, [])
  const guest = harness({ authenticated: false })
  assert.equal(guest.context.selectLibraryFrequencyPair('energy_pairs', 'user_family_karma_550_687'), false)
  assert.equal(guest.run('state.freqA'), 40)
  assert.equal(guest.run('state.freqB'), 116)
  assert.equal(guest.updates, 0)
})

test('repository energy pair data preserves both user names and the decimal frequency', () => {
  const groups = JSON.parse(fs.readFileSync(new URL('../data/fsm/frequency-groups.json', import.meta.url), 'utf8'))
  assert.equal(groups.energy_pairs.title_zh, '能量配對')
  assert.deepEqual(groups.energy_pairs.entries.map(entry => [entry.id, entry.freq_a, entry.freq_b, entry.name_zh]), [
    ['user_family_karma_550_687', 550, 687, '家族業力'],
    ['user_clear_illness_energy_6_2_74', 6.2, 74, '排除病氣'],
  ])
})
