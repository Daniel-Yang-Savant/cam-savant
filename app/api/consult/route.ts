import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const FORM_ACTION =
  'https://docs.google.com/forms/u/0/d/e/1FAIpQLSce2gBT1hksmK27GyvqwCkngUJ1wdQJNLcO2zxCTjGGl0mcCw/formResponse'

const LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000

type ConsultPayload = {
  name?: unknown
  question?: unknown
  contact?: unknown
  articleTitle?: unknown
  sourcePath?: unknown
}

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length > maxLength) return null
  return trimmed
}

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get('origin')
  if (requestOrigin && requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const ip = getClientIp(request.headers)
  const rateLimit = checkRateLimit(`consult:${ip}`, LIMIT, WINDOW_MS)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)) },
      }
    )
  }

  let payload: ConsultPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = text(payload.name ?? '', 100)
  const question = text(payload.question, 3000)
  const contact = text(payload.contact, 200)
  const articleTitle = text(payload.articleTitle ?? '', 300)
  const sourcePath = text(payload.sourcePath ?? '', 500)

  if (name === null || !question || !contact || articleTitle === null || sourcePath === null) {
    return NextResponse.json({ error: 'Invalid consultation data' }, { status: 400 })
  }

  const context = [
    articleTitle ? `來源文章：${articleTitle}` : '',
    sourcePath ? `來源頁面：${sourcePath}` : '',
  ].filter(Boolean)
  const questionWithContext = context.length
    ? `${context.join('\n')}\n\n${question}`
    : question

  const formBody = new URLSearchParams()
  formBody.append('entry.2059990981', name)
  formBody.append('entry.1851838457', questionWithContext)
  formBody.append('entry.1305016048', contact)

  try {
    const response = await fetch(FORM_ACTION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      console.error('Consult form upstream error:', response.status)
      return NextResponse.json({ error: 'Submission failed' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      'Consult form upstream request failed:',
      error instanceof Error ? error.name : 'UnknownError'
    )
    return NextResponse.json({ error: 'Submission failed' }, { status: 502 })
  }
}
