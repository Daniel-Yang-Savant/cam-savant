import { NextRequest, NextResponse } from 'next/server'
import {
  PERIOP_COOKIE_MAX_AGE_SECONDS,
  PERIOP_COOKIE_NAME,
  createPeriopAccessCookie,
} from '@/lib/periop-auth'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const validToken = process.env.PERIOP_ACCESS_TOKEN

  if (!token || !validToken || token !== validToken) {
    return NextResponse.redirect(new URL('/perioperative-rehab/locked', request.url))
  }

  const response = NextResponse.redirect(new URL('/perioperative-rehab', request.url))
  response.cookies.set(
    PERIOP_COOKIE_NAME,
    await createPeriopAccessCookie(validToken),
    {
      maxAge: PERIOP_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    }
  )
  return response
}
