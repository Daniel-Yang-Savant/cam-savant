import { safeJsonLd } from '@/lib/safe-json'
import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleReview from '@/components/ArticleReview'
import Breadcrumbs from '@/components/Breadcrumbs'
import ExerciseGuideAnalytics from '@/components/ExerciseGuideAnalytics'
import ExerciseGuideDirectory from '@/components/ExerciseGuideDirectory'
import {
  EXERCISE_GUIDE_MODULES,
  getExerciseGuideCollectionModifiedDate,
  getExerciseGuideSupervision,
} from '@/lib/exercise-guides'
import { EXERCISE_GUIDE_REVIEW } from '@/lib/exercise-guide-review'
import { getAuthor } from '@/lib/authors'
import { generateBreadcrumbSchema, generateCollectionPageSchema, generatePhysicianSchema } from '@/lib/schema'

const BASE_URL = 'https://camsavant.com'
const DESCRIPTION = '依部位選擇日常放鬆運動，跟著居家與健身房情境的圖解輕輕活動；也可依症狀或已確認的診斷查找指引與研究中的運動方向。'

export const metadata: Metadata = {
  title: '圖解運動專區｜安全自我照護與漸進運動',
  description: DESCRIPTION,
  alternates: { canonical: '/exercise-guides' },
  openGraph: {
    title: '圖解運動專區｜安全自我照護與漸進運動',
    description: DESCRIPTION,
    url: '/exercise-guides',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '圖解運動專區｜安全自我照護與漸進運動',
    description: DESCRIPTION,
  },
}

export default function ExerciseGuidesPage() {
  const pendingCount = EXERCISE_GUIDE_MODULES.filter((guide) => guide.reviewStatus === 'pending').length
  const modifiedDate = getExerciseGuideCollectionModifiedDate(EXERCISE_GUIDE_MODULES)
  const hasIndividualReviewStatus = EXERCISE_GUIDE_MODULES.some((guide) => guide.reviewStatus !== undefined)
  const collectionSchema = {
    ...generateCollectionPageSchema({
      name: '圖解運動專區',
      description: DESCRIPTION,
      url: `${BASE_URL}/exercise-guides`,
      specialty: 'PhysicalMedicineAndRehabilitation',
    }),
    datePublished: EXERCISE_GUIDE_REVIEW.publishedDate,
    dateModified: modifiedDate,
    ...(!hasIndividualReviewStatus ? {
      lastReviewed: EXERCISE_GUIDE_REVIEW.date,
      reviewedBy: generatePhysicianSchema(getAuthor(EXERCISE_GUIDE_REVIEW.reviewerKey)),
    } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
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
          __html: safeJsonLd(
            generateBreadcrumbSchema([
              { name: '首頁', url: BASE_URL },
              { name: '圖解運動專區', url: `${BASE_URL}/exercise-guides` },
            ])
          ),
        }}
      />
      <ExerciseGuideAnalytics />

      <header className="border-b border-neutral-200 bg-gradient-to-b from-teal-50 to-white dark:border-neutral-800 dark:from-teal-950/30 dark:to-neutral-950">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <Breadcrumbs
            items={[{ label: '首頁', href: '/' }, { label: '圖解運動專區' }]}
            className="mb-7"
          />
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-teal-700 dark:text-teal-300">CAM Savant Visual Exercise Guides</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-neutral-950 dark:text-neutral-100 md:text-5xl">圖解運動專區</h1>
            <p className="mt-5 text-base leading-7 text-neutral-600 dark:text-neutral-300 md:text-lg">從想放鬆的部位開始，讓日常多一點活動。<br className="hidden sm:block" />也能依症狀或已確認的診斷，了解相關的運動方向。</p>
            <details className="group mt-5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-medium text-neutral-600 dark:text-neutral-300">內容與使用提醒</summary>
              <div className="mt-2 space-y-3 rounded-2xl border border-neutral-200 bg-white/80 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <p>內容是一般健康教育，不取代個別診斷或治療。近期受傷、手術後，或有持續加重的症狀，請先接受專業評估。</p>
                <p>放鬆運動依一般衛教來源整理；研究方案另說明研究對象與限制。研究劑量不等於個人處方，圖片為合成教學影像或原創示意。</p>
                <p>共 {EXERCISE_GUIDE_MODULES.length} 篇圖解與研究方案{pendingCount > 0 && <>，含 {pendingCount} 篇待醫療審閱內容</>}，各頁標示內容確認狀態。</p>
                <p className="text-xs">內容更新：<time dateTime={modifiedDate}>{modifiedDate}</time></p>
                {!hasIndividualReviewStatus && <ArticleReview metadata={{ reviewedBy: EXERCISE_GUIDE_REVIEW.reviewerKey, lastReviewed: EXERCISE_GUIDE_REVIEW.date }} />}
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <Link href="/locations" className="font-semibold text-teal-700 underline underline-offset-4 dark:text-teal-300">查看看診資訊</Link>
                  <Link href="/about" className="font-semibold text-teal-700 underline underline-offset-4 dark:text-teal-300">查看醫師團隊</Link>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div>
        <ExerciseGuideDirectory
          items={EXERCISE_GUIDE_MODULES.map((guide) => ({
            id: guide.id,
            kind: guide.kind,
            evidenceKind: guide.evidenceKind,
            reviewStatus: guide.reviewStatus,
            relaxationArea: guide.relaxationArea,
            selectionLabel: guide.selectionLabel,
            title: guide.title,
            summary: guide.summary,
            bodyRegion: guide.bodyRegion,
            searchAliases: guide.searchAliases,
            supervision: getExerciseGuideSupervision(guide),
            image: {
              src: guide.cover?.src ?? guide.images[0].src,
              alt: guide.cover?.alt ?? guide.images[0].alt,
            },
          }))}
        />
      </div>
    </>
  )
}
