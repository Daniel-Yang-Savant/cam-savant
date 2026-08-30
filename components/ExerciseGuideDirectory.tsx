'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { ExerciseGuideKind } from '@/lib/exercise-guides'

const FEATURED_CONDITION_COUNT = 6

export interface ExerciseGuideDirectoryItem {
  id: string
  kind: ExerciseGuideKind
  selectionLabel: string
  title: string
  summary: string
  image: {
    src: string
    alt: string
  }
}

interface ExerciseGuideDirectoryProps {
  items: ExerciseGuideDirectoryItem[]
}

const DIRECTORY_COPY: Record<
  ExerciseGuideKind,
  { tab: string; kicker: string; heading: string; description: string }
> = {
  relaxation: {
    tab: '放鬆運動',
    kicker: '一般健康教育',
    heading: '選擇想放鬆的部位',
    description: '適合工作後的一般疲勞或緊繃感；先選部位，再查看該組的連續動作。',
  },
  condition: {
    tab: '依適應證選擇',
    kicker: 'RCT 運動方案',
    heading: '選擇適應證',
    description: '這些運動來自特定臨床族群的研究；請先查看每組的適用對象、研究條件與證據限制。',
  },
}

export default function ExerciseGuideDirectory({ items }: ExerciseGuideDirectoryProps) {
  const [activeKind, setActiveKind] = useState<ExerciseGuideKind>('relaxation')
  const [showAllConditions, setShowAllConditions] = useState(false)
  const copy = DIRECTORY_COPY[activeKind]
  const visibleItems = items.filter((item) => item.kind === activeKind)
  const featuredItems =
    activeKind === 'condition'
      ? visibleItems.slice(0, FEATURED_CONDITION_COUNT)
      : visibleItems
  const additionalItems =
    activeKind === 'condition'
      ? visibleItems.slice(FEATURED_CONDITION_COUNT)
      : []

  return (
    <section className="border-t border-neutral-200 py-12 dark:border-neutral-800 md:py-16" aria-labelledby="exercise-directory-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2" role="tablist" aria-label="選擇運動類型">
          {(Object.keys(DIRECTORY_COPY) as ExerciseGuideKind[]).map((kind, index) => {
            const selected = kind === activeKind
            const count = items.filter((item) => item.kind === kind).length

            return (
              <button
                key={kind}
                id={`exercise-tab-${kind}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="exercise-directory-panel"
                onClick={() => {
                  setActiveKind(kind)
                  setShowAllConditions(false)
                }}
                className={`min-h-24 rounded-3xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                  selected
                    ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-950'
                    : 'border-neutral-200 bg-white text-neutral-950 hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-600'
                }`}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span
                      className={`inline-flex size-9 items-center justify-center rounded-full text-xs font-bold ${
                        selected
                          ? 'bg-white/15 text-white'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg font-bold">{DIRECTORY_COPY[kind].tab}</span>
                  </span>
                  <span className={`text-xs font-semibold ${selected ? 'text-teal-100' : 'text-neutral-400'}`}>
                    {count} 組
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div
          id="exercise-directory-panel"
          role="tabpanel"
          aria-labelledby={`exercise-tab-${activeKind}`}
          className="mt-10"
        >
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-teal-700 dark:text-teal-300">
            {copy.kicker}
          </p>
          <h2 id="exercise-directory-title" className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100 md:text-3xl">
            {copy.heading}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
            {copy.description}
          </p>

          {activeKind === 'condition' && additionalItems.length > 0 && (
            <p className="mt-3 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              先顯示 {featuredItems.length} 組圖解；其餘 {additionalItems.length} 組可展開快速瀏覽。
            </p>
          )}

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <Link
                key={item.id}
                href={`/exercise-guides/${item.id}`}
                className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    {activeKind === 'relaxation' ? '部位' : '適應證'}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-neutral-950 dark:text-neutral-100">
                    {item.selectionLabel}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-neutral-700 dark:text-neutral-300">
                    {item.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    {item.summary}
                  </p>
                  <span className="mt-5 inline-flex text-sm font-bold text-neutral-950 transition-transform group-hover:translate-x-1 dark:text-neutral-100">
                    查看圖解與劑量 →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {activeKind === 'condition' && additionalItems.length > 0 && (
            <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <div
                id="additional-condition-guides"
                className={`${showAllConditions ? 'grid' : 'hidden'} gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
              >
                  {additionalItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/exercise-guides/${item.id}`}
                      className="group rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-teal-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-teal-600"
                    >
                      <p className="text-xs font-bold text-teal-700 dark:text-teal-300">適應證</p>
                      <h3 className="mt-1 text-base font-bold text-neutral-950 dark:text-neutral-100">
                        {item.selectionLabel}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                        {item.title}
                      </p>
                      <span className="mt-4 inline-flex text-sm font-bold text-neutral-950 transition-transform group-hover:translate-x-1 dark:text-neutral-100">
                        查看研究圖解 →
                      </span>
                    </Link>
                  ))}
              </div>

              <button
                type="button"
                aria-expanded={showAllConditions}
                aria-controls="additional-condition-guides"
                onClick={() => setShowAllConditions((current) => !current)}
                className="mx-auto mt-2 flex min-h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-sm font-bold text-neutral-800 transition-colors hover:border-teal-600 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-teal-500 dark:hover:text-teal-200"
              >
                {showAllConditions
                  ? '收合其他研究'
                  : `顯示其餘 ${additionalItems.length} 組研究`}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
