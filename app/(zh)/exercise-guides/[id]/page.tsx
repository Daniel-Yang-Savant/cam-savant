import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import ExerciseGuideAnalytics from '@/components/ExerciseGuideAnalytics'
import ExerciseGuideModuleCard from '@/components/ExerciseGuideModuleCard'
import { EXERCISE_GUIDE_MODULES, getExerciseGuideById } from '@/lib/exercise-guides'
import { getRelatedExerciseGuides } from '@/lib/exercise-guide-related'
import { generateBreadcrumbSchema, generateExerciseGuideSchema } from '@/lib/schema'

const BASE_URL = 'https://camsavant.com'

interface Props {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return EXERCISE_GUIDE_MODULES.map((guide) => ({ id: guide.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const guide = getExerciseGuideById(id)
  if (!guide) return {}

  const url = `/exercise-guides/${guide.id}`

  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${guide.title}｜CAM Savant 圖解運動`,
      description: guide.summary,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${guide.title}｜CAM Savant 圖解運動`,
      description: guide.summary,
    },
  }
}

export default async function ExerciseGuideDetailPage({ params }: Props) {
  const { id } = await params
  const guide = getExerciseGuideById(id)
  if (!guide) notFound()

  const category = guide.kind === 'relaxation' ? '放鬆運動' : '研究運動'
  const pageUrl = `${BASE_URL}/exercise-guides/${guide.id}`
  const relatedGuides = getRelatedExerciseGuides(
    guide,
    EXERCISE_GUIDE_MODULES,
    guide.kind === 'condition' ? 8 : 4
  )

  const pageSchema = generateExerciseGuideSchema(guide)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首頁', url: BASE_URL },
              { name: '圖解運動專區', url: `${BASE_URL}/exercise-guides` },
              { name: guide.selectionLabel, url: pageUrl },
            ])
          ),
        }}
      />
      <ExerciseGuideAnalytics slug={guide.id} placement="exercise-guide-detail" />

      <div className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: '首頁', href: '/' },
              { label: '圖解運動專區', href: '/exercise-guides' },
              { label: guide.selectionLabel },
            ]}
          />
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-neutral-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-neutral-300">
            <strong className="text-neutral-950 dark:text-neutral-100">一般民眾衛教：</strong>
            本頁協助理解安全自我照護與研究中的運動方向，不取代個別診斷、現場動作評估或治療處方；請先閱讀每頁的紅黃綠燈與不適用情況。
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
              {category}
            </span>
            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              {guide.kind === 'relaxation'
                ? `部位：${guide.selectionLabel}`
                : `適合情況：${guide.selectionLabel}`}
            </span>
          </div>
        </div>
      </div>

      <div>
        <ExerciseGuideModuleCard guide={guide} asPage />

        <section className="ExerciseGuideRelated border-t border-neutral-200 bg-neutral-50 py-12 dark:border-neutral-800 dark:bg-neutral-950 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] uppercase text-teal-700 dark:text-teal-300">
                  {category}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100">
                  選擇其他{guide.kind === 'relaxation' ? '部位' : '適合情況'}
                </h2>
              </div>
              <Link
                href="/exercise-guides"
                className="shrink-0 text-sm font-bold text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
              >
                查看全部分類
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedGuides.map((item) => (
                <Link
                  key={item.id}
                  href={`/exercise-guides/${item.id}`}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-teal-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-teal-600"
                >
                  <p className="text-sm font-bold text-neutral-950 dark:text-neutral-100">
                    {item.selectionLabel}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
