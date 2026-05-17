'use client'

import { useEffect, useState, useCallback } from 'react'

const KEY = 'cam-savant-bookmarks'

export function useBookmarks() {
  const [slugs, setSlugs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(KEY)
      setSlugs(stored ? (JSON.parse(stored) as string[]) : [])
    } catch {
      setSlugs([])
    }
  }, [])

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [slug, ...prev]
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => {
      const next = prev.filter((s) => s !== slug)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const isBookmarked = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs]
  )

  return { slugs, toggle, remove, isBookmarked, mounted }
}
