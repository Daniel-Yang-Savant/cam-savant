import { GEOGRAPHY_LABELS, VERIFICATION_LABELS } from '@/lib/rehab-resources/matching'
import { resourceAvailability } from '@/lib/rehab-resources/publication'
import type { RehabResource } from '@/lib/rehab-resources/types'

export function ResourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="underline decoration-neutral-300 underline-offset-4 hover:text-teal-700 dark:hover:text-teal-300">{children}<span className="sr-only">（另開視窗）</span></a>
}

export function resourceTelephone(phone: string): string {
  return phone.split(/[、,，;/]|分機|轉|#|ext\.?/i)[0].replace(/[^\d+]/g, '')
}

export default function ResourceDetails({ resource, today, print = false, detailsOnly = false }: { resource: RehabResource; today: string; print?: boolean; detailsOnly?: boolean }) {
  const availability = resourceAvailability(resource, today)
  return (
    <div className="ResourceDetails space-y-5 text-base leading-8 text-neutral-700 dark:text-neutral-200">
      {!detailsOnly && <>
        <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">聯絡窗口</h4><p>{resource.contact.name}{resource.contact.phone && <> · <a className="underline underline-offset-4" href={`tel:${resourceTelephone(resource.contact.phone)}`}>{resource.contact.phone}</a></>}</p></div>
      </>}
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">協助範圍</h4><p>{resource.benefits}</p></div>
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">申請條件</h4><ul className="list-disc space-y-2 pl-5">{resource.eligibility.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">要帶什麼</h4><ul className="list-disc space-y-2 pl-5">{resource.documents.map((item) => <li key={item}>{item}</li>)}</ul></div>
      {!detailsOnly && <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">怎麼申請</h4><p>{resource.application}</p></div>}
      {resource.cautions.length > 0 && <div className="border-l-4 border-amber-500 pl-4"><h4 className="font-bold text-neutral-950 dark:text-neutral-100">重要限制</h4><ul className="list-disc space-y-2 pl-5">{resource.cautions.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">受理情形</h4><p>{availability.label}：{availability.detail}</p>{resource.applicationPeriod && <p>{resource.applicationPeriod}</p>}{resource.startsOn && <p>開始日：{resource.startsOn}</p>}{resource.endsOn && <p>截止日：{resource.endsOn}</p>}</div>
      <div className="border-t border-neutral-200 pt-4 text-sm leading-7 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        <p>{GEOGRAPHY_LABELS[resource.geographicBasis]} · {resource.regions.join('、')}</p>
        <p>資料核對：<time dateTime={resource.checkedAt}>{resource.checkedAt}</time> · {VERIFICATION_LABELS[resource.verification]}</p>
        {resource.source.publishedOn && <p>來源發布／修正日：{resource.source.publishedOn}</p>}{resource.source.rocYear && <p>適用年度：民國 {resource.source.rocYear} 年</p>}
        <p><ResourceLink href={resource.contact.url}>官方申請說明 ↗</ResourceLink></p>
        <p>來源：<ResourceLink href={resource.source.url}>{resource.source.title}</ResourceLink></p>
        {print && <><p className="ResourceSourceUrl">{resource.source.url}</p>{resource.contact.url !== resource.source.url && <p className="ResourceSourceUrl">{resource.contact.url}</p>}</>}
      </div>
    </div>
  )
}
