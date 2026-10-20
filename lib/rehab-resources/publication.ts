import { COMMUNITY_GUIDES } from './guides-community'
import { GOVERNMENT_GUIDES } from './guides-government'
import { resourceStatus } from './matching'
import type { RehabResource } from './types'

export interface ResourceGuide {
  help: string
  who: string
  firstStep: string
}

// Keep research notes separate from information suitable for the public finder.
// Adding a record requires a reviewed, concrete guide; an organisation name or
// a fundraising story alone does not establish an available application route.
export const PUBLICATION_HOLDS: Record<string, string> = {
  'hengshan-taichung-home-repair-support': '來源為募款案例，缺受助申請規則與流程。',
  'national-autism-family-resources': '宗旨介紹未證實全國實體服務與申請範圍。',
  'nantou-early-intervention-subsidy': '官方申辦摘要缺完整現行資格、療育核銷與期限。',
  'nantou-disability-temporary-short-care': '僅取得2020年計畫，未核實當期服務資料與窗口。',
  'provider-changhua-sixth-credit-charity': '缺完整受理範圍、資格及可操作送件窗口。',
}

export const RESOURCE_GUIDES: Record<string, ResourceGuide> = { ...GOVERNMENT_GUIDES, ...COMMUNITY_GUIDES }

export function publicationLevel(resource: RehabResource): 'rules' | 'service' | 'withheld' {
  if (PUBLICATION_HOLDS[resource.id] || resource.resourceType === 'directory' || !RESOURCE_GUIDES[resource.id]) return 'withheld'
  return resource.resourceType === 'scheme' ? 'rules' : 'service'
}

export function visibleResources(resources: RehabResource[], today: string): RehabResource[] {
  return resources.filter((resource) => publicationLevel(resource) !== 'withheld' && !resourceStatus(resource, today).stale)
}

// A checked rule or service is not evidence that applications are currently open.
export function resourceAvailability(resource: RehabResource, today: string) {
  const { status, reason } = resourceStatus(resource, today)
  if (status === 'inquiry') return resource.resourceType === 'scheme'
    ? { status, label: '先確認收件', detail: '目前收件情形未經窗口確認，請先聯絡再送件。' }
    : { status, label: '先聯絡窗口', detail: '服務內容已核對；收案與預約請洽服務單位。' }
  if (status === 'ongoing') return { status, label: resource.resourceType === 'scheme' ? '常態受理' : '提供服務', detail: reason }
  return { status, label: status === 'open' ? '受理中' : status === 'closed' ? '已截止' : status === 'paused' ? '暫停受理' : '尚未開始', detail: reason }
}
