import { DISEASE_GROUPS, NEEDS, type ApplicationStatus, type RehabResource, type ResourceFilters } from './types'

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  open: '公告受理中', ongoing: '常態受理／服務', upcoming: '尚未開放',
  closed: '已截止', paused: '暫停／額滿', inquiry: '需詢問',
}
export const VERIFICATION_LABELS = {
  'official-page': '官方網頁核對', 'current-notice': '當期公告核對', 'contact-confirmed': '窗口確認',
}
export const GEOGRAPHY_LABELS = {
  household: '依戶籍地', residence: '依居住／服務地', hospital: '依就醫院所', nationwide: '全國性資源',
}
export const RESOURCE_TYPE_LABELS = { scheme: '補助方案', referral: '服務／轉介入口', directory: '官方資源指引' }
const diseaseLabels = new Map<string, string>(DISEASE_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item.label] as const)))
const needLabels = new Map<string, string>(NEEDS.map((item) => [item.id, item.label]))
export const diseaseLabel = (id: string) => diseaseLabels.get(id) ?? id
export const needLabel = (id: string) => needLabels.get(id) ?? id

export function taipeiDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const part = (type: string) => parts.find((item) => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function resourceStatus(resource: RehabResource, today: string) {
  const ageInDays = (Date.parse(today) - Date.parse(resource.checkedAt)) / 86_400_000
  const stale = ageInDays > resource.reviewAfterDays
  let status = resource.status
  let reason = resource.statusNote
  if (resource.endsOn && today > resource.endsOn) {
    status = 'closed'
    reason = `公告受理期限已於 ${resource.endsOn} 結束；未推定次年度繼續辦理。`
  } else if (resource.startsOn && today < resource.startsOn) {
    status = 'upcoming'
    reason = `公告自 ${resource.startsOn} 開始受理，仍須留意主辦單位最新消息。`
  } else if (status === 'upcoming' && resource.startsOn && today >= resource.startsOn) {
    status = 'inquiry'
    reason = '公告開始日已到，尚未重新核實實際受理與名額。'
  } else if (stale && (status === 'open' || status === 'ongoing')) {
    status = 'inquiry'
    reason = `已超過建議複核週期；上次記錄為「${STATUS_LABELS[resource.status]}」，請先確認目前受理情形。`
  }
  return { status, reason, stale, label: STATUS_LABELS[status] }
}

export function geographicMatch(resource: RehabResource, filters: ResourceFilters) {
  if (resource.regions.includes('全國') || resource.geographicBasis === 'nationwide') {
    return { matches: true, reason: '全國性資源；仍須確認個別資格與服務範圍。' }
  }
  if (filters.region) {
    const matches = resource.regions.includes(filters.region)
    return {
      matches,
      reason: matches
        ? `查詢地區包含${filters.region}；${GEOGRAPHY_LABELS[resource.geographicBasis]}的實際資格仍須確認。`
        : `所選${filters.region}不在此資源列示範圍（${resource.regions.join('、')}），請先核對適用地區。`,
    }
  }
  const region = resource.geographicBasis === 'household' ? filters.household
    : resource.geographicBasis === 'hospital' ? filters.hospitalRegion : filters.residence
  if (!region) {
    return { matches: true, reason: `${GEOGRAPHY_LABELS[resource.geographicBasis]}的條件尚未提供，暫保留供確認（${resource.regions.join('、')}）。` }
  }
  return {
    matches: resource.regions.includes(region),
    reason: resource.regions.includes(region)
      ? `${GEOGRAPHY_LABELS[resource.geographicBasis]}範圍包含${region}${resource.geographicBasis === 'hospital' ? '；仍須為該院服務對象' : ''}。`
      : `目前填寫的${region}不在此資源列示範圍（${resource.regions.join('、')}），請先核對適用地區。`,
  }
}

export function matchesResource(resource: RehabResource, filters: ResourceFilters, today: string) {
  const diseaseMatch = resource.diseases === 'all' || filters.diseases.length === 0 ||
    filters.diseases.some((id) => resource.diseases !== 'all' && resource.diseases.includes(id))
  return diseaseMatch && (filters.needs.length === 0 || filters.needs.some((id) => resource.needs.includes(id))) &&
    geographicMatch(resource, filters).matches && (!filters.kind || filters.kind === resource.kind) &&
    (!filters.status || resourceStatus(resource, today).status === filters.status)
}

export function isResourceSearchReady(filters: ResourceFilters): boolean {
  return filters.diseases.length > 0 && Boolean(filters.region) && filters.needs.length > 0
}

export function matchReasons(resource: RehabResource, filters: ResourceFilters): string[] {
  const diseases = filters.diseases.filter((id) => resource.diseases !== 'all' && resource.diseases.includes(id))
  const needs = filters.needs.filter((id) => resource.needs.includes(id))
  return [
    diseases.length ? `與你選擇的${diseases.map(diseaseLabel).join('、')}相關。`
      : resource.diseases === 'all' ? '以照顧、經濟或功能需求為入口，不限單一診斷；仍須評估資格。' : '病別條件請依正式診斷或評估結果確認。',
    needs.length ? `可詢問${needs.map(needLabel).join('、')}方面的協助。` : `協助方向：${resource.needs.map(needLabel).join('、')}。`,
    geographicMatch(resource, filters).reason,
  ]
}
