'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/i18n'

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const { t } = useLang()

  useEffect(() => {
    // Scan all h2/h3 with id attributes rendered in the document
    const elements = Array.from(
      document.querySelectorAll('h2[id], h3[id]')
    ) as HTMLHeadingElement[]

    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent ?? '',
        level: Number(el.tagName[1]) as 2 | 3,
      }))
    )

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
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="TableOfContents" aria-label="文章目錄">
      <p className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-3 font-semibold">
        {t('tocTitle')}
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault()
                document
                  .getElementById(h.id)
                  ?.scrollIntoView({ behavior: 'smooth' })
                setActiveId(h.id)
              }}
              className={`block text-sm leading-snug transition-colors ${
                activeId === h.id
                  ? 'text-neutral-950 dark:text-neutral-100 font-medium border-l-2 border-neutral-950 dark:border-neutral-100 pl-2'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
