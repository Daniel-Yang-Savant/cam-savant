import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { NextRequest, type NextResponse } from 'next/server'
import {
  PERIOP_COOKIE_MAX_AGE_SECONDS,
  PERIOP_COOKIE_NAME,
  PERIOP_QR_GRANT_MAX_AGE_SECONDS,
  createPeriopAccessCookie,
  createPeriopQrGrant,
  verifyPeriopAccessCookie,
  verifyPeriopQrGrant,
} from '../lib/periop-auth'

const PATIENT_SECRET = 'periop-regression-patient-secret'
const ADMIN_SECRET = 'periop-regression-admin-secret'
const ORIGIN = 'https://periop.example.test'
const FIXED_NOW = 1_800_000_000_000

function request(path: string, cookies: Record<string, string> = {}, method = 'GET') {
  return new NextRequest(new URL(path, ORIGIN), {
    method,
    headers: {
      cookie: Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; '),
    },
  })
}

function expectRedirect(response: NextResponse, path: string) {
  assert.equal(response.status, 307)
  assert.equal(response.headers.get('location'), new URL(path, ORIGIN).toString())
}

function expectAllowed(response: NextResponse) {
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('x-middleware-next'), '1')
  assert.match(response.headers.get('cache-control') ?? '', /private/)
  assert.match(response.headers.get('cache-control') ?? '', /no-store/)
}

function expectPatientCookie(response: NextResponse) {
  const cookie = response.cookies.get(PERIOP_COOKIE_NAME)
  assert.ok(cookie, 'Successful authorization must issue the patient cookie')
  assert.equal(cookie.maxAge, 30 * 24 * 60 * 60)
  assert.equal(cookie.httpOnly, true)
  assert.equal(cookie.secure, true)
  assert.equal(cookie.path, '/')
  // Browser cross-site navigation is verified separately. Both cookie writers
  // must use Lax so top-level QR/link redirects can carry this signed cookie.
  assert.equal(cookie.sameSite, 'lax')
  assert.equal(response.cookies.get('admin_token'), undefined)
  return cookie.value
}

function tamperSignature(value: string) {
  const [payload, signature] = value.split('.')
  return `${payload}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`
}

describe('postoperative patient authorization', { concurrency: false }, () => {
  let proxy: typeof import('../proxy').proxy
  let access: typeof import('../app/(zh)/perioperative-rehab/access/route').GET
  let generateQr: typeof import('../app/api/admin/periop-qr/route').POST
  const environmentKeys = ['PERIOP_ACCESS_TOKEN', 'ADMIN_SECRET', 'NODE_ENV'] as const
  const originalEnvironment = new Map(
    environmentKeys.map((key) => [key, process.env[key]])
  )

  before(async () => {
    // proxy captures configuration at module load. Use only fixed test values,
    // import it afterwards, and keep this suite serial to avoid env races.
    Object.assign(process.env, {
      PERIOP_ACCESS_TOKEN: PATIENT_SECRET,
      ADMIN_SECRET,
      NODE_ENV: 'production',
    })
    ;({ proxy } = await import('../proxy'))
    ;({ GET: access } = await import('../app/(zh)/perioperative-rehab/access/route'))
    ;({ POST: generateQr } = await import('../app/api/admin/periop-qr/route'))
  })

  after(() => {
    for (const key of environmentKeys) {
      const value = originalEnvironment.get(key)
      if (value === undefined) delete process.env[key]
      else Object.assign(process.env, { [key]: value })
    }
  })

  test('QR grants expire at 10 minutes and signed patient cookies at 30 days', async () => {
    assert.equal(PERIOP_QR_GRANT_MAX_AGE_SECONDS, 10 * 60)
    assert.equal(PERIOP_COOKIE_MAX_AGE_SECONDS, 30 * 24 * 60 * 60)
    const { grant, expiresAt } = await createPeriopQrGrant(PATIENT_SECRET, FIXED_NOW)
    assert.equal(expiresAt, FIXED_NOW / 1000 + 600)
    assert.equal(await verifyPeriopQrGrant(grant, PATIENT_SECRET, FIXED_NOW), true)
    assert.equal(await verifyPeriopQrGrant(grant, PATIENT_SECRET, FIXED_NOW + 599_999), true)
    assert.equal(await verifyPeriopQrGrant(grant, PATIENT_SECRET, FIXED_NOW + 600_000), false)

    const cookie = await createPeriopAccessCookie(PATIENT_SECRET, FIXED_NOW)
    const expiresAfter = PERIOP_COOKIE_MAX_AGE_SECONDS * 1000
    assert.equal(await verifyPeriopAccessCookie(cookie, PATIENT_SECRET, FIXED_NOW), true)
    assert.equal(await verifyPeriopAccessCookie(cookie, PATIENT_SECRET, FIXED_NOW + expiresAfter - 1), true)
    assert.equal(await verifyPeriopAccessCookie(cookie, PATIENT_SECRET, FIXED_NOW + expiresAfter), false)
  })

  test('malformed, forged, expired, or differently signed credentials fail closed', async () => {
    const { grant } = await createPeriopQrGrant(PATIENT_SECRET, FIXED_NOW)
    const cookie = await createPeriopAccessCookie(PATIENT_SECRET, FIXED_NOW)
    for (const value of ['', '1', 'not-a-token', 'abc.signature', '1.a.b', '9007199254740992.signature']) {
      assert.equal(await verifyPeriopQrGrant(value, PATIENT_SECRET, FIXED_NOW), false)
      assert.equal(await verifyPeriopAccessCookie(value, PATIENT_SECRET, FIXED_NOW), false)
    }
    assert.equal(await verifyPeriopQrGrant(null, PATIENT_SECRET, FIXED_NOW), false)
    assert.equal(await verifyPeriopAccessCookie(undefined, PATIENT_SECRET, FIXED_NOW), false)
    for (const secret of [undefined, '', ADMIN_SECRET]) {
      assert.equal(await verifyPeriopQrGrant(grant, secret, FIXED_NOW), false)
      assert.equal(await verifyPeriopAccessCookie(cookie, secret, FIXED_NOW), false)
    }
    assert.equal(await verifyPeriopQrGrant(tamperSignature(grant), PATIENT_SECRET, FIXED_NOW), false)
    assert.equal(await verifyPeriopAccessCookie(tamperSignature(cookie), PATIENT_SECRET, FIXED_NOW), false)
  })

  test('a newly generated patient QR issues a signed cookie that opens Chinese and English guides', async () => {
    for (const locale of ['zh', 'en']) {
      const qrRequest = request(`/api/admin/periop-qr?locale=${locale}`, { admin_token: ADMIN_SECRET }, 'POST')
      expectAllowed(await proxy(qrRequest))
      const qrResponse = await generateQr(qrRequest)
      assert.equal(qrResponse.status, 200)
      const data = await qrResponse.json() as { url: string; expiresAt: string }
      const url = new URL(data.url)
      assert.equal(url.origin, ORIGIN)
      assert.equal(url.pathname, '/perioperative-rehab/access')
      assert.equal(url.searchParams.has('token'), false)
      assert.equal(await verifyPeriopQrGrant(url.searchParams.get('grant'), PATIENT_SECRET), true)
      assert.ok(Date.parse(data.expiresAt) > Date.now())

      const accessRequest = request(url.pathname + url.search)
      expectAllowed(await proxy(accessRequest))
      const accessResponse = await access(accessRequest)
      const destination = locale === 'en' ? '/en/perioperative-rehab' : '/perioperative-rehab'
      expectRedirect(accessResponse, destination)
      const cookie = expectPatientCookie(accessResponse)
      assert.equal(await verifyPeriopAccessCookie(cookie, PATIENT_SECRET), true)
      for (const guidePath of ['/perioperative-rehab', '/en/perioperative-rehab/example-guide']) {
        expectAllowed(await proxy(request(guidePath, { [PERIOP_COOKIE_NAME]: cookie })))
      }
    }
  })

  test('legacy token QR links still authorize both locales', async () => {
    for (const locale of ['zh', 'en']) {
      const response = await access(request(`/perioperative-rehab/access?token=${PATIENT_SECRET}&locale=${locale}`))
      const destination = locale === 'en' ? '/en/perioperative-rehab' : '/perioperative-rehab'
      expectRedirect(response, destination)
      const cookie = expectPatientCookie(response)
      expectAllowed(await proxy(request(destination, { [PERIOP_COOKIE_NAME]: cookie })))
    }
  })

  test('legacy access query links issue the same cookie and remove credentials from redirects', async () => {
    for (const prefix of ['', '/en']) {
      const response = await proxy(request(`${prefix}/perioperative-rehab/example?access=${PATIENT_SECRET}&extra=discard`))
      const destination = `${prefix}/perioperative-rehab`
      expectRedirect(response, destination)
      const cookie = expectPatientCookie(response)
      expectAllowed(await proxy(request(destination, { [PERIOP_COOKIE_NAME]: cookie })))
    }
  })

  test('expired or forged QR scans and invalid legacy links never issue patient access', async () => {
    const { grant: expired } = await createPeriopQrGrant(PATIENT_SECRET, Date.now() - 601_000)
    const { grant: fresh } = await createPeriopQrGrant(PATIENT_SECRET)
    for (const locale of ['zh', 'en']) {
      const locked = locale === 'en' ? '/en/perioperative-rehab/locked' : '/perioperative-rehab/locked'
      for (const query of ['', 'token=wrong-token', `grant=${expired}`, `grant=${tamperSignature(fresh)}`]) {
        const response = await access(request(`/perioperative-rehab/access?locale=${locale}&${query}`))
        expectRedirect(response, locked)
        assert.equal(response.cookies.get(PERIOP_COOKIE_NAME), undefined)
      }
      const prefix = locale === 'en' ? '/en' : ''
      expectRedirect(await proxy(request(`${prefix}/perioperative-rehab?access=wrong-token`)), locked)
    }
  })

  test('QR grants and 30-day cookies cannot be substituted for each other', async () => {
    const { grant } = await createPeriopQrGrant(PATIENT_SECRET)
    const cookie = await createPeriopAccessCookie(PATIENT_SECRET)
    assert.equal(await verifyPeriopAccessCookie(grant, PATIENT_SECRET), false)
    assert.equal(await verifyPeriopQrGrant(cookie, PATIENT_SECRET), false)
    expectRedirect(await proxy(request('/perioperative-rehab', { [PERIOP_COOKIE_NAME]: grant })), '/perioperative-rehab/locked')
    const swapped = await access(request(`/perioperative-rehab/access?grant=${cookie}`))
    expectRedirect(swapped, '/perioperative-rehab/locked')
    assert.equal(swapped.cookies.get(PERIOP_COOKIE_NAME), undefined)
  })

  test('absent, expired, forged, and old unsigned patient cookies cannot open protected guides', async () => {
    const fresh = await createPeriopAccessCookie(PATIENT_SECRET)
    const expired = await createPeriopAccessCookie(PATIENT_SECRET, Date.now() - (PERIOP_COOKIE_MAX_AGE_SECONDS + 1) * 1000)
    for (const prefix of ['', '/en']) {
      const destination = `${prefix}/perioperative-rehab`
      const missing = await proxy(request(destination))
      expectRedirect(missing, `${destination}/locked`)
      assert.equal(missing.headers.get('set-cookie'), null, 'An omitted cookie must not erase browser-held authorization')
      for (const cookie of ['1', PATIENT_SECRET, expired, tamperSignature(fresh)]) {
        const rejected = await proxy(request(`${destination}/example`, { [PERIOP_COOKIE_NAME]: cookie }))
        expectRedirect(rejected, `${destination}/locked`)
        assert.equal(rejected.cookies.get(PERIOP_COOKIE_NAME)?.value, '')
        assert.equal(Number(rejected.cookies.get(PERIOP_COOKIE_NAME)?.expires), 0)
      }
    }
  })

  test('patient access never grants admin privileges, while real admins can view guides and generate QR codes', async () => {
    const cookie = await createPeriopAccessCookie(PATIENT_SECRET)
    const nonAdminCookies: Record<string, string>[] = [
      {},
      { [PERIOP_COOKIE_NAME]: cookie },
      { admin_token: PATIENT_SECRET },
    ]
    for (const cookies of nonAdminCookies) {
      assert.equal((await proxy(request('/admin/editor', cookies))).status, 404)
      assert.equal((await proxy(request('/api/admin/periop-qr', cookies, 'POST'))).status, 401)
    }
    for (const path of ['/admin/editor', '/api/admin/periop-qr', '/perioperative-rehab', '/en/perioperative-rehab']) {
      expectAllowed(await proxy(request(path, { admin_token: ADMIN_SECRET })))
    }
    expectRedirect(await proxy(request('/perioperative-rehab', { admin_token: PATIENT_SECRET })), '/perioperative-rehab/locked')
  })

  test('locked pages and the QR authorization endpoint remain reachable without a session', async () => {
    for (const path of ['/perioperative-rehab/locked', '/en/perioperative-rehab/locked', '/perioperative-rehab/access']) {
      expectAllowed(await proxy(request(path)))
    }
  })
})
