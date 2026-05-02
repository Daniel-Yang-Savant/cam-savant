import Link from 'next/link'
import { getPostsByCategory, CATEGORY_LABELS } from '@/lib/posts'
import ArticleCard from '@/components/ArticleCard'

interface RelatedArticlesProps {
  currentSlug: string
  category: string
}

export default function RelatedArticles({ currentSlug, category }: RelatedArticlesProps) {
  const related = getPostsByCategory(category)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 3)

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
