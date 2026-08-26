import Link from 'next/link'
import type { Lang } from '@/lib/i18n'

interface ContextualCareCTAProps {
  variant?: 'public' | 'perioperative'
  locale?: Lang
}

export default function ContextualCareCTA({
  variant = 'public',
  locale = 'zh',
}: ContextualCareCTAProps) {
  if (locale === 'en') {
    return (
      <aside className="not-prose my-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-5 dark:border-rose-900 dark:bg-rose-950/30 sm:px-6">
        <h2 className="text-base font-bold text-neutral-950 dark:text-neutral-100">
          Stop the exercise and follow the warning guidance above
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
          Contact your surgical team for new or worsening warning symptoms. For chest pain,
          shortness of breath, heavy bleeding, new weakness, or rapid deterioration, seek
          emergency care now. This website is not an emergency service.
        </p>
        <Link
          href="/en/contact"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          View clinic information
        </Link>
      </aside>
    )
  }

  const perioperative = variant === 'perioperative'

  return (
    <aside className="not-prose my-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-5 dark:border-rose-900 dark:bg-rose-950/30 sm:px-6">
      <h2 className="text-base font-bold text-neutral-950 dark:text-neutral-100">
        {perioperative ? '先停止訓練，依警示程度處理' : '這些情況不適合只靠文章自行判斷'}
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
        {perioperative
          ? '若符合上述警示症狀，請先停止練習並聯絡手術或治療團隊；胸痛、呼吸困難、大量出血、新出現肢體無力或快速惡化時，請立即就醫。本站諮詢表單不處理緊急狀況。'
          : '若符合上述警訊，請先依警示程度就醫；若不是急症，但症狀持續、反覆或已影響走路、日常活動或運動，可安排復健科或相關專科評估。本站諮詢表單不是急診或正式預約管道。'}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/locations"
          className="inline-flex min-h-11 items-center rounded-lg bg-neutral-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          查看看診資訊
        </Link>
        {!perioperative && (
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            查看醫師團隊
          </Link>
        )}
      </div>
    </aside>
  )
}
