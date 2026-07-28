import { NextRequest, NextResponse } from 'next/server'
import {
  PERIOP_COOKIE_MAX_AGE_SECONDS,
  PERIOP_COOKIE_NAME,
  createPeriopAccessCookie,
  verifyPeriopQrGrant,
} from '@/lib/periop-auth'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const grant = request.nextUrl.searchParams.get('grant')
  const validToken = process.env.PERIOP_ACCESS_TOKEN
  const hasValidToken = Boolean(token && validToken && token === validToken)
  const hasValidGrant = await verifyPeriopQrGrant(grant, validToken)

  if (!validToken || (!hasValidToken && !hasValidGrant)) {
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
