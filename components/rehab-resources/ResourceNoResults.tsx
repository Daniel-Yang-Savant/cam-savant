import { NATIONAL_RESOURCES } from '@/lib/rehab-resources/national'
import type { RehabResource, Region } from '@/lib/rehab-resources/types'
import { resourceContactLead } from '@/lib/rehab-resources/freshness'
import { taipeiDate } from '@/lib/rehab-resources/matching'
import { LTC_LINKS } from '@/lib/rehab-resources/official-links'
import RegionalContactCards from './RegionalContactCards'
import { ResourceLink, resourceTelephone } from './ResourceLinks'

// Stable phone leads remain useful even when no current scheme matches.
const HELP_LINES = [
  { id: 'national-1957-welfare', label: '福利、急難救助', description: '說明生活困難或福利問題，請社工協助找資源。' },
  { id: 'national-ltc-1966', label: '長照、照顧需求', description: '詢問照顧、接送或輔具服務，並請窗口安排需求評估。' },
]

export default function ResourceNoResults({ regions, today = taipeiDate(), resources = NATIONAL_RESOURCES }: { regions: Region[]; today?: string; resources?: RehabResource[] }) {
  const lines = HELP_LINES.flatMap((line) => {
    const resource = resources.find((item) => item.id === line.id)
    if (!resource?.contact.phone) return []
    const lead = resourceContactLead(resource, today)
    return lead.discontinued ? [] : [{ ...line, phone: resource.contact.phone, contactUrl: lead.contactUrl }]
  })
  return <div className="space-y-6" data-resource-no-results>
    <div className="rounded-2xl border border-dashed border-neutral-300 p-5 sm:p-8 dark:border-neutral-700"><h3 className="text-xl font-bold">目前沒有符合這組條件的資源</h3><p className="mt-3 text-base leading-8 text-neutral-600 dark:text-neutral-300">查不到不代表沒有援助。可以修改條件，{lines.length ? '或先打下面的電話找幫忙。' : '或先問下面的縣市窗口。'}</p></div>
    {lines.length > 0 && <section aria-label="查無結果可撥打的全國服務電話" className="rounded-2xl border border-neutral-200 p-5 sm:p-6 dark:border-neutral-700">
      <h2 className="text-xl font-bold">先打電話問</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{lines.map((line) => {
        return <div key={line.id} className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
          <h3 className="text-lg font-bold">{line.label}</h3><p className="mt-2 text-base leading-8 text-neutral-600 dark:text-neutral-300">{line.description}</p>
          <a href={`tel:${resourceTelephone(line.phone)}`} className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-teal-800 px-5 text-lg font-bold text-white hover:bg-teal-900">撥打 {line.phone}</a>
          {line.contactUrl && <p className="mt-3 text-sm"><ResourceLink href={line.contactUrl}>{line.contactUrl === LTC_LINKS.countyContacts ? '各縣市照管中心電話' : '官方服務說明'} ↗</ResourceLink></p>}
        </div>
      })}</div>
    </section>}
    <RegionalContactCards regions={regions} variant="fallback" />
  </div>
}
