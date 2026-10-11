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
function harness({ protocols = [], encoderFailure = false, renderFailure = false, renderPromise = null, resumePromise = null, outputMode = 'listening' } = {}) {
  const nodes = new Map()
  const downloaded = []
  const scripts = []
  const intervals = new Set()
  const revoked = []
  const pageListeners = new Map()
  let urlCount = 0
  let panelElements = []
  let offlineAllocations = 0
  const offlineFrames = []
  const liveContexts = []
  let stoppedRuns = 0
  const attrsFrom = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]))
  function node(attrs = {}, tag = '') {
    const classes = new Set((attrs.class || '').split(' '))
    const result = {
      attrs, tag, value: attrs.value || '', style: {}, disabled: false, textContent: '', events: {},
      classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) },
      getAttribute: key => attrs[key],
      setAttribute: (key, value) => { attrs[key] = value },
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
    state: { freqA: 0.1, freqB: 10, polarity: 'Positive', waveshape: 'Sharp', outputMode }, LANG: 'en',
    auth: { user: { email: 'fixture@example.test' } },
    FREQ_A_MAP: {}, FREQ_B_MAP: {}, PROTOCOLS_CURATED: [], PROTOCOLS_FULL: [], USER_PROTOCOLS: protocols,
    loadCustomProtocols: () => protocols,
    protocolHasVerifiedSettings: p => !!p?.steps?.length && p.steps.every(s => s.polarity && s.wave),
    normalizeStep: s => s, totalProtocolMinutes: p => p.steps.reduce((sum, s) => sum + s.duration, 0),
    isValidFrequency: v => Number.isFinite(v) && v >= 0.1 && v <= 999,
    isValidStepDuration: v => Number.isFinite(v) && v > 0 && v <= 60,
    escapeHtml: s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
    $: id => nodes.get(id), t: key => key,
    stopRun: () => { stoppedRuns++ },
    URL: { createObjectURL: () => 'blob:fixture-' + ++urlCount, revokeObjectURL: url => revoked.push(url) },
    document: {
      hidden: false,
      addEventListener: (event, callback) => pageListeners.set(event, callback),
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
    window: {
      addEventListener: (event, callback) => pageListeners.set(event, callback),
      AudioContext: class {
        state = 'running'
        sources = []
        listeners = new Map()
        destination = {}
        constructor() { liveContexts.push(this) }
        addEventListener(event, callback) { this.listeners.set(event, callback) }
        changeState(state) { this.state = state; this.listeners.get('statechange')?.() }
        resume() { return resumePromise || Promise.resolve() }
        close() { this.state = 'closed'; return Promise.resolve() }
        createBufferSource() {
          const source = { starts: 0, stops: 0, disconnected: false,
            connect() {}, disconnect() { this.disconnected = true },
            start() { this.starts++ }, stop() { this.stops++ },
          }
          this.sources.push(source)
          return source
        }
      },
      OfflineAudioContext: class {
        constructor(_channels, frames) { offlineAllocations++; offlineFrames.push(frames) }
        startRendering() { return renderPromise || (renderFailure ? Promise.reject(new Error('render unavailable')) : Promise.resolve(buffer)) }
      },
    },
  })
  vm.runInContext(musicScript, context)
  context.renderMusicView()
  return { context, nodes, downloaded, scripts, intervals, buffer, revoked, pageListeners, liveContexts, offlineFrames,
    get offlineAllocations() { return offlineAllocations },
    get stoppedRuns() { return stoppedRuns },
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
  assert.equal(captures[0].level, 0.2)
  assert.deepEqual(captures[1], { style: 'ambient', totalSec: 60, level: 0.6 })
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
  assert.equal(h.nodes.get('musicDownloadLink').textContent, 'FSM_0.1_10_10min.wav')
  assert.equal(h.nodes.get('musicDownloadLink').href, 'blob:fixture-1')
  assert.equal(h.nodes.get('musicDownloadLink').download, 'FSM_0.1_10_10min.wav')
  h.context.renderMusicView()
  assert.equal(h.nodes.get('musicDownloadLink').href, 'blob:fixture-1')
  h.nodes.get('musicDownloadLink').click()
  assert.deepEqual(h.downloaded, ['FSM_0.1_10_10min.wav', 'FSM_0.1_10_10min.wav'])
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
  assert.equal(h.nodes.get('musicDownloadLink').download, 'FSM_0.2_10_10min.wav')
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

test('signal level reaches zero and remains zero in an exported settings snapshot', () => {
  const h = harness()
  assert.equal(h.nodes.get('musicTreatmentSlider').attrs.min, '0')
  h.nodes.get('musicTreatmentSlider').fire('input', '0')
  assert.equal(h.context.readMusicExportSettings().treatmentLevel, 0)
  h.context.renderMusicView()
  assert.equal(h.nodes.get('musicTreatmentSlider').value, '0')
})

test('signal-only style temporarily mutes background without erasing its mix level', () => {
  const h = harness()
  h.nodes.get('musicBgSlider').fire('input', '45')
  h.click('data-style', 'silent')
  assert.equal(h.nodes.get('musicBgSlider').disabled, true)
  const rendered = []
  h.context.buildSegment = () => {}
  h.context.buildBackground = () => rendered.push('background')
  h.context.scheduleMusicMix({}, h.context.readMusicExportSettings(), 20)
  assert.equal(rendered.length, 0)
  h.click('data-style', 'ambient')
  assert.equal(h.nodes.get('musicBgSlider').disabled, false)
  assert.equal(h.context.readMusicExportSettings().bgLevel, 0.45)
  h.context.scheduleMusicMix({}, h.context.readMusicExportSettings(), 20)
  assert.equal(rendered.length, 1)
})

test('preview uses the visible mix for 20 seconds, stops a live run and never loads an encoder', async () => {
  const h = harness()
  h.click('data-fmt', 'mp3')
  const captures = []
  h.context.buildSegment = (_ctx, seg, start, end, level) => captures.push({ ...seg, start, end, level })
  h.context.buildBackground = (_ctx, style, totalSec, level) => captures.push({ style, totalSec, level })
  await h.context.previewMusicMix()
  assert.equal(h.stoppedRuns, 1)
  assert.deepEqual(h.offlineFrames, [20 * 44100])
  assert.equal(captures[0].end, 20)
  assert.equal(captures[0].level, 0.2)
  assert.deepEqual(captures[1], { style: 'ambient', totalSec: 20, level: 0.6 })
  assert.equal(h.scripts.length, 0)
  assert.equal(h.downloaded.length, 0)
  assert.equal(h.liveContexts[0].sources[0].starts, 1)
  assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'true')
  await h.context.previewMusicMix()
  assert.equal(h.liveContexts[0].state, 'closed')
  assert.equal(h.liveContexts[0].sources[0].stops, 1)
  assert.equal(h.liveContexts[0].sources[0].disconnected, true)
  assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'false')
})

test('pad mode disables preview and direct calls cannot allocate live or offline audio', async () => {
  const h = harness({ outputMode: 'icare' })
  assert.equal(h.nodes.get('previewMusicBtn').disabled, true)
  assert.match(h.nodes.get('previewMusicBtn').textContent, /unavailable in pad mode/)
  assert.match(h.nodes.get('musicPreviewStatus').textContent, /Disconnect the pad and select Listen/)
  await h.context.previewMusicMix()
  // Force the event callback too: disabling the UI must not be the only guard.
  await h.nodes.get('previewMusicBtn').fire('click')
  assert.equal(h.liveContexts.length, 0)
  assert.equal(h.offlineAllocations, 0)
  assert.equal(h.stoppedRuns, 0, 'a rejected preview must not disturb a pad run')
  assert.equal(h.downloaded.length, 0)
})

test('switching from pad to listening mode restores preview only after explicit action', async () => {
  const h = harness({ outputMode: 'icare' })
  h.context.buildSegment = () => {}
  h.context.buildBackground = () => {}
  h.context.state.outputMode = 'listening'
  h.context.syncMusicPreviewUI()
  assert.equal(h.nodes.get('previewMusicBtn').disabled, false)
  assert.equal(h.liveContexts.length, 0, 'changing mode must not autoplay')
  await h.nodes.get('previewMusicBtn').fire('click')
  assert.equal(h.liveContexts.length, 1)
  assert.equal(h.liveContexts[0].sources[0].starts, 1)
  h.context.stopMusicPreview()
})

test('pad mode still permits a listening-file export without making preview available', async () => {
  const h = harness({ outputMode: 'icare' })
  const mix = []
  h.context.buildSegment = (_ctx, seg, start, end, level) => mix.push({ ...seg, start, end, level })
  h.context.buildBackground = (_ctx, style, totalSec, level) => mix.push({ style, totalSec, level })
  assert.equal(h.nodes.get('generateMusicBtn').disabled, false)
  assert.match(h.nodes.get('musicPreviewStatus').textContent, /Music exports are for listening/)
  await h.context.generateMusicFile()
  assert.equal(h.liveContexts.length, 0)
  assert.equal(h.offlineAllocations, 1)
  assert.deepEqual(h.downloaded, ['FSM_0.1_10_10min.wav'])
  assert.equal(mix[0].level, 0.2)
  assert.deepEqual(mix[1], { style: 'ambient', totalSec: 600, level: 0.6 })
  assert.equal(h.nodes.get('generateMusicBtn').disabled, false)
  assert.equal(h.nodes.get('previewMusicBtn').disabled, true)
  await h.context.previewMusicMix()
  assert.equal(h.liveContexts.length, 0)
  assert.equal(h.offlineAllocations, 1)
})

test('running and paused pad sessions block music export before allocating audio, and stopping permits it', async () => {
  for (const paused of [false, true]) {
    const h = harness({ outputMode: 'icare' })
    h.context.state.running = true
    h.context.state.paused = paused
    h.context.buildSegment = () => {}
    h.context.buildBackground = () => {}
    h.click('data-fmt', 'mp3')
    await assert.rejects(h.context.generateMusicFile(), /Stop the pad session before exporting music/)
    assert.equal(h.offlineAllocations, 0, `paused=${paused}`)
    assert.equal(h.liveContexts.length, 0, `paused=${paused}`)
    assert.equal(h.scripts.length, 0, 'blocked export must not begin encoder preparation')
    assert.equal(h.downloaded.length, 0)
    assert.equal(h.stoppedRuns, 0, 'export must not stop or change the pad session')
    assert.equal(h.context.state.running, true)
    assert.equal(h.context.state.paused, paused)
    assert.equal(h.nodes.get('generateMusicBtn').disabled, false)
    h.context.state.running = false
    h.context.state.paused = false
    await h.context.generateMusicFile()
    assert.equal(h.offlineAllocations, 1)
    assert.equal(h.liveContexts.length, 0)
    assert.deepEqual(h.downloaded, ['FSM_0.1_10_10min.mp3'])
    assert.equal(h.nodes.get('previewMusicBtn').disabled, true)
  }
})

test('export in progress disables preview even when its UI is resynchronized in listening mode', async () => {
  let release
  const renderPromise = new Promise(resolve => { release = resolve })
  const h = harness({ renderPromise })
  h.context.buildSegment = () => {}
  h.context.buildBackground = () => {}
  const exporting = h.context.generateMusicFile()
  await Promise.resolve()
  h.context.syncMusicPreviewUI()
  assert.equal(h.nodes.get('previewMusicBtn').disabled, true)
  await h.context.previewMusicMix()
  assert.equal(h.liveContexts.length, 0)
  assert.equal(h.offlineAllocations, 1, 'only the full export allocates audio')
  release(h.buffer)
  await exporting
  assert.equal(h.nodes.get('previewMusicBtn').disabled, false)
})

test('cancel during resume or offline rendering cannot start audio after cancellation', async () => {
  for (const phase of ['resume', 'render']) {
    let release
    const deferred = new Promise(resolve => { release = resolve })
    const h = harness(phase === 'resume' ? { resumePromise: deferred } : { renderPromise: deferred })
    h.context.buildSegment = () => {}
    h.context.buildBackground = () => {}
    const previewing = h.context.previewMusicMix()
    await Promise.resolve()
    h.context.stopMusicPreview()
    release(h.buffer)
    await previewing
    assert.equal(h.liveContexts[0].state, 'closed')
    assert.equal(h.liveContexts[0].sources.length, 0)
    assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'false')
  }
})

test('new settings, export, page exit, and natural completion all clean up preview playback', async () => {
  for (const action of ['settings', 'export', 'pagehide', 'ended']) {
    const h = harness()
    h.context.buildSegment = () => {}
    h.context.buildBackground = () => {}
    await h.context.previewMusicMix()
    const source = h.liveContexts[0].sources[0]
    if (action === 'settings') h.nodes.get('musicBgSlider').fire('input', '15')
    else if (action === 'export') await h.context.generateMusicFile()
    else if (action === 'pagehide') h.pageListeners.get('pagehide')()
    else source.onended()
    assert.equal(h.liveContexts[0].state, 'closed', action)
    assert.equal(source.disconnected, true, action)
    assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'false', action)
  }
})

test('preview rendering errors clean up the audio context and permit a retry', async () => {
  const h = harness({ renderFailure: true })
  h.context.buildSegment = () => {}
  h.context.buildBackground = () => {}
  await assert.rejects(h.context.previewMusicMix(), /render unavailable/)
  assert.equal(h.liveContexts[0].state, 'closed')
  assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'false')
  await assert.rejects(h.context.previewMusicMix(), /render unavailable/)
  assert.equal(h.liveContexts.length, 2)
  assert.equal(h.liveContexts[1].state, 'closed')
})

test('hiding the page cancels pending and playing previews and returning never restarts them', async () => {
  for (const phase of ['rendering', 'playing']) {
    let release
    const deferred = new Promise(resolve => { release = resolve })
    const h = harness(phase === 'rendering' ? { renderPromise: deferred } : {})
    h.context.buildSegment = () => {}
    h.context.buildBackground = () => {}
    const previewing = h.context.previewMusicMix()
    if (phase === 'playing') await previewing
    else await Promise.resolve()
    h.context.document.hidden = true
    h.pageListeners.get('visibilitychange')()
    if (phase === 'rendering') release(h.buffer)
    await previewing
    assert.equal(h.liveContexts[0].state, 'closed')
    h.context.document.hidden = false
    h.pageListeners.get('visibilitychange')()
    assert.equal(h.liveContexts.length, 1)
    assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'false')
    assert.equal(h.liveContexts[0].sources.length, phase === 'playing' ? 1 : 0)
    if (phase === 'playing') assert.equal(h.liveContexts[0].sources[0].disconnected, true)
  }
})

test('audio interruption cancels preview and context recovery cannot restart it', async () => {
  for (const interruption of ['suspended', 'interrupted', 'closed']) {
    const h = harness()
    h.context.buildSegment = () => {}
    h.context.buildBackground = () => {}
    await h.context.previewMusicMix()
    const context = h.liveContexts[0]
    context.changeState(interruption)
    assert.equal(context.sources[0].stops, 1)
    assert.equal(context.sources[0].disconnected, true)
    assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'false')
    assert.match(h.nodes.get('musicPreviewStatus').textContent, /interrupted/)
    context.changeState('running')
    assert.equal(context.sources[0].starts, 1)
    assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'false')
  }
})

test('central auth UI update invalidates preview after account replacement or revocation', async () => {
  assert.match(html, /function updateAuthUI\(\) \{\s+syncMusicDownload\(\);\s+if \(typeof syncMusicPreviewOwner === 'function'\) syncMusicPreviewOwner\(\);/)
  for (const replacement of [null, { email: 'other@example.test' }]) {
    const h = harness()
    h.context.buildSegment = () => {}
    h.context.buildBackground = () => {}
    await h.context.previewMusicMix()
    h.context.auth.user = replacement
    h.context.syncMusicPreviewOwner()
    assert.equal(h.liveContexts[0].state, 'closed')
    assert.equal(h.liveContexts[0].sources[0].disconnected, true)
    assert.equal(h.nodes.get('previewMusicBtn').attrs['aria-pressed'], 'false')
  }
})

test('export memory estimate follows duration and is unchanged by MP3 selection', () => {
  const h = harness()
  assert.equal(h.nodes.get('musicDurSlider').value, '10')
  assert.match(h.nodes.get('musicWorkingMemory').textContent, /212 MB/)
  h.nodes.get('musicDurSlider').fire('input', '50')
  assert.match(h.nodes.get('musicWorkingMemory').textContent, /1059 MB/)
  h.click('data-fmt', 'mp3')
  assert.match(h.nodes.get('musicWorkingMemory').textContent, /1059 MB/)
})

test('output peak protection attenuates both channels equally without raising a quiet mix', () => {
  const h = harness()
  const channels = [Float32Array.from([0, 1.8, -1.2]), Float32Array.from([0.4, -0.8, 0.1])]
  const buffer = { numberOfChannels: 2, getChannelData: i => channels[i] }
  h.context.protectMusicPeak(buffer)
  assert.ok(Math.abs(channels[0][1] - 0.9) < 1e-6)
  assert.ok(Math.abs(channels[1][0] - 0.2) < 1e-6)
  assert.ok(Math.abs(channels[0][2] + 0.6) < 1e-6)
  const quiet = Float32Array.from([0, 0.02, -0.02])
  h.context.protectMusicPeak({ numberOfChannels: 1, getChannelData: () => quiet })
  assert.deepEqual(quiet, Float32Array.from([0, 0.02, -0.02]))
})

test('low-frequency modulation has a zero intrinsic gain and polarity adds no DC signal', () => {
  const h = harness()
  const makeAudioGraph = () => {
    const gains = [], constants = []
    const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {} })
    const base = () => ({ connect() {}, start() {}, stop() {} })
    const ctx = {
      destination: {},
      createChannelMerger: base,
      createGain: () => { const n = { ...base(), gain: param() }; gains.push(n); return n },
      createOscillator: () => ({ ...base(), frequency: param() }),
      createConstantSource: () => { const n = { ...base(), offset: param() }; constants.push(n); return n },
    }
    return { ctx, gains, constants }
  }
  const low = makeAudioGraph()
  h.context.buildSegment(low.ctx, { freqA: 0.1, freqB: 10, wave: 'Gentle', polarity: 'Positive' }, 0, 20, 1)
  assert.equal(low.gains[1].gain.value, 0)
  assert.equal(low.gains[3].gain.value, 0)
  assert.equal(low.constants.length, 2, 'only the two amplitude-modulation offsets are needed')
  const audible = makeAudioGraph()
  h.context.buildSegment(audible.ctx, { freqA: 40, freqB: 116, wave: 'Gentle', polarity: 'Positive' }, 0, 20, 1)
  assert.equal(audible.constants.length, 0, 'polarity must not create a DC offset in the audio file')
})
