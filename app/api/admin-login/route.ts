import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, isAllowedWriteOrigin, rateLimitError } from '@/lib/rate-limit'
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSession,
} from '@/lib/admin-auth'

// 5 attempts per 15-minute window per IP
const LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000

// Fixed 300 ms delay on every login attempt (slows brute-force regardless of outcome)
const DELAY_MS = 300

export async function POST(request: NextRequest) {
  if (!isAllowedWriteOrigin(request.headers, request.nextUrl.origin)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`admin-login:${ip}`, LIMIT, WINDOW_MS)

  if (!rl.allowed) {
    const error = rateLimitError(rl)
    return NextResponse.json(
      { error: error.error, code: error.code },
      {
        status: error.status,
        headers: {
          ...error.headers,
          'X-RateLimit-Limit': String(LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + rl.resetIn),
        },
      }
    )
  }

  // Fixed delay — apply before any response to slow down automated attacks
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { password } = body as { password?: unknown }
  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: 'Admin access is not configured' },
      { status: 503 }
    )
  }

  if (
    typeof password !== 'string' ||
    password.length > 200 ||
    password !== secret
  ) {
    // Generic message — don't reveal whether the account exists
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true }, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
  response.cookies.set(ADMIN_COOKIE_NAME, await createAdminSession(secret), {
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return response
}
