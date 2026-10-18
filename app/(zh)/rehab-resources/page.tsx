import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import ResourceDirectory from '@/components/rehab-resources/ResourceDirectory'
import { REHAB_RESOURCES, RESOURCE_UPDATED_AT } from '@/lib/rehab-resources'

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
  const schemes = REHAB_RESOURCES.filter((resource) => resource.resourceType === 'scheme').length
  const referrals = REHAB_RESOURCES.length - schemes
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
          <Breadcrumbs items={[{ label: '首頁', href: '/' }, { label: '補助與援助' }]} className="mb-7" />
          <div className="max-w-3xl"><p className="text-xs font-bold tracking-[0.18em] text-teal-800 dark:text-teal-300">復健家庭 · 資源與支持</p><h1 className="mt-4 text-3xl font-bold leading-snug tracking-tight md:text-4xl">復健科常見疾病<span className="mt-2 block text-2xl font-medium leading-snug text-neutral-600 dark:text-neutral-300 md:text-3xl">全台政府和民間補助與援助查詢</span></h1><p className="mt-5 text-base leading-8 text-neutral-600 dark:text-neutral-300">從疾病、所在地與需要的協助開始，整理值得詢問的資源，<br className="hidden sm:block" />帶著清單，和醫院社工一起確認下一步。</p></div>
          <div className="mt-7 flex flex-wrap gap-2 text-xs text-neutral-600 dark:text-neutral-300"><span className="rounded-full border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">22 縣市官方窗口</span><span className="rounded-full border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">{schemes} 筆補助方案 · {referrals} 筆服務與指引</span><span className="rounded-full border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">彰化 · 南投 · 台中 · 雲林優先整理</span></div>
          <details className="mt-6 max-w-3xl text-sm leading-7 text-neutral-500 dark:text-neutral-400"><summary className="min-h-11 cursor-pointer py-2 font-medium">收錄範圍、核對方式與使用提醒</summary><div className="mt-2 space-y-3 rounded-2xl border border-neutral-200 bg-white/80 p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <p>兩大入口涵蓋中風、脊髓損傷、腦傷，以及發展遲緩、ADHD、自閉症、腦性麻痺、SMA 與肌肉失養症。神經肌肉疾病的成年患者也可查詢；疑似或評估中仍可尋找服務入口。</p>
            <p>疾病名稱不等同身障、重大傷病或罕病認定，也不代表自動符合早療補助。各方案另有年齡、就學、戶籍、經濟、證明及功能評估等條件，以當地現行辦法與承辦認定為準。</p>
            <p>首版提供全國性資源及 22 縣市政府窗口，地方方案優先整理彰化、南投、台中、雲林。尚未涵蓋所有地方慈善會或醫院專款；查無結果不代表沒有協助。</p>
            <p>逐筆標示來源與核對日期；網頁核對不等同已向窗口確認經費。逾公告期限會標示截止，超過建議複核週期的受理資訊會改為需詢問，不自動推定次年度開放。</p>
            <p>本工具提供資源整理與轉介準備，不代辦、不審核補助。資料整理：<time dateTime={RESOURCE_UPDATED_AT}>{RESOURCE_UPDATED_AT}</time>；個別資源核對日請見各卡片。</p>
          </div></details>
        </div>
      </header>
      <ResourceDirectory />
    </div>
  )
}
