import Link from 'next/link'
import { getPublicPosts, CATEGORY_LABELS } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'

interface RelatedArticlesProps {
  currentSlug: string
  category: string
  tags?: string[]
}

export default function RelatedArticles({ currentSlug, category, tags = [] }: RelatedArticlesProps) {
  const allPosts = getPublicPosts().filter((p) => p.slug !== currentSlug)

  // Score each post: shared tags (2pts each) + same category (1pt)
  const scored = allPosts.map((post) => {
    const postTags = post.frontmatter.tags ?? []
    const sharedTags = postTags.filter((t) => tags.includes(t)).length
    const sameCategory = post.frontmatter.category === category ? 1 : 0
    return { post, score: sharedTags * 2 + sameCategory }
  })

  // Keep only posts with at least some relevance, sorted by score then date
  const related = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.post.frontmatter.date.localeCompare(a.post.frontmatter.date))
    .slice(0, 3)
    .map((s) => s.post)

  // Fallback: fill with same-category posts if not enough tag matches
  if (related.length < 3) {
    const existing = new Set(related.map((p) => p.slug))
    const fallback = allPosts
      .filter((p) => p.frontmatter.category === category && !existing.has(p.slug))
      .slice(0, 3 - related.length)
    related.push(...fallback)
  }

  if (related.length === 0) return null

  const categoryLabel = CATEGORY_LABELS[category] ?? category
  const categoryHref = `/${category}`

  return (
    <section className="mt-16 pt-10 border-t border-neutral-100 dark:border-neutral-800">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-lg font-bold text-neutral-950 dark:text-neutral-100">
          延伸閱讀
        </h2>
        <Link
          href={categoryHref}
          className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
        >
          更多{categoryLabel} →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {related.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}
