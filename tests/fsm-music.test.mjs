import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const musicScript = html.slice(html.indexOf('const MUSIC_MAX_MINUTES ='), html.indexOf('// PROTECTED: INFO VIEW'))
const vendorRoot = new URL('../public/fsm/studio/vendor/lamejs-1.2.1/', import.meta.url)
const vendorScript = fs.readFileSync(new URL('lame.min.js', vendorRoot), 'utf8')
const fixtureProtocol = (id, frequency = 0.1) => ({ id, name: id, steps: [
  { freq_a: frequency, freq_b: 10, duration: 1, polarity: 'Alternating', wave: 'Gentle' },
] })

// Small DOM fixture for the music panel's real rendering and event bindings.
function harness({ protocols = [], encoderFailure = false, renderFailure = false } = {}) {
  const nodes = new Map()
  const downloaded = []
  const scripts = []
  const intervals = new Set()
  const revoked = []
  const pageListeners = new Map()
  let urlCount = 0
  let panelElements = []
  let offlineAllocations = 0
  const attrsFrom = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]))
  function node(attrs = {}, tag = '') {
    const classes = new Set((attrs.class || '').split(' '))
    const result = {
      attrs, tag, value: attrs.value || '', style: {}, disabled: false, textContent: '', events: {},
      classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) },
      getAttribute: key => attrs[key],
      removeAttribute(key) { delete attrs[key]; delete this[key] },
      addEventListener(event, callback) { this.events[event] = callback },
      fire(event, value = this.value) { this.value = value; return this.events[event]?.({ target: this }) },
      querySelectorAll: () => panelElements.filter(e => ['input', 'select', 'button'].includes(e.tag)),
      click() { downloaded.push(this.download) }, remove() { this.removed = true },
    }
    let markup = ''
    Object.defineProperty(result, 'innerHTML', {
      get: () => markup,
      set(value) {
        markup = value
        if (attrs.id === 'view-music') {
          panelElements = [...value.matchAll(/<(\w+)\b([^>]*)>/g)].map(m => node(attrsFrom(m[2]), m[1]))
          for (const element of panelElements) if (element.attrs.id) nodes.set(element.attrs.id, element)
          for (const select of value.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)) {
            nodes.get(attrsFrom(select[1]).id).innerHTML = select[2]
          }
        } else if (tag === 'select') {
          const options = [...value.matchAll(/<option\b([^>]*)>/g)]
          const chosen = options.find(m => /\bselected\b/.test(m[1])) || options[0]
          result.value = chosen ? attrsFrom(chosen[1]).value || '' : ''
        }
      },
    })
    return result
  }
  nodes.set('view-music', node({ id: 'view-music' }, 'div'))
  function query(selector) {
    const attr = selector.includes('data-msrc') ? 'data-msrc' : selector.includes('musicStyleGroup') ? 'data-style' : 'data-fmt'
    return panelElements.filter(el => el.attrs[attr] && (!selector.includes('.active') || el.classList.contains('active')))
  }
  const buffer = {
    numberOfChannels: 2, sampleRate: 44100, length: 4410,
    getChannelData: ch => Float32Array.from({ length: 4410 }, (_, i) => 0.2 * Math.sin(2 * Math.PI * (ch ? 220 : 440) * i / 44100)),
  }
  const context = vm.createContext({
    console: { ...console, error() {} }, Blob, setTimeout: (fn, ms) => { if (ms <= 50) queueMicrotask(fn); return 1 }, clearTimeout() {},
    setInterval: fn => { intervals.add(fn); return fn }, clearInterval: fn => intervals.delete(fn),
    state: { freqA: 0.1, freqB: 10, polarity: 'Positive', waveshape: 'Sharp' }, LANG: 'en',
    auth: { user: { email: 'fixture@example.test' } },
    FREQ_A_MAP: {}, FREQ_B_MAP: {}, PROTOCOLS_CURATED: [], PROTOCOLS_FULL: [], USER_PROTOCOLS: protocols,
    loadCustomProtocols: () => protocols,
    protocolHasVerifiedSettings: p => !!p?.steps?.length && p.steps.every(s => s.polarity && s.wave),
    normalizeStep: s => s, totalProtocolMinutes: p => p.steps.reduce((sum, s) => sum + s.duration, 0),
    isValidFrequency: v => Number.isFinite(v) && v >= 0.1 && v <= 999,
    isValidStepDuration: v => Number.isFinite(v) && v > 0 && v <= 60,
    escapeHtml: s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
    $: id => nodes.get(id), t: key => key,
    URL: { createObjectURL: () => 'blob:fixture-' + ++urlCount, revokeObjectURL: url => revoked.push(url) },
    document: {
      querySelectorAll: query, querySelector: selector => query(selector)[0],
      createElement: tag => node({}, tag), body: { appendChild() {}, removeChild() {} },
      head: { appendChild(script) {
        scripts.push(script)
        queueMicrotask(() => {
          if (encoderFailure) script.onerror()
          else { vm.runInContext(vendorScript, context); script.onload() }
        })
      } },
    },
    window: { addEventListener: (event, callback) => pageListeners.set(event, callback), OfflineAudioContext: class {
      constructor() { offlineAllocations++ }
      startRendering() { return renderFailure ? Promise.reject(new Error('render unavailable')) : Promise.resolve(buffer) }
    } },
  })
  vm.runInContext(musicScript, context)
  context.renderMusicView()
  return { context, nodes, downloaded, scripts, intervals, buffer, revoked, pageListeners,
    get offlineAllocations() { return offlineAllocations },
    musicState: vm.runInContext('musicState', context),
    click(attr, value) { panelElements.find(el => el.attrs[attr] === value).fire('click') },
  }
}

test('first render shows the same inherited frequency and waveform exported by manual source', () => {
  const h = harness()
  assert.equal(h.nodes.get('musicFreqAInput').value, '0.1')
  assert.equal(h.nodes.get('musicFreqBInput').value, '10')
  const settings = h.context.readMusicExportSettings()
  assert.equal(settings.segments[0].freqA, 0.1)
  assert.equal(settings.segments[0].freqB, 10)
  assert.equal(settings.segments[0].polarity, 'Positive')
  assert.equal(settings.segments[0].wave, 'Sharp')
})

test('revisits preserve manual frequencies, protocol choice, source and visible panel', () => {
  const h = harness({ protocols: [fixtureProtocol('one'), fixtureProtocol('two', 999)] })
  h.nodes.get('musicFreqAInput').fire('input', '0.2')
  h.nodes.get('musicProtocolSelect').fire('change', 'two')
  h.click('data-msrc', 'protocol')
  h.context.state.freqA = 40
  h.context.renderMusicView()
  assert.equal(h.nodes.get('musicFreqAInput').value, '0.2')
  assert.equal(h.nodes.get('musicProtocolSelect').value, 'two')
  assert.match(h.nodes.get('view-music').innerHTML, /id="musicManualSource" style="display:none"/)
  assert.match(h.nodes.get('view-music').innerHTML, /id="musicProtocolSource" style="display:"/)
  const settings = h.context.readMusicExportSettings()
  assert.equal(settings.source, 'protocol')
  assert.equal(settings.segments[0].freqA, 999)
})

test('cleared or out-of-range frequency is rejected instead of exporting stale state', () => {
  const h = harness()
  for (const value of ['', '0', '1000', 'Infinity']) {
    h.nodes.get('musicFreqAInput').fire('input', value)
    assert.equal(h.nodes.get('musicFreqAVal').textContent, '—')
    assert.throws(() => h.context.readMusicExportSettings(), /0.1 and 999/)
  }
})

test('50 minute limit is consistent in manual controls and protocol preflight', async () => {
  const p = fixtureProtocol('long')
  p.steps[0].duration = 51
  const h = harness({ protocols: [p] })
  assert.equal(h.nodes.get('musicDurSlider').attrs.max, '50')
  h.nodes.get('musicDurSlider').value = '50'
  assert.equal(h.context.readMusicExportSettings().totalSec, 3000)
  h.nodes.get('musicDurSlider').value = '51'
  assert.throws(() => h.context.readMusicExportSettings(), /1–50/)
  h.click('data-msrc', 'protocol')
  await assert.rejects(h.context.generateMusicFile(), /50-minute/)
  assert.equal(h.offlineAllocations, 0)
})

test('generation snapshots every visible setting before async loading and isolates protocol mutation', async () => {
  const p = fixtureProtocol('selected', 0.1)
  const h = harness({ protocols: [p] })
  h.click('data-msrc', 'protocol')
  h.click('data-fmt', 'mp3')
  const captures = []
  h.context.buildSegment = (_ctx, seg, start, end, level) => captures.push({ ...seg, start, end, level })
  h.context.buildBackground = (_ctx, style, totalSec, level) => captures.push({ style, totalSec, level })
  const generating = h.context.generateMusicFile()
  assert.equal(h.nodes.get('generateMusicBtn').disabled, true)
  h.musicState.format = 'wav'
  h.musicState.treatmentLevel = 1
  h.musicState.style = 'silent'
  h.musicState.bgLevel = 0
  p.name = 'mutated'
  p.steps[0].freq_a = 900
  h.nodes.get('musicTreatmentSlider').value = '100'
  h.context.renderMusicView()
  assert.equal(h.nodes.get('generateMusicBtn').disabled, true)
  await generating
  assert.equal(captures[0].freqA, 0.1)
  assert.equal(captures[0].level, 0.7)
  assert.deepEqual(captures[1], { style: 'ambient', totalSec: 60, level: 0.3 })
  assert.deepEqual(h.downloaded, ['FSM_selected.mp3'])
  assert.equal(h.nodes.get('generateMusicBtn').disabled, false)
  assert.equal(h.scripts[0].src, '/fsm/studio/vendor/lamejs-1.2.1/lame.min.js')
})

test('MP3 loader failure occurs before audio allocation and allows a retry', async () => {
  const h = harness({ encoderFailure: true })
  h.click('data-fmt', 'mp3')
  await assert.rejects(h.context.generateMusicFile(), /Retry or choose WAV/)
  assert.equal(h.offlineAllocations, 0)
  assert.equal(h.nodes.get('generateMusicBtn').disabled, false)
  await assert.rejects(h.context.generateMusicFile(), /Retry or choose WAV/)
  assert.equal(h.scripts.length, 2)
  assert.ok(h.scripts.every(s => s.removed))
})

test('render failure clears its progress monitor and restores controls', async () => {
  const h = harness({ renderFailure: true })
  h.context.buildSegment = () => {}
  h.context.buildBackground = () => {}
  await assert.rejects(h.context.generateMusicFile(), /render unavailable/)
  assert.equal(h.intervals.size, 0)
  assert.equal(h.nodes.get('generateMusicBtn').disabled, false)
})

test('vendored encoder is verified against official package checksums and encodes stereo MP3', async () => {
  const h = harness()
  const provenance = JSON.parse(fs.readFileSync(new URL('provenance.json', vendorRoot), 'utf8'))
  const archive = fs.readFileSync(new URL('lamejs-1.2.1-source.tgz', vendorRoot))
  assert.equal(createHash('sha256').update(vendorScript).digest('hex'), provenance.browserBundleSha256)
  assert.equal('sha512-' + createHash('sha512').update(archive).digest('base64'), provenance.npmIntegrity)
  vm.runInContext(vendorScript, h.context)
  const blob = h.context.encodeMP3(h.buffer, 192)
  const data = new Uint8Array(await blob.arrayBuffer())
  assert.equal(blob.type, 'audio/mpeg')
  assert.ok(data.length > 1000)
  assert.equal(data[0], 0xff)
  assert.equal(data[1] & 0xe0, 0xe0, 'output begins with an MPEG frame sync')
  assert.equal((data[2] >> 4) & 0xf, 11, 'MPEG-1 layer III bitrate is 192 kbps')
  assert.notEqual(data[3] >> 6, 3, 'output is stereo')
  assert.doesNotMatch(musicScript, /cdn\.jsdelivr\.net/)
})

test('completed file has a persistent clickable download link after revisiting music', async () => {
  const h = harness()
  h.context.buildSegment = () => {}
  h.context.buildBackground = () => {}
  await h.context.generateMusicFile()
  assert.equal(h.nodes.get('musicDownload').style.display, 'block')
  assert.equal(h.nodes.get('musicProgressTitle').textContent, 'music_ready')
  assert.equal(h.nodes.get('musicProgressStatus').textContent, 'music_progress_done')
  assert.equal(h.nodes.get('musicDownloadLink').textContent, 'FSM_0.1_10_20min.wav')
  assert.equal(h.nodes.get('musicDownloadLink').href, 'blob:fixture-1')
  assert.equal(h.nodes.get('musicDownloadLink').download, 'FSM_0.1_10_20min.wav')
  h.context.renderMusicView()
  assert.equal(h.nodes.get('musicDownloadLink').href, 'blob:fixture-1')
  h.nodes.get('musicDownloadLink').click()
  assert.deepEqual(h.downloaded, ['FSM_0.1_10_20min.wav', 'FSM_0.1_10_20min.wav'])
  assert.deepEqual(h.revoked, [])
})

test('failed export retains the last file, and successful replacement releases only the old URL', async () => {
  const h = harness()
  h.context.buildSegment = () => {}
  h.context.buildBackground = () => {}
  await h.context.generateMusicFile()
  h.nodes.get('musicFreqAInput').value = ''
  await h.nodes.get('generateMusicBtn').fire('click')
  assert.equal(h.nodes.get('musicProgressTitle').textContent, 'music_generate_failed')
  assert.equal(h.nodes.get('musicDownloadLink').href, 'blob:fixture-1')
  assert.deepEqual(h.revoked, [])
  h.nodes.get('musicFreqAInput').fire('input', '0.2')
  const retry = h.context.generateMusicFile()
  assert.equal(h.nodes.get('musicProgressTitle').textContent, 'music_generating')
  await retry
  assert.equal(h.nodes.get('musicProgressTitle').textContent, 'music_ready')
  assert.equal(h.nodes.get('musicDownloadLink').href, 'blob:fixture-2')
  assert.equal(h.nodes.get('musicDownloadLink').download, 'FSM_0.2_10_20min.wav')
  assert.deepEqual(h.revoked, ['blob:fixture-1'])
})

test('account changes and leaving the page revoke the file and remove the link', async () => {
  for (const event of ['account', 'pagehide']) {
    const h = harness()
    h.context.buildSegment = () => {}
    h.context.buildBackground = () => {}
    await h.context.generateMusicFile()
    if (event === 'account') {
      h.context.auth.user = { email: 'other@example.test' }
      h.context.syncMusicDownload()
    } else h.pageListeners.get('pagehide')()
    assert.deepEqual(h.revoked, ['blob:fixture-1'])
    assert.equal(h.nodes.get('musicDownload').style.display, 'none')
    assert.equal(h.nodes.get('musicDownloadLink').href, undefined)
    assert.equal(h.nodes.get('musicDownloadLink').textContent, '')
    h.context.renderMusicView()
    assert.equal(h.nodes.get('musicDownloadLink').href, undefined)
  }
  assert.match(html, /function updateAuthUI\(\) \{\s+syncMusicDownload\(\);/)
})

test('an export finishing after account change or pagehide cannot publish its download', async () => {
  for (const event of ['account', 'pagehide']) {
    const h = harness()
    h.context.buildSegment = () => {}
    h.context.buildBackground = () => {}
    const generating = h.context.generateMusicFile()
    if (event === 'account') h.context.auth.user = { email: 'other@example.test' }
    else h.pageListeners.get('pagehide')()
    await generating
    assert.deepEqual(h.downloaded, [])
    assert.equal(h.nodes.get('musicDownloadLink').href, undefined)
  }
})
