import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const validToken = process.env.NEXT_PUBLIC_PERIOP_ACCESS_TOKEN

  if (!token || !validToken || token !== validToken) {
    return NextResponse.redirect(new URL('/perioperative-rehab/locked', request.url))
  }

  const response = NextResponse.redirect(new URL('/perioperative-rehab', request.url))
  response.cookies.set('periop_access', '1', {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
  return response
}
