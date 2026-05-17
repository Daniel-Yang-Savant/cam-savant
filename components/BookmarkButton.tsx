'use client'

import { useBookmarks } from '@/lib/useBookmarks'
import clsx from 'clsx'

interface Props {
  slug: string
  /** compact = icon-only; default = icon + label */
  compact?: boolean
}

export default function BookmarkButton({ slug, compact = false }: Props) {
  const { isBookmarked, toggle, mounted } = useBookmarks()

  if (!mounted) return null

  const saved = isBookmarked(slug)

  return (
    <button
      onClick={() => toggle(slug)}
      aria-label={saved ? '取消收藏' : '收藏文章'}
      title={saved ? '取消收藏' : '收藏文章'}
      className={clsx(
        'inline-flex items-center gap-1.5 transition-colors',
        compact
          ? 'p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800'
          : 'px-3 py-1.5 rounded-full border text-xs font-semibold',
        saved && !compact
          ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900'
          : !compact
          ? 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-700 dark:hover:border-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          : saved
          ? 'text-amber-500 dark:text-amber-400'
          : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300'
      )}
    >
      <svg
        width={compact ? 16 : 14}
        height={compact ? 16 : 14}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {!compact && <span>{saved ? '已收藏' : '收藏'}</span>}
    </button>
  )
}
