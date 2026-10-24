'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react'
import {
  configureGoogleAnalyticsPage,
  filterAnalyticsEvent,
  isPrivateAnalyticsPath,
  validGoogleMeasurementId,
  type PrivacyAnalyticsWindow,
} from '@/lib/analytics-privacy'

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  return filterAnalyticsEvent(event, window.location.href)
}

export default function PrivacyAnalytics({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname()
  const allowed = !!pathname && !isPrivateAnalyticsPath(pathname)

  useEffect(() => {
    configureGoogleAnalyticsPage(window as typeof window & PrivacyAnalyticsWindow, measurementId, window.location.href, document.referrer)
  }, [measurementId, pathname])

  if (!allowed) return null
  return (
    <>
      <Analytics beforeSend={beforeSend} route={pathname} path={pathname} debug={false} />
      {validGoogleMeasurementId(measurementId) && (
        <Script
          id="privacy-ga4"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        />
      )}
    </>
  )
}
