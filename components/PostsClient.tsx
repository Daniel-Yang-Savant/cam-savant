'use client'

import { useState, useMemo } from 'react'
import clsx from 'clsx'
import ArticleCard from '@/components/ArticleCard'
import type { Post } from '@/lib/posts'

interface Props {
  allPosts: Post[]
  allTags: { tag: string; count: number }[]
}

const POSTS_PER_PAGE = 12

const CATEGORY_TABS = [
  { key: 'all',                     href: '/posts',                  label: '全部'   },
  { key: 'sports-medicine',         href: '/sports-medicine',        label: '運動醫學' },
  { key: 'rehabilitation-medicine', href: '/rehabilitation-medicine', label: '復健醫學' },
  { key: 'functional-medicine',     href: '/functional-medicine',    label: '功能醫學' },
  { key: 'fsm',                     href: '/fsm',                    label: 'FSM'    },
]

export default function PostsClient({ allPosts, allTags }: Props) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [showFilter, setShowFilter] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  function toggleTag(tag: string) {
    setCurrentPage(1)
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  function clearTags() {
    setCurrentPage(1)
    setSelectedTags(new Set())
  }

  const filtered = useMemo(() => {
    if (selectedTags.size === 0) return allPosts
    return allPosts.filter((p) =>
      p.frontmatter.tags?.some((t) => selectedTags.has(t))
    )
  }, [allPosts, selectedTags])

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
  const safePage = Math.min(currentPage, Math.max(totalPages, 1))
  const paginated = filtered.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE
  )

  // ── Page button helpers ──────────────────────────────────────────────────
  function buildPages(current: number, total: number): (number | 'ellipsis')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | 'ellipsis')[] = [1]
    if (current > 3) pages.push('ellipsis')
    const s = Math.max(2, current - 1)
    const e = Math.min(total - 1, current + 1)
    for (let i = s; i <= e; i++) pages.push(i)
    if (current < total - 2) pages.push('ellipsis')
    pages.push(total)
    return pages
  }

  const btnBase =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-2.5 text-sm border rounded transition-colors'
  const btnActive =
    'bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 border-neutral-950 dark:border-neutral-100 font-semibold'
  const btnDefault =
    'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-950 dark:hover:border-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
  const btnDisabled =
    'border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700 cursor-not-allowed'

  return (
    <div>
      {/* ── Category tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_TABS.map(({ key, href, label }) => (
          <a
            key={key}
            href={href}
            className={clsx(
              'px-4 py-1.5 text-xs tracking-widest uppercase font-medium border transition-colors',
              key === 'all'
                ? 'bg-accent-700 text-white border-accent-700 dark:bg-accent-500 dark:text-neutral-950 dark:border-accent-500'
                : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
            )}
          >
            {label}
          </a>
        ))}
      </div>

      {/* ── Tag filter toggle ── */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilter((v) => !v)}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors',
            showFilter || selectedTags.size > 0
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
              : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-700 dark:hover:border-neutral-400'
          )}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          標籤篩選
          {selectedTags.size > 0 && (
            <span className="ml-0.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
              {selectedTags.size}
            </span>
          )}
          <svg
            width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={clsx('transition-transform', showFilter && 'rotate-180')}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Active tag chips */}
        {Array.from(selectedTags).map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            #{tag}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        ))}

        {selectedTags.size > 1 && (
          <button
            onClick={clearTags}
            className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors underline-offset-2 hover:underline"
          >
            全部清除
          </button>
        )}
      </div>

      {/* ── Tag checkbox panel ── */}
      {showFilter && (
        <div className="mb-8 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
              所有標籤（{allTags.length}）
            </span>
            {selectedTags.size > 0 && (
              <button
                onClick={clearTags}
                className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                清除選取
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(({ tag, count }) => {
              const active = selectedTags.has(tag)
              return (
                <label
                  key={tag}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all select-none',
                    active
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-500'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleTag(tag)}
                    className="sr-only"
                  />
                  #{tag}
                  <span className={clsx(
                    'text-[10px] font-normal',
                    active ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400 dark:text-neutral-600'
                  )}>
                    {count}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Results count ── */}
      {selectedTags.size > 0 && (
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          找到 <span className="font-semibold text-neutral-900 dark:text-neutral-100">{filtered.length}</span> 篇相關文章
        </p>
      )}

      {/* ── Grid ── */}
      {paginated.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {paginated.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-neutral-400 dark:text-neutral-500 text-sm">
            {selectedTags.size > 0 ? '此標籤組合沒有符合的文章。' : '此分類目前尚無文章。'}
          </p>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav aria-label="文章分頁" className="flex items-center justify-center gap-1 mt-14 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className={clsx(btnBase, safePage <= 1 ? btnDisabled : btnDefault)}
          >←</button>

          {buildPages(safePage, totalPages).map((page, i) =>
            page === 'ellipsis' ? (
              <span key={`e${i}`} className="inline-flex items-center justify-center min-w-[36px] h-9 text-sm text-neutral-400">…</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={clsx(btnBase, page === safePage ? btnActive : btnDefault)}
                aria-current={page === safePage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className={clsx(btnBase, safePage >= totalPages ? btnDisabled : btnDefault)}
          >→</button>
        </nav>
      )}
    </div>
  )
}
