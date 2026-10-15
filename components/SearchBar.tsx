'use client'

import { useState, useEffect, useRef, useMemo, useId } from 'react'
import type { KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import type { SearchItem } from '@/lib/search-types'
import { createSiteSearch, searchSiteIndex } from '@/lib/site-search'
import { trackAnalyticsEvent } from '@/lib/analytics'

interface Props {
  fullWidth?: boolean
  autoFocus?: boolean
  onNavigate?: () => void
}

export default function SearchBar({ fullWidth = false, autoFocus = false, onNavigate }: Props) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchItem[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const { lang } = useLang()
  const router = useRouter()
  const english = lang === 'en'

  useEffect(() => {
    const controller = new AbortController()
    setLoadState('loading')
    fetch('/api/search', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Search unavailable')
        const data: unknown = await response.json()
        if (!Array.isArray(data) || !data.every((item) => item && typeof item.id === 'string' && typeof item.href === 'string' && typeof item.title === 'string')) {
          throw new Error('Invalid search index')
        }
        if (controller.signal.aborted) return
        setIndex(data as SearchItem[])
        setLoadState('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadState('error')
      })
    return () => controller.abort()
  }, [attempt])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const search = useMemo(() => createSiteSearch(index), [index])
  const results = useMemo(() => searchSiteIndex(search, query), [query, search])
  const showDropdown = open && query.trim().length > 0
  const activeItem = showDropdown && loadState === 'ready' ? results[activeIndex] : undefined

  useEffect(() => {
    if (activeIndex >= 0) listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  useEffect(() => {
    function handler(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [])

  function clear() {
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
  }

  function navigate() {
    clear()
    onNavigate?.()
  }

  function selectResult(item: SearchItem) {
    trackAnalyticsEvent('site_search_used', {
      slug: item.slug,
      category: item.category,
      locale: english ? 'en' : 'zh-TW',
      placement: fullWidth ? 'full_width_search' : 'navigation_search',
    })
    navigate()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter confirms Chinese IME text while composing; it must not navigate.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key === 'Escape') {
      if (showDropdown) event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!query.trim() || loadState !== 'ready' || results.length === 0) return
      event.preventDefault()
      setOpen(true)
      setActiveIndex((current) => {
        if (!showDropdown || current < 0) return event.key === 'ArrowDown' ? 0 : results.length - 1
        return (current + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
      })
    } else if (event.key === 'Enter' && activeItem) {
      event.preventDefault()
      selectResult(activeItem)
      router.push(activeItem.href)
    }
  }

  const status = !showDropdown ? '' : loadState === 'loading'
    ? (english ? 'Loading search…' : '正在載入搜尋…')
    : loadState === 'error'
      ? (english ? 'Search is unavailable. Please retry.' : '搜尋暫時無法使用，請重試。')
      : results.length === 0
        ? (english ? 'No matching results.' : '找不到相符結果。')
        : (english ? `${results.length} results. Use arrow keys to select.` : `顯示 ${results.length} 筆結果，可用方向鍵選擇。`)

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : 'w-44'}`}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false)
          setActiveIndex(-1)
        }
      }}>
      <div className="relative flex items-center">
        <svg className="absolute left-2.5 text-neutral-500 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input ref={inputRef} type="text" role="combobox"
          aria-label={english ? 'Search articles, exercises, doctors and clinics' : '搜尋文章、運動、醫師與院區'}
          aria-autocomplete="list" aria-expanded={showDropdown} aria-controls={showDropdown ? listId : undefined}
          aria-activedescendant={activeItem ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off" spellCheck={false} value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(Boolean(event.target.value.trim()))
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(Boolean(query.trim()))} onKeyDown={handleKeyDown}
          placeholder={english ? 'Search the site…' : '搜尋全站…'}
          className={`w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 rounded-lg pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 ${fullWidth ? 'min-h-11 pr-11 py-2.5' : 'pr-8 py-1.5'}`} />
        {query && (
          <button type="button" onClick={() => { clear(); inputRef.current?.focus() }}
            className={`absolute flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors ${fullWidth ? 'right-0 h-11 w-11' : 'right-0 h-8 w-8'}`}
            aria-label={english ? 'Clear search' : '清除搜尋'}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status}</p>
      {showDropdown && (
        <div className={`absolute top-full mt-1 right-0 ${fullWidth ? 'w-full' : 'w-[min(28rem,calc(100vw-2rem))]'} bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 max-h-[min(28rem,60dvh)] overflow-y-auto`}>
          {loadState === 'loading' && <p className="px-4 py-3 text-sm text-neutral-500">{english ? 'Loading search…' : '正在載入搜尋…'}</p>}
          {loadState === 'error' && (
            <div className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
              <p>{english ? 'Search is temporarily unavailable.' : '搜尋暫時無法使用。'}</p>
              <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-2 min-h-11 rounded-lg border border-neutral-300 px-3 font-semibold dark:border-neutral-600">{english ? 'Retry' : '重新載入'}</button>
            </div>
          )}
          <ul id={listId} ref={listRef} role="listbox" aria-label={english ? 'Search results' : '搜尋結果'} aria-busy={loadState === 'loading'}>
            {loadState === 'ready' && results.map((item, resultIndex) => (
              <li key={item.id} role="presentation">
                <Link id={`${listId}-${resultIndex}`} href={item.href} role="option" aria-selected={activeIndex === resultIndex} tabIndex={-1}
                  onClick={() => selectResult(item)}
                  className={`block px-4 py-3 transition-colors border-b border-neutral-100 dark:border-neutral-800 ${activeIndex === resultIndex ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}>
                  <span className="text-xs text-accent-700 dark:text-accent-400 font-semibold">{item.typeLabel}</span>
                  <span className="ml-2 text-xs text-neutral-500">{item.categoryLabel}</span>
                  <p className="text-sm font-medium text-neutral-950 dark:text-neutral-100 leading-snug line-clamp-2 mt-0.5">{item.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{item.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
          {loadState === 'ready' && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-300">
              <p>{english ? 'No matching results. Try a body region, doctor or clinic name.' : '找不到相符結果，可改用部位、醫師姓名或院區名稱。'}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {[
                  ['/exercise-guides', english ? 'Exercise guides' : '圖解運動'],
                  ['/locations', english ? 'Clinic information' : '看診資訊'],
                  ['/posts', english ? 'All articles' : '全部文章'],
                ].map(([href, label]) => <Link key={href} href={href} onClick={navigate} className="inline-flex min-h-11 items-center font-semibold text-accent-700 underline underline-offset-4 dark:text-accent-400">{label}</Link>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
