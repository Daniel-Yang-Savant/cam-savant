'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  DISEASE_GROUPS, GEOGRAPHY_LABELS, KIND_LABELS, NEEDS, PRIORITY_REGIONS, REGIONS,
  REGIONAL_CONTACTS, REHAB_RESOURCES, RESOURCE_TYPE_LABELS, RESOURCE_UPDATED_AT, STATUS_LABELS,
  diseaseLabel, matchReasons, matchesResource, needLabel, resourceStatus, taipeiDate,
  type ApplicationStatus, type DiseaseId, type NeedId, type RehabResource, type Region, type ResourceFilters, type ResourceKind,
} from '@/lib/rehab-resources'
import ResourceDetails, { ResourceLink } from './ResourceDetails'

const EMPTY_FILTERS: ResourceFilters = { diseases: [], needs: [], residence: '', household: '', hospitalRegion: '', kind: '', status: '' }
const PAGE_SIZE = 9
const FIELD_CLASS = 'mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'

function StatusBadge({ resource, today }: { resource: RehabResource; today: string }) {
  const { status, label, stale } = resourceStatus(resource, today)
  const color = status === 'open' || status === 'ongoing' ? 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
    : status === 'closed' || status === 'paused' ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
      : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{label}{stale && <span className="ml-1">· 待複核</span>}</span>
}

function RegionOptions() {
  return <>{REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}</>
}

function toggleItem<T extends string>(items: T[], id: T) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id]
}

function matchesCurrentContext(resource: RehabResource, filters: ResourceFilters, today: string) {
  return matchesResource(resource, { ...filters, kind: '', status: '' }, today)
}

export default function ResourceDirectory() {
  const [filters, setFilters] = useState<ResourceFilters>(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [householdMode, setHouseholdMode] = useState('unknown')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [today, setToday] = useState(RESOURCE_UPDATED_AT)
  const [age, setAge] = useState('')
  const [disability, setDisability] = useState('未提供／不確定')
  const [income, setIncome] = useState('未提供／不確定')
  const [school, setSchool] = useState('未提供／不確定')
  const [printNotice, setPrintNotice] = useState('')
  const discussionRef = useRef<HTMLElement>(null)
  const filterToggleRef = useRef<HTMLButtonElement>(null)
  const id = useId()
  useEffect(() => {
    const updateDate = () => setToday(taipeiDate())
    const beforePrint = () => flushSync(updateDate)
    const onVisible = () => { if (document.visibilityState === 'visible') updateDate() }
    updateDate()
    const timer = window.setInterval(updateDate, 60_000)
    window.addEventListener('focus', updateDate)
    window.addEventListener('beforeprint', beforePrint)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', updateDate)
      window.removeEventListener('beforeprint', beforePrint)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const activeFilters = useMemo(() => ({ ...filters, household: householdMode === 'same' ? filters.residence : filters.household }), [filters, householdMode])
  const results = useMemo(() => REHAB_RESOURCES.filter((resource) => matchesResource(resource, activeFilters, today)), [activeFilters, today])
  const selectedResources = useMemo(() => selectedIds.flatMap((selectedId) => {
    const resource = REHAB_RESOURCES.find((item) => item.id === selectedId)
    return resource ? [resource] : []
  }), [selectedIds])
  const hasKnownRegion = Boolean(filters.residence || activeFilters.household)
  const contacts = hasKnownRegion ? REGIONAL_CONTACTS.filter((contact) => contact.region === filters.residence || contact.region === activeFilters.household)
    : REGIONAL_CONTACTS.filter((contact) => PRIORITY_REGIONS.includes(contact.region))
  const filterSummary = [
    filters.diseases.length ? `${filters.diseases.slice(0, 2).map(diseaseLabel).join('、')}${filters.diseases.length > 2 ? `等 ${filters.diseases.length} 項` : ''}` : '不限疾病',
    filters.residence && `居住 ${filters.residence}`,
    activeFilters.household && `戶籍 ${activeFilters.household}`,
    filters.hospitalRegion && `就醫 ${filters.hospitalRegion}`,
    filters.needs.length ? `${filters.needs.slice(0, 2).map(needLabel).join('、')}${filters.needs.length > 2 ? `等 ${filters.needs.length} 項需求` : ''}` : '不限需求',
    filters.kind && KIND_LABELS[filters.kind],
    filters.status && STATUS_LABELS[filters.status],
  ].filter(Boolean).join(' · ')

  function closeFilters() {
    setFiltersOpen(false)
    filterToggleRef.current?.focus()
    filterToggleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function updateFilter<K extends keyof ResourceFilters>(key: K, value: ResourceFilters[K]) {
    setFilters((previous) => ({ ...previous, [key]: value }))
    setVisibleCount(PAGE_SIZE)
  }
  function toggleSelection(resourceId: string) {
    setSelectedIds((previous) => toggleItem(previous, resourceId))
    setPrintNotice('')
  }
  function resetFilters() {
    setFilters(EMPTY_FILTERS); setHouseholdMode('unknown'); setVisibleCount(PAGE_SIZE)
  }
  function clearPrivateDetails() {
    resetFilters(); setSelectedIds([]); setAge(''); setDisability('未提供／不確定'); setIncome('未提供／不確定'); setSchool('未提供／不確定'); setPrintNotice('已清除本頁選擇與補充資訊。')
  }
  function printList() {
    if (selectedIds.length === 0) { setPrintNotice('請先加入至少一筆資源，再列印討論清單。'); return }
    flushSync(() => setToday(taipeiDate()))
    window.print()
  }
  const profile = [
    `疾病／評估狀況：${filters.diseases.length ? filters.diseases.map(diseaseLabel).join('、') : '未指定'}`,
    `協助需求：${filters.needs.length ? filters.needs.map(needLabel).join('、') : '未指定'}`,
    `居住地：${filters.residence || '待確認'}；戶籍地：${activeFilters.household || '待確認'}；就醫縣市：${filters.hospitalRegion || '待確認'}`,
    `年齡：${age ? `${age} 歲` : '待確認'}；身障證明：${disability}；經濟身分：${income}；就學狀況：${school}`,
  ]

  return (
    <div className="RehabResourceDirectory">
      <div className="ResourceScreenOnly mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 px-5 py-4 dark:border-teal-900 dark:bg-teal-950/20">
          <p className="text-sm leading-6 text-teal-950 dark:text-teal-100">先選疾病、所在地與需求，再將想詢問的資源加入討論清單。</p>
          <button type="button" onClick={() => discussionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-11 rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white hover:bg-teal-900">查看社工討論清單（{selectedIds.length}）↓</button>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section aria-label="資源篩選" className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-3 flex items-center justify-between lg:mb-6"><h2 className="text-lg font-bold">找到需要的協助</h2><button type="button" onClick={resetFilters} className="min-h-11 px-2 text-xs text-neutral-500 underline underline-offset-4">重設篩選</button></div>
            <p id={`${id}-filter-summary`} className="mb-3 text-xs leading-6 text-neutral-500 lg:hidden">目前條件：{filterSummary}</p>
            <button ref={filterToggleRef} type="button" aria-expanded={filtersOpen} aria-controls={`${id}-filter-fields`} aria-describedby={`${id}-filter-summary`} onClick={() => setFiltersOpen((open) => !open)} className="min-h-11 w-full scroll-mt-24 rounded-xl border border-teal-700 px-4 text-sm font-semibold text-teal-800 dark:text-teal-300 lg:hidden">{filtersOpen ? '收起篩選 ↑' : '顯示疾病、地區與需求篩選 ↓'}</button>
            <div id={`${id}-filter-fields`} className={`${filtersOpen ? 'mt-5 block' : 'hidden'} lg:mt-0 lg:block`}>
            <fieldset><legend className="mb-3 text-sm font-bold">1. 疾病／評估狀況 <span className="font-normal text-neutral-500">可複選</span></legend>
              {DISEASE_GROUPS.map((group) => <div key={group.label} className="mb-5"><p className="mb-2 text-xs font-semibold text-neutral-500">{group.label}</p><div className="space-y-1">{group.items.map((item) => <label key={item.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"><input className="h-4 w-4 shrink-0 accent-teal-700" type="checkbox" checked={filters.diseases.includes(item.id)} onChange={() => updateFilter('diseases', toggleItem<DiseaseId>(filters.diseases, item.id))} />{item.label}</label>)}</div></div>)}
            </fieldset>
            <div className="border-t border-neutral-200 pt-5 dark:border-neutral-800"><label htmlFor={`${id}-region`} className="text-sm font-bold">2. 目前住在哪裡？</label><select id={`${id}-region`} value={filters.residence} onChange={(event) => updateFilter('residence', event.target.value as Region | '')} className={FIELD_CLASS}><option value="">全台／尚未指定</option><RegionOptions /></select>
              <label htmlFor={`${id}-household-mode`} className="mt-4 block text-xs font-medium text-neutral-600 dark:text-neutral-300">戶籍地</label><select id={`${id}-household-mode`} value={householdMode} onChange={(event) => { setHouseholdMode(event.target.value); updateFilter('household', '') }} className={FIELD_CLASS}><option value="same">與居住縣市相同</option><option value="different">不同縣市</option><option value="unknown">不確定，先保留待確認</option></select>
              {householdMode === 'different' && <><label htmlFor={`${id}-household`} className="mt-3 block text-xs">選擇戶籍縣市</label><select id={`${id}-household`} value={filters.household} onChange={(event) => updateFilter('household', event.target.value as Region | '')} className={FIELD_CLASS}><option value="">尚未指定</option><RegionOptions /></select></>}
              <label htmlFor={`${id}-hospital-region`} className="mt-4 block text-xs font-medium text-neutral-600 dark:text-neutral-300">就醫縣市（查醫院資源時選填）</label><select id={`${id}-hospital-region`} value={filters.hospitalRegion} onChange={(event) => updateFilter('hospitalRegion', event.target.value as Region | '')} className={FIELD_CLASS}><option value="">不確定／保留各地醫院入口</option><RegionOptions /></select>
            </div>
            <fieldset className="mt-6 border-t border-neutral-200 pt-5 dark:border-neutral-800"><legend className="float-left mb-3 w-full text-sm font-bold">3. 需要哪些協助？ <span className="font-normal text-neutral-500">可複選</span></legend><div className="clear-both space-y-1">{NEEDS.map((need) => <label key={need.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"><input type="checkbox" className="h-4 w-4 accent-teal-700" checked={filters.needs.includes(need.id)} onChange={() => updateFilter('needs', toggleItem<NeedId>(filters.needs, need.id))} />{need.label}</label>)}</div></fieldset>
            <details className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800"><summary className="min-h-11 cursor-pointer text-sm font-semibold leading-10">來源與受理狀態</summary><label htmlFor={`${id}-kind`} className="mt-3 block text-xs">資源來源</label><select id={`${id}-kind`} value={filters.kind} onChange={(event) => updateFilter('kind', event.target.value as ResourceKind | '')} className={FIELD_CLASS}><option value="">所有來源</option>{Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label htmlFor={`${id}-status`} className="mt-4 block text-xs">受理狀態</label><select id={`${id}-status`} value={filters.status} onChange={(event) => updateFilter('status', event.target.value as ApplicationStatus | '')} className={FIELD_CLASS}><option value="">所有狀態（含需詢問）</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></details>
            <p className="mt-5 text-xs leading-6 text-neutral-500">同一欄複選為任一符合；不同欄交叉篩選。尚未提供的地區條件會保留候選資源，並標示待確認。</p>
            <button type="button" onClick={closeFilters} className="mt-4 min-h-11 w-full rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white hover:bg-teal-900 lg:hidden">收起篩選，查看 {results.length} 筆結果 ↑</button>
            </div>
          </section>

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-xl font-bold" aria-live="polite" aria-atomic="true">{results.length} 筆可能相關的資源</h2><span className="text-xs text-neutral-500">依收錄順序呈現，無付費排序</span></div>
            <p className="mb-6 text-sm leading-7 text-neutral-500">列出原因供你決定要問誰；實際資格、剩餘經費與核定結果由承辦單位確認。服務入口與補助方案有不同標籤。</p>
            {results.length === 0 && <div className="rounded-2xl border border-dashed border-neutral-300 p-8 dark:border-neutral-700"><h3 className="font-bold">目前尚未收錄符合這組條件的資源</h3><p className="mt-3 text-sm leading-7 text-neutral-500">可以減少篩選條件，或透過下方政府窗口與就醫醫院社工詢問。查無結果不代表當地沒有援助。</p><button type="button" className="mt-4 min-h-11 text-sm font-semibold text-teal-800 underline dark:text-teal-300" onClick={resetFilters}>清除篩選，查看所有資源</button></div>}
            <div className="space-y-5">{results.slice(0, visibleCount).map((resource) => <article key={resource.id} className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="mb-3 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-neutral-500">{KIND_LABELS[resource.kind]} · {RESOURCE_TYPE_LABELS[resource.resourceType]}</span><StatusBadge resource={resource} today={today} /></div>
              <h3 className="text-lg font-bold leading-7">{resource.title}</h3><p className="mt-1 text-xs text-neutral-500">{resource.organization} · {GEOGRAPHY_LABELS[resource.geographicBasis]}</p><p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{resource.summary}</p>
              <div className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-900"><p className="mb-1 text-xs font-semibold text-teal-800 dark:text-teal-300">為何值得詢問</p><ul className="space-y-1 text-xs leading-6 text-neutral-600 dark:text-neutral-300">{matchReasons(resource, activeFilters).map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
              <details className="mt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">查看資格、文件與申請方式</summary><div className="pb-4 pt-2"><ResourceDetails resource={resource} today={today} /></div></details>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800"><p className="text-xs text-neutral-500">核對：<time dateTime={resource.checkedAt}>{resource.checkedAt}</time>{resource.endsOn && <> · 截止：{resource.endsOn}</>}</p><button type="button" aria-pressed={selectedIds.includes(resource.id)} onClick={() => toggleSelection(resource.id)} className={`min-h-11 rounded-xl border px-4 text-sm font-semibold ${selectedIds.includes(resource.id) ? 'border-teal-700 bg-teal-700 text-white' : 'border-neutral-300 text-neutral-800 hover:border-teal-700 hover:text-teal-800 dark:border-neutral-700 dark:text-neutral-100'}`}>{selectedIds.includes(resource.id) ? '✓ 已加入討論清單' : '＋ 加入討論清單'}</button></div>
            </article>)}</div>
            {visibleCount < results.length && <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="mt-6 min-h-12 w-full rounded-xl border border-neutral-300 text-sm font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">再顯示 {Math.min(PAGE_SIZE, results.length - visibleCount)} 筆（尚有 {results.length - visibleCount} 筆）↓</button>}

            <section className="mt-10 rounded-2xl border border-neutral-200 p-5 sm:p-6 dark:border-neutral-800" aria-labelledby={`${id}-contacts-title`}><h2 id={`${id}-contacts-title`} className="text-lg font-bold">所在地的政府詢問窗口</h2><p className="mt-2 text-sm leading-7 text-neutral-500">22 縣市皆提供官方入口；窗口本身不等同一項補助。{filters.residence ? '以下依居住及已提供的戶籍地列出。' : '先顯示四個優先整理縣市，選擇所在地可查看其他縣市。'}</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{contacts.map((contact) => <div key={contact.region} className="rounded-xl bg-neutral-50 p-4 text-sm dark:bg-neutral-900"><h3 className="font-bold">{contact.region}</h3><p className="mt-1"><ResourceLink href={contact.url}>{contact.name}</ResourceLink></p>{contact.earlyInterventionUrl && <p className="mt-2"><ResourceLink href={contact.earlyInterventionUrl}>早療官方資訊</ResourceLink></p>}{contact.phone && <p className="mt-2">電話：{contact.phone}</p>}<p className="mt-2 text-xs leading-6 text-neutral-500">{contact.note}</p><p className="mt-2 text-xs text-neutral-500">入口核對：{contact.checkedAt}</p></div>)}</div></section>
          </div>
        </div>

        <section ref={discussionRef} id="discussion-list" className="mt-12 scroll-mt-24 rounded-2xl border border-teal-200 bg-teal-50/30 p-5 sm:p-8 dark:border-teal-900 dark:bg-teal-950/10" aria-labelledby={`${id}-discussion-title`}>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold tracking-widest text-teal-800 dark:text-teal-300">帶去與社工討論</p><h2 id={`${id}-discussion-title`} className="mt-2 text-2xl font-bold">我的資源討論清單</h2></div><button type="button" onClick={printList} className="min-h-12 rounded-xl bg-teal-800 px-5 text-sm font-semibold text-white hover:bg-teal-900">列印／另存 PDF（{selectedIds.length}）</button></div>
          <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">清單會附上列出原因、待確認資格、文件、窗口、轉介方式及來源。修改篩選後，已選資源仍會保留，並依目前條件重新提示差異。</p>
          <details className="mt-5 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950"><summary className="min-h-11 cursor-pointer text-sm font-semibold leading-10">補充資訊（選填，供社工確認）</summary><p className="mt-2 text-xs leading-6 text-neutral-500">不作自動資格判定；僅用於本次列印，不儲存於網站或傳送至分析平台。</p><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label htmlFor={`${id}-age`} className="text-sm">年齡（歲）<input id={`${id}-age`} type="number" min="0" max="120" step="0.1" value={age} onChange={(event) => setAge(event.target.value)} placeholder="不必填出生日期" className={FIELD_CLASS} /></label><label htmlFor={`${id}-disability`} className="text-sm">身障證明<select id={`${id}-disability`} value={disability} onChange={(event) => setDisability(event.target.value)} className={FIELD_CLASS}>{['未提供／不確定', '已有證明', '申請中', '尚無證明'].map((value) => <option key={value}>{value}</option>)}</select></label><label htmlFor={`${id}-income`} className="text-sm">經濟身分<select id={`${id}-income`} value={income} onChange={(event) => setIncome(event.target.value)} className={FIELD_CLASS}>{['未提供／不確定', '一般戶', '低收入戶', '中低收入戶', '經濟困難，待社工評估'].map((value) => <option key={value}>{value}</option>)}</select></label><label htmlFor={`${id}-school`} className="text-sm">就學狀況<select id={`${id}-school`} value={school} onChange={(event) => setSchool(event.target.value)} className={FIELD_CLASS}>{['未提供／不確定', '尚未入小學', '已入學', '核准暫緩入學', '不適用'].map((value) => <option key={value}>{value}</option>)}</select></label></div></details>
          {selectedResources.length === 0 ? <p className="my-8 text-center text-sm text-neutral-500">還沒有選擇資源。請在上方卡片按「加入討論清單」。</p> : <ol className="mt-6 space-y-3">{selectedResources.map((resource, index) => <li key={resource.id} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"><div><p className="text-sm font-bold">{index + 1}. {resource.title}</p><p className="mt-1 text-xs text-neutral-500">{resource.organization} · {resourceStatus(resource, today).label}</p>{!matchesCurrentContext(resource, activeFilters, today) && <p className="mt-2 text-xs leading-6 text-amber-800 dark:text-amber-200">與目前疾病、需求或地區篩選不同，仍保留供討論；請先核對。</p>}</div><button type="button" aria-label={`移除${resource.title}`} onClick={() => toggleSelection(resource.id)} className="min-h-11 shrink-0 px-2 text-xs text-neutral-500 underline underline-offset-4">移除</button></li>)}</ol>}
          <p role="status" className="mt-4 text-sm text-teal-800 dark:text-teal-300">{printNotice}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-5 dark:border-neutral-800"><p className="max-w-2xl text-xs leading-6 text-neutral-500">本頁不要求登入或上傳診斷書、財稅、戶籍資料。選擇只保留在目前頁面的記憶體，不寫入瀏覽器儲存空間；重新整理會重設。使用公用電腦時，可按「清除本頁資料」。</p><button type="button" onClick={clearPrivateDetails} className="min-h-11 text-xs text-neutral-500 underline underline-offset-4">清除本頁資料</button></div>
        </section>

        {selectedIds.length > 0 && <div className="ResourceSelectionBar fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><button type="button" onClick={() => discussionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-11 text-sm font-semibold">已選 {selectedIds.length} 筆 · 查看清單 ↑</button><button type="button" onClick={printList} className="min-h-11 rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white">列印討論清單</button></div></div>}
      </div>

      <section className="ResourcePrintOnly" aria-label="社工討論清單列印內容">
        <div className="ResourcePrintIntro"><p className="text-xs">CAM SAVANT · 復健科補助與援助資源</p><div className="ResourcePrintTitle">社工討論準備清單</div><p>產生日期：{today} · 已選 {selectedResources.length} 筆 · 資源內容整理：{RESOURCE_UPDATED_AT}</p><p>此為詢問與備件清單，非資格認定或核定通知；請與社工及各承辦單位確認。</p>{profile.map((line) => <p key={line}>{line}</p>)}<p>姓名／稱呼：＿＿＿＿＿＿　就醫院所：＿＿＿＿＿＿　討論日期：＿＿＿＿＿＿</p></div>
        {selectedResources.length === 0 ? <p>尚未選擇資源。請回到頁面，加入想詢問的資源後再列印。</p> : <>
          <div className="ResourcePrintSummary"><h2>本次想詢問的資源</h2><ol>{selectedResources.map((resource) => <li key={resource.id}>{resource.title}（{resourceStatus(resource, today).label}）</li>)}</ol><h2>先與社工確認</h2><p>□ 戶籍／居住／就醫範圍　□ 年齡、就學與證明效期　□ 經濟評估</p><p>□ 是否先核定再購買／療育　□ 同一費用是否已有補助或保險給付</p><p>□ 收據正本及申請／核銷期限　□ 是否需社工轉介　□ 目前名額、經費與撥款</p><p>文件以各項資源說明及承辦要求為準；共通文件可先備一份供核對，正本用途請確認後安排。</p></div>
          {selectedResources.map((resource, index) => <article key={resource.id} className="ResourcePrintItem"><h2>{index + 1}. {resource.title}</h2><p>{resource.organization} · {KIND_LABELS[resource.kind]} · {RESOURCE_TYPE_LABELS[resource.resourceType]}</p>{!matchesCurrentContext(resource, activeFilters, today) && <p className="font-bold">注意：這筆與目前篩選條件不同，請先確認適用性。</p>}<h3>為何列出供討論</h3><ul>{matchReasons(resource, activeFilters).map((reason) => <li key={reason}>{reason}</li>)}</ul><ResourceDetails resource={resource} today={today} print /><div className="ResourceSocialWorkerNotes"><p>社工討論：□ 可進一步評估　□ 待補件　□ 轉介中　□ 不適用</p><p>待辦／轉介對象：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</p><p>備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</p></div></article>)}
        </>}
      </section>
    </div>
  )
}
