import { NextRequest, NextResponse } from 'next/server'
import { createPeriopQrGrant } from '@/lib/periop-auth'

export async function POST(request: NextRequest) {
  const secret = process.env.PERIOP_ACCESS_TOKEN
  if (!secret) {
    return NextResponse.json(
      { error: 'PERIOP_ACCESS_TOKEN 尚未設定' },
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
