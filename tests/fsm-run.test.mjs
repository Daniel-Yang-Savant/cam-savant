import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const functionNames = [
  'syncRunRemaining', 'clearRunScheduling', 'releaseRunWakeLock', 'requestRunWakeLock',
  'startTimerLoop', 'toggleRunPause', 'adjustRunMinutes', 'jumpRunStep',
  'startManualRun', 'startStep', 'onStepEnd', 'stopRun',
]
const functions = functionNames.map((name) => {
  const start = html.indexOf(`function ${name}(`)
  assert.notEqual(start, -1, `${name} must exist`)
  return html.slice(start, html.indexOf('\n}', start) + 2)
}).join('\n')
const lifecycleStart = html.indexOf("window.addEventListener('pagehide', stopRun)")
assert.notEqual(lifecycleStart, -1)
const lifecycleHooks = html.slice(lifecycleStart, html.indexOf('// ═', lifecycleStart))

function harness({ wakeLock } = {}) {
  let now = 0
  let id = 0
  const timers = new Map()
  const nodes = new Map()
  const starts = []
  const alerts = []
  const listeners = new Map()
  const state = {
    freqA: 40, freqB: 116, polarity: 'Alternating', waveshape: 'Medium', current: 200,
    duration: 1, running: false, paused: false, timerInterval: null,
    remainingSec: 0, stepTotalSec: 0, timerDeadlineMs: null, transitionTimeout: null,
    runGeneration: 0, loadedProtocol: null, currentStepIndex: 0, wakeLock: null,
  }
  const context = {
    state, performance: { now: () => now },
    navigator: wakeLock ? { wakeLock } : {},
    window: { addEventListener: (event, callback) => listeners.set(event, callback) },
    document: { hidden: false, addEventListener: (event, callback) => listeners.set(event, callback) },
    FREQ_A_MAP: {}, FREQ_B_MAP: {}, LANG: 'zh',
    $: (name) => {
      if (!nodes.has(name)) nodes.set(name, {
        classList: { add() {}, remove() {}, contains: () => false }, style: {},
      })
      return nodes.get(name)
    },
    t: (key) => key,
    alert: (message) => alerts.push(message),
    isValidFrequency: (value) => Number.isFinite(value) && value >= 0.1 && value <= 999,
    isValidStepDuration: (value) => Number.isFinite(value) && value > 0 && value <= 60,
    audio: { start: (...args) => starts.push(args), stop() {} },
    updateFreqDisplay() {}, reflectControlState() {}, applyRunScale() {},
    renderRunQueue() {}, updateTimerDisplay() {}, renderProtocolList() {}, playEndChime() {},
    setInterval: (callback, delay) => { timers.set(++id, { callback, delay, type: 'interval' }); return id },
    clearInterval: (timer) => timers.delete(timer),
    setTimeout: (callback, delay) => { timers.set(++id, { callback, delay, type: 'timeout' }); return id },
    clearTimeout: (timer) => timers.delete(timer),
  }
  vm.createContext(context)
  vm.runInContext(functions + '\n' + lifecycleHooks, context)
  return {
    context, state, starts, alerts, timers, listeners,
    setTime(value) { now = value },
    fire(timer) {
      const task = timers.get(timer)
      assert.ok(task, `timer ${timer} exists`)
      if (task.type === 'timeout') timers.delete(timer)
      task.callback()
    },
    protocol() {
      state.loadedProtocol = {
        name: 'Test',
        steps: [40, 80, 160].map((freq) => ({ freq_a: freq, freq_b: 116, polarity: 'Alternating', wave: 'Medium', duration: 1 })),
      }
      context.startStep(state.loadedProtocol.steps[0], true)
    },
    finishStep() {
      now = state.timerDeadlineMs
      this.fire(state.timerInterval)
      assert.notEqual(state.transitionTimeout, null)
      return timers.get(state.transitionTimeout).callback
    },
  }
}

test('STOP cancels transition and rejects an already queued transition callback', () => {
  const h = harness()
  h.protocol()
  const staleCallback = h.finishStep()
  h.context.stopRun()
  staleCallback()
  assert.equal(h.state.running, false)
  assert.equal(h.state.transitionTimeout, null)
  assert.equal(h.timers.size, 0)
  assert.equal(h.starts.length, 1)
})

test('pausing during transition stays silent; resume advances exactly once', () => {
  const h = harness()
  h.protocol()
  const staleCallback = h.finishStep()
  h.context.toggleRunPause()
  staleCallback()
  assert.equal(h.state.paused, true)
  assert.equal(h.state.currentStepIndex, 0)
  assert.equal(h.starts.length, 1)
  h.context.toggleRunPause()
  assert.equal(h.starts.length, 1, 'completed frequency must not restart on resume')
  h.fire(h.state.transitionTimeout)
  assert.equal(h.state.currentStepIndex, 1)
  assert.equal(h.starts.length, 2)
  assert.equal(h.starts[1][0], 80)
})

test('jumping during transition invalidates the previous destination', () => {
  const h = harness()
  h.protocol()
  const staleCallback = h.finishStep()
  h.context.jumpRunStep(2)
  staleCallback()
  assert.equal(h.state.currentStepIndex, 2)
  assert.equal(h.starts.length, 2)
  assert.equal(h.starts[1][0], 160)
  assert.equal(h.state.transitionTimeout, null)
})

test('starting a new manual run cannot be overwritten by an old transition', () => {
  const h = harness()
  h.protocol()
  const staleCallback = h.finishStep()
  h.state.freqA = 0.1
  h.context.startManualRun()
  staleCallback()
  assert.equal(h.state.loadedProtocol, null)
  assert.equal(h.starts.length, 2)
  assert.equal(h.starts[1][0], 0.1)
})

test('delayed timer callbacks use elapsed time and finish without duplicate transitions', () => {
  const h = harness()
  h.protocol()
  const callback = h.timers.get(h.state.timerInterval).callback
  h.setTime(10_500)
  callback()
  assert.equal(h.state.remainingSec, 49.5)
  h.setTime(65_000)
  callback()
  const transition = h.state.transitionTimeout
  callback()
  assert.equal(h.state.transitionTimeout, transition)
  assert.equal(h.timers.size, 1)
  assert.equal(h.state.remainingSec, 0)
})

test('pause preserves fractional remaining time without counting paused time', () => {
  const h = harness()
  h.context.startManualRun()
  h.setTime(1500)
  h.context.toggleRunPause()
  assert.equal(h.state.remainingSec, 58.5)
  h.setTime(101_500)
  h.context.toggleRunPause()
  h.setTime(102_500)
  h.fire(h.state.timerInterval)
  assert.equal(h.state.remainingSec, 57.5)
})

test('duration adjustments update the deadline and respect the 60-minute limit', () => {
  const h = harness()
  h.context.startManualRun()
  h.setTime(10_000)
  h.context.adjustRunMinutes(1)
  assert.equal(h.state.remainingSec, 110)
  h.setTime(20_000)
  h.fire(h.state.timerInterval)
  assert.equal(h.state.remainingSec, 100)
  h.context.adjustRunMinutes(100)
  assert.equal(h.state.stepTotalSec, 3600)
  const remaining = h.state.remainingSec
  h.context.adjustRunMinutes(1)
  assert.equal(h.state.remainingSec, remaining)
})

test('invalid step cancels pending output and decimal frequencies remain exact', () => {
  const h = harness()
  h.protocol()
  const staleCallback = h.finishStep()
  h.context.startStep({ freq_a: 0, freq_b: 10, duration: 1, polarity: 'Alternating', wave: 'Medium' }, false)
  staleCallback()
  assert.equal(h.starts.length, 1)
  assert.equal(h.state.running, false)
  assert.equal(h.alerts.length, 1)
  h.context.startStep({ freq_a: 0.1, freq_b: 0.5, duration: 0.5, polarity: 'Alternating', wave: 'Medium' }, false)
  assert.equal(h.starts[1][0], 0.1)
  assert.equal(h.starts[1][1], 0.5)
  assert.equal(h.state.remainingSec, 30)
})

test('wake lock arriving after STOP is released instead of retained', async () => {
  let grant
  let releases = 0
  const h = harness({ wakeLock: { request: () => new Promise((resolve) => { grant = resolve }) } })
  h.context.startManualRun()
  h.context.stopRun()
  grant({ release() { releases++; return Promise.resolve() } })
  await Promise.resolve()
  assert.equal(releases, 1)
  assert.equal(h.state.wakeLock, null)
})

test('leaving the page cancels output while merely hiding the tab preserves playback', () => {
  const h = harness()
  h.protocol()
  h.context.document.hidden = true
  h.listeners.get('visibilitychange')()
  assert.equal(h.state.running, true)
  assert.equal(h.state.paused, false)
  const staleCallback = h.finishStep()
  h.listeners.get('pagehide')()
  staleCallback()
  assert.equal(h.state.running, false)
  assert.equal(h.starts.length, 1)
  assert.equal(h.timers.size, 0)
})
