import { RESOURCE_GUIDES, publicationLevel, resourceAvailability } from '@/lib/rehab-resources/publication'
import type { RehabResource } from '@/lib/rehab-resources/types'
import ResourceDetails, { ResourceLink, resourceTelephone } from './ResourceDetails'
import { resourceReportUrl } from '@/lib/rehab-resources/report'
import { resourceFreshness } from '@/lib/rehab-resources/freshness'
import ResourceContact from './ResourceContact'

export default function ResourceService({ resource, today }: { resource: RehabResource; today: string }) {
  const freshness = resourceFreshness(resource, today)
  if (freshness.level === 'hidden' || publicationLevel(resource) === 'withheld') return null
  if (freshness.level === 'contact-only') return <section className="ResourceService py-6 first:pt-0 last:pb-0" aria-label={`${resource.organization} 聯絡窗口`}><ResourceContact resource={resource} today={today} /></section>
  const guide = RESOURCE_GUIDES[resource.id]
  if (!guide) return null
  const availability = resourceAvailability(resource, today)
  const active = availability.status === 'open' || availability.status === 'ongoing'
  return (
    <section className="ResourceService py-6 first:pt-0 last:pb-0" aria-label={resource.title}>
      <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">{resource.resourceType === 'scheme' ? '補助方案' : '諮詢與服務'}</p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h4 className="text-base font-bold leading-7 sm:text-lg">{resource.title}</h4>
        {availability.showBadge && <span className={`shrink-0 rounded-lg px-3 py-1 text-sm font-semibold ${active ? 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'}`}>{availability.label}</span>}
      </div>
      <dl className="mt-5 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-4 text-base leading-8">
        <dt className="font-semibold text-neutral-500 dark:text-neutral-400">能幫什麼</dt><dd>{guide.help}</dd>
        <dt className="font-semibold text-neutral-500 dark:text-neutral-400">適用對象</dt><dd>{guide.who}</dd>
        <dt className="font-semibold text-teal-800 dark:text-teal-300">第一步</dt><dd className="font-semibold">{guide.firstStep}</dd>
      </dl>
      {availability.showBadge && <p className="mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{availability.detail}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        {resource.contact.phone && <a href={`tel:${resourceTelephone(resource.contact.phone)}`} className="inline-flex min-h-12 items-center rounded-xl bg-teal-800 px-5 text-base font-semibold text-white hover:bg-teal-900">打電話</a>}
        <ResourceLink href={resource.contact.url}>官方說明 ↗</ResourceLink>
      </div>
      <p className="mt-3 text-sm leading-7 text-neutral-500 dark:text-neutral-400">{resource.contact.name}{resource.contact.phone && <span className="block">{resource.contact.phone}</span>}</p>
      <details className="mt-4 border-t border-neutral-100 pt-2 dark:border-neutral-800">
        <summary className="min-h-12 cursor-pointer py-3 text-base font-semibold">申請條件與文件</summary>
        <div className="pb-4 pt-3"><ResourceDetails resource={resource} today={today} detailsOnly /></div>
      </details>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500 dark:text-neutral-400"><p>資料核對：<time dateTime={resource.checkedAt}>{resource.checkedAt}</time></p><ResourceLink href={resourceReportUrl(resource.id)}>回報資料有誤</ResourceLink></div>
    </section>
  )
}
