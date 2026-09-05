'use client'

import { track } from '@vercel/analytics/react'

export type AnalyticsEventName =
  | 'article_engaged'
  | 'line_clicked'
  | 'booking_clicked'
  | 'location_opened'
  | 'consult_started'
  | 'consult_submitted'
  | 'site_search_used'

/**
 * Analytics privacy contract.
 *
 * Keep this list aligned with CAM-SAVANT-SEO-CONTENT-WORKFLOW.md. Do not add
 * free-text form values, search queries, contact details, or URL parameters.
 */
export interface AnalyticsProperties {
  slug?: string
  category?: string
  locale?: 'zh-TW' | 'en'
  placement?: string
  clinic_slug?: string
  referrer_group?: string
}

const ALLOWED_PROPERTY_KEYS = [
  'slug',
  'category',
  'locale',
  'placement',
  'clinic_slug',
  'referrer_group',
] as const satisfies readonly (keyof AnalyticsProperties)[]

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  properties: AnalyticsProperties = {}
) {
  const safeProperties = Object.fromEntries(
    ALLOWED_PROPERTY_KEYS.flatMap((key) => {
      const value = properties[key]
      return typeof value === 'string' ? [[key, value]] : []
    })
  ) as Record<string, string>

  track(name, safeProperties)

  const analyticsWindow = window as typeof window & {
    gtag?: (...args: unknown[]) => void
  }
  analyticsWindow.gtag?.('event', name, safeProperties)
}
