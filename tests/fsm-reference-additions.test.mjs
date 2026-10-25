import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const additions = JSON.parse(fs.readFileSync(new URL('../data/fsm/course-reference-2026-10-25.json', import.meta.url), 'utf8'))
const frequencyGroups = JSON.parse(fs.readFileSync(new URL('../data/fsm/frequency-groups.json', import.meta.url), 'utf8'))
const referenceSource = fs.readFileSync(new URL('../lib/fsm/reference-library.js', import.meta.url), 'utf8')
  .replace(/^import .+;\r?$/gm, '').replace(/^export /gm, '')
const fixture = id => ({ id, name: id, steps: [{ freq_a: 40, freq_b: 116, duration: 4 }] })
const plain = value => JSON.parse(JSON.stringify(value))

function library() {
  const context = vm.createContext({ COURSE_REFERENCE: additions })
  vm.runInContext(referenceSource, context)
  return context
}

test('course photo pairs retain the user-confirmed settings and their separate provenance', () => {
  assert.deepEqual(additions.map(protocol => protocol.steps.map(step => [step.freq_a, step.freq_b])), [
    [[40,84],[40,87],[284,84],[284,87],[13,84],[13,87],[91,84],[91,87],[217,84],[217,87],[51,84],[51,87],[124,100],[124,62],[124,46],[49,33]],
    [[40,396],[40,562],[284,396],[284,562],[13,396],[13,562],[91,396],[91,562],[217,396],[217,562],[51,396],[51,562]],
  ])
  assert.deepEqual(additions.map(protocol => protocol.total_duration_minutes), [64,48])
  for (const protocol of additions) {
    assert.equal(protocol.settings_source, 'user_confirmed_2026-10-25')
    assert.equal(protocol.source_total_duration_minutes, null)
    for (const step of protocol.steps) {
      assert.equal(step.duration, 4)
      assert.equal(step.polarity, 'Alternating')
      assert.equal(step.wave, 'Medium')
    }
  }
})

test('official and photo solar references coexist without changing the Solfeggio values', () => {
  assert.deepEqual(frequencyGroups.chakra.entries.map(entry => entry.freq), [396,417,200,528,639,741,852,963])
  assert.deepEqual(frequencyGroups.solfeggio.entries.map(entry => entry.freq), [174,285,396,417,528,639,741,852,963])
  const official = frequencyGroups.chakra.entries.find(entry => entry.id === 'fsm_chakra_solar_200')
  const photo = frequencyGroups.chakra.entries.find(entry => entry.id === 'photo_chakra_528')
  assert.equal(official.freq, 200)
  assert.equal(official.verification_status, 'user_confirmed_official')
  assert.match(official.source_label, /FSM 官方對照（使用者/)
  assert.equal(photo.freq, 528)
  assert.match(photo.name_zh, /圖片／Solfeggio/)
})

function apiHarness(stored, { unavailable = false } = {}) {
  const store = new Map(stored === undefined ? [] : [['reference_protocols_v3', stored]])
  const calls = []
  return {
    store, calls,
    async request(route, { method = route === 'protected-data' ? 'POST' : 'GET', body = {} } = {}) {
      const context = vm.createContext({
        COURSE_REFERENCE: additions, FREQUENCY_GROUPS: frequencyGroups,
        MB_REFERENCE: [fixture('repository-only')], STUDIO_GUIDE: {}, Buffer,
        process: { env: { KV_REST_API_URL: 'https://synthetic-kv.invalid', KV_REST_API_TOKEN: 'synthetic-token' } },
        console: { error() {} },
        authorizeSession: async () => ({ email: 'hermiterudite@gmail.com' }),
        fetch: async (url, options = {}) => {
          const parsed = new URL(url)
          assert.equal(parsed.hostname, 'synthetic-kv.invalid')
          const key = decodeURIComponent(parsed.pathname.split('/').at(-1))
          calls.push({ method: options.method || 'GET', key })
          if (unavailable) throw new Error('Synthetic storage outage')
          if (options.method === 'POST') {
            store.set(key, JSON.parse(JSON.parse(options.body)))
            return { ok: true, json: async () => ({ result: 'OK' }) }
          }
          return { ok: true, json: async () => ({ result: store.has(key) ? JSON.stringify(store.get(key)) : null }) }
        },
      })
      vm.runInContext(referenceSource, context)
      const source = fs.readFileSync(new URL(`../pages/api/${route}.js`, import.meta.url), 'utf8')
        .replace(/^import .+;\r?$/gm, '').replace('export default async function handler', 'async function handler')
      vm.runInContext(source, context)
      const response = { status: 200, headers: {}, body: undefined }
      const res = {
        setHeader(name, value) { response.headers[name.toLowerCase()] = value },
        status(value) { response.status = value; return this },
        json(value) { response.body = plain(value); return this },
        end() { return this },
      }
      await context.handler({ method, body }, res)
      return response
    },
  }
}

test('only the new course batch is added to legacy shared libraries', () => {
  const { resolveReferenceProtocols } = library()
  const custom = fixture('admin-custom')
  const seed = [fixture('repository-only')]
  const actual = plain(resolveReferenceProtocols([custom], seed))
  assert.deepEqual(actual, [custom, ...additions])
  assert.equal(actual.some(protocol => protocol.id === 'repository-only'), false)
  assert.deepEqual(plain(resolveReferenceProtocols(null, seed)), [...seed, ...additions])
  assert.deepEqual(plain(resolveReferenceProtocols(actual, seed)), actual)
  assert.equal(new Set(actual.map(protocol => protocol.id)).size, actual.length)
})

test('existing course ids retain administrator edits and explicit replacements preserve deletions', () => {
  const { resolveReferenceProtocols, toStoredReferenceProtocols } = library()
  const edited = { ...additions[0], name_zh: '管理員調整的協定' }
  const migrated = plain(resolveReferenceProtocols([edited], []))
  assert.deepEqual(migrated[0], edited)
  assert.equal(migrated.filter(protocol => protocol.id === edited.id).length, 1)
  const saved = toStoredReferenceProtocols([edited])
  assert.deepEqual(plain(resolveReferenceProtocols(saved, [])), [edited])
  assert.deepEqual(plain(resolveReferenceProtocols(toStoredReferenceProtocols([]), [fixture('seed')])), [])
})

test('malformed stored envelopes and duplicate protocol ids are rejected', () => {
  const { resolveReferenceProtocols } = library()
  for (const stored of [
    {}, { version: 3, protocols: [], applied_additions: [] },
    { version: 4, protocols: [], applied_additions: null },
    { version: 4, protocols: [], applied_additions: [false] },
    { version: 4, protocols: {}, applied_additions: [] },
    [null], [fixture('duplicate'), fixture('duplicate')],
  ]) assert.throws(() => resolveReferenceProtocols(stored, []), /Invalid saved reference/)
})

test('both authenticated library endpoints expose the same additions without writing on reads', async () => {
  const custom = fixture('admin-custom')
  const h = apiHarness([custom])
  const shared = await h.request('reference-protocols')
  const protectedData = await h.request('protected-data')
  assert.equal(shared.status, 200)
  assert.equal(protectedData.status, 200)
  assert.deepEqual(shared.body.protocols, protectedData.body.data.full)
  assert.deepEqual(shared.body.protocols.map(protocol => protocol.id), [custom.id, ...additions.map(protocol => protocol.id)])
  assert.deepEqual(protectedData.body.data.frequency_groups, frequencyGroups)
  assert.deepEqual(h.store.get('reference_protocols_v3'), [custom])
  assert.equal(h.calls.some(call => call.method === 'POST'), false)
})

test('an explicit shared save keeps edited course entries and does not resurrect removed ones', async () => {
  const h = apiHarness([fixture('admin-custom')])
  const loaded = await h.request('reference-protocols')
  const edited = { ...loaded.body.protocols.find(protocol => protocol.id === additions[0].id), name_zh: '已調整' }
  const replacement = [edited]
  const saved = await h.request('reference-protocols', { method: 'POST', body: { protocols: replacement } })
  assert.equal(saved.status, 200)
  const envelope = h.store.get('reference_protocols_v3')
  assert.equal(envelope.version, 4)
  assert.deepEqual(envelope.applied_additions, ['course-2026-10-25'])
  const shared = await h.request('reference-protocols')
  const protectedData = await h.request('protected-data')
  assert.deepEqual(shared.body.protocols, replacement)
  assert.deepEqual(protectedData.body.data.full, replacement)

  assert.equal((await h.request('reference-protocols', { method: 'POST', body: { protocols: [] } })).status, 200)
  assert.deepEqual((await h.request('reference-protocols')).body.protocols, [])
  assert.deepEqual((await h.request('protected-data')).body.data.full, [])
})

test('invalid saved data and storage outages never silently restore the repository seed', async () => {
  for (const route of ['reference-protocols', 'protected-data']) {
    for (const h of [apiHarness({ version: 4, protocols: [], applied_additions: null }), apiHarness([], { unavailable: true })]) {
      const response = await h.request(route)
      assert.equal(response.status, 500, route)
      assert.equal(Object.hasOwn(response.body, 'data'), false)
      assert.equal(Object.hasOwn(response.body, 'protocols'), false)
      assert.equal(h.calls.some(call => call.method === 'POST'), false)
    }
  }
})
