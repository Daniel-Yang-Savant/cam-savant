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

test('each copied hemophilia Plan retains bleeding and procedure precautions', () => {
  for (const { id, plan } of hemophiliaTemplates) {
    assert.match(plan, /hematolog|hemophilia treatment cent(?:er|re)|\bHTC\b/i, `${id}: coordination with the treating team survives copying`)
    assert.match(plan, /stop|suspend|withhold/i, `${id}: the plan includes a reason to stop treatment`)
    assert.match(plan, /bleed/i, `${id}: reassessment for bleeding survives copying`)
    assert.match(plan, /emergency|urgent/i, `${id}: escalation advice survives copying`)
    assert.match(plan, /invasive|injection|needling|aspiration/i, `${id}: procedural precautions survive copying`)
    assert.match(plan, /hemosta|haemosta/i, `${id}: bleeding protection survives copying`)
    assert.match(plan, /negative ultrasound alone[^.]*exclude[^.]*bleed/i, `${id}: a negative scan cannot independently clear suspected bleeding`)
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
  assert.match(acute.plan, /emicizumab[^.]*does not treat[^.]*acute bleed/i)
  assert.match(acute.plan, /iliopsoas[^.]*avoid walking/i)

  assert.match(recovery.plan, /confirm bleeding control/i)
  assert.match(recovery.plan, /hemostatic coverage/i)
  assert.match(recovery.plan, /when cleared and acute pain has subsided/i)
  assert.match(recovery.plan, /pre-bleed function/i, 'recovery goals use the individual baseline')

  assert.match(stable.plan, /new pain, warmth, swelling[^.]*stop loading/i)
  assert.match(stable.plan, /low-impact/i)
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
