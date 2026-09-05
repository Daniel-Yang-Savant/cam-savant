'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  getExerciseGuideFollowUp,
  type ExerciseGuideModule,
  type ExerciseGuideTheme,
} from '@/lib/exercise-guides'
import { EXERCISE_GUIDE_REVIEW } from '@/lib/exercise-guide-review'

const THEME_STYLES: Record<
  ExerciseGuideTheme,
  { eyebrow: string; badge: string; surface: string; border: string }
> = {
  orange: {
    eyebrow: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-600 text-white',
    surface: 'bg-orange-50/70 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-900',
  },
  teal: {
    eyebrow: 'text-teal-700 dark:text-teal-300',
    badge: 'bg-teal-700 text-white',
    surface: 'bg-teal-50/70 dark:bg-teal-950/20',
    border: 'border-teal-200 dark:border-teal-900',
  },
  violet: {
    eyebrow: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-700 text-white',
    surface: 'bg-violet-50/70 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-900',
  },
  blue: {
    eyebrow: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-700 text-white',
    surface: 'bg-blue-50/70 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-900',
  },
  green: {
    eyebrow: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-700 text-white',
    surface: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
}

interface ExerciseGuideModuleCardProps {
  guide: ExerciseGuideModule
  asPage?: boolean
}

export default function ExerciseGuideModuleCard({ guide, asPage = false }: ExerciseGuideModuleCardProps) {
  const theme = THEME_STYLES[guide.theme]
  const Heading = asPage ? 'h1' : 'h2'
  const [showAllSteps, setShowAllSteps] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/admin/session', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => {
        if (response.ok) setIsAdmin(true)
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])

  return (
    <section
      id={guide.id}
      className={`scroll-mt-24 py-12 md:py-16 ${
        asPage ? '' : 'border-t border-neutral-200 dark:border-neutral-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className={`text-xs font-bold tracking-[0.16em] uppercase ${theme.eyebrow}`}>
            {guide.eyebrow}
          </p>
          <Heading
            className={`mt-3 font-bold leading-tight text-neutral-950 dark:text-neutral-100 ${
              asPage ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
            }`}
          >
            {guide.title}
          </Heading>
          <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300 md:text-lg">
            {guide.summary}
          </p>
        </div>

        <ol
          className={`ExerciseGuideStepList mt-8 gap-3 rounded-3xl border p-3 ${theme.surface} ${theme.border} ${
            showAllSteps
              ? 'grid grid-cols-1 overflow-visible pb-3'
              : 'flex snap-x snap-mandatory overflow-x-auto pb-5'
          } md:grid md:overflow-visible md:pb-3 ${
            guide.images.length === 1
              ? 'md:grid-cols-1'
              : guide.images.length === 3
                ? 'md:grid-cols-3'
                : 'md:grid-cols-4'
          }`}
          aria-label={`${guide.title}動作步驟`}
        >
          {guide.images.map((image, imageIndex) => (
            <li
              key={image.src}
              id={`step-${imageIndex + 1}`}
              className={`${
                showAllSteps ? 'w-auto max-w-none' : 'w-[74vw] max-w-[360px] shrink-0 snap-center'
              } overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900 md:w-auto md:max-w-none`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width ?? 418}
                height={image.height ?? 941}
                priority={asPage && imageIndex === 0}
                sizes={
                  guide.images.length === 1
                    ? '(max-width: 768px) 74vw, 100vw'
                    : guide.images.length === 3
                      ? '(max-width: 768px) 74vw, 33vw'
                      : '(max-width: 768px) 74vw, 25vw'
                }
                className="h-auto w-full"
              />
              <div className="p-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${theme.badge}`}>
                  {image.step}
                </span>
                <p className="mt-3 text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
                  {image.caption}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="ExerciseGuidePrintHide mt-3 flex flex-wrap items-center justify-center gap-2 text-xs md:justify-between">
          <p className="text-neutral-500 dark:text-neutral-400 md:hidden">
            {showAllSteps ? '已一次展開全部步驟' : '左右滑動查看完整步驟'}
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:ml-auto">
            <button
              type="button"
              onClick={() => setShowAllSteps((current) => !current)}
              aria-expanded={showAllSteps}
              className="inline-flex min-h-10 items-center rounded-full border border-neutral-300 bg-white px-4 font-bold text-neutral-700 transition-colors hover:border-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-800 md:hidden"
            >
              {showAllSteps ? '改回左右滑動' : '一次展開全部步驟'}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => window.print()}
                className="PrintButton inline-flex min-h-10 items-center rounded-full border border-neutral-300 bg-white px-4 font-bold text-neutral-700 transition-colors hover:border-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
              >
                列印／另存 PDF
              </button>
            )}
          </div>
        </div>
        <p className="ExerciseGuideDisclosure mt-4 rounded-xl bg-neutral-100 px-4 py-3 text-xs leading-5 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
          示範圖為合成教學影像，已用於輔助理解而非取代現場動作評估；實際姿勢、幅度與支撐方式請依個別能力調整。
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-neutral-100">適合什麼情況</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{guide.suitableFor}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-neutral-100">做多久／幾次</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{guide.dosage}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-neutral-100">一句動作提示</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{guide.cue}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-neutral-100">降階方式</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{guide.regression}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 md:col-span-2">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-neutral-100">多久沒改善要評估</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{getExerciseGuideFollowUp(guide)}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-neutral-950 dark:text-neutral-100">用綠、黃、紅燈判斷反應</h3>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">綠燈｜可以繼續</p>
              <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">{guide.signals.green}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">黃燈｜減量觀察</p>
              <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">{guide.signals.yellow}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/30">
              <p className="text-sm font-bold text-rose-800 dark:text-rose-300">紅燈｜停止並評估</p>
              <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">{guide.signals.red}</p>
            </div>
          </div>
        </div>

        <details className="group mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-neutral-950 dark:text-neutral-100 [&::-webkit-details-marker]:hidden">
            <span>證據來源與適用對象</span>
            <span aria-hidden="true" className="text-xl font-normal text-neutral-400 transition-transform group-open:rotate-45">＋</span>
          </summary>
          <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">{guide.evidence}</p>
            <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              <strong>適用對象：</strong>{guide.audience}
            </p>
            <ul className="mt-4 space-y-2">
              {guide.sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent-700 underline decoration-accent-300 underline-offset-4 transition-colors hover:text-accent-900 dark:text-accent-300 dark:hover:text-accent-200"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>

        <div className="mt-6 flex flex-col gap-2 border-t border-neutral-200 pt-5 text-xs leading-5 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          <span>
            最後審閱：<time dateTime={EXERCISE_GUIDE_REVIEW.date}>{EXERCISE_GUIDE_REVIEW.date}</time>
          </span>
          <span>
            審閱者：
            <Link
              href="/doctors/yu-kai-yang"
              className="font-semibold text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
            >
              {EXERCISE_GUIDE_REVIEW.reviewerName}
            </Link>
            （{EXERCISE_GUIDE_REVIEW.reviewerTitle}，{EXERCISE_GUIDE_REVIEW.affiliation}）
          </span>
        </div>
      </div>
    </section>
  )
}
