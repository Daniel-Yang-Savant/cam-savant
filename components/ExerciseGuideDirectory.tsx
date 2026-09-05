'use client'

import Fuse from 'fuse.js'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type {
  ExerciseGuideBodyRegion,
  ExerciseGuideKind,
} from '@/lib/exercise-guides'

export interface ExerciseGuideDirectoryItem {
  id: string
  kind: ExerciseGuideKind
  selectionLabel: string
  title: string
  summary: string
  bodyRegion?: ExerciseGuideBodyRegion
  searchAliases?: string[]
  image: {
    src: string
    alt: string
  }
}

interface ExerciseGuideDirectoryProps {
  items: ExerciseGuideDirectoryItem[]
}

type RegionFilter = '全部' | ExerciseGuideBodyRegion

const CONDITION_REGIONS: ExerciseGuideBodyRegion[] = [
  '頭頸與下顎',
  '上肢與手部',
  '脊椎與軀幹',
  '髖膝與大腿',
  '足踝',
  '全身與神經',
]

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
    heading: '搜尋適合的研究運動方案',
    description: '可輸入症狀、常用說法或疾病名稱，再搭配身體部位快速縮小範圍。',
  },
}

function ConditionGuideCard({ item }: { item: ExerciseGuideDirectoryItem }) {
  return (
    <Link
      href={`/exercise-guides/${item.id}`}
      className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-teal-600"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="text-teal-700 dark:text-teal-300">適應證</span>
        {item.bodyRegion && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {item.bodyRegion}
          </span>
        )}
      </div>
      <h3 className="mt-2 text-lg font-bold text-neutral-950 dark:text-neutral-100">
        {item.selectionLabel}
      </h3>
      <p className="mt-2 text-sm font-medium leading-6 text-neutral-700 dark:text-neutral-300">
        {item.title}
      </p>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
        {item.summary}
      </p>
      <span className="mt-auto pt-5 text-sm font-bold text-neutral-950 transition-transform group-hover:translate-x-1 dark:text-neutral-100">
        查看研究圖解與劑量 →
      </span>
    </Link>
  )
}

export default function ExerciseGuideDirectory({ items }: ExerciseGuideDirectoryProps) {
  const [activeKind, setActiveKind] = useState<ExerciseGuideKind>('relaxation')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('全部')
  const relaxationItems = useMemo(
    () => items.filter((item) => item.kind === 'relaxation'),
    [items]
  )
  const conditionItems = useMemo(
    () => items.filter((item) => item.kind === 'condition'),
    [items]
  )

  const conditionSearch = useMemo(
    () =>
      new Fuse(conditionItems, {
        keys: [
          { name: 'selectionLabel', weight: 0.36 },
          { name: 'searchAliases', weight: 0.28 },
          { name: 'title', weight: 0.2 },
          { name: 'summary', weight: 0.1 },
          { name: 'bodyRegion', weight: 0.06 },
        ],
        threshold: 0.32,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [conditionItems]
  )

  const trimmedQuery = searchQuery.trim()
  const matchingConditionItems = useMemo(() => {
    const searchedItems = trimmedQuery
      ? conditionSearch.search(trimmedQuery).map((result) => result.item)
      : conditionItems

    return selectedRegion === '全部'
      ? searchedItems
      : searchedItems.filter((item) => item.bodyRegion === selectedRegion)
  }, [conditionItems, conditionSearch, selectedRegion, trimmedQuery])

  const regionGroups = useMemo(
    () =>
      CONDITION_REGIONS.map((region) => ({
        region,
        items: conditionItems.filter((item) => item.bodyRegion === region),
      })).filter((group) => group.items.length > 0),
    [conditionItems]
  )

  const isBrowsingAllConditions = !trimmedQuery && selectedRegion === '全部'

  function resetConditionFilters() {
    setSearchQuery('')
    setSelectedRegion('全部')
  }

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
                aria-controls={`exercise-directory-panel-${kind}`}
                onClick={() => {
                  setActiveKind(kind)
                  resetConditionFilters()
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
          id="exercise-directory-panel-relaxation"
          role="tabpanel"
          aria-labelledby="exercise-tab-relaxation"
          hidden={activeKind !== 'relaxation'}
          className="mt-10"
        >
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-teal-700 dark:text-teal-300">
            {DIRECTORY_COPY.relaxation.kicker}
          </p>
          <h2 id="exercise-directory-title" className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100 md:text-3xl">
            {DIRECTORY_COPY.relaxation.heading}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
            {DIRECTORY_COPY.relaxation.description}
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relaxationItems.map((item) => (
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
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-300">部位</p>
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
        </div>

        <div
          id="exercise-directory-panel-condition"
          role="tabpanel"
          aria-labelledby="exercise-tab-condition"
          hidden={activeKind !== 'condition'}
          className="mt-10"
        >
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-teal-700 dark:text-teal-300">
            {DIRECTORY_COPY.condition.kicker}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100 md:text-3xl">
            {DIRECTORY_COPY.condition.heading}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
            {DIRECTORY_COPY.condition.description}
          </p>

          <div className="mt-7">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/70 sm:p-6">
                <label htmlFor="condition-guide-search" className="text-sm font-bold text-neutral-950 dark:text-neutral-100">
                  關鍵字快速配對
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                    <input
                      id="condition-guide-search"
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="例如：前膝痛、腳跟痛、手麻、跌倒"
                      className="min-h-12 w-full rounded-2xl border border-neutral-300 bg-white py-3 pl-12 pr-4 text-base text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                    />
                  </div>
                  {(trimmedQuery || selectedRegion !== '全部') && (
                    <button
                      type="button"
                      onClick={resetConditionFilters}
                      className="min-h-12 rounded-2xl border border-neutral-300 bg-white px-5 text-sm font-bold text-neutral-700 transition-colors hover:border-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
                    >
                      清除條件
                    </button>
                  )}
                </div>
                <fieldset className="mt-5">
                  <legend className="text-sm font-bold text-neutral-950 dark:text-neutral-100">依身體部位篩選</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['全部', ...CONDITION_REGIONS] as RegionFilter[]).map((region) => {
                      const count = region === '全部'
                        ? conditionItems.length
                        : conditionItems.filter((item) => item.bodyRegion === region).length
                      const selected = selectedRegion === region

                      return (
                        <button
                          key={region}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSelectedRegion(region)}
                          className={`min-h-10 rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                            selected
                              ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-950'
                              : 'border-neutral-300 bg-white text-neutral-700 hover:border-teal-500 hover:text-teal-800 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-teal-600 dark:hover:text-teal-200'
                          }`}
                        >
                          {region} <span className={selected ? 'text-teal-100' : 'text-neutral-400'}>{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200" aria-live="polite" aria-atomic="true">
                  {isBrowsingAllConditions
                    ? `共 ${conditionItems.length} 組，依部位折疊顯示`
                    : `找到 ${matchingConditionItems.length} 組符合內容`}
                </p>
                {isBrowsingAllConditions && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">選擇一個部位即可快速展開該類結果</p>
                )}
              </div>

              {isBrowsingAllConditions ? (
                <div id="condition-guide-groups" className="mt-4 space-y-3">
                  {regionGroups.map((group) => (
                    <details
                      key={group.region}
                      className="group rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 [&::-webkit-details-marker]:hidden sm:px-6">
                        <span>
                          <span className="block text-lg font-bold text-neutral-950 dark:text-neutral-100">{group.region}</span>
                          <span className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">{group.items.length} 組研究運動方案</span>
                        </span>
                        <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-700 transition-transform group-open:rotate-45 dark:bg-neutral-800 dark:text-neutral-200">
                          ＋
                        </span>
                      </summary>
                      <div className="grid gap-3 border-t border-neutral-200 p-4 dark:border-neutral-800 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                        {group.items.map((item) => (
                          <ConditionGuideCard key={item.id} item={item} />
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              ) : matchingConditionItems.length > 0 ? (
                <div id="condition-guide-results" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {matchingConditionItems.map((item) => (
                    <ConditionGuideCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-7 text-center dark:border-neutral-700 dark:bg-neutral-900">
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-neutral-100">目前找不到符合的研究運動方案</h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    可改用較短的症狀詞、清除部位條件再試一次。找不到不代表沒有問題，也不代表不需要評估。
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={resetConditionFilters}
                      className="inline-flex min-h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                      查看全部方案
                    </button>
                    <Link
                      href="/locations"
                      className="inline-flex min-h-11 items-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-bold text-neutral-800 hover:border-neutral-500 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
                    >
                      查看看診資訊
                    </Link>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  )
}
