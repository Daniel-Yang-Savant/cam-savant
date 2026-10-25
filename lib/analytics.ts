'use client'

import { track } from '@vercel/analytics/react'
import {
  hasAnalyticsOptOut,
  safeAnalyticsUrl,
  safeAnalyticsReferrer,
  sanitizeAnalyticsProperties,
  validAnalyticsEventName,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from './analytics-privacy'

export type { AnalyticsEventName, AnalyticsProperties } from './analytics-privacy'

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  properties: AnalyticsProperties = {}
) {
  if (typeof window === 'undefined' || hasAnalyticsOptOut(window.navigator) || !validAnalyticsEventName(name)) return
  const location = safeAnalyticsUrl(window.location.href)
  if (!location) return
  const safeProperties = sanitizeAnalyticsProperties(properties)

  track(name, safeProperties)

  const analyticsWindow = window as typeof window & {
    gtag?: (...args: unknown[]) => void
  }
  analyticsWindow.gtag?.('event', name, {
    ...safeProperties,
    page_location: location,
    page_referrer: safeAnalyticsReferrer(document.referrer),
  })
}
