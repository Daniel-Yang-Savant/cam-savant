import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  REHAB_RESOURCES, RESOURCE_GUIDES, matchReasons, matchingProviders, resourceAvailability, resourceStatus, visibleResources,
  type RehabResource, type ResourceFilters,
} from '../lib/rehab-resources'
import { resourceFreshness, resourceQueryDate } from '../lib/rehab-resources/freshness'
import { RESOURCE_UPDATED_AT } from '../lib/rehab-resources'
import { readFileSync } from 'node:fs'
import { COUNTY_RESOURCE_PAGES } from '../lib/rehab-resources/counties'
import ResourceService from '../components/rehab-resources/ResourceService'
import ResourceDetails from '../components/rehab-resources/ResourceDetails'
import { ResourcePrintService } from '../components/rehab-resources/ResourceDirectory'
import CountyResourcePage from '../components/rehab-resources/CountyResourcePage'

const CHECKED_AT = '2026-01-01'
const CONTACT_URL = 'https://example.org/stable-contact'
const SOURCE_URL = 'https://example.org/programme-source'
const EMPTY: ResourceFilters = { diseases: [], needs: [], regions: [], region: '', residence: '', household: '', hospitalRegion: '', kind: '', status: '' }
const original = REHAB_RESOURCES.find((resource) => resource.id === 'changhua-disability-assistive-subsidy')!
assert.ok(original)

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
}

function fixture(overrides: Partial<RehabResource> = {}): RehabResource {
  return {
    ...original,
    organization: '測試穩定單位',
    title: '易變方案標題：限額七人補助九十九萬元',
    benefits: '易變金額：補助999999元、限七名',
    eligibility: ['易變資格：收入及年齡門檻'],
    documents: ['易變文件：特殊年度核定函'],
    application: '易變流程：年度專用送件程序',
    cautions: ['易變限制：本年度只收七名'],
    status: 'open',
    statusNote: '易變狀態：目前受理中，尚餘七名',
    startsOn: '2025-12-31',
    endsOn: '2026-11-30',
    applicationPeriod: '易變期限：2026-11-30以前',
    contact: { name: '測試穩定窗口', phone: '04-1234-5678 分機 9', url: CONTACT_URL },
    source: { title: '易變公告標題：補助999999元', url: SOURCE_URL, publishedOn: '2025-12-12', rocYear: 115 },
    checkedAt: CHECKED_AT,
    reviewAfterDays: 30,
    verification: 'current-notice',
    ...overrides,
  }
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
const includesText = (html: string, value: string) => assert.ok(html.includes(escapeHtml(value)), `missing stable text: ${value}`)

function assertContactOnly(html: string, resource: RehabResource, today: string) {
  const freshness = resourceFreshness(resource, today)
  assert.equal(freshness.level, 'contact-only')
  for (const value of [resource.organization, resource.contact.name, resource.contact.phone!, resource.checkedAt, '金額與期限請向窗口確認', freshness.notice]) includesText(html, value)
  assert.ok(html.includes('href="tel:0412345678"'))
  assert.ok(html.includes(`href="${escapeHtml(freshness.contactUrl!)}"`))
  const guide = RESOURCE_GUIDES[resource.id]
  for (const value of [
    resource.title, resource.benefits, ...resource.eligibility, ...resource.documents,
    resource.application, ...resource.cautions, resource.statusNote, resource.startsOn!, resource.endsOn!,
    resource.applicationPeriod!, resource.source.title, resource.source.publishedOn!,
    guide.help, guide.who, guide.firstStep,
  ]) assert.ok(!html.includes(escapeHtml(value)), `volatile information leaked: ${value}`)
  assert.doesNotMatch(html, /受理中|限七名|限額七人|適用年度：民國 115 年/)
  includesText(html, '最後核對：')
  includesText(html, '申請規定可能已更新，請先打電話向窗口確認。')
  assert.doesNotMatch(html, /逾期\s*\d+\s*天|超過週期|距上次核對/)
}

test('rule cycles remain independent of the fixed 365-day contact retention boundary', () => {
  for (const cycle of [30, 60, 90]) {
    const resource = fixture({ reviewAfterDays: cycle })
    for (const age of [0, cycle - 1, cycle]) {
      const freshness = resourceFreshness(resource, addDays(CHECKED_AT, age))
      assert.equal(freshness.level, 'full', `${cycle}-day cycle at age ${age}`)
      assert.equal(freshness.ageInDays, age)
      assert.equal(freshness.overdueDays, 0)
    }
    for (const age of [cycle + 1, cycle * 2 - 1, cycle * 2, cycle * 2 + 1, 180, 181, 364, 365]) {
      const today = addDays(CHECKED_AT, age)
      const freshness = resourceFreshness(resource, today)
      assert.equal(freshness.level, 'contact-only', `${cycle}-day cycle at age ${age}`)
      assert.equal(freshness.ageInDays, age)
      assert.equal(freshness.overdueDays, age - cycle)
      assert.ok(freshness.notice.trim())
      assert.equal(visibleResources([resource], today).length, 1)
    }
    const hiddenDate = addDays(CHECKED_AT, 366)
    assert.equal(resourceFreshness(resource, hiddenDate).level, 'hidden')
    assert.deepEqual(visibleResources([resource], hiddenDate), [])
  }
})

test('an early device clock keeps the published catalogue and matching results available', () => {
  const filters: ResourceFilters = { ...EMPTY, diseases: ['stroke'], regions: ['彰化縣'], needs: ['assistive'] }
  for (const deviceToday of ['1990-01-01', '2026-10-18', RESOURCE_UPDATED_AT]) {
    const today = resourceQueryDate(deviceToday, RESOURCE_UPDATED_AT)
    assert.equal(today, RESOURCE_UPDATED_AT)
    assert.equal(visibleResources(REHAB_RESOURCES, today).length, REHAB_RESOURCES.length)
    assert.ok(matchingProviders(REHAB_RESOURCES, filters, today).length > 0)
  }
  assert.equal(resourceQueryDate('2026-11-01', RESOURCE_UPDATED_AT), '2026-11-01')
  const source = readFileSync(new URL('../components/rehab-resources/ResourceDirectory.tsx', import.meta.url), 'utf8')
  assert.match(source, /const updateDate = \(\) => setToday\(resourceQueryDate\(taipeiDate\(\), RESOURCE_UPDATED_AT\)\)/)
  assert.match(source, /flushSync\(\(\) => setToday\(resourceQueryDate\(taipeiDate\(\), RESOURCE_UPDATED_AT\)\)\)/)
  assert.doesNotMatch(source, /setToday\(taipeiDate\(\)\)/)
})

test('a check date later than a mis-set device clock is clamped to age zero without hiding the resource', () => {
  const resource = fixture({ checkedAt: '2026-10-20' })
  const freshness = resourceFreshness(resource, '2026-10-18')
  assert.equal(freshness.ageInDays, 0)
  assert.equal(freshness.level, 'full')
  assert.equal(visibleResources([resource], '2026-10-18').length, 1)
})

test('a healthy link does not extend a content check, and the freshness policy makes no network requests or record mutations', () => {
  const resource = fixture()
  const before = JSON.stringify(resource)
  const savedFetch = globalThis.fetch
  let networkCalls = 0
  globalThis.fetch = (() => { networkCalls++; throw new Error('content freshness must not fetch URLs') }) as typeof fetch
  try {
    assert.equal(resourceFreshness(resource, addDays(CHECKED_AT, 31)).level, 'contact-only')
    assert.equal(resourceFreshness(resource, addDays(CHECKED_AT, 365)).level, 'contact-only')
    assert.equal(resourceFreshness(resource, addDays(CHECKED_AT, 366)).level, 'hidden')
    assert.equal(networkCalls, 0)
    assert.equal(JSON.stringify(resource), before)
    assert.equal(resource.checkedAt, CHECKED_AT)
  } finally {
    globalThis.fetch = savedFetch
  }
})

test('invalid review calendars and impossible check dates stay hidden', () => {
  const today = addDays(CHECKED_AT, 5)
  for (const resource of [
    ...[0, -1, Number.NaN, Number.POSITIVE_INFINITY].map((reviewAfterDays) => fixture({ reviewAfterDays })),
    fixture({ checkedAt: '2026-02-30' }),
    fixture({ checkedAt: 'not-a-date' }),
  ]) {
    assert.equal(resourceFreshness(resource, today).level, 'hidden', `${resource.checkedAt} / ${resource.reviewAfterDays}`)
    assert.equal(resourceStatus(resource, today).status, 'inquiry')
    assert.equal(visibleResources([resource], today).length, 0)
  }
})

test('a source 404 immediately removes volatile claims while preserving a working official contact', () => {
  const today = addDays(CHECKED_AT, 5)
  const resource = fixture({ reviewEvidence: [{ kind: 'not-found', observedAt: today, url: SOURCE_URL }] })
  const freshness = resourceFreshness(resource, today)
  assert.equal(freshness.level, 'contact-only')
  assert.equal(freshness.contactUrl, CONTACT_URL)
  assert.equal(resourceStatus(resource, today).status, 'inquiry')
  assert.equal(visibleResources([resource], today).length, 1)
  const html = renderToStaticMarkup(createElement(ResourceDetails, { resource, today, print: true }))
  assertContactOnly(html, resource, today)
  assert.ok(!html.includes(`href="${SOURCE_URL}"`))
  assert.ok(!html.includes(`>${SOURCE_URL}<`))
})

test('a broken contact link falls back to a verified source link; two broken links preserve only a usable phone', () => {
  const today = addDays(CHECKED_AT, 5)
  const contactBroken = fixture({ reviewEvidence: [{ kind: 'not-found', observedAt: today, url: CONTACT_URL }] })
  assert.equal(resourceFreshness(contactBroken, today).contactUrl, SOURCE_URL)
  const html = renderToStaticMarkup(createElement(ResourceDetails, { resource: contactBroken, today, print: true }))
  assert.ok(html.includes(`href="${SOURCE_URL}"`))
  assert.ok(!html.includes(CONTACT_URL))
  assert.equal([...html.matchAll(/<svg\b/g)].length, 1)

  const bothBroken = fixture({ reviewEvidence: [
    { kind: 'not-found', observedAt: today, url: CONTACT_URL },
    { kind: 'not-found', observedAt: today, url: SOURCE_URL },
  ] })
  assert.equal(resourceFreshness(bothBroken, today).level, 'contact-only')
  assert.equal(resourceFreshness(bothBroken, today).contactUrl, undefined)
  const phoneOnly = renderToStaticMarkup(createElement(ResourceDetails, { resource: bothBroken, today, print: true }))
  includesText(phoneOnly, bothBroken.contact.name)
  assert.match(phoneOnly, /href="tel:0412345678"/)
  assert.doesNotMatch(phoneOnly, /<svg\b/)
  assert.ok(!phoneOnly.includes(CONTACT_URL) && !phoneOnly.includes(SOURCE_URL))
  const noUsableRoute = { ...bothBroken, contact: { ...bothBroken.contact, phone: undefined } }
  assert.equal(resourceFreshness(noUsableRoute, today).level, 'hidden')
  assert.equal(visibleResources([noUsableRoute], today).length, 0)
})

test('official discontinuation hides a fresh scheme immediately, including when the separate phone is still reachable', () => {
  const today = addDays(CHECKED_AT, 2)
  const resource = fixture({ reviewEvidence: [{ kind: 'discontinued', observedAt: today, url: SOURCE_URL, sourceUrl: 'https://example.org/official-discontinued-notice' }] })
  assert.equal(resourceFreshness(resource, today).level, 'hidden')
  assert.equal(visibleResources([resource], today).length, 0)
  assert.equal(renderToStaticMarkup(createElement(ResourceService, { resource, today })), '')
  for (const props of [{}, { detailsOnly: true }, { print: true }]) assert.equal(renderToStaticMarkup(createElement(ResourceDetails, { resource, today, ...props })), '')
})

test('only an explicit content verification for the same URL can resolve negative evidence, and it must also be reflected in checkedAt', () => {
  const negativeAt = addDays(CHECKED_AT, 2)
  const verifiedAt = addDays(CHECKED_AT, 4)
  const today = addDays(CHECKED_AT, 5)
  const negative: NonNullable<RehabResource['reviewEvidence']>[number] = { kind: 'not-found', observedAt: negativeAt, url: SOURCE_URL }
  const verified: NonNullable<RehabResource['reviewEvidence']>[number] = { kind: 'content-verified', observedAt: verifiedAt, url: SOURCE_URL }
  const unresolved = fixture({ reviewEvidence: [negative, verified] })
  assert.equal(resourceFreshness(unresolved, today).level, 'contact-only', 'a content evidence entry alone must not silently refresh the resource')
  const resolved = { ...unresolved, checkedAt: verifiedAt }
  assert.equal(resourceFreshness(resolved, today).level, 'full')
  assert.equal(resourceFreshness({ ...resolved, reviewEvidence: [verified, negative] }, today).level, 'full', 'evidence input order must not change the outcome')
  assert.equal(resourceFreshness({ ...resolved, reviewEvidence: [negative, { ...verified, url: CONTACT_URL }] }, today).level, 'contact-only', 'an unrelated contact check cannot prove the source is correct')
  assert.equal(resourceFreshness({ ...resolved, reviewEvidence: [{ ...negative, observedAt: today }, verified] }, today).level, 'contact-only', 'a newer failure supersedes an earlier successful content check')
  const sameDay = fixture({ checkedAt: negativeAt, reviewEvidence: [negative, { ...verified, observedAt: negativeAt }] })
  assert.equal(resourceFreshness(sameDay, today).level, 'full')
  const failedAfterSameDayCheck = { ...sameDay, reviewEvidence: [{ ...verified, observedAt: negativeAt }, negative] }
  assert.equal(resourceFreshness(failedAfterSameDayCheck, today).level, 'contact-only', 'a later same-day failure immediately supersedes the preceding content check')
  const sameDayStopped = { ...sameDay, reviewEvidence: [{ ...verified, observedAt: negativeAt }, { ...negative, kind: 'discontinued' as const }] }
  assert.equal(resourceFreshness(sameDayStopped, today).level, 'hidden', 'a later same-day discontinuation notice is not cancelled by an earlier check')
})

test('future observations neither downgrade today nor prematurely resolve existing negative evidence', () => {
  const today = addDays(CHECKED_AT, 3)
  const futureAt = addDays(today, 1)
  assert.equal(resourceFreshness(fixture({ reviewEvidence: [{ kind: 'discontinued', observedAt: futureAt, url: SOURCE_URL }] }), today).level, 'full')
  const resource = fixture({ reviewEvidence: [
    { kind: 'not-found', observedAt: addDays(CHECKED_AT, 1), url: SOURCE_URL },
    { kind: 'content-verified', observedAt: futureAt, url: SOURCE_URL },
  ] })
  assert.equal(resourceFreshness(resource, today).level, 'contact-only')
})

test('overdue cards, expanded details and printouts retain contacts without leaking old amounts, dates, quotas or application claims', () => {
  const resource = fixture()
  const today = addDays(CHECKED_AT, 31)
  for (const component of [
    createElement(ResourceService, { resource, today }),
    createElement(ResourceDetails, { resource, today }),
    createElement(ResourceDetails, { resource, today, detailsOnly: true }),
    createElement(ResourceDetails, { resource, today, print: true }),
  ]) assertContactOnly(renderToStaticMarkup(component), resource, today)
  const printed = renderToStaticMarkup(createElement(ResourceDetails, { resource, today, print: true }))
  assert.equal([...printed.matchAll(/<svg\b/g)].length, 1)
  assert.ok(printed.includes(`data-resource-qr="${resource.id}"`))
  assert.doesNotMatch(printed, /api\.qrserver|chart\.googleapis|quickchart\.io/)
  assert.equal(resourceAvailability(resource, today).showBadge, false)
})

test('fresh content keeps verified rules, while records over 365 days render nothing even if directly passed to a component', () => {
  const resource = fixture()
  const fresh = renderToStaticMarkup(createElement(ResourceDetails, { resource, today: addDays(CHECKED_AT, 30), print: true }))
  for (const value of [resource.benefits, ...resource.eligibility, ...resource.documents, resource.endsOn!, resource.applicationPeriod!]) includesText(fresh, value)
  for (const component of [
    createElement(ResourceService, { resource, today: addDays(CHECKED_AT, 366) }),
    createElement(ResourceDetails, { resource, today: addDays(CHECKED_AT, 366), print: true }),
  ]) assert.equal(renderToStaticMarkup(component), '')
})

test('the actual print-service wrapper omits stale programme titles and eligibility reasons as well as the inner rules', () => {
  const resource = fixture()
  const filters: ResourceFilters = { ...EMPTY, diseases: ['sci'], regions: ['臺中市'], needs: ['medical'] }
  const today = addDays(CHECKED_AT, 31)
  const html = renderToStaticMarkup(createElement(ResourcePrintService, { resource, filters, today }))
  assertContactOnly(html, resource, today)
  assert.doesNotMatch(html, /本次查詢的需求|這項服務與目前篩選條件不同/)
  for (const reason of matchReasons(resource, filters)) assert.ok(!html.includes(escapeHtml(reason)), reason)
  assert.equal([...html.matchAll(/<svg\b/g)].length, 1)
  const hidden = renderToStaticMarkup(createElement(ResourcePrintService, { resource, filters, today: addDays(CHECKED_AT, 366) }))
  assert.equal(hidden, '')
})

test('full records outrank contact-only specialists; a provider with mixed freshness uses its fresh service to rank', () => {
  const today = addDays(CHECKED_AT, 31)
  const filters: ResourceFilters = { ...EMPTY, regions: ['彰化縣'], diseases: ['sci'], needs: ['medical', 'care'] }
  const staleSpecialist = fixture({ id: 'stale-specific', kind: 'foundation', organization: '舊資料單位', diseases: ['sci'], needs: ['medical', 'care'] })
  const freshGeneral = fixture({ id: 'fresh-general', kind: 'foundation', organization: '新資料單位', checkedAt: today, diseases: 'all', needs: ['medical'] })
  assert.deepEqual(matchingProviders([staleSpecialist, freshGeneral], filters, today).map((provider) => provider.id), ['新資料單位', '舊資料單位'])

  const sharedFresh = { ...freshGeneral, id: 'shared-fresh', organization: staleSpecialist.organization }
  const otherFreshSpecific = { ...freshGeneral, id: 'other-specialist', diseases: ['sci'] as RehabResource['diseases'], organization: '新疾病專屬單位' }
  const mixed = matchingProviders([staleSpecialist, sharedFresh, otherFreshSpecific], filters, today)
  assert.deepEqual(mixed.map((provider) => provider.id), ['新疾病專屬單位', '舊資料單位'])
  assert.deepEqual(mixed[1].resources.map((resource) => resource.id), ['shared-fresh', 'stale-specific'])
})

test('county server-rendered pages use the same contact-only protection and omit withdrawn or long-expired programmes from their ItemList', () => {
  const county = COUNTY_RESOURCE_PAGES.find((item) => item.slug === 'changhua')!
  const today = addDays(CHECKED_AT, 31)
  const resource = fixture()
  const html = renderToStaticMarkup(createElement(CountyResourcePage, { county, resources: [resource], today }))
  assertContactOnly(html, resource, today)
  assert.equal([...html.matchAll(/<article\b/g)].length, 1)
  assert.match(html, /"numberOfItems":1/)
  for (const hidden of [
    { ...resource, checkedAt: addDays(CHECKED_AT, -335) },
    { ...resource, reviewEvidence: [{ kind: 'discontinued' as const, observedAt: today, url: SOURCE_URL }] },
  ]) {
    const hiddenHtml = renderToStaticMarkup(createElement(CountyResourcePage, { county, resources: [hidden], today }))
    assert.equal([...hiddenHtml.matchAll(/<article\b/g)].length, 0)
    assert.match(hiddenHtml, /"numberOfItems":0/)
    assert.ok(!hiddenHtml.includes(resource.title))
  }
})
