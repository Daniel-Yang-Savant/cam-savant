import { generateLlmsText } from '@/lib/llms'

export const dynamic = 'force-static'

export function GET() {
  return new Response(generateLlmsText(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
