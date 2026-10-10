'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useAdminSession } from '@/components/AdminSessionProvider'
import { getExerciseGuideDates, type ExerciseGuideModule } from '@/lib/exercise-guides'

interface RelaxationGuideContentProps {
  guide: ExerciseGuideModule
  asPage?: boolean
}

export default function RelaxationGuideContent({ guide, asPage = false }: RelaxationGuideContentProps) {
  const Heading = asPage ? 'h1' : 'h2'
  const dates = getExerciseGuideDates(guide)
  const { authenticated: isAdmin } = useAdminSession()
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null)
  const imageDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = imageDialogRef.current
    if (!dialog) return
    if (expandedImageIndex !== null && !dialog.open) dialog.showModal()
    if (expandedImageIndex === null && dialog.open) dialog.close()
  }, [expandedImageIndex])

  const expandedImage = expandedImageIndex === null ? null : guide.images[expandedImageIndex]

  return (
    <section id={guide.id} className={`scroll-mt-24 py-10 md:py-14 ${asPage ? '' : 'border-t border-neutral-200 dark:border-neutral-800'}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.16em] text-teal-700 dark:text-teal-300">{guide.eyebrow}</p>
          <Heading className="mt-3 text-3xl font-bold leading-tight text-neutral-950 dark:text-neutral-100 md:text-5xl">{guide.title}</Heading>
          <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300 md:text-lg">{guide.summary}</p>
          <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{guide.suitableFor}</p>
        </header>

        <div className="mt-7 rounded-2xl bg-teal-50 px-5 py-4 text-sm leading-6 text-teal-950 dark:bg-teal-950/40 dark:text-teal-100">
          <p><strong>跟著自己的節奏：</strong>{guide.dosage}</p>
          <p className="mt-1 text-teal-800 dark:text-teal-200">{guide.cue}</p>
        </div>

        <ol className="RelaxationGuideStepList mt-8 grid gap-6 print:gap-4" aria-label={`${guide.selectionLabel}放鬆動作`}>
          {guide.images.map((image, index) => {
            const step = guide.steps?.[index]
            return (
              <li key={image.src} id={`step-${index + 1}`} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 print:break-inside-avoid">
                <div className="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
                  {image.paired && (
                    <div className="grid grid-cols-2 px-4 pt-4 text-center text-xs font-semibold tracking-wider text-neutral-500 dark:text-neutral-400">
                      <span>準備</span><span>動作</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedImageIndex(index)}
                    aria-haspopup="dialog"
                    aria-label={`放大查看：${image.alt}`}
                    className="group/image relative block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width ?? 1536}
                      height={image.height ?? 576}
                      priority={asPage && index === 0}
                      sizes="(max-width: 1152px) calc(100vw - 32px), 1088px"
                      className="h-auto w-full object-contain"
                    />
                    <span className="ExerciseGuidePrintHide absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white">點圖放大</span>
                  </button>
                </div>
                <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_220px] lg:gap-8">
                  <div>
                    <h2 className="flex items-center gap-3 text-lg font-bold text-neutral-950 dark:text-neutral-100 md:text-xl">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm text-white dark:bg-teal-600">{String(index + 1).padStart(2, '0')}</span>
                      {step?.title ?? image.caption}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300 md:text-base">{step?.instruction ?? image.caption}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm leading-6 dark:bg-neutral-950/60">
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300">起步量</p>
                    <p className="mt-1 text-neutral-700 dark:text-neutral-200">{step?.dosage ?? image.step}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <aside className="mt-7 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-sm leading-6 text-neutral-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-neutral-300" aria-labelledby={`${guide.id}-safety`}>
          <h2 id={`${guide.id}-safety`} className="font-bold text-neutral-950 dark:text-neutral-100">做的時候留意</h2>
          <p className="mt-2"><strong>不舒服先停：</strong>{guide.signals.yellow}</p>
          <p className="mt-2"><strong>輕鬆一點：</strong>{guide.regression}</p>
          <p className="mt-2"><strong>停止並評估：</strong>{guide.signals.red}</p>
          <p className="mt-2">{guide.followUp}</p>
        </aside>

        <details className="group mt-6 border-y border-neutral-200 px-1 py-3 dark:border-neutral-800">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300 [&::-webkit-details-marker]:hidden">
            <span>參考資料</span>
            <span aria-hidden="true" className="text-xl font-normal text-neutral-400 transition-transform group-open:rotate-45">＋</span>
          </summary>
          <ul className="space-y-3 pb-4 pt-2">
            {guide.sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="text-sm leading-6 text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100">{source.label}</a>
              </li>
            ))}
          </ul>
        </details>

        <footer className="mt-5 flex flex-wrap items-start justify-between gap-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
          <div>
            <p className="ExerciseGuideDisclosure">合成教學影像 · 動作幅度依個人舒適度調整。</p>
            <p className="mt-1">內容更新：<time dateTime={dates.modifiedDate}>{dates.modifiedDate}</time>
              {guide.reviewStatus === 'pending' && <>{' · '}待醫療審閱</>}
              {guide.reviewStatus === 'approved' && <>{' · '}內容已由網站內容負責人確認{guide.approvalDate && <>（<time dateTime={guide.approvalDate}>{guide.approvalDate}</time>）</>}</>}
            </p>
          </div>
          {isAdmin && <button type="button" onClick={() => window.print()} className="ExerciseGuidePrintHide inline-flex min-h-10 items-center rounded-full border border-neutral-300 px-4 font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">列印／另存 PDF</button>}
        </footer>

        <dialog
          ref={imageDialogRef}
          aria-label={expandedImage?.alt ?? '圖解放大檢視'}
          onClose={() => setExpandedImageIndex(null)}
          onCancel={() => setExpandedImageIndex(null)}
          onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close() }}
          className="ExerciseGuidePrintHide m-auto max-h-[92vh] w-[min(96vw,1440px)] rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl backdrop:bg-black/75 dark:border-neutral-700 dark:bg-neutral-950"
        >
          {expandedImage && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-4 px-1">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{expandedImage.caption}</p>
                <button type="button" onClick={() => imageDialogRef.current?.close()} className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-neutral-300 px-4 text-sm font-bold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">關閉</button>
              </div>
              <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400 md:hidden">左右滑動查看放大的姿勢</p>
              <div className="overflow-x-auto rounded-xl" tabIndex={0} aria-label="放大圖解，可左右捲動">
                <Image src={expandedImage.src} alt={expandedImage.alt} width={expandedImage.width ?? 1152} height={expandedImage.height ?? 432} sizes="(max-width: 768px) 768px, 96vw" className="h-auto w-full min-w-[768px] object-contain" />
              </div>
            </div>
          )}
        </dialog>
      </div>
    </section>
  )
}
