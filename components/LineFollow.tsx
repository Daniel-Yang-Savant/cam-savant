'use client'

import { QRCodeSVG } from 'qrcode.react'
import { LINE_ADD_URL, LINE_ID, LINE_GREEN } from '@/lib/site'
import { trackAnalyticsEvent } from '@/lib/analytics'

// LINE logo (官方綠底白字)
function LineGlyph({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 5.79 2 10.46c0 4.18 3.55 7.68 8.34 8.35.32.07.77.21.88.49.1.25.07.64.03.9l-.14.85c-.04.25-.2.99.87.54 1.07-.45 5.77-3.4 7.87-5.82C21.46 14.36 22 12.5 22 10.46 22 5.79 17.52 2 12 2ZM8.2 13.1H6.16a.53.53 0 0 1-.53-.53V8.49a.53.53 0 1 1 1.06 0v3.55H8.2a.53.53 0 1 1 0 1.06Zm2.08-.53a.53.53 0 1 1-1.06 0V8.49a.53.53 0 1 1 1.06 0v4.08Zm4.79 0a.53.53 0 0 1-.36.5.55.55 0 0 1-.17.03.53.53 0 0 1-.43-.21l-2.09-2.84v2.52a.53.53 0 1 1-1.06 0V8.49a.53.53 0 0 1 .36-.5.53.53 0 0 1 .6.18l2.09 2.84V8.49a.53.53 0 1 1 1.06 0v4.08Zm3.34-2.57a.53.53 0 1 1 0 1.06h-1.5v.98h1.5a.53.53 0 1 1 0 1.06h-2.04a.53.53 0 0 1-.53-.53V8.49a.53.53 0 0 1 .53-.53h2.04a.53.53 0 1 1 0 1.06h-1.5v.98h1.5Z" />
    </svg>
  )
}

interface Props {
  /** 標題文字 */
  title?: string
  /** 副標說明 */
  subtitle?: string
  /** 是否顯示外框卡片樣式（false 時只給按鈕，用於 Footer 等緊湊處） */
  card?: boolean
}

/**
 * LINE 官方帳號入口：
 * - 桌機（sm 以上）顯示 QR code 供掃描
 * - 手機顯示「加入好友」按鈕
 */
export default function LineFollow({
  title = '加入官方 LINE',
  subtitle = '門診提醒、衛教新知與線上諮詢，一鍵掌握',
  card = true,
}: Props) {
  const Button = (
    <a
      href={LINE_ADD_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackAnalyticsEvent('line_clicked', {
          locale: 'zh-TW',
          placement: card ? 'line_follow_card' : 'line_follow_compact',
        })
      }
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all"
      style={{ backgroundColor: LINE_GREEN }}
      aria-label="加入官方 LINE 好友"
    >
      <LineGlyph className="w-5 h-5" />
      加入好友
    </a>
  )

  if (!card) {
    return (
      <div className="flex flex-col gap-2">
        {Button}
        <span className="text-xs text-neutral-400 dark:text-neutral-500">LINE ID：{LINE_ID}</span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 flex flex-col sm:flex-row items-center gap-6">
      {/* QR code — 桌機顯示 */}
      <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0">
        <div className="p-3 bg-white rounded-xl border border-neutral-200 shadow-sm">
          <QRCodeSVG value={LINE_ADD_URL} size={120} bgColor="#ffffff" fgColor="#111111" level="M" />
        </div>
        <span className="text-xs text-neutral-400">掃描加入好友</span>
      </div>

      {/* 文字 + 按鈕 */}
      <div className="flex-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 mb-1.5">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white"
            style={{ backgroundColor: LINE_GREEN }}
          >
            <LineGlyph className="w-4 h-4" />
          </span>
          <h3 className="text-lg font-bold text-neutral-950 dark:text-neutral-100">{title}</h3>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4 max-w-sm">
          {subtitle}
        </p>
        {/* 手機顯示按鈕（桌機已有 QR，但仍保留按鈕方便點擊） */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {Button}
          <span className="text-xs text-neutral-400 dark:text-neutral-500">LINE ID：{LINE_ID}</span>
        </div>
      </div>
    </div>
  )
}
