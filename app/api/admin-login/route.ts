import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// 5 attempts per 15-minute window per IP
const LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000

// Fixed 300 ms delay on every login attempt (slows brute-force regardless of outcome)
const DELAY_MS = 300

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const rl = checkRateLimit(`admin-login:${ip}`, LIMIT, WINDOW_MS)

  if (!rl.allowed) {
    const retryAfterSec = Math.ceil(rl.resetIn / 1000)
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSec),
          'X-RateLimit-Limit': String(LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + rl.resetIn),
        },
      }
    )
  }

  // Fixed delay — apply before any response to slow down automated attacks
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))

  let body: { password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { password } = body
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

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_token', secret, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return response
}
