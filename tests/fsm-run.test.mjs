import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../public/fsm/studio/index.html', import.meta.url), 'utf8')
const functionNames = [
  'syncRunRemaining', 'clearRunScheduling', 'releaseRunWakeLock', 'requestRunWakeLock',
  'startTimerLoop', 'toggleRunPause', 'adjustRunMinutes', 'jumpRunStep',
  'startManualRun', 'startStep', 'onStepEnd', 'stopRun',
  'getOutputGain', 'setOutputMode',
]
function extractFunction(name) {
  const start = html.indexOf(`function ${name}(`)
  assert.notEqual(start, -1, `${name} must exist`)
  const firstLine = html.slice(start, html.indexOf('\n', start))
  if (firstLine.trimEnd().endsWith('}')) return firstLine
  return html.slice(start, html.indexOf('\n}', start) + 2)
}
const functions = functionNames.map(extractFunction).join('\n')
const endChimeFunction = extractFunction('playEndChime')
const lifecycleStart = html.indexOf("window.addEventListener('pagehide', stopRun)")
assert.notEqual(lifecycleStart, -1)
const lifecycleHooks = html.slice(lifecycleStart, html.indexOf('// ═', lifecycleStart))

function harness({ wakeLock, realEndChime = false } = {}) {
  let now = 0
  let id = 0
  const timers = new Map()
  const nodes = new Map()
  const starts = []
  const alerts = []
  const listeners = new Map()
  const calls = { audioStops: 0, musicStops: 0, chimeStops: 0, outputUI: 0, controls: 0, chimeContexts: 0 }
  const state = {
    freqA: 40, freqB: 116, polarity: 'Alternating', waveshape: 'Medium', current: 200,
    outputMode: 'listening', padGain: 0,
    duration: 1, running: false, paused: false, timerInterval: null,
    remainingSec: 0, stepTotalSec: 0, timerDeadlineMs: null, transitionTimeout: null,
    runGeneration: 0, loadedProtocol: null, currentStepIndex: 0, wakeLock: null,
  }
  const context = {
    state, endChimeContext: null, musicExportInProgress: false, performance: { now: () => now },
    navigator: wakeLock ? { wakeLock } : {},
    window: {
      addEventListener: (event, callback) => listeners.set(event, callback),
      AudioContext: class {
        constructor() { calls.chimeContexts++; this.state = 'running'; this.currentTime = 0; this.destination = {} }
        createOscillator() { return { frequency: { value: 0 }, connect() {}, start() {}, stop() {} } }
        createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} } }
        close() { return Promise.resolve() }
      },
    },
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
    audio: { start: (...args) => starts.push(args), stop() { calls.audioStops++ } },
    updateFreqDisplay() {}, reflectControlState() { calls.controls++ }, applyRunScale() {},
    updateOutputModeUI() { calls.outputUI++ },
    stopMusicPreview() { calls.musicStops++ }, stopEndChime() { calls.chimeStops++ },
    renderRunQueue() {}, updateTimerDisplay() {}, renderProtocolList() {}, playEndChime() {},
    setInterval: (callback, delay) => { timers.set(++id, { callback, delay, type: 'interval' }); return id },
    clearInterval: (timer) => timers.delete(timer),
    setTimeout: (callback, delay) => { timers.set(++id, { callback, delay, type: 'timeout' }); return id },
    clearTimeout: (timer) => timers.delete(timer),
  }
  vm.createContext(context)
  vm.runInContext(functions + '\n' + lifecycleHooks + (realEndChime ? '\n' + endChimeFunction : ''), context)
  return {
    context, state, starts, alerts, timers, listeners, calls,
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

test('zero remains muted and legacy protocol gains are bounded in controls and audio', () => {
  const h = harness();
  const step = { freq_a: 40, freq_b: 116, duration: 1, polarity: 'Alternating', wave: 'Medium' };
  h.context.startStep({ ...step, current: 0 }, false);
  assert.equal(h.state.current, 0);
  assert.equal(h.starts[0][4], 0);
  h.context.startStep({ ...step, current: 500 }, false);
  assert.equal(h.state.current, 100);
  assert.equal(h.starts[1][4], 100);
});

test('pending audio startup does not count silent time toward the session', () => {
  const h = harness();
  h.context.audio.ctx = { state: 'suspended' };
  h.context.startManualRun();
  assert.equal(h.state.timerInterval, null);
  assert.equal(h.state.timerDeadlineMs, null);
  h.setTime(15000);
  h.context.audio.ctx.state = 'running';
  h.context.startTimerLoop();
  assert.equal(h.state.timerDeadlineMs, 75000);
  assert.equal(h.state.remainingSec, 60);
});

test('audio allocation failure stops a session and does not leave a live timer', () => {
  const h = harness();
  h.context.audio.start = () => { throw new Error('No audio device'); };
  h.context.startManualRun();
  assert.equal(h.state.running, false);
  assert.equal(h.timers.size, 0);
  assert.equal(h.alerts.length, 1);
});

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

test('Pad steps and resume use only the independent Pad gain, including zero', () => {
  const h = harness()
  const step = { freq_a: 0.1, freq_b: 10, duration: 1, polarity: 'Alternating', wave: 'Medium', current: 500 }
  h.state.current = 100
  assert.equal(h.context.getOutputGain(), 100)
  h.context.setOutputMode('icare')
  assert.equal(h.context.getOutputGain(), 0)
  h.state.current = 20

  for (const gain of [0, 12]) {
    h.state.padGain = gain
    h.state.loadedProtocol = { name: 'Legacy high-gain protocol', steps: [step, { ...step, freq_a: 80, current: 900 }] }
    h.state.currentStepIndex = 0
    h.context.startStep(step, true)
    assert.equal(h.starts.at(-1)[4], gain)
    assert.equal(h.starts.at(-1)[5], 'icare')
    assert.equal(h.state.padGain, gain, 'a legacy step.current must not overwrite Pad gain')
    assert.equal(h.state.current, 20, 'Pad protocols must also preserve the listening gain')
    h.finishStep()
    h.fire(h.state.transitionTimeout)
    assert.equal(h.state.currentStepIndex, 1)
    assert.equal(h.starts.at(-1)[4], gain, 'advancing protocol steps must preserve the independent Pad gain')
    assert.equal(h.starts.at(-1)[5], 'icare')
    h.context.toggleRunPause()
    h.state.current = 100
    h.context.toggleRunPause()
    assert.equal(h.starts.at(-1)[4], gain, 'resume must not inherit the listening gain')
    assert.equal(h.starts.at(-1)[5], 'icare')
    h.state.current = 20
  }
})

test('switching output modes stops every output, cancels old transitions, and resets Pad gain', () => {
  const h = harness()
  h.protocol()
  const staleCallback = h.finishStep()
  h.state.padGain = 30
  const before = { ...h.calls }
  h.context.setOutputMode('icare')
  assert.equal(h.state.outputMode, 'icare')
  assert.equal(h.state.padGain, 0)
  assert.equal(h.state.running, false)
  assert.equal(h.state.transitionTimeout, null)
  assert.equal(h.timers.size, 0)
  assert.ok(h.calls.audioStops > before.audioStops)
  assert.ok(h.calls.musicStops > before.musicStops)
  assert.ok(h.calls.chimeStops > before.chimeStops)
  assert.ok(h.calls.outputUI > before.outputUI)
  staleCallback()
  assert.equal(h.starts.length, 1)
  assert.equal(h.state.running, false)

  h.state.padGain = 12
  h.context.startManualRun()
  assert.equal(h.starts.at(-1)[4], 12)
  assert.equal(h.starts.at(-1)[5], 'icare')
  h.context.setOutputMode('listening')
  assert.equal(h.state.running, false)
  assert.equal(h.timers.size, 0)
  h.context.setOutputMode('icare')
  assert.equal(h.state.padGain, 0, 'every entry into Pad mode starts muted')
})

test('hiding a Pad session pauses output and returning never resumes it automatically', () => {
  const h = harness()
  h.context.setOutputMode('icare')
  h.state.padGain = 12
  h.context.startManualRun()
  h.setTime(1500)
  h.context.document.hidden = true
  h.listeners.get('visibilitychange')()
  assert.equal(h.state.running, true)
  assert.equal(h.state.paused, true)
  assert.equal(h.state.remainingSec, 58.5)
  assert.equal(h.state.timerInterval, null)
  assert.equal(h.timers.size, 0)
  const startsBeforeReturn = h.starts.length
  h.setTime(101500)
  h.context.document.hidden = false
  h.listeners.get('visibilitychange')()
  assert.equal(h.state.paused, true)
  assert.equal(h.starts.length, startsBeforeReturn)
  assert.equal(h.state.remainingSec, 58.5)

  h.context.toggleRunPause()
  assert.equal(h.state.paused, false)
  assert.equal(h.starts.length, startsBeforeReturn + 1)
  assert.equal(h.starts.at(-1)[4], 12)
  assert.equal(h.starts.at(-1)[5], 'icare')
})

test('finishing Pad output never creates the audible completion chime', () => {
  const h = harness({ realEndChime: true })
  h.context.setOutputMode('icare')
  h.state.current = 100
  h.state.padGain = 12
  h.context.startManualRun()
  h.setTime(h.state.timerDeadlineMs)
  h.fire(h.state.timerInterval)
  assert.equal(h.state.running, false)
  assert.equal(h.calls.chimeContexts, 0)
  assert.equal(h.timers.size, 0)
  h.context.playEndChime()
  assert.equal(h.calls.chimeContexts, 0, 'direct chime calls must also be blocked for Pad output')

  h.context.setOutputMode('listening')
  h.state.current = 20
  h.context.playEndChime()
  assert.equal(h.calls.chimeContexts, 1, 'the fixture must detect audible chime allocation in listening mode')
  assert.equal(h.timers.size, 1, 'the listening chime should reach its scheduled cleanup without a swallowed fixture error')
})

test('music export blocks Pad startup until a later manual start without blocking listening mode', () => {
  const h = harness()
  h.context.setOutputMode('icare')
  h.state.padGain = 12
  h.context.musicExportInProgress = true
  h.context.startManualRun()
  assert.equal(h.state.running, false)
  assert.equal(h.starts.length, 0)
  assert.equal(h.timers.size, 0)
  assert.equal(h.alerts.length, 1)

  h.context.musicExportInProgress = false
  assert.equal(h.state.running, false)
  assert.equal(h.starts.length, 0, 'finishing export must not automatically start Pad output')
  h.context.startManualRun()
  assert.equal(h.state.running, true)
  assert.equal(h.starts.length, 1)
  assert.equal(h.starts[0][4], 12)
  assert.equal(h.starts[0][5], 'icare')

  h.context.setOutputMode('listening')
  h.context.musicExportInProgress = true
  h.context.startManualRun()
  assert.equal(h.state.running, true)
  assert.equal(h.starts.at(-1)[5], 'listening')
  assert.equal(h.alerts.length, 1)
})

test('music export may not restart Pad output through a pending protocol transition', () => {
  const h = harness()
  h.context.setOutputMode('icare')
  h.state.padGain = 12
  h.protocol()
  h.finishStep()
  h.context.musicExportInProgress = true
  h.fire(h.state.transitionTimeout)
  assert.equal(h.starts.length, 1)
  assert.equal(h.state.running, false)
  assert.equal(h.state.transitionTimeout, null)
  assert.equal(h.timers.size, 0)
  assert.equal(h.alerts.length, 1)

  h.context.musicExportInProgress = false
  assert.equal(h.starts.length, 1)
  h.context.startStep(h.state.loadedProtocol.steps[h.state.currentStepIndex], true)
  assert.equal(h.state.running, true)
  assert.equal(h.starts.length, 2)
  assert.equal(h.starts.at(-1)[4], 12)
  assert.equal(h.starts.at(-1)[5], 'icare')
})

test('music export allows pausing Pad output but keeps it paused until export finishes and the user resumes', () => {
  const h = harness()
  h.context.setOutputMode('icare')
  h.state.padGain = 12
  h.context.startManualRun()
  h.setTime(1500)
  h.context.musicExportInProgress = true
  h.context.toggleRunPause()
  assert.equal(h.state.paused, true, 'the export guard must never block pausing active output')
  assert.equal(h.state.remainingSec, 58.5)
  assert.equal(h.timers.size, 0)
  assert.equal(h.alerts.length, 0)

  const generation = h.state.runGeneration
  h.context.toggleRunPause()
  assert.equal(h.state.paused, true)
  assert.equal(h.state.remainingSec, 58.5)
  assert.equal(h.state.runGeneration, generation)
  assert.equal(h.starts.length, 1)
  assert.equal(h.timers.size, 0)
  assert.equal(h.alerts.length, 1)

  h.setTime(100000)
  h.context.musicExportInProgress = false
  assert.equal(h.state.paused, true)
  assert.equal(h.starts.length, 1)
  h.context.toggleRunPause()
  assert.equal(h.state.paused, false)
  assert.equal(h.starts.length, 2)
  assert.equal(h.starts.at(-1)[4], 12)
  assert.equal(h.starts.at(-1)[5], 'icare')
  assert.equal(h.state.timerDeadlineMs, 158500)
})
