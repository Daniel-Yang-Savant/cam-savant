import assert from 'node:assert/strict'
import test from 'node:test'
import { hemophiliaTemplates } from '../lib/opd-hemophilia'
import { GET } from '../app/api/admin/opd/templates/route'

test('hemophilia templates provide distinct, independently copyable English O and P sections', () => {
  assert.deepEqual(hemophiliaTemplates.map(({ id }) => id).sort(), [
    'hemophilia-acute-bleed',
    'hemophilia-arthropathy',
    'hemophilia-recovery',
  ])
  assert.equal(new Set(hemophiliaTemplates.map(({ objective }) => objective)).size, 3)
  assert.equal(new Set(hemophiliaTemplates.map(({ plan }) => plan)).size, 3)

  for (const { id, title, hint, objective, plan, safetyZh } of hemophiliaTemplates) {
    assert.ok(title.trim(), id)
    assert.ok(hint.trim(), id)
    assert.match(safetyZh, /\p{Script=Han}/u, `${id}: the workspace safety reminder stays Chinese`)
    const planLines = plan.trim().split('\n')
    assert.ok(planLines.length >= 4 && planLines.length <= 5, `${id}: Plan stays within four to five actionable items`)
    for (const [index, line] of planLines.entries()) {
      assert.ok(line.startsWith(`${index + 1}. `), `${id}: each Plan item is visibly numbered`)
      assert.match(line, /^\d+\. [A-Za-z /]+: .+/, `${id}: each item has a clear activity label`)
      assert.ok(line.split(/\s+/).length <= 40, `${id}: each item stays concise instead of becoming a paragraph`)
    }
    for (const [section, text] of [['O', objective], ['P', plan]]) {
      assert.ok(text.trim(), `${id}: ${section} is not empty`)
      assert.match(text, /_{4}/, `${id}: ${section} has fields for individual findings or orders`)
      assert.doesNotMatch(text, /\p{Script=Han}|[：；，。／＿｜]/u, `${id}: copied ${section} stays English`)
      assert.doesNotMatch(text, /undefined|\[object Object\]|(?:^|\n)[SOAP]:/, `${id}: ${section} is usable without copying other sections`)
      assert.doesNotMatch(text, /\b\d+(?:\.\d+)?\s*(?:mg|mcg|IU|U|units|mL)\s*(?:\/\s*kg)?\b/i, `${id}: no preset medication doses`)
    }
    for (const line of objective.split('\n').filter((line) => line.trim())) {
      assert.match(line, /_{4}/, `${id}: objective findings require completion instead of implied assessment`)
    }
    assert.doesNotMatch(objective, /:\s*(?:normal|intact|negative|full and symmetric|5\/5|0\/10)\b/i, `${id}: no prefilled normal examination results`)
    assert.doesNotMatch(objective, /:\s*\d+(?:\.\d+)?\s*(?:°|(?:degrees|cm|mmHg)\b)/i, `${id}: measured findings must be entered by the clinician`)
  }
})

test('each copied hemophilia Plan retains bleeding stop rules, with procedure cautions in the workspace', () => {
  for (const { id, plan, safetyZh } of hemophiliaTemplates) {
    assert.match(plan, /hematolog|hemophilia treatment cent(?:er|re)|\bHTC\b/i, `${id}: coordination with the treating team survives copying`)
    assert.match(plan, /stop|suspend|withhold/i, `${id}: the plan includes a reason to stop treatment`)
    assert.match(plan, /bleed/i, `${id}: reassessment for bleeding survives copying`)
    assert.match(plan, /emergency|urgent/i, `${id}: escalation advice survives copying`)
    assert.match(safetyZh, /侵入性|針刺|注射|抽吸/, `${id}: procedural precautions remain visible in the workspace`)
    assert.match(plan, /hemosta|haemosta/i, `${id}: bleeding protection survives copying`)
  }
})

test('acute, recovery, and stable plans retain different clinical entry and progression criteria', () => {
  const acute = hemophiliaTemplates.find(({ id }) => id === 'hemophilia-acute-bleed')
  const recovery = hemophiliaTemplates.find(({ id }) => id === 'hemophilia-recovery')
  const stable = hemophiliaTemplates.find(({ id }) => id === 'hemophilia-arthropathy')
  assert.ok(acute)
  assert.ok(recovery)
  assert.ok(stable)

  assert.match(acute.objective, /no forced ROM or resisted testing/i)
  assert.match(acute.plan, /without waiting for[^.]*imaging/i, 'suspected bleeding treatment cannot wait for imaging')
  assert.match(acute.plan, /suspend rehabilitation|suspend loading/i)
  assert.match(acute.safetyZh, /emicizumab.*不能取代急性止血/)
  assert.match(acute.plan, /iliopsoas[^.]*avoid walking/i)
  assert.match(acute.safetyZh, /陰性超音波不能單獨排除出血/)
  assert.match(acute.plan, /lower-limb muscle bleed \(not iliopsoas\)[^.]*pain-free opposite-limb ROM without moving\/loading the bleeding region/i)
  assert.match(acute.plan, /only after bleeding control[^.]*HTC clearance[^.]*AROM\/AAROM/i)

  assert.match(recovery.plan, /confirm bleeding control/i)
  assert.match(recovery.plan, /hemostatic coverage/i)
  assert.match(recovery.plan, /once acute pain subsides[^.]*pain-free AROM\/AAROM/i)
  assert.match(recovery.plan, /pre-bleed function/i, 'recovery goals use the individual baseline')
  assert.match(recovery.plan, /isometric contractions/i)
  assert.match(recovery.plan, /resistance-band exercises/i)
  assert.match(recovery.plan, /supported standing balance/i)

  assert.match(stable.plan, /new pain, warmth, swelling[^.]*stop loading/i)
  assert.match(stable.plan, /low-impact/i)
  assert.match(stable.plan, /walking, stationary cycling, or swimming/i)
  assert.match(stable.plan, /light resistance bands/i)
  assert.match(stable.plan, /avoid forcing a fixed contracture/i)
})

test('hemophilia source and review metadata accompanies each clinical template', () => {
  for (const { id, sources, reviewedAt } of hemophiliaTemplates) {
    assert.ok(sources.length > 0, `${id}: clinical guidance has references`)
    assert.equal(new Set(sources.map(({ url }) => url)).size, sources.length, `${id}: no duplicate references`)
    for (const { label, url } of sources) {
      assert.ok(label.trim(), `${id}: each reference has a readable label`)
      assert.equal(new URL(url).protocol, 'https:', `${id}: each reference has an HTTPS URL`)
    }
    assert.match(reviewedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.equal(new Date(reviewedAt).toISOString().slice(0, 10), reviewedAt)
  }
})

test('admin API exposes the complete hemophilia O/P library without caching or replacing existing libraries', async () => {
  const response = GET()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store, max-age=0, must-revalidate')
  const data = await response.json()
  assert.equal(data.templates.length, 39)
  assert.equal(data.prescriptions.length, 15)
  assert.deepEqual(data.hemophiliaTemplates, hemophiliaTemplates)
  for (const template of data.hemophiliaTemplates) {
    assert.deepEqual(Object.keys(template).sort(), [
      'hint', 'id', 'objective', 'plan', 'reviewedAt', 'safetyZh', 'sources', 'title',
    ])
  }
})
