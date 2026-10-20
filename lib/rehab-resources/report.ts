import { LINE_ID } from '@/lib/site'
import { REHAB_RESOURCES } from './index'

const PUBLIC_IDS = new Set(REHAB_RESOURCES.map((resource) => resource.id))

/** Public record ID only. Never pass disease, county, need or selection state. */
export function resourceReportUrl(resourceId: string): string {
  if (!/^[a-z0-9-]+$/.test(resourceId) || !PUBLIC_IDS.has(resourceId)) throw new Error('Invalid public resource ID')
  return `https://line.me/R/oaMessage/${encodeURIComponent(LINE_ID)}/?${encodeURIComponent(`resource_id=${resourceId}`)}`
}
