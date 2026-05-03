import { buildSearchIndex } from '@/lib/search'

// 強制此 route 在 build time 預先執行（變成靜態 JSON）
export const dynamic = 'force-static'

// 1 小時 revalidate（發新文章 redeploy 後立即生效）
export const revalidate = 3600

export function GET() {
  return Response.json(buildSearchIndex())
}