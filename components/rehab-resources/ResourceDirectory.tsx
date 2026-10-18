'use client'

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import {
  DISEASE_GROUPS, GEOGRAPHY_LABELS, KIND_LABELS, NEEDS, REGIONS,
  REHAB_RESOURCES, RESOURCE_TYPE_LABELS, RESOURCE_UPDATED_AT, STATUS_LABELS,
  diseaseLabel, groupResourceProviders, isResourceSearchReady, matchingProviders, matchReasons, matchesResource, needLabel, resourceStatus, taipeiDate, toggleProviderSelection,
  type ApplicationStatus, type DiseaseId, type NeedId, type RehabResource, type Region, type ResourceFilters, type ResourceKind, type ResourceProvider, type ProviderSelection,
} from '@/lib/rehab-resources'
import ResourceDetails from './ResourceDetails'

const EMPTY_FILTERS: ResourceFilters = { diseases: [], needs: [], region: '', residence: '', household: '', hospitalRegion: '', kind: '', status: '' }
const PAGE_SIZE = 9
const FIELD_CLASS = 'mt-2 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
const PRIMARY_BUTTON = 'min-h-12 rounded-xl bg-teal-800 px-6 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-40'
const SECONDARY_BUTTON = 'min-h-12 rounded-xl border border-neutral-300 px-5 text-sm font-semibold hover:border-teal-700 dark:border-neutral-700'
const STEPS = ['疾病', '所在地', '協助需求']

function StatusBadge({ resource, today }: { resource: RehabResource; today: string }) {
  const { status, label, stale } = resourceStatus(resource, today)
  const color = status === 'open' || status === 'ongoing' ? 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200'
    : status === 'closed' || status === 'paused' ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
      : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{label}{stale && <span className="ml-1">· 待複核</span>}</span>
}

function toggleItem<T extends string>(items: T[], id: T) {
  return items.includes(id) ? items.filter((item) => item !== id) : [...items, id]
}

function matchesCurrentContext(resource: RehabResource, filters: ResourceFilters, today: string) {
  return matchesResource(resource, { ...filters, kind: '', status: '' }, today)
}

export default function ResourceDirectory() {
  const [draft, setDraft] = useState<ResourceFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<ResourceFilters | null>(null)
  const [step, setStep] = useState(0)
  const [view, setView] = useState<'wizard' | 'results'>('wizard')
  const [selections, setSelections] = useState<ProviderSelection[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [today, setToday] = useState(RESOURCE_UPDATED_AT)
  const [age, setAge] = useState('')
  const [disability, setDisability] = useState('未填寫')
  const [income, setIncome] = useState('未填寫')
  const [school, setSchool] = useState('未填寫')
  const discussionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
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

  const activeFilters = appliedFilters ?? EMPTY_FILTERS
  const results = useMemo(() => appliedFilters && isResourceSearchReady(appliedFilters)
    ? matchingProviders(REHAB_RESOURCES, appliedFilters, today) : [], [appliedFilters, today])
  const selectedProviders = useMemo(() => selections.flatMap((selection) => {
    const provider = groupResourceProviders(REHAB_RESOURCES.filter((resource) => selection.resourceIds.includes(resource.id)))[0]
    return provider ? [provider] : []
  }), [selections])
  const filterSummary = [
    activeFilters.diseases.map(diseaseLabel).join('、'), activeFilters.region, activeFilters.needs.map(needLabel).join('、'),
  ].filter(Boolean).join(' · ')
  const canContinue = step === 0 ? draft.diseases.length > 0 : step === 1 ? Boolean(draft.region) : isResourceSearchReady(draft)

  function focusHeading() {
    window.requestAnimationFrame(() => headingRef.current?.focus())
  }
  function updateDraft<K extends keyof ResourceFilters>(key: K, value: ResourceFilters[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }))
  }
  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canContinue) return
    if (step < 2) setStep(step + 1)
    else if (isResourceSearchReady(draft)) {
      setAppliedFilters({ ...draft, kind: '', status: '' })
      setVisibleCount(PAGE_SIZE)
      setView('results')
    }
    focusHeading()
  }
  function editFilters() {
    setDraft({ ...activeFilters, kind: '', status: '' })
    setStep(0)
    setView('wizard')
    focusHeading()
  }
  function refineResults<K extends 'kind' | 'status'>(key: K, value: ResourceFilters[K]) {
    setAppliedFilters((previous) => previous ? { ...previous, [key]: value } : null)
    setVisibleCount(PAGE_SIZE)
  }
  function toggleSelection(provider: ResourceProvider) {
    setSelections((previous) => toggleProviderSelection(previous, provider))
  }
  function clearPrivateDetails() {
    setDraft(EMPTY_FILTERS); setAppliedFilters(null); setStep(0); setView('wizard'); setVisibleCount(PAGE_SIZE)
    setSelections([]); setAge(''); setDisability('未填寫'); setIncome('未填寫'); setSchool('未填寫')
    focusHeading()
  }
  function printList() {
    if (selections.length === 0) return
    flushSync(() => setToday(taipeiDate()))
    window.print()
  }
  const profile = [
    `疾病：${activeFilters.diseases.map(diseaseLabel).join('、')}`,
    `協助需求：${activeFilters.needs.map(needLabel).join('、')}`,
    `查詢縣市：${activeFilters.region}（實際戶籍、居住及就醫資格請依各項資源確認）`,
    `年齡：${age ? `${age} 歲` : '未填寫'}；身障證明：${disability}；經濟身分：${income}；就學狀況：${school}`,
  ]

  return (
    <div className="RehabResourceDirectory">
      <div className="ResourceScreenOnly mx-auto max-w-5xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        {view === 'wizard' ? (
          <form onSubmit={submitStep} aria-label="資源篩選" className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-5 sm:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            <ol aria-label="篩選步驟" className="mb-8 flex items-center gap-2 sm:gap-5">
              {STEPS.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={`flex flex-1 items-center gap-2 text-xs sm:text-sm ${step === index ? 'font-bold text-teal-800 dark:text-teal-300' : 'text-neutral-500'}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${step === index ? 'bg-teal-800 text-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>{index + 1}</span>{label}</li>)}
            </ol>
            <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold outline-none sm:text-2xl">{step === 0 ? '選擇疾病' : step === 1 ? '選擇所在地' : '需要哪些協助？'}</h2>
            {step === 0 && <fieldset className="mt-6"><legend className="sr-only">疾病，可複選</legend><p className="mb-5 text-sm text-neutral-500">可複選</p>
              {DISEASE_GROUPS.map((group) => <div key={group.label} className="mb-6 last:mb-0"><h3 className="mb-3 text-sm font-semibold text-neutral-500">{group.label}</h3><div className="grid gap-3 sm:grid-cols-2">{group.items.map((item) => <label key={item.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${draft.diseases.includes(item.id) ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/40' : 'border-neutral-200 hover:border-teal-600 dark:border-neutral-700'}`}><input className="h-4 w-4 shrink-0 accent-teal-700" type="checkbox" checked={draft.diseases.includes(item.id)} onChange={() => updateDraft('diseases', toggleItem<DiseaseId>(draft.diseases, item.id))} />{item.label}</label>)}</div></div>)}
            </fieldset>}
            {step === 1 && <div className="mt-6"><label htmlFor={`${id}-region`} className="text-sm font-medium">想查哪個縣市的資源？</label><select id={`${id}-region`} required value={draft.region} onChange={(event) => updateDraft('region', event.target.value as Region | '')} className={FIELD_CLASS}><option value="" disabled>請選擇縣市</option>{REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}</select><p className="mt-3 text-xs leading-6 text-neutral-500">同時查找全國性資源；各方案的戶籍、居住或就醫限制會列在結果中。</p></div>}
            {step === 2 && <fieldset className="mt-6"><legend className="sr-only">協助需求，可複選</legend><p className="mb-5 text-sm text-neutral-500">可複選</p><div className="grid gap-3 sm:grid-cols-2">{NEEDS.map((need) => <label key={need.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${draft.needs.includes(need.id) ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/40' : 'border-neutral-200 hover:border-teal-600 dark:border-neutral-700'}`}><input type="checkbox" className="h-4 w-4 shrink-0 accent-teal-700" checked={draft.needs.includes(need.id)} onChange={() => updateDraft('needs', toggleItem<NeedId>(draft.needs, need.id))} />{need.label}</label>)}</div></fieldset>}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
              {step > 0 ? <button type="button" onClick={() => { setStep(step - 1); focusHeading() }} className={SECONDARY_BUTTON}>上一步</button> : <span className="text-xs text-neutral-500">第 1／3 步</span>}
              <button type="submit" disabled={!canContinue} className={PRIMARY_BUTTON}>{step === 2 ? '查看相關資源' : '下一步 →'}</button>
            </div>
          </form>
        ) : (
          <section aria-label="查詢結果">
            <div className="mb-6 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold outline-none">相關資源 <span className="ml-2 text-sm font-normal text-neutral-500">{results.length} 個單位</span></h2><button type="button" onClick={editFilters} className={SECONDARY_BUTTON}>修改條件</button></div>
              <p className="mt-3 text-sm leading-7 text-neutral-500">{filterSummary}</p>
              <details className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800"><summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">進一步篩選來源與受理狀態</summary><div className="mt-2 grid gap-4 sm:grid-cols-2"><label htmlFor={`${id}-kind`} className="text-sm">資源來源<select id={`${id}-kind`} value={activeFilters.kind} onChange={(event) => refineResults('kind', event.target.value as ResourceKind | '')} className={FIELD_CLASS}><option value="">所有來源</option>{Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label htmlFor={`${id}-status`} className="text-sm">受理狀態<select id={`${id}-status`} value={activeFilters.status} onChange={(event) => refineResults('status', event.target.value as ApplicationStatus | '')} className={FIELD_CLASS}><option value="">所有狀態</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></details>
            </div>
            {results.length === 0 && <div className="rounded-2xl border border-dashed border-neutral-300 p-8 dark:border-neutral-700"><h3 className="font-bold">目前沒有符合這組條件的資源</h3><p className="mt-3 text-sm leading-7 text-neutral-500">可修改條件，或從頁面上方的「相關網頁」查詢政府窗口。查無結果不代表當地沒有援助。</p></div>}
            <div className="space-y-5">{results.slice(0, visibleCount).map((provider) => {
              const selection = selections.find((item) => item.providerId === provider.id)
              const selected = Boolean(selection)
              const hasAdditional = selection && provider.resources.some((resource) => !selection.resourceIds.includes(resource.id))
              return <article key={provider.id} className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950">
                <p className="mb-2 text-xs font-semibold text-neutral-500">{[...new Set(provider.resources.map((resource) => KIND_LABELS[resource.kind]))].join('・')}</p>
                <h3 className="text-lg font-bold leading-7">{provider.name}</h3>
                <div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">{provider.resources.map((resource) => <details key={resource.id} className="py-1">
                  <summary className="min-h-12 cursor-pointer py-3 text-sm font-semibold leading-7"><span className="mr-3">{resource.title}</span><StatusBadge resource={resource} today={today} /><span className="mt-1 block text-xs font-normal text-neutral-500">{RESOURCE_TYPE_LABELS[resource.resourceType]} · 核對 {resource.checkedAt}</span></summary>
                  <div className="pb-5 pt-2"><p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">{resource.summary}</p><p className="mt-1 text-xs text-neutral-500">{GEOGRAPHY_LABELS[resource.geographicBasis]}</p>
                    <div className="my-4 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-900"><p className="mb-1 text-xs font-semibold text-teal-800 dark:text-teal-300">為何值得詢問</p><ul className="space-y-1 text-xs leading-6 text-neutral-600 dark:text-neutral-300">{matchReasons(resource, activeFilters).map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
                    <ResourceDetails resource={resource} today={today} />
                  </div>
                </details>)}</div>
                <div className="mt-3 flex justify-end border-t border-neutral-100 pt-4 dark:border-neutral-800"><button type="button" aria-pressed={hasAdditional ? undefined : selected} onClick={() => toggleSelection(provider)} className={`min-h-11 rounded-xl border px-4 text-sm font-semibold ${selected && !hasAdditional ? 'border-teal-700 bg-teal-700 text-white' : 'border-neutral-300 text-neutral-800 hover:border-teal-700 hover:text-teal-800 dark:border-neutral-700 dark:text-neutral-100'}`}>{hasAdditional ? '＋ 加入其他符合服務' : selected ? '✓ 已加入討論清單' : '＋ 加入討論清單'}</button></div>
              </article>
            })}</div>
            {visibleCount < results.length && <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="mt-6 min-h-12 w-full rounded-xl border border-neutral-300 text-sm font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">再顯示 {Math.min(PAGE_SIZE, results.length - visibleCount)} 個單位（尚有 {results.length - visibleCount} 個）↓</button>}

          </section>
        )}

        {selectedProviders.length > 0 && <section ref={discussionRef} id="discussion-list" className="mt-12 scroll-mt-24 rounded-2xl border border-teal-200 bg-teal-50/30 p-5 sm:p-8 dark:border-teal-900 dark:bg-teal-950/10" aria-labelledby={`${id}-discussion-title`}>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold tracking-widest text-teal-800 dark:text-teal-300">帶去與社工討論</p><h2 id={`${id}-discussion-title`} className="mt-2 text-2xl font-bold">我的資源討論清單</h2></div><button type="button" onClick={printList} className={PRIMARY_BUTTON}>列印／另存 PDF（{selectedProviders.length} 個單位）</button></div>
          <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">清單整合同一單位在加入時符合條件的服務，附上適用原因、待確認資格、文件與轉介窗口；修改查詢後仍會保留。</p>
          <details className="mt-5 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-950"><summary className="min-h-11 cursor-pointer text-sm font-semibold leading-10">補充資訊（選填，供社工確認）</summary><p className="mt-2 text-xs leading-6 text-neutral-500">不作自動資格判定；僅用於本次列印，不儲存於網站或傳送至分析平台。</p><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label htmlFor={`${id}-age`} className="text-sm">年齡（歲）<input id={`${id}-age`} type="number" min="0" max="120" step="0.1" value={age} onChange={(event) => setAge(event.target.value)} placeholder="不必填出生日期" className={FIELD_CLASS} /></label><label htmlFor={`${id}-disability`} className="text-sm">身障證明<select id={`${id}-disability`} value={disability} onChange={(event) => setDisability(event.target.value)} className={FIELD_CLASS}>{['未填寫', '已有證明', '申請中', '尚無證明'].map((value) => <option key={value}>{value}</option>)}</select></label><label htmlFor={`${id}-income`} className="text-sm">經濟身分<select id={`${id}-income`} value={income} onChange={(event) => setIncome(event.target.value)} className={FIELD_CLASS}>{['未填寫', '一般戶', '低收入戶', '中低收入戶', '經濟困難，待社工評估'].map((value) => <option key={value}>{value}</option>)}</select></label><label htmlFor={`${id}-school`} className="text-sm">就學狀況<select id={`${id}-school`} value={school} onChange={(event) => setSchool(event.target.value)} className={FIELD_CLASS}>{['未填寫', '尚未入小學', '已入學', '核准暫緩入學', '不適用'].map((value) => <option key={value}>{value}</option>)}</select></label></div></details>
          <ol className="mt-6 space-y-3">{selectedProviders.map((provider, index) => <li key={provider.id} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"><div><p className="text-sm font-bold">{index + 1}. {provider.name}</p><ul className="mt-2 space-y-2">{provider.resources.map((resource) => <li key={resource.id} className="text-xs leading-6 text-neutral-500">{resource.title} · {resourceStatus(resource, today).label}{!matchesCurrentContext(resource, activeFilters, today) && <p className="text-amber-800 dark:text-amber-200">與目前疾病、需求或地區條件不同，仍保留供討論；請先核對。</p>}</li>)}</ul></div><button type="button" aria-label={`移除${provider.name}`} onClick={() => toggleSelection(provider)} className="min-h-11 shrink-0 px-2 text-xs text-neutral-500 underline underline-offset-4">移除</button></li>)}</ol>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-5 dark:border-neutral-800"><p className="max-w-2xl text-xs leading-6 text-neutral-500">選擇與補充資訊只保留在目前頁面；重新整理會重設，不會上傳或儲存。使用公用電腦後可清除。</p><button type="button" onClick={clearPrivateDetails} className="min-h-11 text-xs text-neutral-500 underline underline-offset-4">清除本頁資料</button></div>
        </section>}

        {selectedProviders.length > 0 && <div className="ResourceSelectionBar fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-700 dark:bg-neutral-950/95"><div className="mx-auto flex max-w-5xl items-center justify-between gap-3"><button type="button" onClick={() => discussionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-11 text-sm font-semibold">已選 {selectedProviders.length} 個單位 · 查看清單 ↑</button><button type="button" onClick={printList} className="min-h-11 rounded-xl bg-teal-800 px-4 text-sm font-semibold text-white">列印討論清單</button></div></div>}
      </div>

      <section className="ResourcePrintOnly" aria-label="社工討論清單列印內容">
        {selectedProviders.length === 0 ? <p>請先完成疾病、所在地及協助需求的選擇，將想詢問的單位加入討論清單後再列印。</p> : <>
          <div className="ResourcePrintIntro"><p className="text-xs">CAM SAVANT · 復健科補助與援助資源</p><div className="ResourcePrintTitle">社工討論準備清單</div><p>產生日期：{today} · 已選 {selectedProviders.length} 個單位 · 資源內容整理：{RESOURCE_UPDATED_AT}</p><p>此為詢問與備件清單，非資格認定或核定通知；請與社工及各承辦單位確認。</p>{profile.map((line) => <p key={line}>{line}</p>)}<p>姓名／稱呼：＿＿＿＿＿＿　就醫院所：＿＿＿＿＿＿　討論日期：＿＿＿＿＿＿</p></div>
          <div className="ResourcePrintSummary"><h2>本次想詢問的單位</h2><ol>{selectedProviders.map((provider) => <li key={provider.id}>{provider.name}</li>)}</ol><h2>先與社工確認</h2><p>□ 戶籍／居住／就醫範圍　□ 年齡、就學與證明效期　□ 經濟評估</p><p>□ 是否先核定再購買／療育　□ 同一費用是否已有補助或保險給付</p><p>□ 收據正本及申請／核銷期限　□ 是否需社工轉介　□ 目前名額、經費與撥款</p><p>文件以各項資源說明及承辦要求為準；共通文件可先備一份供核對，正本用途請確認後安排。</p></div>
          {selectedProviders.map((provider, index) => <article key={provider.id} className="ResourcePrintItem"><h2>{index + 1}. {provider.name}</h2>{provider.resources.map((resource) => <div key={resource.id} className="mt-5"><h3>{resource.title}</h3><p>{resource.organization} · {KIND_LABELS[resource.kind]} · {RESOURCE_TYPE_LABELS[resource.resourceType]}</p>{!matchesCurrentContext(resource, activeFilters, today) && <p className="font-bold">注意：這項服務與目前篩選條件不同，請先確認適用性。</p>}<h3>為何列出供討論</h3><ul>{matchReasons(resource, activeFilters).map((reason) => <li key={reason}>{reason}</li>)}</ul><ResourceDetails resource={resource} today={today} print /></div>)}<div className="ResourceSocialWorkerNotes"><p>社工討論：□ 可進一步評估　□ 待補件　□ 轉介中　□ 不適用</p><p>待辦／轉介對象：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</p><p>備註：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿</p></div></article>)}
        </>}
      </section>
    </div>
  )
}
