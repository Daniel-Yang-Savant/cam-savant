import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  REHAB_RESOURCES, RESOURCE_GUIDES, RESOURCE_UPDATED_AT, REGIONAL_CONTACTS, REGIONS, PRIORITY_REGIONS, PUBLICATION_HOLDS,
  geographicMatch, matchesResource, matchingProviders, groupResourceProviders, queryRegions, isResourceSearchReady,
  resourceAvailability, visibleResources, taipeiDate, type RehabResource, type ResourceFilters,
} from '../lib/rehab-resources'
import { COUNTY_RESOURCE_PAGES, countyResourceTitle } from '../lib/rehab-resources/counties'
import { PREREQUISITE_HEALTH_RESOURCES } from '../lib/rehab-resources/prerequisites-health'
import { PREREQUISITE_INSURANCE_RESOURCES } from '../lib/rehab-resources/prerequisites-insurance'
import { resourceReportUrl } from '../lib/rehab-resources/report'
import { LINE_ID } from '../lib/site'
import ResourceDetails from '../components/rehab-resources/ResourceDetails'
import ResourceService from '../components/rehab-resources/ResourceService'
import RegionalContactCards from '../components/rehab-resources/RegionalContactCards'
import CountyPage, { dynamic, dynamicParams, generateMetadata, generateStaticParams } from '../app/(zh)/rehab-resources/[county]/page'
import sitemap from '../app/sitemap'

const TODAY = '2026-10-20'
const EMPTY: ResourceFilters = { diseases: [], needs: [], regions: [], region: '', residence: '', household: '', hospitalRegion: '', kind: '', status: '' }
const record = (id: string) => {
  const resource = REHAB_RESOURCES.find((item) => item.id === id)
  assert.ok(resource, `missing public record: ${id}`)
  return resource
}
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
const includesText = (html: string, value: string, context: string) => assert.ok(html.includes(escapeHtml(value)), context)
function fixture(id: string, overrides: Partial<RehabResource> = {}): RehabResource {
  return {
    ...REHAB_RESOURCES[0], id, title: id, organization: id, kind: 'foundation', resourceType: 'referral',
    regions: ['全國'], geographicBasis: 'nationwide', diseases: 'all', diseaseSpecific: undefined,
    needs: ['medical'], status: 'ongoing', checkedAt: TODAY, reviewAfterDays: 90, ...overrides,
  }
}

test('multi-county search includes a Yunlin household benefit and CCH care without unrelated Taichung-only services', () => {
  const filters: ResourceFilters = { ...EMPTY, regions: ['雲林縣', '彰化縣'], diseases: ['stroke'], needs: ['medical', 'living', 'assistive'] }
  assert.equal(isResourceSearchReady(filters), true)
  const resources = matchingProviders(REHAB_RESOURCES, filters, TODAY).flatMap((provider) => provider.resources)
  assert.ok(resources.some((resource) => resource.id === 'yunlin-disability-living-allowance'))
  assert.ok(resources.some((resource) => resource.id === 'cch-social-work-referral'))
  assert.equal(record('yunlin-disability-living-allowance').geographicBasis, 'household')
  assert.equal(record('cch-social-work-referral').geographicBasis, 'hospital')
  assert.ok(resources.every((resource) => resource.regions.includes('全國') || resource.geographicBasis === 'nationwide' || resource.regions.some((region) => region === '雲林縣' || region === '彰化縣')))
  assert.ok(!resources.some((resource) => resource.regions.length === 1 && resource.regions[0] === '臺中市'))
  assert.deepEqual(queryRegions({ ...filters, regions: ['雲林縣', '彰化縣', '雲林縣'] }), ['雲林縣', '彰化縣'])
})

test('legacy single-county queries and separate household/hospital checks remain compatible', () => {
  const filters: ResourceFilters = { ...EMPTY, region: '彰化縣', diseases: ['stroke'], needs: ['medical'] }
  const oldIds = matchingProviders(REHAB_RESOURCES, filters, TODAY).flatMap((provider) => provider.resources.map((resource) => resource.id)).sort()
  const newIds = matchingProviders(REHAB_RESOURCES, { ...filters, region: '', regions: ['彰化縣'] }, TODAY).flatMap((provider) => provider.resources.map((resource) => resource.id)).sort()
  assert.deepEqual(oldIds, newIds)
  assert.equal(isResourceSearchReady(filters), true)
  assert.equal(geographicMatch(record('cch-social-work-referral'), { ...EMPTY, household: '雲林縣', hospitalRegion: '彰化縣' }).matches, true)
  assert.equal(geographicMatch(record('cch-social-work-referral'), { ...EMPTY, household: '彰化縣', hospitalRegion: '臺中市' }).matches, false)
})

test('provider relevance favours disease expertise, then need coverage, then local availability', () => {
  const filters: ResourceFilters = { ...EMPTY, regions: ['彰化縣'], diseases: ['sci'], needs: ['medical', 'assistive', 'care'] }
  const broadLocal = fixture('broad-local', { regions: ['彰化縣'], geographicBasis: 'residence', needs: ['medical', 'assistive', 'care'] })
  const specialist = fixture('specialist', { diseases: ['sci'], needs: ['medical'] })
  assert.deepEqual(matchingProviders([broadLocal, specialist], filters, TODAY).map((provider) => provider.id), ['specialist', 'broad-local'])

  const twoNeeds = fixture('two-needs', { diseases: ['sci'], needs: ['medical', 'assistive'] })
  const oneNeedLocal = fixture('one-need-local', { diseases: ['sci'], regions: ['彰化縣'], geographicBasis: 'residence', needs: ['medical'] })
  assert.deepEqual(matchingProviders([oneNeedLocal, twoNeeds], filters, TODAY).map((provider) => provider.id), ['two-needs', 'one-need-local'])

  const oneNeedNational = fixture('one-need-national', { diseases: ['sci'], needs: ['medical'] })
  assert.deepEqual(matchingProviders([oneNeedNational, oneNeedLocal], filters, TODAY).map((provider) => provider.id), ['one-need-local', 'one-need-national'])
})

test('a cause-dependent insurance route receives no disease-specialist bonus', () => {
  const filters: ResourceFilters = { ...EMPTY, regions: ['彰化縣'], diseases: ['sci'], needs: ['medical'] }
  const insurance = fixture('cause-dependent', { kind: 'insurance', diseases: ['sci'], diseaseSpecific: false })
  const generalLocal = fixture('general-local', { regions: ['彰化縣'], geographicBasis: 'residence' })
  const specialist = fixture('disease-specialist', { diseases: ['sci'] })
  assert.deepEqual(matchingProviders([insurance, generalLocal, specialist], filters, TODAY).map((provider) => provider.id), ['disease-specialist', 'general-local', 'cause-dependent'])
})

test('amputation searches retain trauma insurance routes while actual accident eligibility remains separate', () => {
  const filters: ResourceFilters = { ...EMPTY, regions: ['彰化縣'], diseases: ['amputation'], needs: ['benefits'] }
  const ids = matchingProviders(REHAB_RESOURCES, filters, TODAY).flatMap((provider) => provider.resources.map((resource) => resource.id))
  for (const id of ['national-occupational-accident-insurance', 'national-occupational-functional-rehabilitation', 'national-compulsory-auto-insurance-guidance', 'national-motor-accident-compensation-fund']) {
    assert.ok(ids.includes(id), id)
    assert.equal(record(id).diseaseSpecific, false, id)
  }
})

test('a provider cannot outrank a better match by publishing many overlapping services', () => {
  const filters: ResourceFilters = { ...EMPTY, regions: ['彰化縣'], diseases: ['stroke'], needs: ['medical', 'care'] }
  const many = Array.from({ length: 20 }, (_, index) => fixture(`many-${index}`, { organization: 'many-programmes', needs: ['medical'] }))
  const best = fixture('one-complete-service', { organization: 'one-better-provider', needs: ['medical', 'care'] })
  const ranked = matchingProviders([...many, best], filters, TODAY)
  assert.deepEqual(ranked.map((provider) => provider.id), ['one-better-provider', 'many-programmes'])
  assert.equal(ranked[1].resources.length, 20)
  const oneBetterProgramme = fixture('many-best', { organization: 'many-programmes', diseases: ['stroke'], needs: ['medical', 'care'] })
  const updated = matchingProviders([...many, best, oneBetterProgramme], filters, TODAY)
  assert.equal(updated.length, 2)
  assert.equal(updated[0].id, 'many-programmes')
  assert.equal(updated[0].resources[0].id, 'many-best')
})

test('Kaohsiung and every non-central county expose a direct official contact outside the grants list', () => {
  const outside = REGIONS.filter((region) => !PRIORITY_REGIONS.includes(region))
  assert.equal(outside.length, 18)
  for (const region of outside) {
    const contact = REGIONAL_CONTACTS.find((item) => item.region === region)
    assert.ok(contact, region)
    const html = renderToStaticMarkup(createElement(RegionalContactCards, { regions: [region] }))
    includesText(html, region, region)
    includesText(html, contact.name, region)
    assert.ok(html.includes(`href="${escapeHtml(contact.url)}"`), region)
    if (contact.earlyInterventionUrl) assert.ok(html.includes(`href="${escapeHtml(contact.earlyInterventionUrl)}"`), region)
    assert.doesNotMatch(html, /<details\b|<article\b|ResourceService|application\/ld\+json/)
    assert.match(html, /尚未.*在地方案/)
  }
  const allContacts = renderToStaticMarkup(createElement(RegionalContactCards, { regions: [...REGIONS] }))
  assert.equal([...allContacts.matchAll(/<li\b/g)].length, outside.length)
  assert.equal(renderToStaticMarkup(createElement(RegionalContactCards, { regions: [...PRIORITY_REGIONS] })), '')
})

interface CollectionSchema {
  '@type': string
  url: string
  dateModified: string
  mainEntity: { '@type': string; numberOfItems: number; itemListElement: Array<{ position: number; name: string; url: string }> }
}

test('all four county routes deliver crawlable service content and an ItemList matching real provider anchors', async () => {
  assert.equal(dynamic, 'force-static')
  assert.equal(dynamicParams, false)
  assert.deepEqual(generateStaticParams().map((item) => item.county).sort(), COUNTY_RESOURCE_PAGES.map((item) => item.slug).sort())
  assert.equal(COUNTY_RESOURCE_PAGES.length, 4)
  const sitemapEntries = sitemap()
  for (const county of COUNTY_RESOURCE_PAGES) {
    const canonical = `/rehab-resources/${county.slug}`
    const fullUrl = `https://camsavant.com${canonical}`
    const props = { params: Promise.resolve({ county: county.slug }) }
    const html = renderToStaticMarkup(await CountyPage(props))
    const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    const resources = visibleResources(REHAB_RESOURCES.filter((resource) => resource.regions.includes(county.region)), taipeiDate())
    const providers = groupResourceProviders(resources)
    assert.ok(providers.length > 0, county.slug)
    const articleIds = [...body.matchAll(/<article\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1])
    assert.equal(articleIds.length, providers.length, county.slug)
    assert.equal(new Set(articleIds).size, articleIds.length)
    for (const resource of resources) {
      includesText(body, resource.title, `${county.slug}: ${resource.id} title must be server-rendered`)
      includesText(body, RESOURCE_GUIDES[resource.id].help, `${county.slug}: ${resource.id} help must be server-rendered`)
    }
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]) as CollectionSchema)
    const collection = schemas.find((schema) => schema['@type'] === 'CollectionPage')
    assert.ok(collection, county.slug)
    assert.equal(collection.url, fullUrl)
    assert.equal(collection.dateModified, RESOURCE_UPDATED_AT)
    assert.equal(collection.mainEntity['@type'], 'ItemList')
    assert.equal(collection.mainEntity.numberOfItems, articleIds.length)
    assert.equal(collection.mainEntity.itemListElement.length, articleIds.length)
    collection.mainEntity.itemListElement.forEach((item, index) => {
      assert.equal(item.position, index + 1)
      assert.equal(item.name, providers[index].name)
      const itemUrl = new URL(item.url)
      assert.equal(itemUrl.origin + itemUrl.pathname, fullUrl)
      assert.ok(articleIds.includes(decodeURIComponent(itemUrl.hash.slice(1))))
    })
    const metadata = await generateMetadata(props)
    assert.equal(metadata.title, countyResourceTitle(county))
    assert.equal(metadata.alternates?.canonical, canonical)
    assert.equal(metadata.openGraph?.url, canonical)
    assert.match(String(metadata.description), new RegExp(county.region))
    const sitemapEntry = sitemapEntries.find((item) => item.url === fullUrl)
    assert.ok(sitemapEntry, county.slug)
    assert.equal(new Date(sitemapEntry.lastModified!).toISOString().slice(0, 10), RESOURCE_UPDATED_AT)
  }
})

test('badges appear only for meaningful acceptance status or an announced deadline', () => {
  const cases: Array<[Partial<RehabResource>, boolean]> = [
    [{ status: 'inquiry', endsOn: undefined }, false],
    [{ status: 'paused', endsOn: undefined }, false],
    [{ status: 'upcoming', endsOn: undefined }, false],
    [{ status: 'inquiry', endsOn: '2026-11-30' }, true],
    [{ status: 'ongoing' }, true],
    [{ status: 'open', endsOn: '2026-11-30' }, true],
    [{ status: 'closed' }, true],
    [{ status: 'inquiry', endsOn: '2026-10-19' }, true],
  ]
  for (const [overrides, expected] of cases) {
    assert.equal(resourceAvailability(fixture('status-case', overrides), TODAY).showBadge, expected, JSON.stringify(overrides))
  }
})

test('service cards omit generic inquiry status before details and show one informative badge when warranted', () => {
  const original = record('changhua-disability-assistive-subsidy')
  for (const [status, endsOn] of [['inquiry', undefined], ['ongoing', undefined], ['open', '2026-11-30'], ['closed', '2026-10-19'], ['inquiry', '2026-11-30']] as const) {
    const resource = { ...original, checkedAt: TODAY, status, endsOn }
    const availability = resourceAvailability(resource, TODAY)
    const html = renderToStaticMarkup(createElement(ResourceService, { resource, today: TODAY }))
    const outsideDetails = html.slice(0, html.indexOf('<details'))
    assert.ok(outsideDetails.includes(escapeHtml(RESOURCE_GUIDES[original.id].firstStep)))
    const labelCount = outsideDetails.split(escapeHtml(availability.label)).length - 1
    assert.equal(labelCount, availability.showBadge ? 1 : 0, `${status} / ${endsOn ?? 'no deadline'}`)
    if (!availability.showBadge) assert.ok(!outsideDetails.includes(escapeHtml(availability.detail)))
  }
})

test('each printable resource keeps its official URL, source, limits and a local SVG QR code', () => {
  for (const resource of REHAB_RESOURCES) {
    const html = renderToStaticMarkup(createElement(ResourceDetails, { resource, today: TODAY, print: true }))
    assert.equal([...html.matchAll(/<svg\b/g)].length, 1, resource.id)
    assert.match(html, /<path\b[^>]*\bd="/)
    assert.ok(html.includes(`data-resource-qr="${resource.id}"`), resource.id)
    assert.ok(html.includes(`href="${escapeHtml(resource.contact.url)}"`), resource.id)
    includesText(html, resource.contact.url, resource.id)
    includesText(html, resource.source.url, resource.id)
    includesText(html, resource.benefits, resource.id)
    for (const caution of resource.cautions) includesText(html, caution, resource.id)
    assert.doesNotMatch(html, /api\.qrserver|chart\.googleapis|quickchart\.io/)
    const normal = renderToStaticMarkup(createElement(ResourceDetails, { resource, today: TODAY }))
    assert.doesNotMatch(normal, /<svg\b|data-resource-qr=/)
  }
  const resource = record('yunlin-disability-startup-rent-equipment-115')
  const html = renderToStaticMarkup(createElement(ResourceDetails, { resource, today: TODAY, print: true }))
  assert.match(html, /每月最高一萬元/)
  assert.match(html, /最長兩年/)
  assert.match(html, /補助一半、最高五萬元/)
})

test('error reports generate an encoded LINE draft containing a known public resource ID only', () => {
  const savedFetch = globalThis.fetch
  let networkCalls = 0
  globalThis.fetch = (() => { networkCalls++; throw new Error('report links must not submit anything') }) as typeof fetch
  try {
    for (const resource of REHAB_RESOURCES) {
      const link = new URL(resourceReportUrl(resource.id))
      assert.equal(link.origin, 'https://line.me')
      assert.equal(link.pathname, `/R/oaMessage/${encodeURIComponent(LINE_ID)}/`)
      assert.equal(decodeURIComponent(link.search.slice(1)), `resource_id=${resource.id}`)
      assert.equal(link.hash, '')
      const message = new URLSearchParams(decodeURIComponent(link.search.slice(1)))
      assert.deepEqual([...message.keys()], ['resource_id'])
      assert.doesNotMatch(decodeURIComponent(link.search.slice(1)), /(?:^|&)(?:diseases?|regions?|county|needs?|household|hospitalRegion|residence|filters)=/i)
    }
    for (const id of ['not-a-public-resource', ...Object.keys(PUBLICATION_HOLDS), '../stroke', 'stroke?region=高雄市', 'stroke&needs=medical', '']) {
      assert.throws(() => resourceReportUrl(id), id)
    }
    assert.equal(networkCalls, 0)
  } finally {
    globalThis.fetch = savedFetch
  }
})

test('all eight prerequisite routes have public guides and concrete contacts without mixing benefit schemes', () => {
  const prerequisites = [...PREREQUISITE_HEALTH_RESOURCES, ...PREREQUISITE_INSURANCE_RESOURCES]
  assert.equal(prerequisites.length, 8)
  assert.equal(new Set(prerequisites.map((resource) => resource.id)).size, 8)
  for (const resource of prerequisites) {
    assert.ok(REHAB_RESOURCES.some((item) => item.id === resource.id), resource.id)
    assert.ok(resource.needs.includes('benefits'), resource.id)
    assert.ok(resource.contact.name && resource.contact.phone, resource.id)
    assert.equal(new URL(resource.contact.url).protocol, 'https:')
    assert.notEqual(new URL(resource.contact.url).pathname, '/', resource.id)
    for (const value of Object.values(RESOURCE_GUIDES[resource.id])) assert.ok(value.trim().length > 10, resource.id)
    assert.ok(resource.eligibility.length && resource.documents.length && resource.application, resource.id)
    assert.equal(resource.checkedAt, TODAY)
    assert.equal(resource.verification, 'official-page')
  }
  const pac = record('care-post-acute-pac')
  assert.notEqual(pac.diseases, 'all')
  assert.equal(matchesResource(pac, { ...EMPTY, diseases: ['sci'], needs: ['therapy'], regions: ['高雄市'] }, TODAY), false)
  assert.equal(matchesResource(pac, { ...EMPTY, diseases: ['stroke'], needs: ['therapy'], regions: ['高雄市'] }, TODAY), true)
  assert.equal(matchesResource(pac, { ...EMPTY, diseases: ['tbi'], needs: ['therapy'], regions: ['高雄市'] }, TODAY), true)
  const ordinary = record('national-labor-disability-benefit')
  const occupational = record('national-occupational-accident-insurance')
  assert.notEqual(ordinary.id, occupational.id)
  assert.equal(ordinary.organization, occupational.organization)
  assert.match(ordinary.cautions.join(' '), /職災/)
  for (const resource of PREREQUISITE_INSURANCE_RESOURCES) assert.equal(resource.diseaseSpecific, false, resource.id)
  const auto = record('national-compulsory-auto-insurance-guidance')
  assert.equal(auto.organization, '中華民國產物保險商業同業公會')
  assert.equal(auto.kind, 'insurance')
  assert.equal(auto.resourceType, 'referral')
  assert.match(RESOURCE_GUIDES[auto.id].firstStep, /承保公司.*申請.*公會只提供諮詢/)
  assert.match(auto.cautions.join(' '), /自|人身|財物/)
  assert.equal(record('national-motor-accident-compensation-fund').organization, '財團法人汽車交通事故特別補償基金')
})
