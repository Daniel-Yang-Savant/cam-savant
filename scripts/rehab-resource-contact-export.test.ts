import assert from 'node:assert/strict'
import test from 'node:test'
import { REHAB_RESOURCES } from '../lib/rehab-resources'
import { resourceContactsText } from '../lib/rehab-resources/contact-export'
import type { ResourceProvider } from '../lib/rehab-resources/providers'

const TODAY = '2026-10-25'
const original = REHAB_RESOURCES.find((resource) => resource.id === 'national-1957-welfare')!

function provider(resources = [original]): ResourceProvider {
  return { id: 'private-provider-id', name: '公開單位', resources }
}

test('contact export contains only public contact fields and deduplicates repeated windows', () => {
  const resource = {
    ...original,
    title: '不應輸出的疾病服務標題',
    summary: '不應輸出的個人需求',
    benefits: '不應輸出的金額',
    eligibility: ['不應輸出的申請條件'],
    contact: { ...original.contact, name: '公開窗口', phone: '02-12345678 分機 9' },
  }
  const result = resourceContactsText([provider([resource, resource])], TODAY)
  assert.match(result, /公開單位\n窗口：公開窗口\n電話：02-12345678 分機 9/)
  assert.equal(result.split('窗口：公開窗口').length - 1, 1)
  assert.doesNotMatch(result, /不應輸出|private-provider-id|national-1957-welfare|https?:/)
})

test('contact-only resources remain exportable while expired, discontinued and withheld resources do not', () => {
  const contactOnly = { ...original, checkedAt: '2026-08-01', reviewAfterDays: 30 }
  assert.match(resourceContactsText([provider([contactOnly])], TODAY), /電話：1957/)

  const hidden = { ...original, checkedAt: '2025-10-24' }
  const withheld = { ...original, id: 'unreviewed-private-resource' }
  const discontinued = { ...original, reviewEvidence: [{ kind: 'discontinued' as const, observedAt: TODAY, url: original.source.url }] }
  assert.equal(resourceContactsText([provider([hidden, withheld, discontinued])], TODAY), '')
  assert.equal(resourceContactsText([], TODAY), '')
})

test('different windows are preserved and a missing phone number is not invented', () => {
  const contacts = [
    { ...original, contact: { ...original.contact, name: '甲窗口', phone: '1957' } },
    { ...original, contact: { ...original.contact, name: '乙窗口', phone: undefined } },
  ]
  const result = resourceContactsText([provider(contacts)], TODAY)
  assert.match(result, /窗口：甲窗口\n電話：1957\n\n窗口：乙窗口/)
  assert.equal(result.split('電話：').length - 1, 1)
})
