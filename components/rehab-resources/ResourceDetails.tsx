import { GEOGRAPHY_LABELS, VERIFICATION_LABELS, resourceStatus } from '@/lib/rehab-resources/matching'
import type { RehabResource } from '@/lib/rehab-resources/types'

export function ResourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="underline decoration-neutral-300 underline-offset-4 hover:text-teal-700 dark:hover:text-teal-300">{children}<span className="sr-only">（另開視窗）</span></a>
}

export default function ResourceDetails({ resource, today, print = false }: { resource: RehabResource; today: string; print?: boolean }) {
  const status = resourceStatus(resource, today)
  return (
    <div className="ResourceDetails space-y-5 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">協助內容</h4><p>{resource.benefits}</p></div>
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">待確認資格</h4><ul className="list-disc space-y-1 pl-5">{resource.eligibility.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">文件準備</h4><p className="text-xs text-neutral-500">先核對需求再備件；以下為此資源列示或需由窗口確認的文件。</p><ul className="list-disc space-y-1 pl-5">{resource.documents.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">申請與轉介方式</h4><p>{resource.application}</p></div>
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">聯絡窗口</h4><p>{resource.contact.name}{resource.contact.phone && <> · <a className="underline underline-offset-4" href={`tel:${resource.contact.phone.split(/[、,，;/]|分機|轉|#|ext\.?/i)[0].replace(/[^\d+]/g, '')}`}>{resource.contact.phone}</a></>}</p><ResourceLink href={resource.contact.url}>查看官方窗口與申請說明 ↗</ResourceLink>{print && resource.contact.url !== resource.source.url && <p className="ResourceSourceUrl text-xs">{resource.contact.url}</p>}</div>
      <div><h4 className="font-bold text-neutral-950 dark:text-neutral-100">受理狀態與時程</h4><p>{status.label}：{status.reason}</p>{resource.applicationPeriod && <p>{resource.applicationPeriod}</p>}{resource.startsOn && <p>公告開始日：{resource.startsOn}</p>}{resource.endsOn && <p>公告截止日：{resource.endsOn}</p>}<p className="text-xs">受理、核定、經費餘額與撥款時間需分別確認；列入清單不代表已取得補助資格。</p></div>
      {resource.cautions.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100"><h4 className="font-bold">申請前留意</h4><ul className="list-disc pl-5">{resource.cautions.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      <div className="border-t border-neutral-200 pt-4 text-xs leading-6 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        <p>{GEOGRAPHY_LABELS[resource.geographicBasis]} · {resource.regions.join('、')}</p>
        <p>核對日期：<time dateTime={resource.checkedAt}>{resource.checkedAt}</time> · {VERIFICATION_LABELS[resource.verification]}{status.stale && ' · 待重新核對'}</p>
        {resource.source.publishedOn && <p>來源發布／修正日：{resource.source.publishedOn}</p>}{resource.source.rocYear && <p>來源適用年度：民國 {resource.source.rocYear} 年</p>}
        <p>來源：<ResourceLink href={resource.source.url}>{resource.source.title}</ResourceLink></p>
        {print && <p className="ResourceSourceUrl">{resource.source.url}</p>}
      </div>
    </div>
  )
}
