import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json(
    { authenticated: true },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
