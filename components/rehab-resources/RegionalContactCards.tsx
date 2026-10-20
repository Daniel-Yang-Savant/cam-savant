import { REGIONAL_CONTACTS } from '@/lib/rehab-resources/regional-contacts'
import { PRIORITY_REGIONS, type Region } from '@/lib/rehab-resources/types'
import { ResourceLink, resourceTelephone } from './ResourceLinks'

export default function RegionalContactCards({ regions, variant = 'uncovered' }: { regions: Region[]; variant?: 'uncovered' | 'fallback' }) {
  const contacts = REGIONAL_CONTACTS.filter((contact) => regions.includes(contact.region) && (variant === 'fallback' || !PRIORITY_REGIONS.includes(contact.region)))
  if (!contacts.length) return null
  return <section className="mb-6 rounded-2xl border border-teal-200 bg-teal-50/40 p-5 sm:p-6 dark:border-teal-900 dark:bg-teal-950/20" aria-label="所選縣市官方窗口">
    <h2 className="text-xl font-bold">先找所選縣市官方窗口</h2>
    <p className="mt-3 text-base leading-8">{variant === 'fallback' ? '點官方網頁找承辦窗口，詢問福利、急難救助或兒童服務。' : '以下縣市尚未逐筆整理在地方案，先從官方窗口查詢。全國性服務仍會列在下方。'}</p>
    <ul className="mt-5 grid gap-4 sm:grid-cols-2">{contacts.map((contact) => <li key={contact.region} className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950">
      <h3 className="text-lg font-bold">{contact.region}</h3><p className="mt-2 text-base leading-7">{contact.name}</p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-base"><ResourceLink href={contact.url}>福利申辦與聯絡窗口 ↗</ResourceLink>{contact.earlyInterventionUrl && <ResourceLink href={contact.earlyInterventionUrl}>兒童早療資訊 ↗</ResourceLink>}</div>
      {contact.phone && <a className="mt-3 inline-flex min-h-12 items-center text-base font-semibold text-teal-800 underline underline-offset-4 dark:text-teal-300" href={`tel:${resourceTelephone(contact.phone)}`}>電話：{contact.phone}</a>}
      <p className="mt-3 text-sm text-neutral-500">官方窗口資料核對：{contact.checkedAt}</p>
    </li>)}</ul>
  </section>
}
