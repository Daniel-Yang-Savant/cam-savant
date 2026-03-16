'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, pct)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="ReadingProgress fixed top-0 left-0 z-[60] h-0.5 bg-neutral-950 dark:bg-neutral-100 transition-all duration-100"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  )
}
