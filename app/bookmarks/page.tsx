'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBookmarks } from '@/lib/useBookmarks'
import type { SearchItem } from '@/lib/search'
import Breadcrumbs from '@/components/Breadcrumbs'
import BookmarkButton from '@/components/BookmarkButton'

export default function BookmarksPage() {
  const { slugs, mounted } = useBookmarks()
  const [index, setIndex] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/search')
      .then((r) => r.json())
      .then((data: SearchItem[]) => {
        setIndex(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (!mounted || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <div className="text-sm text-neutral-400 dark:text-neutral-600">載入中…</div>
      </div>
    )
  }

  const bookmarked = index.filter((item) => slugs.includes(item.slug))
  // Preserve order (newest bookmarked first = slug order in `slugs`)
  const sorted = slugs
    .map((s) => bookmarked.find((b) => b.slug === s))
    .filter(Boolean) as SearchItem[]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      {/* ── Breadcrumbs ── */}
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: '首頁', href: '/' },
          { label: '收藏文章' },
        ]}
      />

      {/* ── Header ── */}
      <div className="mb-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
          Bookmarks
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
          收藏文章
        </h1>
        {sorted.length > 0 && (
          <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
            共 {sorted.length} 篇收藏
          </p>
        )}
      </div>

      {/* ── Empty state ── */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 dark:text-neutral-600">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            尚無收藏
          </h2>
          <p className="text-sm text-neutral-400 dark:text-neutral-600 max-w-xs">
            在文章頁點擊「收藏」按鈕，即可在此快速找回。
          </p>
          <Link
            href="/posts"
            className="mt-6 px-5 py-2 text-sm font-medium rounded-lg bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
          >
            瀏覽文章
          </Link>
        </div>
      )}

      {/* ── Bookmark list ── */}
      {sorted.length > 0 && (
        <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {sorted.map((item) => (
            <li key={item.slug} className="py-5 flex items-start gap-4 group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                    {item.categoryLabel}
                  </span>
                  {item.date && (
                    <>
                      <span className="text-neutral-200 dark:text-neutral-700">·</span>
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                        {item.date}
                      </span>
                    </>
                  )}
                </div>
                <Link
                  href={`/posts/${item.slug}`}
                  className="block text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-snug group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors mb-1"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                  {item.excerpt}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 4).map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {/* Remove bookmark */}
              <BookmarkButton slug={item.slug} compact />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
