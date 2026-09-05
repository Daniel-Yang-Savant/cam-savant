'use client'

import { useEffect } from 'react'
import { trackAnalyticsEvent } from '@/lib/analytics'

interface ExerciseGuideAnalyticsProps {
  slug?: string
  placement?: string
}

export default function ExerciseGuideAnalytics({
  slug = 'exercise-guides',
  placement = 'exercise-guides',
}: ExerciseGuideAnalyticsProps) {
  useEffect(() => {
    let timeReached = false
    let scrollReached = false
    let sent = false

    const sendIfEngaged = () => {
      if (sent || !timeReached || !scrollReached) return
      sent = true

      trackAnalyticsEvent('article_engaged', {
        slug,
        category: 'rehabilitation-medicine',
        locale: 'zh-TW',
        placement,
      })
    }

    const checkScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0 || window.scrollY / scrollable >= 0.5) {
        scrollReached = true
        sendIfEngaged()
      }
    }

    const timer = window.setTimeout(() => {
      timeReached = true
      sendIfEngaged()
    }, 30_000)

    window.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', checkScroll)
    }
  }, [placement, slug])

  return null
}
