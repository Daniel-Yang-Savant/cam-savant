import { REGIONAL_CONTACTS } from '@/lib/rehab-resources/regional-contacts'
import { ResourceLink } from './ResourceDetails'

const GOVERNMENT_LINKS = [
  { name: '衛生福利部', url: 'https://www.mohw.gov.tw/' },
  { name: '社會及家庭署', url: 'https://www.sfaa.gov.tw/' },
  { name: '1966 長照服務', url: 'https://1966.gov.tw/LTC/mp-207.html' },
  { name: '1957 福利諮詢', url: 'https://www.mohw.gov.tw/cp-7183-81286-1.html' },
  { name: '身心障礙福利與輔具', url: 'https://www.mohw.gov.tw/fp-88-235-1.html' },
  { name: '早期療育申辦資訊', url: 'https://www.gov.tw/News_Content_26_578611' },
]

export default function GovernmentLinks() {
  return (
    <details className="ResourceGovernmentLinks group relative shrink-0">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 hover:border-teal-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 [&::-webkit-details-marker]:hidden">
        相關網頁
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 6 4 4 4-4" /></svg>
      </summary>
      <div className="absolute right-0 top-full z-30 mt-3 max-h-[70vh] w-[min(38rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-950">
        <p className="mb-3 text-xs font-semibold text-neutral-500">常用政府網站</p>
        <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {GOVERNMENT_LINKS.map((item) => <li key={item.url} className="flex min-h-11 items-center text-sm"><ResourceLink href={item.url}>{item.name} ↗</ResourceLink></li>)}
        </ul>
        <details className="mt-4 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">各縣市政府窗口</summary>
          <ul className="mt-2 grid gap-x-5 gap-y-1 sm:grid-cols-2">
            {REGIONAL_CONTACTS.map((contact) => <li key={contact.region} className="min-h-11 py-2 text-sm"><ResourceLink href={contact.url}>{contact.name} ↗</ResourceLink></li>)}
          </ul>
        </details>
      </div>
    </details>
  )
}
