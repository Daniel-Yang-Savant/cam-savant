const PRIVATE_ANALYTICS_PATHS = [
  '/admin', '/admin-login', '/api', '/perioperative-rehab',
  '/en/perioperative-rehab', '/ak-google-auth', '/fsm/studio',
  '/login', '/workspace', '/apply', '/patient',
] as const

export interface AnalyticsPrivacySignals {
  doNotTrack?: string | null
  globalPrivacyControl?: boolean
}

/** Respect an explicit browser privacy preference before loading or sending. */
export function hasAnalyticsOptOut(signals: AnalyticsPrivacySignals = {}): boolean {
  return signals.globalPrivacyControl === true || signals.doNotTrack === '1' || signals.doNotTrack === 'yes'
}

export const ANALYTICS_EVENT_NAMES = [
  'article_engaged',
  'line_clicked',
  'booking_clicked',
  'location_opened',
  'consult_started',
  'consult_submitted',
  'site_search_used',
] as const

export type AnalyticsEventName = typeof ANALYTICS_EVENT_NAMES[number]

/** Public content identifiers only; never pass form values or search text. */
export interface AnalyticsProperties {
  slug?: string
  category?: string
  locale?: 'zh-TW' | 'en'
  placement?: string
  clinic_slug?: string
  referrer_group?: string
}

const ALLOWED_PROPERTY_KEYS = [
  'slug', 'category', 'locale', 'placement', 'clinic_slug', 'referrer_group',
] as const satisfies readonly (keyof AnalyticsProperties)[]

// Bounded identifiers reject sentences, URLs, email addresses and encoded text.
// Callers must still supply public content identifiers, never personal values.
const PUBLIC_IDENTIFIER = /^[a-z][a-z0-9_-]{0,119}$/i

export function validAnalyticsEventName(value: unknown): value is AnalyticsEventName {
  return typeof value === 'string' && ANALYTICS_EVENT_NAMES.some(name => name === value)
}

export function sanitizeAnalyticsProperties(properties: unknown): Record<string, string> {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return {}
  return Object.fromEntries(ALLOWED_PROPERTY_KEYS.flatMap(key => {
    if (!Object.prototype.hasOwnProperty.call(properties, key)) return []
    const value = (properties as Record<string, unknown>)[key]
    if (typeof value !== 'string' || !PUBLIC_IDENTIFIER.test(value)) return []
    if (key === 'locale' && value !== 'zh-TW' && value !== 'en') return []
    return [[key, value]]
  }))
}

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

export function filterAnalyticsEvent<T extends { url: string }>(event: T, currentUrl: string, privacy: AnalyticsPrivacySignals = {}): T | null {
  if (hasAnalyticsOptOut(privacy)) return null
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
  privacy: AnalyticsPrivacySignals = {},
): boolean {
  if (!validGoogleMeasurementId(measurementId)) return false
  const location = hasAnalyticsOptOut(privacy) ? null : safeAnalyticsUrl(currentUrl)
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
