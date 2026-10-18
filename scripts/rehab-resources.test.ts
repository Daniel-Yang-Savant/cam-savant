import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  REHAB_RESOURCES, REGIONAL_CONTACTS, REGIONS, PRIORITY_REGIONS, DISEASE_GROUPS, NEEDS,
  resourceStatus, matchesResource, geographicMatch, groupResourceProviders, isResourceSearchReady, matchingProviders, matchReasons, taipeiDate, toggleProviderSelection,
  type RehabResource, type ResourceFilters,
} from '../lib/rehab-resources'
import ResourceDetails from '../components/rehab-resources/ResourceDetails'
import RehabResourcesPage, { metadata, dynamic } from '../app/(zh)/rehab-resources/page'
import sitemap from '../app/sitemap'

const TODAY = '2026-10-18'
const EMPTY: ResourceFilters = { diseases: [], needs: [], region: '', residence: '', household: '', hospitalRegion: '', kind: '', status: '' }
function fixture(overrides: Partial<RehabResource> = {}): RehabResource {
  return { ...REHAB_RESOURCES[0], id: 'test-resource', status: 'ongoing', checkedAt: TODAY, reviewAfterDays: 30, ...overrides }
}

test('catalogue has unique sourced records, explicit restrictions and real verification dates', () => {
  assert.equal(new Set(REHAB_RESOURCES.map((resource) => resource.id)).size, REHAB_RESOURCES.length)
  const diseases = DISEASE_GROUPS.flatMap((group) => group.items.map((item) => item.id))
  for (const resource of REHAB_RESOURCES) {
    assert.match(resource.id, /^[a-z0-9-]+$/)
    assert.ok(['https:'].includes(new URL(resource.source.url).protocol), resource.id)
    assert.ok(['https:'].includes(new URL(resource.contact.url).protocol), resource.id)
    assert.ok(resource.eligibility.length && resource.documents.length && resource.application && resource.statusNote, resource.id)
    assert.ok(resource.needs.length && resource.needs.every((need) => NEEDS.some((item) => item.id === need)), resource.id)
    assert.ok(resource.diseases === 'all' || resource.diseases.every((disease) => diseases.includes(disease)), resource.id)
    assert.match(resource.checkedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(resource.checkedAt <= TODAY, resource.id)
    assert.ok(resource.reviewAfterDays > 0, resource.id)
    assert.ok(resource.regions.every((region) => region === '全國' || REGIONS.includes(region)), resource.id)
    if (resource.status === 'open') assert.ok(resource.endsOn && resource.verification === 'current-notice', resource.id)
    if (resource.startsOn && resource.endsOn) assert.ok(resource.startsOn <= resource.endsOn, resource.id)
  }
})

test('22 county contacts remain separate from grants; all four priority counties have public and community support', () => {
  assert.equal(REGIONAL_CONTACTS.length, 22)
  assert.equal(new Set(REGIONAL_CONTACTS.map((contact) => contact.region)).size, 22)
  assert.deepEqual([...REGIONAL_CONTACTS.map((contact) => contact.region)].sort(), [...REGIONS].sort())
  const central = groupResourceProviders(REHAB_RESOURCES).filter((provider) => provider.resources.some((resource) => resource.regions.some((region) => region !== '全國' && PRIORITY_REGIONS.includes(region))))
  assert.ok(central.length >= 50, `only ${central.length} distinct central providers`)
  for (const region of PRIORITY_REGIONS) {
    const local = REHAB_RESOURCES.filter((resource) => resource.regions.includes(region))
    assert.ok(local.some((resource) => resource.kind === 'government' && resource.resourceType === 'scheme'), region)
    assert.ok(local.some((resource) => resource.kind === 'hospital'), region)
    assert.ok(local.some((resource) => resource.kind === 'foundation' || resource.kind === 'charity'), region)
  }
})

test('programmes, departments and family foundation sites are grouped into one provider', () => {
  const resources = [
    fixture({ id: 'public-a', kind: 'government', geographicBasis: 'household', organization: '彰化縣政府社會處', regions: ['彰化縣'], diseases: 'all', needs: ['medical'] }),
    fixture({ id: 'public-b', kind: 'government', geographicBasis: 'household', organization: '彰化縣政府／受託服務單位', regions: ['彰化縣'], diseases: 'all', needs: ['assistive'] }),
    fixture({ id: 'ccf-a', organization: '家扶基金會雲林家扶中心', kind: 'foundation', geographicBasis: 'residence', regions: ['雲林縣'] }),
    fixture({ id: 'ccf-b', organization: '家扶基金會南投家扶中心', kind: 'foundation', geographicBasis: 'residence', regions: ['南投縣'] }),
  ]
  const providers = groupResourceProviders(resources)
  assert.equal(providers.length, 2)
  assert.deepEqual(providers.map((provider) => provider.resources.length), [2, 2])
  assert.equal(new Set(providers.map((provider) => provider.id)).size, 2)
  const matching = matchingProviders(resources, { ...EMPTY, diseases: ['stroke'], region: '彰化縣', needs: ['medical'] }, TODAY)
  assert.equal(matching.length, 1)
  assert.deepEqual(matching[0].resources.map((resource) => resource.id), ['public-a'])
})

test('search requires a disease, county and need; the disease options contain only the two defined clinical groups', () => {
  const complete: ResourceFilters = { ...EMPTY, diseases: ['stroke'], region: '彰化縣', needs: ['medical'] }
  assert.equal(isResourceSearchReady(EMPTY), false)
  assert.equal(isResourceSearchReady(complete), true)
  for (const incomplete of [
    { ...complete, diseases: [] }, { ...complete, region: '' as const }, { ...complete, needs: [] },
    { ...EMPTY, diseases: ['stroke'] as const, residence: '彰化縣' as const, needs: ['medical'] as const },
  ]) assert.equal(isResourceSearchReady({ ...incomplete, diseases: [...incomplete.diseases], needs: [...incomplete.needs] }), false)
  assert.equal(DISEASE_GROUPS.length, 2)
  assert.equal(DISEASE_GROUPS.reduce((count, group) => count + group.items.length, 0), 9)
  assert.doesNotMatch(JSON.stringify(DISEASE_GROUPS), /assessing|other|尚未確定/)
})

test('adding newly matched services keeps the same provider selected once and preserves prior services', () => {
  const provider = { id: 'one-provider', name: '同一單位', resources: [fixture({ id: 'service-a' })] }
  const first = toggleProviderSelection([], provider)
  const updated = toggleProviderSelection(first, { ...provider, resources: [fixture({ id: 'service-b' }), fixture({ id: 'service-a' })] })
  assert.equal(updated.length, 1)
  assert.deepEqual(updated[0].resourceIds, ['service-a', 'service-b'])
  assert.deepEqual(first[0].resourceIds, ['service-a'])
  assert.deepEqual(toggleProviderSelection(updated, provider), [])
})

test('a query county narrows local candidates without claiming household, residence or hospital eligibility', () => {
  for (const geographicBasis of ['household', 'residence', 'hospital'] as const) {
    const resource = fixture({ regions: ['彰化縣'], geographicBasis })
    const local = geographicMatch(resource, { ...EMPTY, region: '彰化縣' })
    assert.equal(local.matches, true)
    assert.match(local.reason, /實際資格仍須確認/)
    const otherCounty = geographicMatch(resource, { ...EMPTY, region: '臺中市' })
    assert.equal(otherCounty.matches, false)
    assert.match(otherCounty.reason, /所選臺中市不在/)
  }
  assert.equal(geographicMatch(fixture({ regions: ['全國'], geographicBasis: 'nationwide' }), { ...EMPTY, region: '彰化縣' }).matches, true)
})

test('unknown registered address keeps candidate grants without inferring it from residence', () => {
  const resource = fixture({ regions: ['彰化縣'], geographicBasis: 'household' })
  assert.equal(geographicMatch(resource, { ...EMPTY, residence: '臺北市' }).matches, true)
  assert.match(geographicMatch(resource, { ...EMPTY, residence: '臺北市' }).reason, /尚未提供/)
  const mismatch = geographicMatch(resource, { ...EMPTY, residence: '彰化縣', household: '臺北市' })
  assert.equal(mismatch.matches, false)
  assert.match(mismatch.reason, /不在此資源列示範圍/)
  assert.doesNotMatch(mismatch.reason, /範圍包含臺北市/)
})

test('hospital resources use treatment county, not household or residence', () => {
  const resource = fixture({ regions: ['臺中市'], geographicBasis: 'hospital' })
  assert.equal(matchesResource(resource, { ...EMPTY, residence: '彰化縣', household: '雲林縣', hospitalRegion: '臺中市' }, TODAY), true)
  assert.equal(matchesResource(resource, { ...EMPTY, residence: '臺中市', hospitalRegion: '南投縣' }, TODAY), false)
  assert.equal(matchesResource(resource, { ...EMPTY, residence: '南投縣' }, TODAY), true)
})

test('disease and need selections combine across fields, with broad schemes still discoverable', () => {
  const resource = fixture({ diseases: ['sci'], needs: ['assistive'], regions: ['全國'] })
  assert.equal(matchesResource(resource, { ...EMPTY, diseases: ['stroke', 'sci'], needs: ['transport', 'assistive'] }, TODAY), true)
  assert.equal(matchesResource(resource, { ...EMPTY, diseases: ['stroke'], needs: ['assistive'] }, TODAY), false)
  assert.equal(matchesResource(resource, { ...EMPTY, diseases: ['sci'], needs: ['medical'] }, TODAY), false)
  assert.equal(matchesResource(fixture({ diseases: 'all' }), { ...EMPTY, diseases: ['autism'] }, TODAY), true)
  assert.ok(matchReasons(resource, { ...EMPTY, diseases: ['sci'], needs: ['assistive'] }).some((reason) => reason.includes('脊髓損傷')))
})

test('deadline is inclusive in Taiwan and never rolled to a new year', () => {
  const resource = fixture({ status: 'open', endsOn: '2026-10-18' })
  assert.equal(resourceStatus(resource, '2026-10-18').status, 'open')
  assert.equal(resourceStatus(resource, '2026-10-19').status, 'closed')
  assert.equal(resourceStatus(resource, '2027-01-01').status, 'closed')
  assert.equal(taipeiDate(new Date('2026-10-18T16:05:00Z')), '2026-10-19')
})

test('a future start date and overdue checks do not silently claim applications are open', () => {
  const future = fixture({ status: 'upcoming', startsOn: '2026-10-20' })
  assert.equal(resourceStatus(future, TODAY).status, 'upcoming')
  assert.equal(resourceStatus(future, '2026-10-20').status, 'inquiry')
  const expiredCheck = fixture({ checkedAt: '2026-08-01', reviewAfterDays: 30 })
  assert.equal(resourceStatus(expiredCheck, TODAY).status, 'inquiry')
  assert.equal(resourceStatus(expiredCheck, TODAY).stale, true)
  assert.equal(expiredCheck.checkedAt, '2026-08-01')
  assert.equal(resourceStatus(fixture({ status: 'paused', checkedAt: '2026-08-01' }), TODAY).status, 'paused')
})

test('contact extensions remain human readable without being appended to the telephone number', () => {
  const resource = fixture({ contact: { name: '測試窗口', phone: '04-2236-3595 分機 15、16', url: 'https://example.org/contact' } })
  const html = renderToStaticMarkup(createElement(ResourceDetails, { resource, today: TODAY, print: true }))
  assert.match(html, /href="tel:0422363595"/)
  assert.doesNotMatch(html, /tel:04223635951516/)
  for (const text of ['待確認資格', '文件準備', '申請與轉介方式', '核對日期', resource.source.url]) assert.ok(html.includes(text))
  assert.match(html, /referrerPolicy="no-referrer"/i)
  const multiplePhones = renderToStaticMarkup(createElement(ResourceDetails, { resource: fixture({ contact: { ...resource.contact, phone: '04-7532310、04-7532309' } }), today: TODAY }))
  assert.match(multiplePhones, /href="tel:047532310"/)
  assert.doesNotMatch(multiplePhones, /tel:047532310047532309/)
})

test('page stays static, indexable and has matching canonical and sitemap dates', () => {
  assert.equal(dynamic, 'force-static')
  assert.equal(metadata.alternates?.canonical, '/rehab-resources')
  const entry = sitemap().find((item) => item.url === 'https://camsavant.com/rehab-resources')
  assert.equal((entry?.lastModified as Date).toISOString().slice(0, 10), TODAY)
  const html = renderToStaticMarkup(createElement(RehabResourcesPage))
  assert.match(html, /相關網頁/)
  assert.match(html, /常用政府網站/)
  assert.match(html, /選擇疾病/)
  assert.doesNotMatch(html, /22 縣市官方窗口|收錄範圍、核對方式與使用提醒|筆可能相關的資源|尚未確定/)
  assert.doesNotMatch(html, /aria-label="查詢結果"|ResourcePrintItem|我的資源討論清單/)
  for (const resource of REHAB_RESOURCES) assert.ok(!html.includes(resource.title), resource.id)
  assert.match(html, /disabled=""[^>]*>下一步/)
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1)
})

test('patient selections use no storage, network submission or URL state and printing is scoped to this page', () => {
  const source = readFileSync('components/rehab-resources/ResourceDirectory.tsx', 'utf8')
  assert.doesNotMatch(source, /localStorage|sessionStorage|fetch\(|trackAnalyticsEvent|URLSearchParams|history\.pushState|router\.push/)
  assert.match(source, /window\.print\(\)/)
  const styles = readFileSync('app/(zh)/rehab-resources/resources.css', 'utf8')
  assert.match(styles, /body:has\(\.RehabResourcesPage\)/)
  assert.match(styles, /\.RehabResourcesPage \.ResourcePrintOnly/)
  const home = readFileSync('app/(zh)/page.tsx', 'utf8')
  assert.doesNotMatch(home, /href="\/rehab-resources"/)
  const footer = readFileSync('components/Footer.tsx', 'utf8')
  assert.match(footer, /const siteLinks = isEnglish\s*\?\s*\[[\s\S]*?\]\s*:\s*\[[\s\S]*?\['\/rehab-resources', '補助與援助'\]/)
  assert.match(footer, /siteLinks\.map\([\s\S]*?<Link\s+href=\{href\}\s+prefetch=\{href === '\/rehab-resources' \? false : undefined\}/)
})
