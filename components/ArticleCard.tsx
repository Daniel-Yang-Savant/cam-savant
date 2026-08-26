import Link from 'next/link'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import type { Post } from '@/lib/posts'
import { CATEGORY_LABELS } from '@/lib/category'
import CoverImage from '@/components/CoverImage'
import { getReadingTime } from '@/lib/reading-time'

interface ArticleCardProps {
  post: Post
  /** 較大的卡片版型，用於首頁 featured 等場景 */
  large?: boolean
}

export default function ArticleCard({ post, large = false }: ArticleCardProps) {
  const { slug, frontmatter, content } = post
  const categoryLabel = CATEGORY_LABELS[frontmatter.category] ?? frontmatter.category
  const formattedDate = format(new Date(frontmatter.date), 'yyyy.MM.dd', {
    locale: zhTW,
  })
  const readingTime = getReadingTime(content)

  return (
    <article className="group flex flex-col">
      <Link href={`/posts/${slug}`} className="flex flex-col flex-1">

        {/* ── Cover image ── */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {frontmatter.coverImage ? (
            <CoverImage
              src={frontmatter.coverImage}
              alt={frontmatter.title}
              categoryLabel={categoryLabel}
              sizes={
                large
                  ? '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 800px'
                  : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              }
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-accent-900 flex flex-col items-center justify-center gap-2">
              <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="text-xs text-neutral-500 tracking-widest uppercase font-medium">{categoryLabel}</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="pt-4 flex flex-col flex-1">
          {/* Category */}
          <span className="text-[0.65rem] tracking-widest uppercase font-medium text-neutral-500 dark:text-neutral-500 mb-1.5">
            {categoryLabel}
          </span>

          {/* Title */}
          <h2
            className={`font-bold text-neutral-950 dark:text-neutral-100 leading-snug group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors ${
              large ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
            }`}
          >
            {frontmatter.title}
          </h2>

          {/* Excerpt */}
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3 flex-1">
            {frontmatter.excerpt}
          </p>

          {/* Date + reading time */}
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-500 font-mono">
            <span>{formattedDate}</span>
            <span>·</span>
            <span>約 {readingTime} 分鐘</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
