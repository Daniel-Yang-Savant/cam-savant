import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import ExerciseGuideAnalytics from '@/components/ExerciseGuideAnalytics'
import ExerciseGuideDirectory from '@/components/ExerciseGuideDirectory'
import { EXERCISE_GUIDE_MODULES } from '@/lib/exercise-guides'
import { generateBreadcrumbSchema, generateCollectionPageSchema } from '@/lib/schema'

const BASE_URL = 'https://camsavant.com'
const DESCRIPTION = '先選擇放鬆運動的身體部位，或依適應證進入有隨機對照試驗支持的運動方案，再查看連續圖片、劑量、降階方式與停止警訊。'

export const metadata: Metadata = {
  title: '圖解運動專區｜安全自我照護與漸進運動',
  description: DESCRIPTION,
  alternates: { canonical: '/exercise-guides' },
  openGraph: {
    title: '圖解運動專區｜安全自我照護與漸進運動',
    description: DESCRIPTION,
    url: '/exercise-guides',
    type: 'website',
    images: [
      {
        url: '/images/exercise-guides/og-exercise-guides.png',
        width: 1536,
        height: 1024,
        alt: 'CAM Savant 圖解運動專區',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '圖解運動專區｜安全自我照護與漸進運動',
    description: DESCRIPTION,
    images: ['/images/exercise-guides/og-exercise-guides.png'],
  },
}

export default function ExerciseGuidesPage() {
  const collectionSchema = generateCollectionPageSchema({
    name: '圖解運動專區',
    description: DESCRIPTION,
    url: `${BASE_URL}/exercise-guides`,
    specialty: 'PhysicalMedicineAndRehabilitation',
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...collectionSchema,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: EXERCISE_GUIDE_MODULES.map((guide, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: guide.title,
                url: `${BASE_URL}/exercise-guides/${guide.id}`,
              })),
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首頁', url: BASE_URL },
              { name: '圖解運動專區', url: `${BASE_URL}/exercise-guides` },
            ])
          ),
        }}
      />
      <ExerciseGuideAnalytics />

      <header className="border-b border-neutral-200 bg-gradient-to-b from-teal-50 to-white dark:border-neutral-800 dark:from-teal-950/30 dark:to-neutral-950">
        <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <Breadcrumbs
            items={[{ label: '首頁', href: '/' }, { label: '圖解運動專區' }]}
            className="mb-8"
          />

          <div className="max-w-4xl">
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-teal-700 dark:text-teal-300">
              CAM Savant Visual Exercise Guides
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-neutral-950 dark:text-neutral-100 md:text-6xl">
              圖解運動專區
            </h1>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-neutral-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-neutral-300">
            <strong className="text-neutral-950 dark:text-neutral-100">先確認安全：</strong>
            這些內容是一般健康教育，不取代個別診斷或治療。近期外傷、症狀快速惡化，或出現麻木、無力、明顯腫脹、胸痛、呼吸困難時，請先停止並依警示程度就醫。
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/locations"
              className="inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-bold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              查看看診資訊
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-bold text-neutral-800 transition-colors hover:border-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
            >
              查看醫師團隊
            </Link>
          </div>

          <p className="mt-5 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            示範圖為合成教學影像；實際動作請依個別能力與當下反應調整。
          </p>
        </div>
      </header>

      <main>
        <ExerciseGuideDirectory
          items={EXERCISE_GUIDE_MODULES.map((guide) => ({
            id: guide.id,
            kind: guide.kind,
            selectionLabel: guide.selectionLabel,
            title: guide.title,
            summary: guide.summary,
            bodyRegion: guide.bodyRegion,
            searchAliases: guide.searchAliases,
            image: {
              src: guide.images[0].src,
              alt: guide.images[0].alt,
            },
          }))}
        />
      </main>
    </>
  )
}
