import { PUBLIC_ARTICLE_CATEGORIES } from './article-discovery'
import { normalizeTags } from './tags'

export interface RelatedArticleCandidate {
  slug: string
  content: string
  frontmatter: {
    category: string
    date: string
    tags?: string[]
    draft?: boolean
  }
}

// These describe the collection or article format rather than its clinical topic.
const GENERIC_TAGS = new Set([
  '運動醫學', '復健醫學', '功能醫學', '每週論文精選', 'FSM',
  '實證醫學', '文獻回顧', '物理治療', '傷害預防', '運動傷害',
  '訓練', '保守治療', '運動治療', '居家運動',
])

// A small editorial bridge where existing tags do not express the article's
// specific sections. All destinations still pass the public/draft filters below.
const EDITORIAL_RELATED: Readonly<Record<string, readonly string[]>> = {
  // The source discusses hydration and tibial stress injury explicitly.
  'marathon-running-injuries-prevention': [
    'sports-hydration-guide',
    'running-shin-pain-bone-stress-injury',
  ],
  // The source has dedicated sections on lateral/medial elbow pain and ankle sprain.
  'tennis-injuries-prevention': [
    'lateral-epicondylitis-rehab',
    'lateral-ankle-sprain-rehab',
    'medial-epicondylitis-rehab',
  ],
}

function specificTags(post: RelatedArticleCandidate): string[] {
  return normalizeTags(post.frontmatter.tags ?? []).filter((tag) => !GENERIC_TAGS.has(tag))
}

function linkedArticleSlugs(content: string): Set<string> {
  const slugs = new Set<string>()
  const prose = content.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '')
  const links = prose.matchAll(/(?<!!)\[[^\]]*\]\(\s*(<?[^\s)]+>?)(?:\s+["'][^)]*)?\)|\bhref\s*=\s*["']([^"']+)["']/g)

  for (const match of links) {
    try {
      const href = (match[1] ?? match[2]).replace(/^<|>$/g, '')
      const url = new URL(href, 'https://camsavant.com')
      if (!['camsavant.com', 'www.camsavant.com'].includes(url.hostname)) continue
      const route = url.pathname.match(/^\/posts\/([^/]+)\/?$/)
      if (route) slugs.add(decodeURIComponent(route[1]))
    } catch {
      // Malformed links do not create recommendation candidates.
    }
  }

  return slugs
}

export function getRelatedArticles<T extends RelatedArticleCandidate>(
  currentSlug: string,
  posts: readonly T[],
  limit = 3
): T[] {
  if (!Number.isSafeInteger(limit) || limit <= 0) return []

  const publicPosts = [...new Map(posts
    .filter(({ frontmatter }) =>
      !frontmatter.draft &&
      PUBLIC_ARTICLE_CATEGORIES.some((category) => category === frontmatter.category)
    )
    .map((post) => [post.slug, post] as const)).values()]
  const source = publicPosts.find((post) => post.slug === currentSlug)
  if (!source) return []

  const sourceTags = new Set(specificTags(source))
  const linkedSlugs = linkedArticleSlugs(source.content)
  const editorialSlugs = EDITORIAL_RELATED[currentSlug] ?? []
  const tagCounts = new Map<string, number>()
  for (const post of publicPosts) {
    for (const tag of specificTags(post)) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  return publicPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      // A rare shared topic carries more information than a common label.
      const topicScore = specificTags(post).reduce((score, tag) =>
        sourceTags.has(tag)
          ? score + Math.log2(1 + publicPosts.length / (tagCounts.get(tag) ?? 1))
          : score, 0)
      const editorialIndex = editorialSlugs.indexOf(post.slug)
      return {
        post,
        linked: linkedSlugs.has(post.slug),
        editorialRank: editorialIndex < 0 ? editorialSlugs.length : editorialIndex,
        editorial: editorialIndex >= 0,
        topicScore,
        sameCategory: post.frontmatter.category === source.frontmatter.category,
      }
    })
    // An overlapping tag alone must not move general clinical readers into
    // an FSM case discussion. Explicit editorial/prose links remain deliberate.
    .filter((item) =>
      source.frontmatter.category === 'fsm' ||
      item.post.frontmatter.category !== 'fsm' ||
      item.linked || item.editorial
    )
    .filter((item) => item.linked || item.editorial || item.topicScore > 0 || item.sameCategory)
    .sort((a, b) =>
      Number(b.linked) - Number(a.linked) ||
      a.editorialRank - b.editorialRank ||
      b.topicScore - a.topicScore ||
      Number(b.sameCategory) - Number(a.sameCategory) ||
      b.post.frontmatter.date.localeCompare(a.post.frontmatter.date) ||
      a.post.slug.localeCompare(b.post.slug)
    )
    .slice(0, limit)
    .map(({ post }) => post)
}
