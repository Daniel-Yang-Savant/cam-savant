import { getPublicPosts, CATEGORY_LABELS } from '@/lib/posts'

const BASE_URL = 'https://cam-savant.vercel.app'

export function GET() {
  const posts = getPublicPosts()

  const items = posts
    .map((post) => {
      const categoryLabel =
        CATEGORY_LABELS[post.frontmatter.category] ?? post.frontmatter.category

      return `    <item>
      <title><![CDATA[${post.frontmatter.title}]]></title>
      <link>${BASE_URL}/posts/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/posts/${post.slug}</guid>
      <description><![CDATA[${post.frontmatter.excerpt}]]></description>
      <category>${categoryLabel}</category>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CAM Savant — 整合醫學知識平台</title>
    <link>${BASE_URL}</link>
    <description>彰化、南投、台中、雲林地區復健科與運動醫學專業團隊，提供增生療法、PRP治療、骨質疏鬆、超音波導引注射、FSM頻率共振微電流與功能醫學服務。</description>
    <language>zh-TW</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/images/logo.png</url>
      <title>CAM Savant</title>
      <link>${BASE_URL}</link>
    </image>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
