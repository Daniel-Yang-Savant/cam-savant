import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import type { Post } from '@/lib/posts'
import { CATEGORY_LABELS } from '@/lib/posts'

interface ArticleCardProps {
  post: Post
  /** 較大的卡片版型，用於首頁 featured 等場景 */
  large?: boolean
}

export default function ArticleCard({ post, large = false }: ArticleCardProps) {
  const { slug, frontmatter } = post
  const categoryLabel = CATEGORY_LABELS[frontmatter.category] ?? frontmatter.category
  const formattedDate = format(new Date(frontmatter.date), 'yyyy.MM.dd', {
    locale: zhTW,
  })

  return (
    <article className="group flex flex-col">
      <Link href={`/posts/${slug}`} className="flex flex-col flex-1">

        {/* ── Cover image ── */}
        <div
          className={`relative overflow-hidden bg-neutral-100 ${
            large ? 'aspect-[16/9]' : 'aspect-[4/3]'
          }`}
        >
          {frontmatter.coverImage ? (
            <Image
              src={frontmatter.coverImage}
              alt={frontmatter.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs tracking-widest uppercase text-neutral-300">
                {categoryLabel}
              </span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="pt-4 flex flex-col flex-1">
          {/* Category */}
          <span className="text-[0.65rem] tracking-widest uppercase font-medium text-neutral-400 mb-1.5">
            {categoryLabel}
          </span>

          {/* Title */}
          <h2
            className={`font-bold text-neutral-950 leading-snug group-hover:text-neutral-500 transition-colors ${
              large ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
            }`}
          >
            {frontmatter.title}
          </h2>

          {/* Excerpt */}
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed line-clamp-3 flex-1">
            {frontmatter.excerpt}
          </p>

          {/* Date */}
          <p className="mt-3 text-xs text-neutral-400 font-mono">{formattedDate}</p>
        </div>
      </Link>
    </article>
  )
}
