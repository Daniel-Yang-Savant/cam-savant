import { NextRequest, NextResponse } from 'next/server'
import {
  PERIOP_COOKIE_MAX_AGE_SECONDS,
  PERIOP_COOKIE_NAME,
  createPeriopAccessCookie,
  verifyPeriopAccessCookie,
} from '@/lib/periop-auth'

const TOKEN = process.env.PERIOP_ACCESS_TOKEN
const ADMIN_SECRET = process.env.ADMIN_SECRET

function withPrivateNoStore(response: NextResponse): NextResponse {
  response.headers.set(
    'Cache-Control',
    'private, no-store, max-age=0, must-revalidate'
  )
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const isEnglishPeriop =
    pathname === '/en/perioperative-rehab' ||
    pathname.startsWith('/en/perioperative-rehab/')
  const adminCookie = request.cookies.get('admin_token')
  const hasAdminAccess = Boolean(
    ADMIN_SECRET && adminCookie?.value === ADMIN_SECRET
  )

  // ── Admin routes: /admin/** and /api/admin/** ──
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (hasAdminAccess) {
      return withPrivateNoStore(NextResponse.next())
    }
    // Return 404 for page routes, 401 for API routes
    if (pathname.startsWith('/api/admin')) {
      return withPrivateNoStore(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      )
    }
    return withPrivateNoStore(new NextResponse(null, { status: 404 }))
  }

  // Allow the locked page and access route to pass through without auth check
  if (
    pathname === '/perioperative-rehab/locked' ||
    pathname.startsWith('/perioperative-rehab/access') ||
    pathname === '/en/perioperative-rehab/locked'
  ) {
    return withPrivateNoStore(NextResponse.next())
  }

  // 管理員登入後可直接查看術後專區，不需要另外掃描病患 QR。
  if (hasAdminAccess) {
    return withPrivateNoStore(NextResponse.next())
  }

  // Valid signed cookie already set → allow
  const cookie = request.cookies.get(PERIOP_COOKIE_NAME)
  if (await verifyPeriopAccessCookie(cookie?.value, TOKEN)) {
    return withPrivateNoStore(NextResponse.next())
  }

  // ?access=TOKEN in query → set cookie and redirect to clean URL
  const accessParam = searchParams.get('access')
  if (accessParam && TOKEN && accessParam === TOKEN) {
    const dest = request.nextUrl.clone()
    dest.pathname = isEnglishPeriop
      ? '/en/perioperative-rehab'
      : '/perioperative-rehab'
    dest.search = ''
    const response = NextResponse.redirect(dest)
    response.cookies.set(
      PERIOP_COOKIE_NAME,
      await createPeriopAccessCookie(TOKEN),
      {
        maxAge: PERIOP_COOKIE_MAX_AGE_SECONDS,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      }
    )
    return withPrivateNoStore(response)
  }

  // No valid access → redirect to locked page
  const locked = request.nextUrl.clone()
  locked.pathname = isEnglishPeriop
    ? '/en/perioperative-rehab/locked'
    : '/perioperative-rehab/locked'
  locked.search = ''
  const response = NextResponse.redirect(locked)
  response.cookies.delete(PERIOP_COOKIE_NAME)
  return withPrivateNoStore(response)
}

export const config = {
  matcher: [
    '/perioperative-rehab/:path*',
    '/en/perioperative-rehab/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
