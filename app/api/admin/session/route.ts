import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json(
    { authenticated: true },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    }
  )
}
