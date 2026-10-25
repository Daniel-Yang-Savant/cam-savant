import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { trackAnalyticsEvent } from '../lib/analytics'
import { buildSearchIndex } from '../lib/search'
import { CLINIC_LOCATIONS } from '../lib/locations'
import {
  ANALYTICS_EVENT_NAMES,
  configureGoogleAnalyticsPage,
  filterAnalyticsEvent,
  hasAnalyticsOptOut,
  isPrivateAnalyticsPath,
  safeAnalyticsReferrer,
  safeAnalyticsUrl,
  sanitizeAnalyticsProperties,
  validAnalyticsEventName,
  validGoogleMeasurementId,
  type AnalyticsPrivacySignals,
  type PrivacyAnalyticsWindow,
} from '../lib/analytics-privacy'

const origin = 'https://camsavant.com'

test('all protected/auth/patient routes, including encoded aliases, are excluded from analytics', () => {
  for (const path of ['/admin', '/admin/editor', '/admin-login', '/api/admin/session', '/perioperative-rehab', '/perioperative-rehab/access', '/en/perioperative-rehab/acl-reconstruction-rehab', '/ak-google-auth', '/fsm/studio/', '/patient/record', '/workspace/a', '/%61dmin/editor', '/%70atient%2frecord', '/%broken']) {
    assert.equal(isPrivateAnalyticsPath(path), true, path)
    assert.equal(safeAnalyticsUrl(origin + path + '?patient=synthetic#record'), null, path)
    assert.equal(filterAnalyticsEvent({ type: 'pageview', url: origin + '/posts' }, origin + path), null, path)
  }
  for (const path of ['/', '/en', '/posts/example', '/exercise-guides', '/locations', '/rehab-resources', '/administration-guide']) assert.equal(isPrivateAnalyticsPath(path), false, path)
})

test('public page views and custom events lose query strings, fragments and URL userinfo before sending', () => {
  const secretUrl = 'https://synthetic:password@camsavant.com/posts/example?email=patient%40example.invalid&symptoms=synthetic#clinical-note'
  assert.equal(safeAnalyticsUrl(secretUrl), origin + '/posts/example')
  const event = { type: 'event', url: secretUrl }
  const filtered = filterAnalyticsEvent(event, secretUrl)
  assert.deepEqual(filtered, { type: 'event', url: origin + '/posts/example' })
  assert.equal(event.url, secretUrl, 'filter never mutates the SDK input')
  assert.equal(filterAnalyticsEvent(event, origin + '/admin/opd'), null)
  assert.equal(filterAnalyticsEvent({ type: 'event', url: 'https://external.invalid/a' }, origin + '/posts'), null)
  for (const url of ['javascript:alert(1)', 'data:text/plain,private', 'invalid']) assert.equal(safeAnalyticsUrl(url), null)
  assert.equal(safeAnalyticsReferrer(origin + '/admin/opd?patient=synthetic'), '')
  assert.equal(safeAnalyticsReferrer('https://www.google.com/search?q=synthetic+medical+question'), 'https://www.google.com/')
})

test('Google analytics config and public events never contain sensitive URL/query/referrer values', () => {
  const target: PrivacyAnalyticsWindow = {}
  const current = origin + '/posts/example?email=synthetic%40example.invalid&symptoms=synthetic#note'
  assert.equal(configureGoogleAnalyticsPage(target, 'G-TEST123', current, 'https://www.google.com/search?q=synthetic'), true)
  assert.equal(target['ga-disable-G-TEST123'], false)
  const queue = JSON.stringify(target.dataLayer)
  assert.doesNotMatch(queue, /email=|symptoms=|#note|search\?q|example\.invalid/)
  const config = Array.from(target.dataLayer![1] as ArrayLike<unknown>)
  assert.deepEqual(config.slice(0, 2), ['config', 'G-TEST123'])
  assert.equal((config[2] as Record<string, unknown>).send_page_view, false)
  assert.equal((config[2] as Record<string, unknown>).allow_google_signals, false)
  const event = Array.from(target.dataLayer!.at(-1) as ArrayLike<unknown>)
  assert.deepEqual(event.slice(0, 2), ['event', 'page_view'])
  assert.equal((event[2] as Record<string, unknown>).page_location, origin + '/posts/example')
})

test('Google sends nothing on initial private pages and disables an SDK from a previous public navigation', () => {
  const target: PrivacyAnalyticsWindow = {}
  assert.equal(configureGoogleAnalyticsPage(target, 'G-TEST123', origin + '/admin/opd?patient=synthetic', ''), false)
  assert.equal(target.dataLayer, undefined)
  assert.equal(target['ga-disable-G-TEST123'], true)
  configureGoogleAnalyticsPage(target, 'G-TEST123', origin + '/posts', '')
  const events = target.dataLayer!.length
  configureGoogleAnalyticsPage(target, 'G-TEST123', origin + '/ak-google-auth?state=sensitive', '')
  assert.equal(target.dataLayer!.length, events)
  assert.equal(target['ga-disable-G-TEST123'], true)
  configureGoogleAnalyticsPage(target, 'G-TEST123', origin + '/locations', '')
  assert.equal(target['ga-disable-G-TEST123'], false)
  assert.equal(target.dataLayer!.filter(entry => (entry as unknown[])[0] === 'config').length, 1)
})

test('layouts only mount the privacy-aware analytics component and no longer embed raw GA config', () => {
  for (const file of ['app/(zh)/layout.tsx', 'app/(en)/layout.tsx']) {
    const source = fs.readFileSync(file, 'utf8')
    assert.match(source, /<PrivacyAnalytics measurementId=/)
    assert.doesNotMatch(source, /<Analytics\s*\/>|gtag\('config'|googletagmanager\.com\/gtag/)
  }
  const component = fs.readFileSync('components/PrivacyAnalytics.tsx', 'utf8')
  assert.match(component, /if \(!allowed\) return null/)
  assert.match(component, /beforeSend=\{beforeSend\}/)
  assert.match(component, /route=\{pathname\} path=\{pathname\}/)
  const events = fs.readFileSync('lib/analytics.ts', 'utf8')
  assert.match(events, /safeAnalyticsUrl\(window\.location\.href\)/)
  assert.ok(events.indexOf('if (!location) return') < events.indexOf('track(name, safeProperties)'))
})

test('invalid Google IDs cannot break out into inline configuration or an arbitrary script URL', () => {
  for (const value of [undefined, '', 'G-A\');alert(1);//', 'https://external.invalid', 'G-<script>']) assert.equal(validGoogleMeasurementId(value), false)
  assert.equal(validGoogleMeasurementId('G-TEST123'), true)
})

test('browser privacy opt-outs block Vercel page views/events and initial Google configuration', () => {
  for (const signals of [{ doNotTrack: '1' }, { doNotTrack: 'yes' }, { globalPrivacyControl: true }]) {
    assert.equal(hasAnalyticsOptOut(signals), true)
    for (const type of ['pageview', 'event']) {
      assert.equal(filterAnalyticsEvent({ type, url: origin + '/posts' }, origin + '/posts', signals), null)
    }
    const target: PrivacyAnalyticsWindow = {}
    assert.equal(configureGoogleAnalyticsPage(target, 'G-TEST123', origin + '/posts', '', signals), false)
    assert.equal(target['ga-disable-G-TEST123'], true)
    assert.equal(target.dataLayer, undefined)
    assert.equal(target.gtag, undefined)
  }
  for (const signals of [{}, { doNotTrack: '0' }, { doNotTrack: 'unspecified' }, { doNotTrack: null }, { globalPrivacyControl: false }]) {
    assert.equal(hasAnalyticsOptOut(signals), false)
    assert.notEqual(filterAnalyticsEvent({ type: 'pageview', url: origin + '/posts' }, origin + '/posts', signals), null)
  }
})

test('an opt-out disables Google after a prior public page without adding events', () => {
  const target: PrivacyAnalyticsWindow = {}
  configureGoogleAnalyticsPage(target, 'G-TEST123', origin + '/posts', '')
  const previousCount = target.dataLayer!.length
  assert.equal(configureGoogleAnalyticsPage(target, 'G-TEST123', origin + '/locations', '', { globalPrivacyControl: true }), false)
  assert.equal(target.dataLayer!.length, previousCount)
  assert.equal(target['ga-disable-G-TEST123'], true)
})

test('only fixed event names and bounded public identifier properties survive runtime validation', () => {
  for (const name of ANALYTICS_EVENT_NAMES) assert.equal(validAnalyticsEventName(name), true)
  for (const name of [undefined, null, 123, 'patient@example.invalid', 'patient_named_synthetic', '', 'booking_clicked\n']) {
    assert.equal(validAnalyticsEventName(name), false)
  }
  const permitted = { slug: 'ankle-sprain-2026', category: 'sports-medicine', locale: 'zh-TW', placement: 'doctor_clinic_card', clinic_slug: 'erlin', referrer_group: 'search' }
  assert.deepEqual(sanitizeAnalyticsProperties(permitted), permitted)
  assert.deepEqual(sanitizeAnalyticsProperties({ ...permitted, email: 'patient@example.invalid', question: 'synthetic question' }), permitted)
  for (const value of ['', '0912345678', 'synthetic patient', 'patient@example.invalid', 'https://example.invalid', 'synthetic%20patient', 'synthetic\npatient', '病情內容', 'a'.repeat(121), 123, {}, ['synthetic']]) {
    assert.deepEqual(sanitizeAnalyticsProperties({ slug: value, category: value, placement: value, clinic_slug: value, referrer_group: value }), {})
  }
  assert.deepEqual(sanitizeAnalyticsProperties({ locale: 'arbitrary_locale' }), {})
  assert.deepEqual(sanitizeAnalyticsProperties({ locale: 'en' }), { locale: 'en' })
  assert.deepEqual(sanitizeAnalyticsProperties(Object.create({ slug: 'inherited' })), {})
  for (const properties of [undefined, null, [], 'synthetic', 123]) assert.deepEqual(sanitizeAnalyticsProperties(properties), {})
})

test('the identifier contract preserves current public search metadata and clinic identifiers', () => {
  for (const item of buildSearchIndex()) {
    const properties = { slug: item.slug, category: item.category }
    assert.deepEqual(sanitizeAnalyticsProperties(properties), properties, item.id)
  }
  for (const clinic of CLINIC_LOCATIONS) {
    const properties = { clinic_slug: clinic.slug }
    assert.deepEqual(sanitizeAnalyticsProperties(properties), properties)
  }
})

test('custom event dispatch honors browser preferences and sends the same sanitized properties to both providers', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const vercel: unknown[][] = []
  const google: unknown[][] = []
  const browser = {
    navigator: {} as AnalyticsPrivacySignals,
    location: { href: origin + '/posts/example?email=synthetic%40example.invalid#private' },
    va: (...args: unknown[]) => vercel.push(args),
    gtag: (...args: unknown[]) => google.push(args),
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser })
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { referrer: 'https://www.google.com/search?q=synthetic' } })
  try {
    for (const signals of [{ doNotTrack: '1' }, { doNotTrack: 'yes' }, { globalPrivacyControl: true }]) {
      browser.navigator = signals
      trackAnalyticsEvent('booking_clicked', { placement: 'doctor_clinic_card' })
    }
    browser.navigator = {}
    trackAnalyticsEvent('unapproved_event' as never, {})
    assert.deepEqual(vercel, [])
    assert.deepEqual(google, [])

    trackAnalyticsEvent('booking_clicked', {
      placement: 'doctor_clinic_card', clinic_slug: 'erlin', locale: 'zh-TW',
      slug: 'patient@example.invalid', category: 'synthetic question',
      email: 'patient@example.invalid',
    } as never)
    const safeProperties = { locale: 'zh-TW', placement: 'doctor_clinic_card', clinic_slug: 'erlin' }
    assert.deepEqual(vercel, [['event', { name: 'booking_clicked', data: safeProperties, options: undefined }]])
    assert.deepEqual(google, [['event', 'booking_clicked', {
      ...safeProperties, page_location: origin + '/posts/example', page_referrer: 'https://www.google.com/',
    }]])
    assert.doesNotMatch(JSON.stringify([vercel, google]), /example\.invalid|synthetic|email=|#private|search\?q/)
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow)
    else Reflect.deleteProperty(globalThis, 'window')
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument)
    else Reflect.deleteProperty(globalThis, 'document')
  }
})
