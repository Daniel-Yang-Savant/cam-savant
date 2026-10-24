import { NextRequest, NextResponse } from 'next/server'
import { createPeriopQrGrant, getPeriopSigningSecret } from '@/lib/periop-auth'
import { checkRateLimit, getClientIp, isAllowedWriteOrigin, rateLimitError } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  if (!isAllowedWriteOrigin(request.headers, request.nextUrl.origin)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const limit = await checkRateLimit(`admin-qr:${getClientIp(request.headers)}`, 30, 60_000)
  if (!limit.allowed) {
    const error = rateLimitError(limit)
    return NextResponse.json({ error: error.error, code: error.code }, { status: error.status, headers: error.headers })
  }
  const secret = getPeriopSigningSecret()
  if (!secret) {
    return NextResponse.json(
      { error: '術後專區簽章金鑰尚未設定' },
      { status: 503 }
    )
  }

  const { grant, expiresAt } = await createPeriopQrGrant(secret)
  const accessUrl = new URL('/perioperative-rehab/access', request.url)
  accessUrl.searchParams.set('grant', grant)
  if (request.nextUrl.searchParams.get('locale') === 'en') {
    accessUrl.searchParams.set('locale', 'en')
  }

  return NextResponse.json(
    {
      url: accessUrl.toString(),
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
