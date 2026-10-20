import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { REHAB_RESOURCES, type RehabResource } from '../lib/rehab-resources'
import { resourceFreshness } from '../lib/rehab-resources/freshness'
import { formatResourceReviewWarnings, resourceReviewWarnings } from '../lib/rehab-resources/review-warnings'

const original = REHAB_RESOURCES.find((resource) => resource.id === 'changhua-disability-assistive-subsidy')!
assert.ok(original)
const second = REHAB_RESOURCES.find((resource) => resource.id === 'national-1957-welfare')!
assert.ok(second)

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
}

function fixture(overrides: Partial<RehabResource> = {}): RehabResource {
  return { ...original, checkedAt: '2026-10-18', reviewAfterDays: 30, reviewEvidence: undefined, ...overrides }
}

test('review warnings include transitions in 1–28 days, and exclude today and day 29', () => {
  const resource = fixture()
  const transition = '2026-11-18'
  for (const daysUntil of [1, 28]) {
    const report = resourceReviewWarnings([resource], addDays(transition, -daysUntil))
    assert.deepEqual(report.ruleReviews, [{ date: transition, resources: [resource] }])
    assert.deepEqual(report.contactExpiries, [])
  }
  for (const daysUntil of [0, 29]) {
    const report = resourceReviewWarnings([resource], addDays(transition, -daysUntil))
    assert.deepEqual(report.ruleReviews, [])
  }
  assert.equal(resourceFreshness(resource, '2026-11-17').level, 'full')
  assert.equal(resourceFreshness(resource, transition).level, 'contact-only')
})

test('contact expiry warnings include days 1–30, keep day 365 and exclude day 31 or already hidden', () => {
  const resource = fixture({ checkedAt: '2025-10-19' })
  const hideOn = '2026-10-20'
  for (const daysUntil of [1, 30]) {
    const today = addDays(hideOn, -daysUntil)
    const report = resourceReviewWarnings([resource], today)
    assert.equal(resourceFreshness(resource, today).level, 'contact-only')
    assert.deepEqual(report.ruleReviews, [])
    assert.deepEqual(report.contactExpiries, [{ date: hideOn, resources: [resource] }])
  }
  for (const daysUntil of [0, 31, -1]) {
    assert.deepEqual(resourceReviewWarnings([resource], addDays(hideOn, -daysUntil)).contactExpiries, [])
  }
  assert.equal(resourceFreshness(resource, addDays(resource.checkedAt, 365)).level, 'contact-only')
  assert.equal(resourceFreshness(resource, hideOn).level, 'hidden')
})

test('calendar arithmetic handles leap days and year boundaries', () => {
  const leap = fixture({ checkedAt: '2028-01-29', reviewAfterDays: 30 })
  assert.equal(resourceReviewWarnings([leap], '2028-02-01').ruleReviews[0].date, '2028-02-29')
  const yearEnd = fixture({ checkedAt: '2026-12-10', reviewAfterDays: 30 })
  assert.equal(resourceReviewWarnings([yearEnd], '2026-12-14').ruleReviews[0].date, '2027-01-10')
  const leapContact = fixture({ checkedAt: '2028-02-29' })
  assert.equal(resourceReviewWarnings([leapContact], '2029-02-01').contactExpiries[0].date, '2029-03-01')
})

test('warnings follow publication and negative-evidence policy rather than only dates', () => {
  const today = '2026-10-21'
  const discontinued = fixture({ reviewEvidence: [{ kind: 'discontinued', observedAt: today, url: original.source.url }] })
  const broken = fixture({ reviewEvidence: [{ kind: 'not-found', observedAt: today, url: original.source.url }] })
  const held = fixture({ id: 'nantou-early-intervention-subsidy' })
  const directory = fixture({ resourceType: 'directory' })
  const unknown = fixture({ id: 'unpublished-fixture' })
  for (const resource of [discontinued, broken, held, directory, unknown]) {
    assert.deepEqual(resourceReviewWarnings([resource], today).ruleReviews, [], resource.id)
  }
  const ageingBroken = { ...broken, checkedAt: '2025-11-01' }
  assert.equal(resourceReviewWarnings([ageingBroken], today).contactExpiries[0].date, '2026-11-02')
  const futureWithdrawal = fixture({ reviewEvidence: [{ kind: 'discontinued', observedAt: '2026-11-18', url: original.source.url }] })
  assert.deepEqual(resourceReviewWarnings([futureWithdrawal], today).ruleReviews, [])
})

test('a cycle that reaches the contact retention limit without a contact-only transition is not warned as a rules downgrade', () => {
  for (const reviewAfterDays of [365, 366, 400]) {
    const resource = fixture({ checkedAt: '2025-11-01', reviewAfterDays })
    assert.deepEqual(resourceReviewWarnings([resource], '2026-10-21').ruleReviews, [])
  }
})

test('warning groups sort by transition date and resource id without mutating the input', () => {
  const early = fixture({ checkedAt: '2026-10-01' })
  const late = fixture({ checkedAt: '2026-10-02' })
  const sameDate = { ...late, id: second.id, title: second.title, organization: second.organization }
  const resources = [sameDate, late, early]
  const before = structuredClone(resources)
  const report = resourceReviewWarnings(resources, '2026-10-10')
  assert.deepEqual(report.ruleReviews.map((group) => group.date), ['2026-11-01', '2026-11-02'])
  assert.deepEqual(report.ruleReviews[1].resources.map((resource) => resource.id), [late.id, sameDate.id].sort())
  assert.deepEqual(resources, before)
  const formatted = formatResourceReviewWarnings(report)
  assert.match(formatted, /2026-11-01（1 筆）/)
  assert.match(formatted, /2026-11-02（2 筆）/)
  for (const resource of resources) {
    for (const value of [resource.id, resource.title, resource.organization, resource.checkedAt]) assert.ok(formatted.includes(value), value)
  }
})

test('empty reminders remain readable and malformed dates produce a diagnostic error for the advisory CLI', () => {
  const report = resourceReviewWarnings([], '2026-10-20')
  const formatted = formatResourceReviewWarnings(report)
  assert.match(formatted, /台北日期 2026-10-20/)
  assert.match(formatted, /未來 28 天.*0 筆/)
  assert.match(formatted, /未來 30 天.*0 筆/)
  assert.match(formatted, /本次沒有即將到期的項目/)
  assert.throws(() => resourceReviewWarnings([], '2026-02-30'), /無效日期/)
})

test('advisory command writes warnings to stderr and completes successfully', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/check-rehab-resource-reviews.ts'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /補助與援助複核提醒/)
  assert.match(result.stderr, /僅提醒，不阻擋建置/)
})
