'use client'

import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { trackAnalyticsEvent } from '@/lib/analytics'
import { findSupplementProducts } from '@/lib/supplement-catalog'

const PLATFORM_URL = 'https://www.metagenics-prisma.com'
const REFERRAL_CODE = 'YY103001'
const NAME_SHORTCUTS = ['魚油', '益生菌', '維生素', '鎂', '膠囊', '粉']

export default function SupplementCatalogPage() {
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const products = useMemo(() => findSupplementProducts(activeQuery), [activeQuery])

  function searchByName(value: string) {
    setQuery(value)
    setActiveQuery(value)
    if (value.trim()) {
      // Record tool use only. Never send the query, product, or health information.
      trackAnalyticsEvent('site_search_used', {
        locale: 'zh-TW',
        placement: 'supplement_catalog',
      })
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    searchByName(query)
  }

  async function copyReferralCode() {
    try {
      await navigator.clipboard.writeText(REFERRAL_CODE)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <header className="mb-8">
        <Link href="/functional-medicine" className="text-sm text-neutral-500 underline underline-offset-4 dark:text-neutral-400">
          功能醫學專區
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-neutral-950 dark:text-neutral-100 md:text-4xl">
          Metagenics 營養品查找工具
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-300">
          依中英文品名查找既有產品清單，再到台灣代理平台核對最新標示與供應資訊。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          關鍵字相符不代表臨床優先順序或療效排名。結果按英文品名排列，不依疾病、症狀或病史推薦產品，也不提供個人用量。
        </p>
      </header>

      <aside aria-labelledby="supplement-safety-title" className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/20">
        <h2 id="supplement-safety-title" className="font-semibold text-neutral-900 dark:text-neutral-100">使用前先確認</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
          營養補充品可能與藥物交互作用；不要自行以補充品取代處方藥。正在用藥、懷孕或哺乳、準備手術，或考慮讓兒童使用時，請先與醫師或藥師討論。
          <a href="#supplement-sources" className="ml-1 underline underline-offset-4">查看安全資訊來源</a>
        </p>
      </aside>

      <form onSubmit={handleSubmit} role="search" aria-label="營養品品名查找" className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-700">
        <label htmlFor="supplement-name-query" className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          中文或英文品名
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="supplement-name-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={100}
            autoComplete="off"
            aria-describedby="supplement-search-help"
            placeholder="例如：優鎂、魚油、Mag Glycinate"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <button type="submit" className="min-h-11 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300">
            查找品名
          </button>
        </div>
        <p id="supplement-search-help" className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          搜尋只比對品名；請勿輸入病史、用藥、聯絡方式或其他個人資訊。
        </p>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="常見品名字詞">
          {NAME_SHORTCUTS.map((word) => (
            <button key={word} type="button" onClick={() => searchByName(word)} className="min-h-11 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500">
              {word}
            </button>
          ))}
          <button type="button" onClick={() => searchByName('')} className="min-h-11 rounded-full px-4 py-2 text-sm text-teal-700 underline underline-offset-4 dark:text-teal-300">
            顯示全部
          </button>
        </div>
      </form>

      <section aria-labelledby="supplement-results-title" className="mt-9">
        <h2 id="supplement-results-title" className="text-xl font-bold text-neutral-900 dark:text-neutral-100">產品名稱清單</h2>
        <p role="status" aria-atomic="true" className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {activeQuery.trim() ? '查找結果' : '全部品項'}：{products.length} 項，按英文品名排列。
        </p>
        <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
          本頁保留既有產品名稱供查找；最新品名、配方、價格與供應狀態尚未逐品核對。名稱中的數字是產品識別文字，不是服用量。
        </p>

        {products.length === 0 ? (
          <div className="mt-5 rounded-2xl bg-neutral-50 p-6 text-sm leading-7 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <p>沒有相符的品名。請改用包裝上的中英文名稱，或選擇「顯示全部」。本工具不會將症狀或診斷配對到產品。</p>
            <Link href="/locations" className="mt-3 inline-flex min-h-11 items-center text-teal-700 underline underline-offset-4 dark:text-teal-300">需要評估身體不適？查看看診資訊</Link>
          </div>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {products.map((product) => (
              <li key={product.id} className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{product.name}</h3>
                <p className="mt-2 break-words text-sm text-neutral-500 dark:text-neutral-400" lang="en">{product.englishName}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="supplement-platform-title" className="mt-10 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
        <h2 id="supplement-platform-title" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">核對產品資訊</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
          中華生醫為 Metagenics 台灣代理。請在代理平台核對目前商品與包裝標示；個人是否適合使用，仍需與醫師或藥師討論。
        </p>
        <a href={PLATFORM_URL} target="_blank" rel="noopener noreferrer sponsored" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800">
          前往台灣代理平台 ↗
        </a>
        <details className="mt-5 text-sm text-neutral-600 dark:text-neutral-400">
          <summary className="min-h-11 cursor-pointer py-3">平台推薦碼資訊</summary>
          <p className="mt-2 leading-6">如平台需要填寫推薦碼，可使用以下代碼。適用規則以平台說明為準；此代碼不表示本頁已評估任何產品適合您。</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="select-all font-semibold tracking-widest text-neutral-900 dark:text-neutral-100">{REFERRAL_CODE}</span>
            <button type="button" onClick={copyReferralCode} className="min-h-11 rounded-lg border border-neutral-300 px-4 py-2 dark:border-neutral-600">複製代碼</button>
            <span role="status">{copyStatus === 'copied' ? '已複製' : copyStatus === 'error' ? '無法自動複製，請手動選取代碼。' : ''}</span>
          </div>
        </details>
      </section>

      <section id="supplement-sources" aria-labelledby="supplement-sources-title" className="mt-10 scroll-mt-24 border-t border-neutral-200 pt-7 text-sm leading-7 text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
        <h2 id="supplement-sources-title" className="font-semibold text-neutral-900 dark:text-neutral-100">安全資訊來源與內容範圍</h2>
        <p className="mt-2">以下來源僅支持本頁的通用安全提醒，不代表這些機構認可所列品牌或產品，也不代表本清單已完成逐品療效或醫療審閱。</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><a href="https://ods.od.nih.gov/factsheets/WYNTK-Consumer/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">NIH Office of Dietary Supplements：Dietary Supplements — What You Need to Know</a>（藥物交互作用、手術、孕哺與兒童使用注意事項）。</li>
          <li><a href="https://www.fda.gov/consumers/consumer-updates/fda-101-dietary-supplements" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">FDA：FDA 101 — Dietary Supplements</a>（使用前與醫療人員討論、不以補充品取代處方藥）。</li>
        </ul>
        <p className="mt-3 text-xs">通用安全來源查閱日期：2026-10-15。</p>
      </section>
    </div>
  )
}
