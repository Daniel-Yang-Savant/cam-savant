import type { RehabResource, ResourceReviewEvidence } from './types'

export type ResourceFreshnessLevel = 'full' | 'contact-only' | 'hidden'
export interface ResourceFreshness {
  level: ResourceFreshnessLevel
  ageInDays: number
  overdueDays: number
  notice: string
  contactUrl?: string
}

const DAY = 86_400_000
export const CONTACT_RETENTION_DAYS = 365
const RULES_NOTICE = '申請規定可能已更新，請先打電話向窗口確認。'
const CONTACT_NOTICE = '官方頁面目前無法開啟，請改向窗口確認。'

/** A mis-set device clock must not predate the published resource content. */
export function resourceQueryDate(deviceToday: string, contentDate: string): string {
  return deviceToday > contentDate ? deviceToday : contentDate
}

function calendarDay(value: string): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const stamp = Date.parse(value)
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value ? stamp : undefined
}

/** No requests are made here. A successful HTTP response is not a content check. */
function activeNegativeEvidence(resource: RehabResource, today: string): ResourceReviewEvidence[] {
  const observations = (resource.reviewEvidence ?? []).filter((item) => calendarDay(item.observedAt) !== undefined && item.observedAt <= today)
  return observations.filter((item, index) => item.kind !== 'content-verified' && !observations.some((check, checkIndex) =>
    check.kind === 'content-verified' && check.url === item.url &&
    // On the same calendar day, appended observations are later evidence.
    (check.observedAt > item.observedAt || check.observedAt === item.observedAt && checkIndex > index) &&
    check.observedAt <= resource.checkedAt,
  ))
}

/** Stable directory leads still respect known broken URLs and discontinued services. */
export function resourceContactLead(resource: RehabResource, today: string) {
  const evidence = activeNegativeEvidence(resource, today)
  const brokenUrls = new Set(evidence.filter((item) => item.kind === 'not-found').map((item) => item.url))
  return {
    discontinued: evidence.some((item) => item.kind === 'discontinued'),
    hasBrokenLinks: brokenUrls.size > 0,
    contactUrl: [resource.contact.url, resource.source.url].find((url) => !brokenUrls.has(url)),
  }
}

/** Rule review cycles and the fixed contact retention window are independent. */
export function resourceFreshness(resource: RehabResource, today: string): ResourceFreshness {
  const checkedDay = calendarDay(resource.checkedAt)
  const currentDay = calendarDay(today)
  const validReview = checkedDay !== undefined && currentDay !== undefined &&
    Number.isFinite(resource.reviewAfterDays) && Number.isInteger(resource.reviewAfterDays) && resource.reviewAfterDays > 0
  const ageInDays = checkedDay !== undefined && currentDay !== undefined ? Math.max(0, Math.floor((currentDay - checkedDay) / DAY)) : 0
  const overdueDays = Math.max(0, ageInDays - resource.reviewAfterDays)
  const { discontinued, hasBrokenLinks, contactUrl } = resourceContactLead(resource, today)
  const result = { ageInDays, overdueDays, contactUrl }

  if (discontinued) {
    return { ...result, level: 'hidden', notice: '官方已公告停辦，暫不列出。' }
  }
  if (!validReview) return { ...result, level: 'hidden', notice: '資料核對日期或週期需更正，暫不列出。' }
  if (ageInDays > CONTACT_RETENTION_DAYS) {
    return { ...result, level: 'hidden', notice: '聯絡資料已超過一年未核對，暫不列出。' }
  }
  if (hasBrokenLinks && !contactUrl && !resource.contact.phone) {
    return { ...result, level: 'hidden', notice: '官方連結失效且沒有可用聯絡方式，暫不列出。' }
  }
  if (overdueDays || hasBrokenLinks) {
    const notices = [RULES_NOTICE]
    if (hasBrokenLinks) notices.push(CONTACT_NOTICE)
    return { ...result, level: 'contact-only', notice: notices.join(' ') }
  }
  return { ...result, level: 'full', notice: '' }
}
