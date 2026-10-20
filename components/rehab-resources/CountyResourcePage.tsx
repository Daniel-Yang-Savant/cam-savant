import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import ResourceDetails, { ResourceLink, resourceTelephone } from './ResourceDetails'
import { REHAB_RESOURCES, REGIONAL_CONTACTS, RESOURCE_GUIDES, RESOURCE_UPDATED_AT, groupResourceProviders, taipeiDate, visibleResources } from '@/lib/rehab-resources'
import { COUNTY_RESOURCE_PAGES, countyResourceDescription, countyResourceTitle, type CountyResourcePage as CountyPage } from '@/lib/rehab-resources/counties'
import { resourceReportUrl } from '@/lib/rehab-resources/report'
import { resourceFreshness } from '@/lib/rehab-resources/freshness'
import ResourceContact from './ResourceContact'
import type { RehabResource } from '@/lib/rehab-resources/types'

const BASE_URL = 'https://camsavant.com'

export default function CountyResourcePage({ county, resources = REHAB_RESOURCES, today = taipeiDate() }: { county: CountyPage; resources?: RehabResource[]; today?: string }) {
  const localCatalogue = resources.filter((resource) => resource.regions.includes(county.region))
  const localResources = visibleResources(localCatalogue, today)
  const providers = groupResourceProviders([...localResources].sort((left, right) => Number(resourceFreshness(right, today).level === 'full') - Number(resourceFreshness(left, today).level === 'full')))
  const contact = REGIONAL_CONTACTS.find((item) => item.region === county.region)
  const hiddenCount = localCatalogue.length - localResources.length
  const url = `${BASE_URL}/rehab-resources/${county.slug}`
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: countyResourceTitle(county),
    description: countyResourceDescription(county),
    url,
    inLanguage: 'zh-TW',
    dateModified: RESOURCE_UPDATED_AT,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: '補助與援助', item: `${BASE_URL}/rehab-resources` },
        { '@type': 'ListItem', position: 3, name: `${county.label}資源`, item: url },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      name: `${county.region}復健補助與援助單位`,
      numberOfItems: providers.length,
      itemListElement: providers.map((provider, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: provider.name,
        url: `${url}#unit-${index + 1}`,
      })),
    },
  }

  return (
    <div className="text-neutral-950 dark:text-neutral-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, '\\u003c') }} />
      <header className="border-b border-neutral-200 bg-gradient-to-b from-teal-50/70 to-white dark:border-neutral-800 dark:from-teal-950/20 dark:to-neutral-950">
        <div className="mx-auto max-w-5xl px-4 py-9 sm:px-6 md:py-14 lg:px-8">
          <Breadcrumbs className="mb-6" items={[{ label: '首頁', href: '/' }, { label: '補助與援助', href: '/rehab-resources' }, { label: `${county.label}資源` }]} />
          <h1 className="text-3xl font-bold leading-snug tracking-tight md:text-4xl">{county.label}復健補助與援助</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-neutral-600 dark:text-neutral-300">這裡列出服務範圍包含{county.region}的政府、基金會、團體與醫院。各單位的戶籍、服務區域或就醫院所限制不同，請先看「適用對象」。</p>
          <Link href="/rehab-resources" prefetch={false} className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-5 py-3 font-bold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">依疾病與需要查詢、製作列印清單 →</Link>
          <nav aria-label="其他中部縣市資源" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-7">
            {COUNTY_RESOURCE_PAGES.filter((item) => item.slug !== county.slug).map((item) => <Link key={item.slug} href={`/rehab-resources/${item.slug}`} className="min-h-11 py-2 underline underline-offset-4 hover:text-teal-700 dark:hover:text-teal-300">{item.label}資源</Link>)}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {contact && <section aria-labelledby="county-contact-heading" className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 dark:border-teal-900 dark:bg-teal-950/20 sm:p-6">
          <h2 id="county-contact-heading" className="text-xl font-bold">找不到需要的幫忙？先問{county.region}窗口</h2>
          <p className="mt-3 leading-8 text-neutral-700 dark:text-neutral-300">{contact.name}可協助找身障福利、急難救助或兒童服務承辦。這是官方窗口，未列入下方補助與服務單位數。</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 leading-8">
            <ResourceLink href={contact.url}>{contact.name} ↗</ResourceLink>
            {contact.earlyInterventionUrl && <ResourceLink href={contact.earlyInterventionUrl}>兒童早療資訊 ↗</ResourceLink>}
          </div>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">連結核對：<time dateTime={contact.checkedAt}>{contact.checkedAt}</time></p>
        </section>}

        <section aria-labelledby="county-resource-heading">
          <h2 id="county-resource-heading" className="text-2xl font-bold">{providers.length > 0 ? `${providers.length} 個提供在地服務的單位` : '在地資源正在重新核對'}</h2>
          <p className="mt-3 leading-8 text-neutral-600 dark:text-neutral-300">同一單位的不同服務合併列出。全國性方案請到<Link href="/rehab-resources" prefetch={false} className="underline underline-offset-4 hover:text-teal-700 dark:hover:text-teal-300">主查詢頁</Link>查找。</p>
          {hiddenCount > 0 && <p className="mt-3 rounded-xl bg-amber-50 p-4 leading-7 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">部分項目因久未核對或資料已有變動，暫不列出。若下方沒有需要的項目，請先聯絡上方官方窗口；這不代表當地沒有補助或服務。</p>}
          {providers.length > 0 ? <div className="mt-6 space-y-6">{providers.map((provider, index) => (
            <article key={provider.id} id={`unit-${index + 1}`} aria-labelledby={`unit-heading-${index + 1}`} className="scroll-mt-24 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <h3 id={`unit-heading-${index + 1}`} className="bg-neutral-50 px-5 py-5 text-xl font-bold leading-8 dark:bg-neutral-900 sm:px-6">{provider.name}</h3>
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">{provider.resources.map((resource) => {
                const freshness = resourceFreshness(resource, today)
                if (freshness.level === 'hidden') return null
                if (freshness.level === 'contact-only') return <li key={resource.id} className="p-5 sm:p-6"><ResourceContact resource={resource} today={today} /></li>
                const guide = RESOURCE_GUIDES[resource.id]
                return <li key={resource.id} className="space-y-3 p-5 sm:p-6">
                  <h4 className="text-lg font-bold leading-8">{resource.title}</h4>
                  <p className="leading-8 text-neutral-700 dark:text-neutral-300">{guide.help}</p>
                  <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-400">資料核對：<time dateTime={resource.checkedAt}>{resource.checkedAt}</time> · 來源：<ResourceLink href={resource.source.url}>{resource.source.title}</ResourceLink></p>
                  <p className="text-sm leading-7 text-neutral-500"><ResourceLink href={resourceReportUrl(resource.id)}>回報資料有誤</ResourceLink></p>
                  {resource.contact.phone && <p className="leading-8"><a href={`tel:${resourceTelephone(resource.contact.phone)}`} className="inline-flex min-h-11 items-center font-bold text-teal-700 underline underline-offset-4 dark:text-teal-300">電話：{resource.contact.phone}</a></p>}
                  <details className="rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <summary className="min-h-12 cursor-pointer px-4 py-3 font-bold leading-7 hover:text-teal-700 dark:hover:text-teal-300">適用對象與申請方式</summary>
                    <div className="space-y-5 border-t border-neutral-200 p-4 dark:border-neutral-700 sm:p-5">
                      <div><h5 className="font-bold leading-8">適用對象</h5><p className="leading-8 text-neutral-700 dark:text-neutral-300">{guide.who}</p></div>
                      <div><h5 className="font-bold leading-8">第一步</h5><p className="leading-8 text-neutral-700 dark:text-neutral-300">{guide.firstStep}</p></div>
                      <div><h5 className="font-bold leading-8">送件與轉介</h5><p className="leading-8 text-neutral-700 dark:text-neutral-300">{resource.application}</p></div>
                      <ResourceDetails resource={resource} today={today} detailsOnly />
                    </div>
                  </details>
                </li>
              })}</ul>
            </article>
          ))}</div> : <p className="mt-5 leading-8 text-neutral-700 dark:text-neutral-300">目前沒有通過當期核對的在地項目。請從上方{county.region}官方窗口取得最新申請規定，或回主查詢頁尋找全國性服務。</p>}
        </section>
      </div>
    </div>
  )
}
