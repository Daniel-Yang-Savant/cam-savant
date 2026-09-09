import assert from 'node:assert/strict'
import test from 'node:test'
import { postopPrescriptions } from '../lib/opd-prescriptions'
import { orthopedicPlanPhases } from '../lib/opd-plan-phases-orthopedic'
import { nonOrthopedicPlanPhases } from '../lib/opd-plan-phases-nonorthopedic'
import { GET } from '../app/api/admin/opd/templates/route'

test('each procedure has a complete set of unique, independently copyable Plan phases', () => {
  const phaseLibrary = { ...orthopedicPlanPhases, ...nonOrthopedicPlanPhases }
  assert.equal(postopPrescriptions.length, 15)
  assert.equal(new Set(postopPrescriptions.map(({ id }) => id)).size, 15)
  assert.deepEqual(Object.keys(phaseLibrary).sort(), postopPrescriptions.map(({ id }) => id).sort())
  assert.equal(postopPrescriptions.reduce((total, { phases }) => total + phases.length, 0), 59)

  for (const prescription of postopPrescriptions) {
    const { phases, title, safety } = prescription
    assert.ok(phases.length >= 3, title)
    assert.equal(new Set(phases.map(({ id }) => id)).size, phases.length, title)
    assert.equal(new Set(phases.map(({ label }) => label)).size, phases.length, title)
    assert.equal(new Set(phaseLibrary[prescription.id].map(({ plan }) => plan)).size, phases.length, title)
    for (const phase of phases) {
      assert.ok(phase.plan.startsWith(`術式／處置：${title}\n\n階段：${phase.label}\n\n`))
      assert.ok(phase.plan.includes(`共同注意事項：${safety}`), `${title}: safety survives copying`)
      assert.ok(phase.plan.includes('Follow-up：＿＿'))
      assert.match(phase.plan, /運動：/)
      assert.match(phase.plan, /注意事項：/)
      assert.doesNotMatch(phase.plan, /undefined|\[object Object\]|待醫師確認|現有 Notion|(?:^|\n)[SOA]:/)
    }
  }
})

test('ACL preserves six original phases with distinct exercises and precautions', () => {
  const acl = postopPrescriptions.find(({ id }) => id === 'acl-reconstruction')!
  assert.deepEqual(acl.phases.map(({ id }) => id), [
    'week-1', 'weeks-2-4', 'weeks-4-8', 'weeks-8-12', 'month-3', 'months-4-6',
  ])
  assert.match(acl.phases[0].plan, /ankle pump/)
  assert.doesNotMatch(acl.phases[0].plan, /light straight-line jogging/)
  assert.match(acl.phases[1].plan, /mini-squat 0–30°/)
  assert.match(acl.phases[2].plan, /90–45°/)
  assert.match(acl.phases[3].plan, /balance board/)
  assert.match(acl.phases[4].plan, /暫不安排 running、jumping 或 pivot/)
  assert.match(acl.phases[5].plan, /經放行後由 light straight-line jogging/)
  assert.match(acl.phases[5].plan, /單一 LSI 或術後月份不能單獨決定回場/)
})

test('supplemental head-neck and VATS plans also have stage-specific precautions', () => {
  const headNeck = postopPrescriptions.find(({ id }) => id === 'head-neck-cancer-integrated')!
  const vats = postopPrescriptions.find(({ id }) => id === 'vats-lung-resection-integrated')!
  assert.equal(headNeck.phases.length, 3)
  assert.equal(vats.phases.length, 4)
  for (const { plan } of headNeck.phases) assert.match(plan, /pedicle|donor-site/)
  for (const { plan } of vats.phases) assert.match(plan, /胸管/)
  assert.match(vats.phases[0].plan, /24 小時內/)
  assert.match(vats.phases[3].plan, /pulmonary rehabilitation/)
})

test('admin API returns only the phase-based prescription fields with no-store caching', async () => {
  const response = GET()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store, max-age=0, must-revalidate')
  const data = await response.json()
  assert.equal(data.templates.length, 39)
  assert.equal(data.prescriptions.length, 15)
  for (const prescription of data.prescriptions) {
    assert.deepEqual(Object.keys(prescription).sort(), ['category', 'hint', 'id', 'phases', 'safety', 'title'])
    assert.deepEqual(prescription.phases, postopPrescriptions.find(({ id }) => id === prescription.id)!.phases)
  }
})
