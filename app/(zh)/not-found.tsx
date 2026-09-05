import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '找不到頁面',
  description: '您所尋找的頁面不存在。',
}

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">

      {/* Logo mark */}
      <div className="mb-8 flex items-center justify-center w-20 h-20 rounded-full bg-accent-50 dark:bg-accent-950">
        <svg viewBox="0 0 80 80" className="w-12 h-12" aria-hidden="true">
          <circle cx="40" cy="40" r="38" fill="#0f766e" />
          <rect x="22" y="34" width="36" height="12" rx="5" fill="white" />
          <rect x="34" y="22" width="12" height="36" rx="5" fill="white" />
        </svg>
      </div>

      <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-3">
        404
      </p>

      <h1 className="text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100 mb-4">
        找不到這個頁面
      </h1>

      <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed mb-10">
        您所尋找的頁面可能已移除、更名，或暫時無法使用。
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 text-sm font-semibold hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
        >
          返回首頁
        </Link>
        <Link
          href="/locations"
          className="px-6 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-sm hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
        >
          看診資訊
        </Link>
      </div>

      {/* Quick nav */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-400 dark:text-neutral-500">
        {[
          { href: '/sports-medicine',         label: '運動醫學' },
          { href: '/rehabilitation-medicine',  label: '復健醫學' },
          { href: '/functional-medicine',      label: '功能醫學' },
          { href: '/fsm',                      label: 'FSM' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

    </div>
  )
}
