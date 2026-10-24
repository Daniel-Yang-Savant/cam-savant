import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import {
  configureGoogleAnalyticsPage,
  filterAnalyticsEvent,
  isPrivateAnalyticsPath,
  safeAnalyticsReferrer,
  safeAnalyticsUrl,
  validGoogleMeasurementId,
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
