'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { useLang } from '@/lib/i18n'
import type { SearchItem } from '@/lib/search'
import { trackAnalyticsEvent } from '@/lib/analytics'

interface Props {
  fullWidth?: boolean
}

export default function SearchBar({ fullWidth = false }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [index, setIndex] = useState<SearchItem[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { lang, t } = useLang()

  // Fetch search index once on mount
  useEffect(() => {
    fetch('/api/search')
      .then((r) => r.json())
      .then((data: SearchItem[]) => setIndex(data))
      .catch(() => {})
  }, [])

  // Build Fuse instance whenever index changes
  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [
          { name: 'title',         weight: 0.5  },
          { name: 'excerpt',       weight: 0.25 },
          { name: 'tags',          weight: 0.15 },
          { name: 'categoryLabel', weight: 0.1  },
        ],
        threshold: 0.35,
        distance: 200,
        minMatchCharLength: 1,
        includeScore: true,
      }),
    [index]
  )

  // Search whenever query changes
  useEffect(() => {
    const q = query.trim()
    if (q.length < 1) {
      setResults([])
      setOpen(false)
      return
    }
    const found = fuse.search(q, { limit: 8 }).map((r) => r.item)
    setResults(found)
    setOpen(true)
  }, [query, fuse])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const clear = () => {
    setQuery('')
    setOpen(false)
  }

  const selectResult = (item: SearchItem) => {
    trackAnalyticsEvent('site_search_used', {
      slug: item.slug,
      category: item.category,
      locale: lang === 'en' ? 'en' : 'zh-TW',
      placement: fullWidth ? 'full_width_search' : 'navigation_search',
    })
    clear()
  }

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : 'w-44'}`}>
      {/* Input */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-2.5 text-neutral-500 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className={`w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 rounded-lg pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 ${fullWidth ? 'min-h-11 pr-11 py-2.5' : 'pr-7 py-1.5'}`}
        />
        {query && (
          <button
            onClick={clear}
            className={`absolute flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors ${fullWidth ? 'right-0 h-11 w-11' : 'right-2.5'}`}
            aria-label="清除搜尋"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-neutral-500">{t('searchNoResults')}</p>
          ) : (
            <ul>
              {results.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/posts/${item.slug}`}
                    onClick={() => selectResult(item)}
                    className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <span className="text-[0.6rem] tracking-widest uppercase text-neutral-500 font-medium">
                      {item.categoryLabel}
                    </span>
                    <p className="text-sm font-medium text-neutral-950 dark:text-neutral-100 leading-snug line-clamp-1 mt-0.5">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                      {item.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
