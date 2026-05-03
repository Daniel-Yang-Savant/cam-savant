'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import type { SearchItem } from '@/lib/search'

function filterPosts(query: string, index: SearchItem[]): SearchItem[] {
  const q = query.toLowerCase()
  return index.filter(
    (post) =>
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.categoryLabel.toLowerCase().includes(q)
  )
}

interface Props {
  /** When true, renders full-width (for use inside mobile menu) */
  fullWidth?: boolean
}

export default function SearchBar({ fullWidth = false }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [index, setIndex] = useState<SearchItem[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()

  // Fetch search index once on mount
  useEffect(() => {
    fetch('/api/search')
      .then((r) => r.json())
      .then((data: SearchItem[]) => setIndex(data))
      .catch(() => {})
  }, [])

  // Recompute results whenever query changes
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }
    const found = filterPosts(query, index)
    setResults(found)
    setOpen(true)
  }, [query, index])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? 'w-full' : 'w-44'}`}
    >
      {/* Search input */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-2.5 text-neutral-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
        />
      </div>

      {/* Dropdown results */}
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-neutral-400">
              {t('searchNoResults')}
            </p>
          ) : (
            <ul>
              {results.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/posts/${item.slug}`}
                    onClick={clear}
                    className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <span className="text-[0.6rem] tracking-widest uppercase text-neutral-400 font-medium">
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
