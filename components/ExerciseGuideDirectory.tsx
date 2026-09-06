'use client'

import Fuse from 'fuse.js'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type {
  ExerciseGuideBodyRegion,
  ExerciseGuideKind,
  ExerciseGuideSupervision,
} from '@/lib/exercise-guides'

export interface ExerciseGuideDirectoryItem {
  id: string
  kind: ExerciseGuideKind
  selectionLabel: string
  title: string
  summary: string
  bodyRegion?: ExerciseGuideBodyRegion
  searchAliases?: string[]
  supervision: ExerciseGuideSupervision
  image: {
    src: string
    alt: string
  }
}

interface ExerciseGuideDirectoryProps {
  items: ExerciseGuideDirectoryItem[]
}

type RegionFilter = '全部' | ExerciseGuideBodyRegion

type WholeBodySubgroupKey =
  | 'neurological'
  | 'older-adults'
  | 'cardiopulmonary-cancer'
  | 'systemic'
type WholeBodySubgroupFilter = '全部' | WholeBodySubgroupKey

interface DirectoryState {
  activeKind: ExerciseGuideKind
  searchQuery: string
  selectedRegion: RegionFilter
  selectedWholeBodySubgroup: WholeBodySubgroupFilter
}

const CONDITION_REGIONS: ExerciseGuideBodyRegion[] = [
  '頭頸與下顎',
  '上肢與手部',
  '脊椎與軀幹',
  '髖膝與大腿',
  '足踝',
  '全身與神經',
]

const TAB_KINDS: ExerciseGuideKind[] = ['relaxation', 'condition']

const WHOLE_BODY_SUBGROUPS: Array<{
  key: WholeBodySubgroupKey
  label: string
  ids: readonly string[]
}> = [
  {
    key: 'neurological',
    label: '神經復健',
    ids: [
      'parkinson-tai-chi-rct',
      'praised-dementia-rct',
      'parkinson-abc-c-rct',
      'stroke-virtual-arm-rct',
      'ms-pilates-rct',
      'concussion-aerobic-rct',
    ],
  },
  {
    key: 'older-adults',
    label: '銀髮與防跌',
    ids: [
      'otago-fall-prevention-rct',
      'osteoporosis-liftmor-rct',
      'vivifrail-multicomponent-rct',
      'react-older-adults-rct',
    ],
  },
  {
    key: 'cardiopulmonary-cancer',
    label: '心肺與癌症',
    ids: [
      'pad-lite-walking-rct',
      'copd-rehab-duration-rct',
      'lung-cancer-exercise-rct',
      'cardio-oncology-core-rct',
    ],
  },
  {
    key: 'systemic',
    label: '其他全身性',
    ids: ['fibromyalgia-functional-rct'],
  },
]

const DEFAULT_DIRECTORY_STATE: DirectoryState = {
  activeKind: 'relaxation',
  searchQuery: '',
  selectedRegion: '全部',
  selectedWholeBodySubgroup: '全部',
}

const DIRECTORY_HISTORY_STATE_KEY = '__camSavantExerciseDirectory'

function isRegionFilter(value: string | null): value is ExerciseGuideBodyRegion {
  return CONDITION_REGIONS.includes(value as ExerciseGuideBodyRegion)
}

function isWholeBodySubgroup(
  value: string | null
): value is WholeBodySubgroupKey {
  return WHOLE_BODY_SUBGROUPS.some((subgroup) => subgroup.key === value)
}

function getWholeBodySubgroup(itemId: string): WholeBodySubgroupKey {
  return (
    WHOLE_BODY_SUBGROUPS.find((subgroup) => subgroup.ids.includes(itemId))?.key ??
    'systemic'
  )
}

function readDirectoryStateFromUrl(historyState: unknown): DirectoryState {
  const params = new URLSearchParams(window.location.search)
  const storedDirectoryState =
    historyState && typeof historyState === 'object'
      ? (historyState as Record<string, unknown>)[DIRECTORY_HISTORY_STATE_KEY]
      : null
  const storedSearchQuery =
    storedDirectoryState &&
    typeof storedDirectoryState === 'object' &&
    typeof (storedDirectoryState as Record<string, unknown>).searchQuery === 'string'
      ? (storedDirectoryState as { searchQuery: string }).searchQuery
      : ''
  const regionParam = params.get('region')
  const selectedRegion = isRegionFilter(regionParam) ? regionParam : '全部'
  const subgroupParam = params.get('group')
  const selectedWholeBodySubgroup =
    selectedRegion === '全身與神經' && isWholeBodySubgroup(subgroupParam)
      ? subgroupParam
      : '全部'
  const hasConditionFilters = Boolean(
    storedSearchQuery ||
      selectedRegion !== '全部' ||
      selectedWholeBodySubgroup !== '全部'
  )
  const activeKind =
    params.get('view') === 'condition' ||
    (params.get('view') !== 'relaxation' && hasConditionFilters)
      ? 'condition'
      : 'relaxation'

  return {
    activeKind,
    searchQuery: activeKind === 'condition' ? storedSearchQuery : '',
    selectedRegion: activeKind === 'condition' ? selectedRegion : '全部',
    selectedWholeBodySubgroup:
      activeKind === 'condition' ? selectedWholeBodySubgroup : '全部',
  }
}

function writeDirectoryStateToUrl(
  state: DirectoryState,
  mode: 'push' | 'replace'
) {
  const url = new URL(window.location.href)

  if (state.activeKind === 'condition') {
    url.searchParams.set('view', 'condition')

    if (state.selectedRegion !== '全部') {
      url.searchParams.set('region', state.selectedRegion)
    } else {
      url.searchParams.delete('region')
    }

    if (
      state.selectedRegion === '全身與神經' &&
      state.selectedWholeBodySubgroup !== '全部'
    ) {
      url.searchParams.set('group', state.selectedWholeBodySubgroup)
    } else {
      url.searchParams.delete('group')
    }
  } else {
    url.searchParams.delete('view')
    url.searchParams.delete('region')
    url.searchParams.delete('group')
  }

  // Free-text symptoms may be health information. Keep them out of URLs and
  // preserve them only in this browser history entry for Back/Forward restore.
  url.searchParams.delete('q')

  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const currentHistoryState =
    window.history.state && typeof window.history.state === 'object'
      ? window.history.state
      : {}
  const currentDirectoryHistoryState = currentHistoryState[
    DIRECTORY_HISTORY_STATE_KEY
  ] as { searchQuery?: unknown } | undefined
  if (
    nextUrl === currentUrl &&
    currentDirectoryHistoryState?.searchQuery === state.searchQuery
  ) {
    return
  }

  window.history[mode === 'push' ? 'pushState' : 'replaceState'](
    {
      ...currentHistoryState,
      [DIRECTORY_HISTORY_STATE_KEY]: { searchQuery: state.searchQuery },
    },
    '',
    nextUrl
  )
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
    tab: '依症狀或診斷查找',
    kicker: '隨機對照試驗中的運動方案',
    heading: '搜尋相關的研究運動方案',
    description: '可輸入症狀、常用說法或已確認的診斷，再搭配身體部位縮小範圍。搜尋結果不代表診斷，也不表示方案一定適合你。',
  },
}

function ConditionGuideCard({ item }: { item: ExerciseGuideDirectoryItem }) {
  const supervisionLabel =
    item.supervision === 'medical-team'
      ? '需醫療團隊確認'
      : '請先由專業人員確認'

  return (
    <Link
      href={`/exercise-guides/${item.id}`}
      className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-teal-600"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="text-teal-700 dark:text-teal-300">研究主題</span>
        {item.bodyRegion && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {item.bodyRegion}
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-1 ${
            item.supervision === 'medical-team'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
              : 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
          }`}
        >
          {supervisionLabel}
        </span>
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
        查看圖解、研究劑量與提醒 →
      </span>
    </Link>
  )
}

export default function ExerciseGuideDirectory({ items }: ExerciseGuideDirectoryProps) {
  const [directoryState, setDirectoryState] = useState<DirectoryState>(
    DEFAULT_DIRECTORY_STATE
  )
  const tabRefs = useRef<Record<ExerciseGuideKind, HTMLButtonElement | null>>({
    relaxation: null,
    condition: null,
  })
  const {
    activeKind,
    searchQuery,
    selectedRegion,
    selectedWholeBodySubgroup,
  } = directoryState

  useEffect(() => {
    const restoreFromCurrentEntry = (event?: PopStateEvent) =>
      setDirectoryState(
        readDirectoryStateFromUrl(event ? event.state : window.history.state)
      )

    restoreFromCurrentEntry()
    window.addEventListener('popstate', restoreFromCurrentEntry)
    return () => window.removeEventListener('popstate', restoreFromCurrentEntry)
  }, [])

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

    const regionItems = selectedRegion === '全部'
      ? searchedItems
      : searchedItems.filter((item) => item.bodyRegion === selectedRegion)

    return selectedRegion === '全身與神經' &&
      selectedWholeBodySubgroup !== '全部'
      ? regionItems.filter(
          (item) => getWholeBodySubgroup(item.id) === selectedWholeBodySubgroup
        )
      : regionItems
  }, [
    conditionItems,
    conditionSearch,
    selectedRegion,
    selectedWholeBodySubgroup,
    trimmedQuery,
  ])

  const regionGroups = useMemo(
    () =>
      CONDITION_REGIONS.map((region) => ({
        region,
        items: conditionItems.filter((item) => item.bodyRegion === region),
      })).filter((group) => group.items.length > 0),
    [conditionItems]
  )

  const wholeBodyGroups = useMemo(
    () =>
      WHOLE_BODY_SUBGROUPS.map((subgroup) => ({
        ...subgroup,
        items: conditionItems.filter(
          (item) =>
            item.bodyRegion === '全身與神經' &&
            getWholeBodySubgroup(item.id) === subgroup.key
        ),
      })).filter((subgroup) => subgroup.items.length > 0),
    [conditionItems]
  )

  const isBrowsingAllConditions =
    !trimmedQuery &&
    selectedRegion === '全部' &&
    selectedWholeBodySubgroup === '全部'

  function updateDirectoryState(
    nextState: DirectoryState,
    historyMode: 'push' | 'replace' = 'push'
  ) {
    setDirectoryState(nextState)
    writeDirectoryStateToUrl(nextState, historyMode)
  }

  function activateKind(kind: ExerciseGuideKind) {
    if (kind === activeKind) return

    updateDirectoryState(
      kind === 'relaxation'
        ? DEFAULT_DIRECTORY_STATE
        : { ...directoryState, activeKind: 'condition' }
    )
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentKind: ExerciseGuideKind
  ) {
    const currentIndex = TAB_KINDS.indexOf(currentKind)
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % TAB_KINDS.length
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + TAB_KINDS.length) % TAB_KINDS.length
    }
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = TAB_KINDS.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    const nextKind = TAB_KINDS[nextIndex]
    activateKind(nextKind)
    window.requestAnimationFrame(() => tabRefs.current[nextKind]?.focus())
  }

  function resetConditionFilters() {
    updateDirectoryState({
      activeKind: 'condition',
      searchQuery: '',
      selectedRegion: '全部',
      selectedWholeBodySubgroup: '全部',
    })
  }

  return (
    <section
      className="border-t border-neutral-200 py-12 dark:border-neutral-800 md:py-16"
      aria-label="圖解運動目錄"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2" role="tablist" aria-label="選擇運動類型">
          {TAB_KINDS.map((kind, index) => {
            const selected = kind === activeKind
            const count = kind === 'relaxation' ? relaxationItems.length : conditionItems.length

            return (
              <button
                key={kind}
                ref={(node) => {
                  tabRefs.current[kind] = node
                }}
                id={`exercise-tab-${kind}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`exercise-directory-panel-${kind}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => activateKind(kind)}
                onKeyDown={(event) => handleTabKeyDown(event, kind)}
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
          tabIndex={0}
          className="mt-10"
        >
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-teal-700 dark:text-teal-300">
            {DIRECTORY_COPY.relaxation.kicker}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100 md:text-3xl">
            {DIRECTORY_COPY.relaxation.heading}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 md:text-base">
            {DIRECTORY_COPY.relaxation.description}
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relaxationItems.map((item, index) => (
              <Link
                key={item.id}
                href={`/exercise-guides/${item.id}`}
                className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : undefined}
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
          tabIndex={0}
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
          <div
            className="mt-5 max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-neutral-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-neutral-300"
            role="note"
          >
            <strong className="text-neutral-950 dark:text-neutral-100">開始前請先確認：</strong>
            這裡整理的是研究中使用的運動，不是個人處方。術後、近期受傷、曾跌倒、平衡不穩，或有神經、心肺、癌症等病況者，請先和醫師、物理治療師或原醫療團隊確認動作與劑量。
          </div>

          <div className="mt-7">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/70 sm:p-6">
                <label htmlFor="condition-guide-search" className="text-sm font-bold text-neutral-950 dark:text-neutral-100">
                  搜尋症狀或已確認的診斷
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
                      onChange={(event) =>
                        updateDirectoryState(
                          { ...directoryState, searchQuery: event.target.value },
                          'replace'
                        )
                      }
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
                          onClick={() =>
                            updateDirectoryState({
                              ...directoryState,
                              selectedRegion: region,
                              selectedWholeBodySubgroup:
                                region === '全身與神經'
                                  ? selectedWholeBodySubgroup
                                  : '全部',
                            })
                          }
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
                {selectedRegion === '全身與神經' && (
                  <fieldset className="mt-5 border-t border-neutral-200 pt-5 dark:border-neutral-800">
                    <legend className="text-sm font-bold text-neutral-950 dark:text-neutral-100">
                      再依主題縮小範圍
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(
                        [
                          { key: '全部', label: '全部' },
                          ...WHOLE_BODY_SUBGROUPS,
                        ] as Array<{
                          key: WholeBodySubgroupFilter
                          label: string
                        }>
                      ).map((subgroup) => {
                        const count =
                          subgroup.key === '全部'
                            ? conditionItems.filter(
                                (item) => item.bodyRegion === '全身與神經'
                              ).length
                            : conditionItems.filter(
                                (item) =>
                                  item.bodyRegion === '全身與神經' &&
                                  getWholeBodySubgroup(item.id) === subgroup.key
                              ).length
                        const selected =
                          selectedWholeBodySubgroup === subgroup.key

                        return (
                          <button
                            key={subgroup.key}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              updateDirectoryState({
                                ...directoryState,
                                selectedWholeBodySubgroup: subgroup.key,
                              })
                            }
                            className={`min-h-10 rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                              selected
                                ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-950'
                                : 'border-neutral-300 bg-white text-neutral-700 hover:border-teal-500 hover:text-teal-800 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-teal-600 dark:hover:text-teal-200'
                            }`}
                          >
                            {subgroup.label}{' '}
                            <span
                              className={
                                selected ? 'text-teal-100' : 'text-neutral-400'
                              }
                            >
                              {count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200" aria-live="polite" aria-atomic="true">
                  {isBrowsingAllConditions
                    ? `共 ${conditionItems.length} 組，依部位折疊顯示`
                    : `找到 ${matchingConditionItems.length} 組相關內容`}
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
                          <span className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">{group.items.length} 組研究運動內容</span>
                        </span>
                        <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xl text-neutral-700 transition-transform group-open:rotate-45 dark:bg-neutral-800 dark:text-neutral-200">
                          ＋
                        </span>
                      </summary>
                      {group.region === '全身與神經' ? (
                        <div className="space-y-7 border-t border-neutral-200 p-4 dark:border-neutral-800 sm:p-5">
                          {wholeBodyGroups.map((subgroup) => (
                            <section
                              key={subgroup.key}
                              aria-labelledby={`whole-body-subgroup-${subgroup.key}`}
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h3
                                  id={`whole-body-subgroup-${subgroup.key}`}
                                  className="text-base font-bold text-neutral-950 dark:text-neutral-100"
                                >
                                  {subgroup.label}
                                </h3>
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                  {subgroup.items.length} 組
                                </span>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {subgroup.items.map((item) => (
                                  <ConditionGuideCard key={item.id} item={item} />
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      ) : (
                        <div className="grid gap-3 border-t border-neutral-200 p-4 dark:border-neutral-800 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                          {group.items.map((item) => (
                            <ConditionGuideCard key={item.id} item={item} />
                          ))}
                        </div>
                      )}
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
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-neutral-100">目前找不到相關的研究運動內容</h3>
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
