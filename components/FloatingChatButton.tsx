'use client'

import { useState } from 'react'
import { LINE_ADD_URL, CONSULT_FORM_URL, LINE_GREEN } from '@/lib/site'

function LineGlyph({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 5.79 2 10.46c0 4.18 3.55 7.68 8.34 8.35.32.07.77.21.88.49.1.25.07.64.03.9l-.14.85c-.04.25-.2.99.87.54 1.07-.45 5.77-3.4 7.87-5.82C21.46 14.36 22 12.5 22 10.46 22 5.79 17.52 2 12 2ZM8.2 13.1H6.16a.53.53 0 0 1-.53-.53V8.49a.53.53 0 1 1 1.06 0v3.55H8.2a.53.53 0 1 1 0 1.06Zm2.08-.53a.53.53 0 1 1-1.06 0V8.49a.53.53 0 1 1 1.06 0v4.08Zm4.79 0a.53.53 0 0 1-.36.5.55.55 0 0 1-.17.03.53.53 0 0 1-.43-.21l-2.09-2.84v2.52a.53.53 0 1 1-1.06 0V8.49a.53.53 0 0 1 .36-.5.53.53 0 0 1 .6.18l2.09 2.84V8.49a.53.53 0 1 1 1.06 0v4.08Zm3.34-2.57a.53.53 0 1 1 0 1.06h-1.5v.98h1.5a.53.53 0 1 1 0 1.06h-2.04a.53.53 0 0 1-.53-.53V8.49a.53.53 0 0 1 .53-.53h2.04a.53.53 0 1 1 0 1.06h-1.5v.98h1.5Z" />
    </svg>
  )
}

export default function FloatingChatButton({ locale = 'zh' }: { locale?: 'zh' | 'en' }) {
  const [open, setOpen] = useState(false)
  const isEnglish = locale === 'en'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* 展開的兩個選項 */}
      {open && (
        <div className="flex flex-col items-end gap-2 animate-[fadeIn_0.15s_ease-out]">
          <a
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg hover:scale-105 transition-all"
            style={{ backgroundColor: LINE_GREEN }}
            aria-label={isEnglish ? 'Contact us on LINE' : '加入官方 LINE 好友'}
          >
            <LineGlyph className="w-5 h-5" />
            {isEnglish ? 'LINE Consultation' : '官方 LINE 諮詢'}
          </a>
          <a
            href={CONSULT_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-sm font-semibold px-4 py-3 rounded-full shadow-lg hover:scale-105 transition-all"
            aria-label={isEnglish ? 'Open consultation form' : '開啟醫療諮詢表單'}
          >
            {isEnglish ? '📝 Question Form' : '📝 表單提問'}
          </a>
        </div>
      )}

      {/* 主按鈕 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open
          ? (isEnglish ? 'Close consultation menu' : '關閉諮詢選單')
          : (isEnglish ? 'Open consultation menu' : '開啟諮詢選單')}
        className="flex items-center gap-2 bg-accent-700 dark:bg-accent-500 text-white dark:text-neutral-950 text-sm font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-accent-600 dark:hover:bg-accent-400 hover:scale-105 transition-all duration-200"
      >
        {open
          ? (isEnglish ? '✕ Close' : '✕ 關閉')
          : (isEnglish ? '💬 Ask a Question' : '💬 諮詢提問')}
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
