import { NextRequest, NextResponse } from 'next/server'

const TOKEN = process.env.PERIOP_ACCESS_TOKEN
const ADMIN_SECRET = process.env.ADMIN_SECRET

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // ── Admin PE Generator: separate admin_token check ──
  if (pathname === '/perioperative-rehab/pe-generator') {
    const adminCookie = request.cookies.get('admin_token')
    if (ADMIN_SECRET && adminCookie?.value === ADMIN_SECRET) {
      return NextResponse.next()
    }
    return new NextResponse(null, { status: 404 })
  }

  // Allow the locked page and access route to pass through without auth check
  if (
    pathname === '/perioperative-rehab/locked' ||
    pathname.startsWith('/perioperative-rehab/access')
  ) {
    return NextResponse.next()
  }

  // Cookie already set → allow
  const cookie = request.cookies.get('periop_access')
  if (cookie?.value === '1') {
    return NextResponse.next()
  }

  // ?access=TOKEN in query → set cookie and redirect to clean URL
  const accessParam = searchParams.get('access')
  if (accessParam && TOKEN && accessParam === TOKEN) {
    const dest = request.nextUrl.clone()
    dest.pathname = '/perioperative-rehab'
    dest.search = ''
    const response = NextResponse.redirect(dest)
    response.cookies.set('periop_access', '1', {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    return response
  }

  // No valid access → redirect to locked page
  const locked = request.nextUrl.clone()
  locked.pathname = '/perioperative-rehab/locked'
  locked.search = ''
  return NextResponse.redirect(locked)
}

export const config = {
  matcher: ['/perioperative-rehab/:path*'],
}
