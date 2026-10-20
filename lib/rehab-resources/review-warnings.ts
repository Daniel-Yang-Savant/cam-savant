import { CONTACT_RETENTION_DAYS, resourceFreshness } from './freshness'
import { publicationLevel } from './publication'
import type { RehabResource } from './types'

const DAY = 86_400_000
export const RULE_REVIEW_WARNING_DAYS = 28
export const CONTACT_EXPIRY_WARNING_DAYS = 30

export interface ResourceReviewWarningGroup {
  date: string
  resources: RehabResource[]
}

export interface ResourceReviewWarnings {
  today: string
  ruleReviews: ResourceReviewWarningGroup[]
  contactExpiries: ResourceReviewWarningGroup[]
}

function calendarDay(value: string): number {
  const stamp = Date.parse(`${value}T00:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== value) {
    throw new Error(`無效日期：${value}`)
  }
  return stamp
}

function addDays(date: string, days: number): string {
  return new Date(calendarDay(date) + days * DAY).toISOString().slice(0, 10)
}

function groupByDate(entries: { date: string; resource: RehabResource }[]): ResourceReviewWarningGroup[] {
  const grouped = new Map<string, RehabResource[]>()
  for (const { date, resource } of entries) {
    const resources = grouped.get(date) ?? []
    resources.push(resource)
    grouped.set(date, resources)
  }
  return [...grouped.entries()]
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([date, resources]) => ({
      date,
      resources: resources.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0),
    }))
}

/** Advisory only: calculate calendar transitions without changing any review dates. */
export function resourceReviewWarnings(resources: RehabResource[], today: string): ResourceReviewWarnings {
  const currentDay = calendarDay(today)
  const ruleReviews: { date: string; resource: RehabResource }[] = []
  const contactExpiries: { date: string; resource: RehabResource }[] = []

  for (const resource of resources) {
    if (publicationLevel(resource) === 'withheld') continue
    const freshness = resourceFreshness(resource, today)
    if (freshness.level === 'hidden') continue

    if (freshness.level === 'full') {
      // The last full day is checkedAt + reviewAfterDays; downgrade is the next day.
      const date = addDays(resource.checkedAt, resource.reviewAfterDays + 1)
      const daysUntil = (calendarDay(date) - currentDay) / DAY
      if (daysUntil > 0 && daysUntil <= RULE_REVIEW_WARNING_DAYS &&
        resourceFreshness(resource, addDays(date, -1)).level === 'full' &&
        resourceFreshness(resource, date).level === 'contact-only') {
        ruleReviews.push({ date, resource })
      }
    } else {
      // Contacts remain visible on day 365 and disappear on day 366.
      const date = addDays(resource.checkedAt, CONTACT_RETENTION_DAYS + 1)
      const daysUntil = (calendarDay(date) - currentDay) / DAY
      if (daysUntil > 0 && daysUntil <= CONTACT_EXPIRY_WARNING_DAYS &&
        resourceFreshness(resource, addDays(date, -1)).level === 'contact-only' &&
        resourceFreshness(resource, date).level === 'hidden') {
        contactExpiries.push({ date, resource })
      }
    }
  }

  return { today, ruleReviews: groupByDate(ruleReviews), contactExpiries: groupByDate(contactExpiries) }
}

/** A plain-text build-log report; patient choices and network requests are absent. */
export function formatResourceReviewWarnings(report: ResourceReviewWarnings): string {
  const lines = [`[補助與援助複核提醒] 台北日期 ${report.today}；僅提醒，不阻擋建置。`]
  const sections = [
    { heading: `未來 ${RULE_REVIEW_WARNING_DAYS} 天內由完整資料轉為僅顯示窗口`, groups: report.ruleReviews },
    { heading: `已僅顯示窗口，未來 ${CONTACT_EXPIRY_WARNING_DAYS} 天內超過 ${CONTACT_RETENTION_DAYS} 天而隱藏`, groups: report.contactExpiries },
  ]
  for (const { heading, groups } of sections) {
    const count = groups.reduce((sum, group) => sum + group.resources.length, 0)
    lines.push(`${heading}：${count} 筆`)
    if (!count) lines.push('  本次沒有即將到期的項目。')
    for (const group of groups) {
      lines.push(`  ${group.date}（${group.resources.length} 筆）`)
      for (const resource of group.resources) {
        lines.push(`    - ${resource.id}｜${resource.title}｜${resource.organization}｜最後核對：${resource.checkedAt}`)
      }
    }
  }
  return lines.join('\n')
}
