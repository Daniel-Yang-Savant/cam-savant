import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import ResourceDirectory from '@/components/rehab-resources/ResourceDirectory'
import GovernmentLinks from '@/components/rehab-resources/GovernmentLinks'
import { RESOURCE_UPDATED_AT } from '@/lib/rehab-resources'

const TITLE = '復健科常見疾病｜全台政府和民間補助與援助查詢'
const DESCRIPTION = '依疾病、所在地與協助需求查找復健、早療、交通、輔具、照顧及急難資源。全台官方窗口，優先整理彰化、南投、台中、雲林，附受理狀態、核對日期與可列印的社工討論清單。'

export const dynamic = 'force-static'
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/rehab-resources' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/rehab-resources', type: 'website' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

export default function RehabResourcesPage() {
  return (
    <div className="RehabResourcesPage text-neutral-950 dark:text-neutral-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: TITLE, description: DESCRIPTION, url: 'https://camsavant.com/rehab-resources',
        datePublished: RESOURCE_UPDATED_AT, dateModified: RESOURCE_UPDATED_AT,
        inLanguage: 'zh-TW', isPartOf: { '@id': 'https://camsavant.com/#website' },
        breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://camsavant.com/' },
          { '@type': 'ListItem', position: 2, name: '補助與援助', item: 'https://camsavant.com/rehab-resources' },
        ] },
      }) }} />
      <header className="ResourceScreenOnly border-b border-neutral-200 bg-gradient-to-b from-teal-50/70 to-white dark:border-neutral-800 dark:from-teal-950/20 dark:to-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 md:py-14 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '補助與援助' }]} />
            <GovernmentLinks />
          </div>
          <div className="max-w-3xl"><h1 className="text-3xl font-bold leading-snug tracking-tight md:text-4xl">復健科常見疾病<span className="mt-2 block text-2xl font-medium leading-snug text-neutral-600 dark:text-neutral-300 md:text-3xl">全台政府和民間補助與援助查詢</span></h1><p className="mt-5 text-base leading-8 text-neutral-600 dark:text-neutral-300">選疾病、選縣市、選需要，找到窗口後打電話，或列印帶去問社工。</p></div>
        </div>
      </header>
      <ResourceDirectory />
    </div>
  )
}
