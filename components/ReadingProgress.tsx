'use client'

import { useEffect, useRef } from 'react'

export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onScroll() {
      if (!barRef.current) return
      const scrollY = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0
      // 直接操作 DOM，不觸發 React re-render，避免強制自動重排
      barRef.current.style.width = `${Math.min(100, Math.max(0, pct))}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={barRef}
      className="ReadingProgress fixed top-0 left-0 z-[60] h-0.5 bg-accent-600 dark:bg-accent-400 transition-[width] duration-100"
      style={{ width: '0%' }}
      aria-hidden="true"
    />
  )
}
