import { QRCodeSVG } from 'qrcode.react'
import { resourceFreshness } from '@/lib/rehab-resources/freshness'
import { resourceReportUrl } from '@/lib/rehab-resources/report'
import type { RehabResource } from '@/lib/rehab-resources/types'
import { ResourceLink, resourceTelephone } from './ResourceLinks'

/** The contact view deliberately does not read programme rules, guides or status. */
export default function ResourceContact({ resource, today, print = false }: { resource: RehabResource; today: string; print?: boolean }) {
  const freshness = resourceFreshness(resource, today)
  if (freshness.level === 'hidden') return null

  return <div className="ResourceContact space-y-4 text-base leading-8 text-neutral-700 dark:text-neutral-200" data-resource-contact={resource.id}>
    <p className="font-semibold text-neutral-950 dark:text-neutral-100">{resource.organization}</p>
    <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><p>最後核對：<time dateTime={resource.checkedAt}>{resource.checkedAt}</time></p><p>{freshness.notice}</p></div>
    <dl className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-3">
      <dt className="font-semibold text-neutral-500 dark:text-neutral-400">能幫什麼</dt><dd>金額與期限請向窗口確認</dd>
      <dt className="font-semibold text-neutral-500 dark:text-neutral-400">聯絡窗口</dt><dd>{resource.contact.name}</dd>
    </dl>
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {resource.contact.phone && <a href={`tel:${resourceTelephone(resource.contact.phone)}`} className="inline-flex min-h-12 items-center rounded-xl bg-teal-800 px-5 text-base font-semibold text-white hover:bg-teal-900">電話：{resource.contact.phone}</a>}
      {freshness.contactUrl && <ResourceLink href={freshness.contactUrl}>官方網頁 ↗</ResourceLink>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
      <ResourceLink href={resourceReportUrl(resource.id)}>回報資料有誤</ResourceLink>
    </div>
    {print && freshness.contactUrl && <div className="ResourcePrintQr" data-resource-qr={resource.id}>
      <QRCodeSVG value={freshness.contactUrl} size={120} level="M" marginSize={4} bgColor="#ffffff" fgColor="#000000" title={`${resource.organization} 官方窗口`} />
      <div><p>掃碼看官方窗口</p><p className="ResourceSourceUrl">{freshness.contactUrl}</p></div>
    </div>}
  </div>
}
