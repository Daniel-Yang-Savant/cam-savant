import { PROTECTED_CATEGORIES, type Post } from '../../lib/posts'
import { auditPage, parsePage, type Finding } from './core'

type ArticleSource = Pick<Post, 'slug' | 'frontmatter'>

/** Audit only explicitly published articles; never discover routes by walking built files. */
export function auditPublicArticles(
  posts: readonly ArticleSource[],
  origin: string,
  sitemapUrls: ReadonlySet<string>,
  readHtml: (route: string) => string | undefined,
) {
  const publicPosts = posts.filter((post) => !post.frontmatter.draft && !PROTECTED_CATEGORIES.includes(post.frontmatter.category))
  const findings: Finding[] = []
  let pages = 0
  for (const post of publicPosts) {
    const route = `/posts/${post.slug}`
    const url = `${origin}${route}`
    const add = (code: string, evidence: string, action: string) => {
      findings.push({ severity: 'error', code, path: route, evidence, action })
    }
    if (!sitemapUrls.has(url)) add('article.sitemap', url, '將已發布公開文章的 canonical 網址加入 sitemap。')
    const html = readHtml(route)
    if (html === undefined) {
      add('article.missing', '找不到已發布公開文章的靜態 HTML。', '重新 build，確認公開文章頁面存在。')
      continue
    }
    pages += 1
    const page = parsePage(route, html)
    findings.push(...auditPage(page, url))
    const normalize = (value: string) => value.replace(/\s+/gu, ' ').trim()
    if (page.h1.length !== 1 || normalize(page.h1[0]) !== normalize(post.frontmatter.title)) {
      add('article.heading', `可見 H1：${JSON.stringify(page.h1)}`, '讓文章主要標題與已確認的 frontmatter 標題一致。')
    }
    const articles = page.schemas.filter((node) => [node['@type']].flat().includes('Article'))
    const article = articles[0]
    if (articles.length !== 1 || article?.['@id'] !== `${url}#article` || article?.url !== url) {
      add('article.identity', '缺少唯一且對應本頁網址的 Article 結構化資料。', '確認 Article 的 @id 與 url 使用本篇 canonical 網址。')
      continue
    }
    if (article.headline !== post.frontmatter.title) {
      add('article.headline', `headline：${JSON.stringify(article.headline)}`, '使用本篇 frontmatter 標題，與可見標題一致。')
    }
    for (const [property, expected] of Object.entries({
      datePublished: post.frontmatter.date,
      dateModified: post.frontmatter.lastModified ?? post.frontmatter.date,
    })) {
      if (article[property] !== expected) {
        add(`article.${property}`, `${property}：${JSON.stringify(article[property])}；預期 ${expected}`, '使用本篇已記錄的發布／實質更新日期，不以建置日期替代。')
      }
    }
  }
  return { pages, expectedPages: publicPosts.length, findings }
}
