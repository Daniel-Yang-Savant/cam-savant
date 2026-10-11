import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const classStart = html.indexOf('class FSMAudio {')
const classEnd = html.indexOf('\nconst audio = new FSMAudio();', classStart)
assert.ok(classStart >= 0 && classEnd > classStart, 'live audio engine must exist')
const frequencyValidator = html.match(/function isValidFrequency\(value\) \{[^\n]+\}/)?.[0]
assert.ok(frequencyValidator, 'frequency validator must exist')
const source = `${frequencyValidator}\n${html.slice(classStart, classEnd)}\nglobalThis.FSMAudio = FSMAudio`

function harness({ initialContextState = 'running', deferResume = false } = {}) {
  const contexts = []
  const timers = []
  const state = { running: true, paused: false, timerInterval: null }
  const status = { textContent: '' }
  let pauses = 0
  let unlocks = 0
  let timerStarts = 0
  let wakeLockRequests = 0
  let audio

  function parameter(value) {
    return {
      kind: 'AudioParam', value, automation: [],
      setValueAtTime(next, time) { this.value = next; this.automation.push({ type: 'set', value: next, time }) },
      linearRampToValueAtTime(next, time) { this.value = next; this.automation.push({ type: 'ramp', value: next, time }) },
      cancelScheduledValues(time) { this.automation.push({ type: 'cancel', time }) },
    }
  }

  class AudioContext {
    constructor(options) {
      this.options = options
      this.nodes = []
      this.currentTime = 10
      this.state = initialContextState
      this.destination = { kind: 'destination' }
      this.listeners = new Map()
      contexts.push(this)
    }
    node(kind, properties = {}) {
      const node = {
        kind, ...properties, connections: [], started: false, stopped: false,
        connect(target, output = 0, input = 0) { this.connections.push({ target, output, input }); return target },
        start() { this.started = true }, stop() { this.stopped = true },
      }
      this.nodes.push(node)
      return node
    }
    createGain() { return this.node('gain', { gain: parameter(1) }) }
    createOscillator() { return this.node('oscillator', { frequency: parameter(440), type: 'sine' }) }
    createConstantSource() { return this.node('constant', { offset: parameter(1) }) }
    createChannelMerger(channels) { return this.node('merger', { channels }) }
    addEventListener(event, callback) {
      if (!this.listeners.has(event)) this.listeners.set(event, [])
      this.listeners.get(event).push(callback)
    }
    changeState(next) {
      this.state = next
      for (const callback of this.listeners.get('statechange') || []) callback()
    }
    resume() {
      if (deferResume) return new Promise(resolve => { this.resolveResume = resolve })
      this.changeState('running')
      return Promise.resolve()
    }
    finishResume() { this.changeState('running'); this.resolveResume?.() }
    close() { this.changeState('closed'); return Promise.resolve() }
  }

  const context = vm.createContext({
    window: { AudioContext }, state, LANG: 'en',
    _unlockiOSAudio() { unlocks++ },
    toggleRunPause() { pauses++; state.paused = !state.paused; if (state.paused) audio.stop() },
    startTimerLoop() { timerStarts++; state.timerInterval = timerStarts },
    requestRunWakeLock() { wakeLockRequests++ },
    t: key => key,
    $: () => status,
    setTimeout(callback, delay) { timers.push({ callback, delay }); return timers.length },
  })
  vm.runInContext(source, context)
  audio = new context.FSMAudio()
  return {
    audio, contexts, state, status, timers,
    get pauses() { return pauses }, get unlocks() { return unlocks },
    get timerStarts() { return timerStarts }, get wakeLockRequests() { return wakeLockRequests },
    flushTimers() { while (timers.length) timers.shift().callback() },
  }
}

test('low frequencies modulate the carrier between zero and one, without a doubled envelope', () => {
  const h = harness()
  h.audio.start(0.1, 116, 'Alternating', 'Gentle', 20)
  const context = h.audio.ctx
  const carrier = context.nodes.find(node => node.kind === 'oscillator' && node.frequency.value === 200)
  const modulator = context.nodes.find(node => node.kind === 'oscillator' && node.frequency.value === 0.1)
  const offset = context.nodes.find(node => node.kind === 'constant')
  const channel = carrier.connections[0].target
  const modulationGain = modulator.connections[0].target

  assert.equal(channel.gain.value, 0, 'connected AudioParam signals add to the intrinsic value')
  assert.equal(modulationGain.gain.value, 0.5)
  assert.equal(offset.offset.value, 0.5)
  assert.equal(modulationGain.connections[0].target, channel.gain)
  assert.equal(offset.connections[0].target, channel.gain)
  const envelope = sine => channel.gain.value + modulationGain.gain.value * sine + offset.offset.value
  assert.equal(envelope(-1), 0)
  assert.equal(envelope(1), 1)
  assert.ok(carrier.started && modulator.started && offset.started)
})

test('Positive polarity does not add DC to either audible channel', () => {
  const h = harness()
  h.audio.start(40, 116, 'Positive', 'Medium', 100)
  assert.equal(h.audio.ctx.nodes.filter(node => node.kind === 'constant').length, 0)
  const oscillators = h.audio.ctx.nodes.filter(node => node.kind === 'oscillator')
  assert.deepEqual(oscillators.map(node => node.frequency.value), [40, 116])
  for (const oscillator of oscillators) assert.equal(oscillator.connections[0].target.gain.value, 1)
})

test('Positive low-frequency output only uses DC offset on the modulation control', () => {
  const h = harness()
  h.audio.start(0.1, 10, 'Positive', 'Sharp', 100)
  const offsets = h.audio.ctx.nodes.filter(node => node.kind === 'constant')
  assert.equal(offsets.length, 2)
  for (const offset of offsets) {
    assert.equal(offset.offset.value, 0.5)
    assert.equal(offset.connections.length, 1)
    assert.equal(offset.connections[0].target.kind, 'AudioParam', 'offset must never enter the audio signal path')
  }
})

test('iCare outputs both selected sub-audible frequencies directly without a carrier or DC offset', () => {
  for (const [waveshape, expectedType, attack] of [['Sharp', 'square', 0.02], ['Medium', 'sine', 0.15], ['Gentle', 'sine', 0.4]]) {
    const h = harness()
    h.audio.start(0.1, 10, 'Positive', waveshape, 20, 'icare')
    const oscillators = h.audio.ctx.nodes.filter(node => node.kind === 'oscillator')
    assert.deepEqual(oscillators.map(node => node.frequency.value), [0.1, 10])
    assert.ok(oscillators.every(node => node.type === expectedType && node.started))
    assert.equal(h.audio.ctx.nodes.filter(node => node.kind === 'constant').length, 0)
    for (const oscillator of oscillators) assert.equal(oscillator.connections[0].target.gain.value, 1)
    const ramp = h.audio.master.gain.automation.find(event => event.type === 'ramp')
    assert.equal(ramp.time, h.audio.ctx.currentTime + attack)
    assert.equal(ramp.value, 0.12)
  }
})

test('listening and iCare keep A on the left and B on the right with separate low-frequency paths', () => {
  for (const outputMode of [undefined, 'listening', 'icare']) {
    const h = harness()
    h.audio.start(0.1, 116, 'Alternating', 'Gentle', 20, outputMode)
    const context = h.audio.ctx
    const channels = context.nodes.filter(node => node.connections.some(connection => connection.target === h.audio.merger))
    assert.equal(h.audio.merger.channels, 2)
    assert.equal(channels.length, 2)
    for (const [index, channel] of channels.entries()) {
      const connection = channel.connections.find(connection => connection.target === h.audio.merger)
      assert.equal(connection.output, 0)
      assert.equal(connection.input, index, `mode ${outputMode}: channel ${index}`)
      const source = context.nodes.find(node => node.kind === 'oscillator' && node.connections.some(connection => connection.target === channel))
      assert.equal(source.frequency.value, index === 1 ? 116 : outputMode === 'icare' ? 0.1 : 200)
    }
    assert.equal(context.nodes.filter(node => node.kind === 'constant').length, outputMode === 'icare' ? 0 : 1)
    assert.equal(h.audio.merger.connections[0].target, h.audio.master)
  }
})

test('master gain stays bounded for legacy intensity and zero always remains muted', () => {
  for (const outputMode of ['listening', 'icare']) {
    for (const [current, expected] of [[500, 0.6], [100, 0.6], [20, 0.12], [0, 0], [-20, 0]]) {
      const h = harness()
      h.audio.start(0.1, 116, 'Alternating', 'Medium', current, outputMode)
      assert.equal(h.audio.master.gain.value, expected, `${outputMode}: current ${current}`)
      for (const event of h.audio.master.gain.automation) {
        assert.ok(event.value >= 0 && event.value <= 0.6)
      }
      assert.equal(h.audio.master.connections[0].target, h.audio.ctx.destination)
    }
  }
})

test('invalid or non-finite audio settings are rejected before allocating or unlocking audio', () => {
  const invalid = [
    [NaN, 116, 20], [Infinity, 116, 20], [40, -Infinity, 20],
    [0, 116, 20], [1000, 116, 20], ['40', 116, 20],
    [40, 116, NaN], [40, 116, Infinity], [40, 116, -Infinity], [40, 116, 'invalid'],
  ]
  for (const [freqA, freqB, current] of invalid) {
    const h = harness()
    assert.throws(() => h.audio.start(freqA, freqB, 'Alternating', 'Medium', current), /Invalid audio settings/)
    assert.equal(h.contexts.length, 0)
    assert.equal(h.unlocks, 0)
    assert.equal(h.audio.running, false)
  }
})

test('audio interruptions pause the active session and require a manual restart', () => {
  for (const outputMode of ['listening', 'icare']) {
    for (const interruption of ['suspended', 'interrupted', 'closed']) {
      const h = harness()
      h.audio.start(0.1, 116, 'Alternating', 'Medium', 20, outputMode)
      const context = h.audio.ctx
      context.changeState(interruption)
      assert.equal(h.pauses, 1, `${outputMode}: ${interruption}`)
      assert.equal(h.state.paused, true)
      assert.equal(h.audio.running, false)
      assert.equal(h.status.textContent, 'Audio interrupted; resume manually')
      context.changeState('running')
      assert.equal(h.state.paused, true, 'recovering the browser context must not resume the session')
      h.flushTimers()
      assert.equal(h.pauses, 1, 'cleanup state changes must not toggle the session again')
    }
  }
})

test('state changes and deferred cleanup from an old context cannot pause a replacement session', () => {
  const h = harness()
  h.audio.start(40, 116, 'Alternating', 'Medium', 20)
  const previous = h.audio.ctx
  h.audio.start(0.1, 10, 'Positive', 'Gentle', 0, 'icare')
  const current = h.audio.ctx
  assert.notEqual(current, previous)
  previous.changeState('interrupted')
  previous.changeState('suspended')
  h.flushTimers()
  assert.equal(previous.state, 'closed')
  assert.equal(current.state, 'running')
  assert.equal(h.pauses, 0)
  assert.equal(h.audio.running, true)
  assert.equal(h.state.paused, false)
  assert.equal(h.status.textContent, '')
  assert.ok(previous.nodes.filter(node => node.kind === 'oscillator').every(node => node.stopped))
  assert.ok(current.nodes.filter(node => node.kind === 'oscillator').every(node => !node.stopped))
})

test('the active context starts its waiting timer exactly once when audio becomes running', () => {
  const h = harness({ initialContextState: 'suspended', deferResume: true })
  h.audio.start(0.1, 116, 'Alternating', 'Medium', 0, 'icare')
  assert.equal(h.audio.ctx.state, 'suspended')
  assert.equal(h.state.timerInterval, null)
  assert.equal(h.timerStarts, 0)
  assert.equal(h.wakeLockRequests, 0)

  h.audio.ctx.finishResume()
  assert.equal(h.timerStarts, 1)
  assert.equal(h.wakeLockRequests, 1)
  assert.equal(h.state.timerInterval, 1)
  assert.equal(h.status.textContent, 'status_running')
  h.audio.ctx.changeState('running')
  h.audio.ctx.changeState('running')
  assert.equal(h.timerStarts, 1, 'duplicate running events must not reset elapsed time')
  assert.equal(h.wakeLockRequests, 1)
})

test('an old context becoming running cannot start the replacement session timer', () => {
  const h = harness({ initialContextState: 'suspended', deferResume: true })
  h.audio.start(40, 116, 'Alternating', 'Medium', 20)
  const previous = h.audio.ctx
  h.audio.start(80, 284, 'Positive', 'Gentle', 20)
  const current = h.audio.ctx

  previous.finishResume()
  assert.equal(current.state, 'suspended')
  assert.equal(h.state.timerInterval, null)
  assert.equal(h.timerStarts, 0)
  assert.equal(h.wakeLockRequests, 0)
  assert.equal(h.status.textContent, '')
  h.flushTimers()
  assert.equal(h.timerStarts, 0)
  assert.equal(h.pauses, 0)

  current.finishResume()
  assert.equal(h.timerStarts, 1)
  assert.equal(h.wakeLockRequests, 1)
  assert.equal(h.state.timerInterval, 1)
})
