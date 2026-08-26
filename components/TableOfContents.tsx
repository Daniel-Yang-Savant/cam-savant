'use client'

import { useEffect, useRef, useState } from 'react'
import { translations, type Lang } from '@/lib/i18n'

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

interface TableOfContentsProps {
  locale?: Lang
  collapsible?: boolean
}

export default function TableOfContents({
  locale = 'zh',
  collapsible = false,
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const t = (key: keyof typeof translations.zh) => translations[locale][key]

  useEffect(() => {
    let mutationObserver: MutationObserver | null = null

    const scanHeadings = () => {
      const elements = Array.from(
        document.querySelectorAll('h2[id], h3[id]')
      ) as HTMLHeadingElement[]
      const nextHeadings = elements.map((el) => ({
        id: el.id,
        text: el.textContent ?? '',
        level: Number(el.tagName[1]) as 2 | 3,
      }))

      setHeadings((current) => {
        const unchanged =
          current.length === nextHeadings.length &&
          current.every(
            (heading, index) =>
              heading.id === nextHeadings[index].id &&
              heading.text === nextHeadings[index].text &&
              heading.level === nextHeadings[index].level
        )
        return unchanged ? current : nextHeadings
      })

      if (nextHeadings.length > 0) mutationObserver?.disconnect()
      return nextHeadings.length
    }

    const initialHeadingCount = scanHeadings()
    const animationFrame = window.requestAnimationFrame(scanHeadings)
    if (initialHeadingCount === 0) {
      mutationObserver = new MutationObserver(scanHeadings)
      mutationObserver.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      window.cancelAnimationFrame(animationFrame)
      mutationObserver?.disconnect()
    }
  }, [])

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    // Track active heading via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-8% 0% -70% 0%', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  const headingList = (
    <ul className="space-y-1.5">
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
          <a
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault()
              const target = document.getElementById(h.id)
              const scrollToTarget = () =>
                target?.scrollIntoView({ behavior: 'smooth' })

              if (collapsible && detailsRef.current) {
                detailsRef.current.open = false
                window.requestAnimationFrame(scrollToTarget)
              } else {
                scrollToTarget()
              }

              window.history.replaceState(null, '', `#${h.id}`)
              setActiveId(h.id)
            }}
            className={`block rounded-md py-1 text-sm leading-snug transition-colors ${
              activeId === h.id
                ? 'text-accent-700 dark:text-accent-400 font-medium border-l-2 border-accent-600 dark:border-accent-400 pl-2'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  )

  if (collapsible) {
    return (
      <details
        ref={detailsRef}
        className="TableOfContents group rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/60"
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100 [&::-webkit-details-marker]:hidden">
          <span>{t('tocTitle')}</span>
          <svg
            className="h-4 w-4 shrink-0 text-neutral-500 transition-transform group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <nav
          className="border-t border-neutral-200 px-4 py-4 dark:border-neutral-700"
          aria-label={locale === 'en' ? 'Table of contents' : '文章目錄'}
        >
          {headingList}
        </nav>
      </details>
    )
  }

  return (
    <nav className="TableOfContents" aria-label={locale === 'en' ? 'Table of contents' : '文章目錄'}>
      <p className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-3 font-semibold">
        {t('tocTitle')}
      </p>
      {headingList}
    </nav>
  )
}
