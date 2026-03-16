'use client'

import { useLang } from '@/lib/i18n'

export default function PrintButton() {
  const { t } = useLang()

  return (
    <div className="PrintButton flex items-center gap-3 flex-wrap mb-8">
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
      >
        {/* Printer icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        {t('printButton')}
      </button>
      <span className="text-xs text-neutral-400 dark:text-neutral-500">
        {t('printHint')}
      </span>
    </div>
  )
}
