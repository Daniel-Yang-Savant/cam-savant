import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ResourceNoResults from '../components/rehab-resources/ResourceNoResults'
import { REGIONAL_CONTACTS, REGIONS, PRIORITY_REGIONS } from '../lib/rehab-resources'
import { NATIONAL_RESOURCES } from '../lib/rehab-resources/national'

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

test('zero results retain every selected county contact, including the four priority counties', () => {
  for (const region of REGIONS) {
    const contact = REGIONAL_CONTACTS.find((item) => item.region === region)!
    const html = renderToStaticMarkup(createElement(ResourceNoResults, { regions: [region, region] }))
    assert.ok(html.includes(contact.name), region)
    assert.ok(html.includes(`href="${escapeHtml(contact.url)}"`), region)
    assert.equal([...html.matchAll(/<li\b/g)].length, 1, region)
    for (const other of REGIONAL_CONTACTS.filter((item) => item.region !== region)) assert.ok(!html.includes(escapeHtml(other.url)), other.region)
    assert.doesNotMatch(html, /相關網頁|尚未逐筆整理|仍會列在下方/)
    assert.match(html, /查不到不代表沒有援助/)
  }
  const central = renderToStaticMarkup(createElement(ResourceNoResults, { regions: PRIORITY_REGIONS }))
  assert.equal([...central.matchAll(/<li\b/g)].length, 4)
})

test('stable fallback phones survive scheme expiry but never revive recorded broken links or discontinued services', () => {
  const originals = NATIONAL_RESOURCES.filter((resource) => ['national-1957-welfare', 'national-ltc-1966'].includes(resource.id))
  assert.equal(originals.length, 2)
  const today = '2028-01-01'
  const expired = renderToStaticMarkup(createElement(ResourceNoResults, { regions: ['彰化縣'], today, resources: originals }))
  assert.match(expired, /href="tel:1957"/)
  assert.match(expired, /href="tel:1966"/)
  const broken = originals.map((resource) => ({ ...resource, reviewEvidence: [
    { kind: 'not-found' as const, observedAt: today, url: resource.contact.url },
    { kind: 'not-found' as const, observedAt: today, url: resource.source.url },
  ] }))
  const phoneOnly = renderToStaticMarkup(createElement(ResourceNoResults, { regions: ['彰化縣'], today, resources: broken }))
  for (const resource of broken) {
    assert.ok(phoneOnly.includes(`href="tel:${resource.contact.phone}"`))
    assert.ok(!phoneOnly.includes(escapeHtml(resource.contact.url)))
    assert.ok(!phoneOnly.includes(escapeHtml(resource.source.url)))
  }
  const stopped = originals.map((resource) => ({ ...resource, reviewEvidence: [{ kind: 'discontinued' as const, observedAt: today, url: resource.source.url }] }))
  const hidden = renderToStaticMarkup(createElement(ResourceNoResults, { regions: ['彰化縣'], today, resources: stopped }))
  assert.doesNotMatch(hidden, /tel:1957|tel:1966|先打電話問|先打下面的電話/)
  assert.match(hidden, /彰化縣政府社會處/)
})

test('zero results always show actionable 1957 and 1966 calls without becoming grant results', () => {
  for (const regions of [[], ['彰化縣', '高雄市'] as const]) {
    const html = renderToStaticMarkup(createElement(ResourceNoResults, { regions: [...regions] }))
    for (const phone of ['1957', '1966']) {
      assert.match(html, new RegExp(`href="tel:${phone}"`))
      assert.match(html, new RegExp(`撥打 ${phone}`))
    }
    assert.match(html, /安排需求評估/)
    assert.doesNotMatch(html, /<article\b|ResourceService|加入列印清單|application\/ld\+json|保證|免費領取/)
  }
  const directory = readFileSync('components/rehab-resources/ResourceDirectory.tsx', 'utf8')
  assert.match(directory, /results\.length === 0 && <ResourceNoResults regions=\{selectedQueryRegions\}/)
  assert.match(directory, /results\.length > 0 && <RegionalContactCards/)
})
