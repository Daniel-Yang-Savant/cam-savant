'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react'
import {
  configureGoogleAnalyticsPage,
  filterAnalyticsEvent,
  hasAnalyticsOptOut,
  isPrivateAnalyticsPath,
  validGoogleMeasurementId,
  type PrivacyAnalyticsWindow,
} from '@/lib/analytics-privacy'

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  return filterAnalyticsEvent(event, window.location.href, window.navigator)
}

export default function PrivacyAnalytics({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname()
  // Defer scripts until browser privacy signals are available after hydration.
  const [privacyAllowed, setPrivacyAllowed] = useState(false)
  const allowed = privacyAllowed && typeof window !== 'undefined' &&
    !hasAnalyticsOptOut(window.navigator) && !!pathname && !isPrivateAnalyticsPath(pathname)

  useEffect(() => {
    setPrivacyAllowed(!hasAnalyticsOptOut(window.navigator))
    configureGoogleAnalyticsPage(window as typeof window & PrivacyAnalyticsWindow, measurementId, window.location.href, document.referrer, window.navigator)
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
