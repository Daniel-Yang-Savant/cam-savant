import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '找不到頁面',
  description: '您訪問的頁面不存在，請返回首頁或瀏覽其他文章。',
}

export default function NotFound() {
  const categories = [
    { href: '/sports-medicine', label: '運動醫學' },
    { href: '/rehabilitation-medicine', label: '復健醫學' },
    { href: '/functional-medicine', label: '功能醫學' },
    { href: '/fsm', label: 'FSM' },
  ]

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* 404 number */}
      <p className="text-[6rem] md:text-[8rem] font-bold leading-none text-neutral-100 dark:text-neutral-800 select-none">
        404
      </p>

      <h1 className="mt-2 text-2xl md:text-3xl font-bold text-neutral-950 dark:text-neutral-100">
        找不到此頁面
      </h1>

      <p className="mt-4 text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
        您訪問的頁面可能已移除、更名，或暫時無法存取。
      </p>

      {/* Category links */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-neutral-100 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 text-sm font-semibold hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
      >
        ← 返回首頁
      </Link>

      {/* Brand */}
      <p className="mt-12 text-xs text-neutral-400 dark:text-neutral-600">
        CAM Savant 醫療團隊 | 彰化・南投・台中・雲林 復健科・運動醫學
      </p>
    </div>
  )
}
