import { buildSearchIndex } from '@/lib/search'

export function GET() {
  return Response.json(buildSearchIndex())
}
