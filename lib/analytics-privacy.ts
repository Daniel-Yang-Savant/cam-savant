const PRIVATE_ANALYTICS_PATHS = [
  '/admin', '/admin-login', '/api', '/perioperative-rehab',
  '/en/perioperative-rehab', '/ak-google-auth', '/fsm/studio',
  '/login', '/workspace', '/apply', '/patient',
] as const

/** Sensitive pages must not initialize analytics or emit custom events. */
export function isPrivateAnalyticsPath(pathname: string): boolean {
  let normalized: string
  try { normalized = decodeURIComponent(pathname).replace(/\/+/g, '/').toLowerCase() }
  catch { return true }
  return PRIVATE_ANALYTICS_PATHS.some(prefix => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

/** Drop sensitive routes and all URL query/fragment/user-info data. */
export function safeAnalyticsUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (!['https:', 'http:'].includes(url.protocol) || isPrivateAnalyticsPath(url.pathname)) return null
    return `${url.origin}${url.pathname}`
  } catch { return null }
}

export function safeAnalyticsReferrer(value: string): string {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !isPrivateAnalyticsPath(url.pathname) ? `${url.origin}/` : ''
  } catch { return '' }
}

export function filterAnalyticsEvent<T extends { url: string }>(event: T, currentUrl: string): T | null {
  const current = safeAnalyticsUrl(currentUrl)
  const safe = safeAnalyticsUrl(event.url)
  if (!current || !safe || new URL(current).origin !== new URL(safe).origin) return null
  return { ...event, url: safe }
}

export function validGoogleMeasurementId(value: string | undefined): value is string {
  return typeof value === 'string' && /^G-[A-Z0-9]+$/.test(value)
}

export interface PrivacyAnalyticsWindow {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  __camSavantGoogleAnalyticsId?: string
  [key: `ga-disable-${string}`]: boolean | undefined
}

/** Explicit public page views replace Google's default full-URL page view. */
export function configureGoogleAnalyticsPage(
  analyticsWindow: PrivacyAnalyticsWindow,
  measurementId: string | undefined,
  currentUrl: string,
  referrer: string,
): boolean {
  if (!validGoogleMeasurementId(measurementId)) return false
  const location = safeAnalyticsUrl(currentUrl)
  analyticsWindow[`ga-disable-${measurementId}`] = !location
  if (!location) return false

  analyticsWindow.dataLayer ??= []
  // Match Google's queue format; gtag.js consumes Arguments records.
  analyticsWindow.gtag ??= function () {
    // eslint-disable-next-line prefer-rest-params -- gtag.js consumes Google's standard Arguments queue format.
    analyticsWindow.dataLayer!.push(arguments)
  }
  const page = {
    page_path: new URL(location).pathname,
    page_location: location,
    page_referrer: safeAnalyticsReferrer(referrer),
  }
  if (analyticsWindow.__camSavantGoogleAnalyticsId !== measurementId) {
    analyticsWindow.gtag('js', new Date())
    analyticsWindow.gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...page,
    })
    analyticsWindow.__camSavantGoogleAnalyticsId = measurementId
  }
  analyticsWindow.gtag('set', page)
  analyticsWindow.gtag('event', 'page_view', page)
  return true
}
