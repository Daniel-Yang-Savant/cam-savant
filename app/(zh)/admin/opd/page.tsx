'use client'

import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

type TemplateCategory = '快速開始' | '部位檢查' | '常見病況' | '安全與功能'
type PostopPrescriptionCategory = '骨科術後' | '癌症術後' | '心肺術後'
type LibraryMode = 'exam' | 'postop'

interface OpdTemplate {
  id: string
  title: string
  category: TemplateCategory
  hint: string
  objective: string
  safety?: string
  reviewedAt: string
}

interface PostopPrescription {
  id: string
  title: string
  category: PostopPrescriptionCategory
  hint: string
  phases: Array<{ id: string; label: string; plan: string }>
  safety: string
}

type CopyState = 'idle' | 'copied' | 'error'

const INITIAL_SUBJECTIVE = `Chief complaint: ＿＿
Onset / duration: ＿＿
Location / radiation: ＿＿
Aggravating / alleviating factors: ＿＿
Associated symptoms: ＿＿
Trauma history: ＿＿
Past history: ＿＿
Occupation / functional limitation: ＿＿
Exercise habit: ＿＿
Patient goal: ＿＿`

const INITIAL_ASSESSMENT = `Problem list / impression:
1. ＿＿
Differential / contributing factors: ＿＿`

const INITIAL_PLAN = `Education and shared decision-making: ＿＿
Medication / procedure: ＿＿
Rehabilitation / home exercise: ＿＿
Investigation / referral: ＿＿
Precautions / red flags discussed: ＿＿
Follow-up: ＿＿`

const EXAM_CATEGORIES: Array<'全部' | TemplateCategory> = [
  '全部',
  '快速開始',
  '部位檢查',
  '常見病況',
  '安全與功能',
]

const POSTOP_CATEGORIES: Array<'全部' | PostopPrescriptionCategory> = [
  '全部',
  '骨科術後',
  '癌症術後',
  '心肺術後',
]

async function writeClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const fallback = document.createElement('textarea')
  fallback.value = value
  fallback.style.position = 'fixed'
  fallback.style.opacity = '0'
  document.body.appendChild(fallback)
  fallback.select()
  const succeeded = document.execCommand('copy')
  fallback.remove()
  if (!succeeded) throw new Error('Copy failed')
}

function buildSoap(subjective: string, objective: string, assessment: string, plan: string) {
  return [
    `S:\n${subjective.trim()}`,
    `O:\n${objective.trim()}`,
    `A:\n${assessment.trim()}`,
    `P:\n${plan.trim()}`,
  ].join('\n\n')
}

export default function OpdPage() {
  const [templates, setTemplates] = useState<OpdTemplate[]>([])
  const [prescriptions, setPrescriptions] = useState<PostopPrescription[]>([])
  const [templateError, setTemplateError] = useState('')
  const [libraryMode, setLibraryMode] = useState<LibraryMode>('exam')
  const [query, setQuery] = useState('')
  const [examCategory, setExamCategory] =
    useState<(typeof EXAM_CATEGORIES)[number]>('全部')
  const [postopCategory, setPostopCategory] =
    useState<(typeof POSTOP_CATEGORIES)[number]>('全部')
  const [selectedId, setSelectedId] = useState('universal-msk')
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('')
  const [selectedPhaseId, setSelectedPhaseId] = useState('')
  const [subjective, setSubjective] = useState(INITIAL_SUBJECTIVE)
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState(INITIAL_ASSESSMENT)
  const [plan, setPlan] = useState(INITIAL_PLAN)
  const [postopPlan, setPostopPlan] = useState('')
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [hasEdited, setHasEdited] = useState(false)
  const [objectiveEdited, setObjectiveEdited] = useState(false)
  const [postopPlanEdited, setPostopPlanEdited] = useState(false)
  const objectiveRef = useRef<HTMLTextAreaElement>(null)
  const postopWorkspaceRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/admin/opd/templates', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('無法載入 OPD 模板')
        return response.json() as Promise<{
          templates: OpdTemplate[]
          prescriptions: PostopPrescription[]
        }>
      })
      .then(({ templates: nextTemplates, prescriptions: nextPrescriptions }) => {
        setTemplates(nextTemplates)
        setPrescriptions(nextPrescriptions)
        const universal = nextTemplates.find((item) => item.id === 'universal-msk')
        if (universal) setObjective((current) => current || universal.objective)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setTemplateError(
            error instanceof Error ? error.message : '無法載入 OPD 模板'
          )
        }
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!hasEdited && !postopPlanEdited) return
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [hasEdited, postopPlanEdited])

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedId) ?? null,
    [selectedId, templates]
  )

  const selectedPrescription = useMemo(
    () =>
      prescriptions.find((item) => item.id === selectedPrescriptionId) ?? null,
    [prescriptions, selectedPrescriptionId]
  )

  const selectedPhase = useMemo(
    () => selectedPrescription?.phases.find((phase) => phase.id === selectedPhaseId) ?? null,
    [selectedPhaseId, selectedPrescription]
  )

  const phaseCount = useMemo(
    () => prescriptions.reduce((count, prescription) => count + prescription.phases.length, 0),
    [prescriptions]
  )

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return templates.filter((template) => {
      const inCategory =
        examCategory === '全部' || template.category === examCategory
      const matchesQuery =
        !normalizedQuery ||
        template.title.toLowerCase().includes(normalizedQuery) ||
        template.hint.toLowerCase().includes(normalizedQuery) ||
        template.objective.toLowerCase().includes(normalizedQuery)
      return inCategory && matchesQuery
    })
  }, [examCategory, query, templates])

  const filteredPrescriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return prescriptions.filter((prescription) => {
      const inCategory =
        postopCategory === '全部' || prescription.category === postopCategory
      const matchesQuery =
        !normalizedQuery ||
        prescription.title.toLowerCase().includes(normalizedQuery) ||
        prescription.hint.toLowerCase().includes(normalizedQuery) ||
        prescription.phases.some((phase) =>
          phase.label.toLowerCase().includes(normalizedQuery) ||
          phase.plan.toLowerCase().includes(normalizedQuery)
        )
      return inCategory && matchesQuery
    })
  }, [postopCategory, prescriptions, query])

  const copyWorkspace = useCallback(async () => {
    if (libraryMode === 'postop' && !selectedPhase) return
    try {
      await writeClipboard(
        libraryMode === 'postop'
          ? `P:\n${postopPlan.trim()}`
          : buildSoap(subjective, objective, assessment, plan)
      )
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
    window.setTimeout(() => setCopyState('idle'), 2200)
  }, [assessment, libraryMode, objective, plan, postopPlan, selectedPhase, subjective])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        void copyWorkspace()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [copyWorkspace])

  const selectExamTemplate = (template: OpdTemplate) => {
    if (
      objectiveEdited &&
      !window.confirm('切換檢查模板會取代目前手動編輯的 O 內容，確定要繼續嗎？')
    ) {
      return
    }

    setSelectedId(template.id)
    setObjective(template.objective)
    setObjectiveEdited(false)
    window.requestAnimationFrame(() => {
      objectiveRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

  const selectPostopPrescription = (prescription: PostopPrescription) => {
    if (prescription.id === selectedPrescriptionId) return
    const firstPhase = prescription.phases[0]
    if (!firstPhase) return
    if (
      postopPlanEdited &&
      !window.confirm('切換處方會取代目前手動編輯的 P 內容，確定要繼續嗎？')
    ) {
      return
    }

    setSelectedPrescriptionId(prescription.id)
    setSelectedPhaseId(firstPhase.id)
    setPostopPlan(firstPhase.plan)
    setPostopPlanEdited(false)
    setCopyState('idle')
    window.requestAnimationFrame(() => {
      postopWorkspaceRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const selectPostopPhase = (phase: PostopPrescription['phases'][number]) => {
    if (phase.id === selectedPhaseId) return
    if (
      postopPlanEdited &&
      !window.confirm('切換階段會取代目前手動編輯的 P 內容，確定要繼續嗎？')
    ) {
      return
    }
    setSelectedPhaseId(phase.id)
    setPostopPlan(phase.plan)
    setPostopPlanEdited(false)
    setCopyState('idle')
  }

  const clearWorkspace = () => {
    if (libraryMode === 'postop') {
      if (!window.confirm('清空目前階段的 P 內容？')) return
      setPostopPlan('')
      setPostopPlanEdited(true)
      setCopyState('idle')
      return
    }
    if (!window.confirm('清空目前 S、O、A、P 的所有內容？')) return
    setSubjective('')
    setObjective('')
    setAssessment('')
    setPlan('')
    setHasEdited(false)
    setObjectiveEdited(false)
  }

  const restoreSkeleton = () => {
    if (libraryMode === 'postop') {
      if (!selectedPhase) return
      if (
        postopPlanEdited &&
        !window.confirm('重設會取代目前手動編輯的 P 內容，確定要繼續嗎？')
      ) {
        return
      }
      setPostopPlan(selectedPhase.plan)
      setPostopPlanEdited(false)
      setCopyState('idle')
      return
    }
    setSubjective(INITIAL_SUBJECTIVE)
    setAssessment(INITIAL_ASSESSMENT)
    setPlan(INITIAL_PLAN)
    const universal = templates.find((item) => item.id === 'universal-msk')
    setObjective(universal?.objective ?? '')
    setSelectedId('universal-msk')
    setHasEdited(true)
    setObjectiveEdited(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-100 text-stone-950 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-stone-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                管理員專用
              </span>
              <span className="rounded-full border border-stone-200 px-2.5 py-1 text-[11px] text-stone-500 dark:border-neutral-700 dark:text-neutral-400">
                僅存在此分頁・不儲存
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              OPD SOAP 工作區
            </h1>
            <p className="mt-1 text-sm text-stone-500 dark:text-neutral-400">
              理學檢查直接載入 O；術後處方依恢復階段選取、編輯並複製 Plan。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/editor"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
            >
              文章編輯器
            </Link>
            <button
              type="button"
              onClick={restoreSkeleton}
              disabled={libraryMode === 'postop' && !selectedPhase}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
            >
              {libraryMode === 'postop' ? '重設此階段' : '重設格式'}
            </button>
            <button
              type="button"
              onClick={clearWorkspace}
              disabled={libraryMode === 'postop' && !selectedPhase}
              className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-950 dark:bg-neutral-900 dark:text-rose-300"
            >
              清空
            </button>
            <button
              type="button"
              onClick={() => void copyWorkspace()}
              disabled={libraryMode === 'postop' && !selectedPhase}
              className="min-w-32 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              {copyState === 'copied'
                ? libraryMode === 'postop' ? '✓ 已複製 P' : '✓ 已複製 SOAP'
                : copyState === 'error'
                  ? '複製失敗'
                  : libraryMode === 'postop' ? '複製此階段 P' : '複製 SOAP'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 p-4 sm:p-6 lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="self-start overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-4 lg:max-h-[calc(100vh-96px)]">
          <div className="border-b border-stone-200 p-4 dark:border-neutral-800">
            <div className="mb-4 grid grid-cols-2 rounded-xl bg-stone-100 p-1 dark:bg-neutral-950">
              <button
                type="button"
                onClick={() => {
                  setLibraryMode('exam')
                  setQuery('')
                  setCopyState('idle')
                }}
                aria-pressed={libraryMode === 'exam'}
                className={`rounded-lg px-2 py-2 text-xs font-bold transition ${
                  libraryMode === 'exam'
                    ? 'bg-white text-stone-950 shadow-sm dark:bg-neutral-800 dark:text-white'
                    : 'text-stone-500 hover:text-stone-900 dark:text-neutral-500 dark:hover:text-white'
                }`}
              >
                理學檢查 O
              </button>
              <button
                type="button"
                onClick={() => {
                  setLibraryMode('postop')
                  setQuery('')
                  setCopyState('idle')
                }}
                aria-pressed={libraryMode === 'postop'}
                className={`rounded-lg px-2 py-2 text-xs font-bold transition ${
                  libraryMode === 'postop'
                    ? 'bg-white text-stone-950 shadow-sm dark:bg-neutral-800 dark:text-white'
                    : 'text-stone-500 hover:text-stone-900 dark:text-neutral-500 dark:hover:text-white'
                }`}
              >
                術後 Plan
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">
                  {libraryMode === 'exam' ? '理學檢查模板' : '術後復健處方'}
                </h2>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-neutral-500">
                  {libraryMode === 'exam'
                    ? templates.length
                      ? `${templates.length} 組 copy-ready O`
                      : '載入中…'
                    : prescriptions.length
                      ? `${prescriptions.length} 種術式・${phaseCount} 組階段 Plan`
                      : '載入中…'}
                </p>
              </div>
              {libraryMode === 'exam' && (
                <span className="rounded-md bg-stone-100 px-2 py-1 text-[10px] text-stone-500 dark:bg-neutral-800 dark:text-neutral-400">
                  ROM 參考 {templates[0]?.reviewedAt ?? '2026-09-08'}
                </span>
              )}
            </div>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                libraryMode === 'exam'
                  ? '搜尋部位、病況或檢查…'
                  : '搜尋術式、癌症或復健內容…'
              }
              className="mt-3 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm placeholder:text-stone-400 focus:border-stone-500 focus:bg-white dark:border-neutral-700 dark:bg-neutral-950 dark:placeholder:text-neutral-600 dark:focus:border-neutral-500"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {libraryMode === 'exam'
                ? EXAM_CATEGORIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setExamCategory(item)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        examCategory === item
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {item}
                    </button>
                  ))
                : POSTOP_CATEGORIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPostopCategory(item)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        postopCategory === item
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto lg:max-h-[calc(100vh-292px)]">
            {templateError ? (
              <p className="m-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {templateError}，請重新整理頁面。
              </p>
            ) : libraryMode === 'exam' && filteredTemplates.length ? (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => selectExamTemplate(template)}
                  className={`w-full border-b border-stone-100 px-4 py-3 text-left transition last:border-b-0 dark:border-neutral-800 ${
                    selectedId === template.id
                      ? 'bg-amber-50 dark:bg-amber-950/25'
                      : 'hover:bg-stone-50 dark:hover:bg-neutral-800/70'
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug">
                      {template.title}
                    </span>
                    <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-500 dark:bg-neutral-800 dark:text-neutral-400">
                      {template.category}
                    </span>
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-stone-500 dark:text-neutral-500">
                    {template.hint}
                  </span>
                </button>
              ))
            ) : libraryMode === 'postop' && filteredPrescriptions.length ? (
              filteredPrescriptions.map((prescription) => (
                <button
                  key={prescription.id}
                  type="button"
                  onClick={() => selectPostopPrescription(prescription)}
                  aria-pressed={selectedPrescriptionId === prescription.id}
                  className={`w-full border-b border-stone-100 px-4 py-3 text-left transition last:border-b-0 dark:border-neutral-800 ${
                    selectedPrescriptionId === prescription.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/25'
                      : 'hover:bg-stone-50 dark:hover:bg-neutral-800/70'
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug">
                      {prescription.title}
                    </span>
                    <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-500 dark:bg-neutral-800 dark:text-neutral-400">
                      {prescription.category}
                    </span>
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-stone-500 dark:text-neutral-500">
                    {prescription.hint}
                  </span>
                  <span className="mt-2 block text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    {prescription.phases.length} 個恢復階段
                  </span>
                </button>
              ))
            ) : (libraryMode === 'exam' ? templates.length : prescriptions.length) ? (
              <p className="p-8 text-center text-xs text-stone-400 dark:text-neutral-600">
                找不到符合的模板
              </p>
            ) : (
              <div className="space-y-3 p-4" aria-label="模板載入中">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-lg bg-stone-100 dark:bg-neutral-800" />
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="min-w-0 space-y-5">
          {libraryMode === 'exam' && selectedTemplate && (
            <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
                    已選模板
                  </p>
                  <h2 className="mt-1 text-base font-bold">{selectedTemplate.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
                    {selectedTemplate.hint}
                  </p>
                  <p className="mt-3 rounded-lg border border-amber-300 bg-white/80 px-3 py-2 text-xs leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-neutral-950/40 dark:text-amber-200">
                    <span className="font-bold">正常角度預設：</span>
                    O 內數值是成人常用參考值，只能在實際完成檢查且結果相符時保留；異常請改為實測值，未檢查請記錄 not assessed。
                  </p>
                  {selectedTemplate.safety && (
                    <p className="mt-3 rounded-lg border border-rose-200 bg-white/70 px-3 py-2 text-xs leading-relaxed text-rose-800 dark:border-rose-900/70 dark:bg-neutral-950/40 dark:text-rose-300">
                      <span className="font-bold">安全提醒：</span>
                      {selectedTemplate.safety}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {libraryMode === 'postop' && selectedPrescription && (
            <section ref={postopWorkspaceRef} className="scroll-mt-24 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                    已選術後 Plan
                  </p>
                  <h2 className="mt-1 text-base font-bold">
                    {selectedPrescription.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-neutral-400">
                    {selectedPrescription.hint}
                  </p>
                  <div className="mt-4" role="group" aria-label="選擇術後恢復階段">
                    <p className="mb-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      選擇恢復階段
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrescription.phases.map((phase) => (
                        <button
                          key={phase.id}
                          type="button"
                          aria-pressed={selectedPhaseId === phase.id}
                          aria-controls="postop-plan"
                          onClick={() => selectPostopPhase(phase)}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            selectedPhaseId === phase.id
                              ? 'border-emerald-700 bg-emerald-700 text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-emerald-950'
                              : 'border-emerald-200 bg-white text-emerald-800 hover:border-emerald-600 dark:border-emerald-900 dark:bg-neutral-900 dark:text-emerald-300 dark:hover:border-emerald-500'
                          }`}
                        >
                          {phase.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 rounded-lg border border-rose-200 bg-white/70 px-3 py-2 text-xs leading-relaxed text-rose-800 dark:border-rose-900/70 dark:bg-neutral-950/40 dark:text-rose-300">
                    <span className="font-bold">安全提醒：</span>
                    {selectedPrescription.safety}
                  </p>
                </div>
              </div>
            </section>
          )}

          <div
            className={`grid scroll-mt-24 gap-5 ${libraryMode === 'exam' ? 'xl:grid-cols-2' : ''}`}
          >
            {libraryMode === 'exam' ? (
              <>
                <SoapSection
                  label="S"
                  title="Subjective"
                  helper="主訴、病史、功能與病人目標"
                  value={subjective}
                  rows={12}
                  onChange={(value) => {
                    setSubjective(value)
                    setHasEdited(true)
                  }}
                />
                <SoapSection
                  label="O"
                  title="Objective"
                  helper="點選模板即載入；請核對並修改預設正常角度"
                  value={objective}
                  rows={20}
                  textareaRef={objectiveRef}
                  onChange={(value) => {
                    setObjective(value)
                    setHasEdited(true)
                    setObjectiveEdited(true)
                  }}
                />
                <SoapSection
                  label="A"
                  title="Assessment"
                  helper="問題列表、臨床印象與鑑別方向"
                  value={assessment}
                  rows={8}
                  onChange={(value) => {
                    setAssessment(value)
                    setHasEdited(true)
                  }}
                />
                <SoapSection
                  label="P"
                  title="Plan"
                  helper="衛教、治療與追蹤計畫"
                  value={plan}
                  rows={10}
                  onChange={(value) => {
                    setPlan(value)
                    setHasEdited(true)
                  }}
                />
              </>
            ) : selectedPrescription && selectedPhase ? (
              <SoapSection
                key={`${selectedPrescription.id}-${selectedPhase.id}`}
                label="P"
                title={`Plan · ${selectedPhase.label}`}
                helper={`${selectedPrescription.title}｜全英文復健處方，可編輯後直接複製至病歷`}
                textareaId="postop-plan"
                value={postopPlan}
                rows={24}
                onChange={(value) => {
                  setPostopPlan(value)
                  setPostopPlanEdited(true)
                  setCopyState('idle')
                }}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 px-6 py-16 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
                <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  選擇術式，再選恢復階段
                </h2>
                <p className="mt-2 text-sm text-stone-600 dark:text-neutral-400">
                  從左側點選術後處方，即可查看並複製各階段的 Plan。
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">完成後直接貼入院內病歷系統</p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-neutral-500">
                快捷鍵：⌘／Ctrl + Shift + C。請在貼上後再次確認病人、側別、數值與未執行項目。
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyWorkspace()}
              disabled={libraryMode === 'postop' && !selectedPhase}
              className="rounded-xl bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              {copyState === 'copied'
                ? libraryMode === 'postop' ? '✓ 已複製 P' : '✓ 已複製完整 SOAP'
                : copyState === 'error'
                  ? '複製失敗'
                  : libraryMode === 'postop' ? '複製此階段 P' : '複製完整 SOAP'}
            </button>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-900 dark:border-sky-950 dark:bg-sky-950/30 dark:text-sky-300">
            <span className="font-bold">隱私設計：</span>
            本頁沒有儲存 API、沒有 localStorage，也沒有針對輸入內容的分析事件。重新整理或關閉分頁後，尚未複製的內容會消失。模板是記錄輔助，不取代臨床判斷；單一 special test 不應獨立確立診斷。
          </div>
        </section>
      </div>
    </div>
  )
}

function SoapSection({
  label,
  title,
  helper,
  value,
  rows,
  onChange,
  textareaRef,
  textareaId,
}: {
  label: 'S' | 'O' | 'A' | 'P'
  title: string
  helper: string
  value: string
  rows: number
  onChange: (value: string) => void
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
  textareaId?: string
}) {
  const [sectionCopyState, setSectionCopyState] = useState<CopyState>('idle')

  const copySection = async () => {
    try {
      await writeClipboard(`${label}:\n${value.trim()}`)
      setSectionCopyState('copied')
    } catch {
      setSectionCopyState('error')
    }
    window.setTimeout(() => setSectionCopyState('idle'), 1800)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-black text-white dark:bg-white dark:text-neutral-950">
            {label}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold">{title}</h2>
            <p className="truncate text-[11px] text-stone-500 dark:text-neutral-500">
              {helper}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void copySection()}
          className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          {sectionCopyState === 'copied'
            ? '✓ 已複製'
            : sectionCopyState === 'error'
              ? '失敗'
              : `複製 ${label}`}
        </button>
      </div>
      <textarea
        id={textareaId}
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        spellCheck={false}
        className="block w-full resize-y bg-white px-4 py-4 font-mono text-[13px] leading-6 text-stone-800 placeholder:text-stone-300 focus:bg-amber-50/30 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-700 dark:focus:bg-neutral-900"
        aria-label={`${label} ${title}`}
      />
    </section>
  )
}
