import { getPublicPosts, CATEGORY_LABELS } from '@/lib/posts'

const BASE_URL = 'https://camsavant.com'

// Generated entirely from local MDX content; refresh on deployment.
export const dynamic = 'force-static'

export function GET() {
  const posts = getPublicPosts()

  const header = `# CAM Savant — 完整文章索引
# 此檔案供 AI 搜尋引擎與大型語言模型使用
# 最後更新: ${new Date().toISOString().split('T')[0]}
# 網站: ${BASE_URL}
# RSS: ${BASE_URL}/feed.xml
# Sitemap: ${BASE_URL}/sitemap.xml

## 關於 CAM Savant

CAM Savant 是台灣中部（彰化、南投、台中、雲林）的整合醫學知識平台。
由復健科與運動醫學專科醫師團隊主筆，內容涵蓋運動醫學、功能醫學、
FSM 頻率特異性微電流等領域，所有文章均以實證醫學為基礎。

主要作者: 楊育愷醫師 (Yu-Kai Yang, MD) — 復健科主治醫師
機構: 彰化基督教醫院體系
服務地區: 彰化縣、南投縣、台中市、雲林縣

---
`

  const categories = ['sports-medicine', 'functional-medicine', 'fsm'] as const
  const categoryNames: Record<string, string> = {
    'sports-medicine': '運動醫學 (Sports Medicine)',
    'functional-medicine': '功能醫學 (Functional Medicine)',
    'fsm': 'FSM 頻率特異性微電流 (Frequency Specific Microcurrent)',
  }

  let body = ''

  for (const cat of categories) {
    const catPosts = posts.filter((p) => p.frontmatter.category === cat)
    if (catPosts.length === 0) continue

    body += `\n## ${categoryNames[cat]}\n\n`

    for (const post of catPosts) {
      body += `### ${post.frontmatter.title}\n`
      body += `- URL: ${BASE_URL}/posts/${post.slug}\n`
      body += `- 日期: ${post.frontmatter.date}\n`
      body += `- 分類: ${CATEGORY_LABELS[post.frontmatter.category]}\n`
      if (post.frontmatter.author) {
        body += `- 作者: ${post.frontmatter.author}\n`
      }
      body += `\n${post.frontmatter.excerpt}\n\n---\n`
    }
  }

  const footer = `
## 引用與授權

本站內容僅供醫療專業人員學習參考，不構成個別診療建議。
引用本站內容時請標註來源為「CAM Savant 醫療團隊」並附上原文連結。
未經書面授權禁止轉載、複製或商業使用。

## 聯絡

諮詢表單: https://docs.google.com/forms/d/e/1FAIpQLSce2gBT1hksmK27GyvqwCkngUJ1wdQJNLcO2zxCTjGGl0mcCw/viewform
`

  return new Response(header + body + footer, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
