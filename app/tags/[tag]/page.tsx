import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllTags, getPostsByTag, CATEGORY_LABELS } from '@/lib/posts'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import CoverImage from '@/components/CoverImage'

interface Props {
  params: { tag: string }
}

export function generateStaticParams() {
  // 回傳原始值即可，Next.js 會自動做 URL 編碼；
  // 若先 encodeURIComponent 會被雙重編碼，導致頁面 404 + noindex（GSC "Excluded by noindex"）
  return getAllTags().map(({ tag }) => ({ tag }))
}

export function generateMetadata({ params }: Props): Metadata {
  const tag = decodeURIComponent(params.tag)
  return {
    title: `#${tag}`,
    description: `所有標記「${tag}」的文章 — CAM Savant 醫療知識庫`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
  }
}

export default function TagPage({ params }: Props) {
  const tag = decodeURIComponent(params.tag)
  const posts = getPostsByTag(tag)

  if (posts.length === 0) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

      {/* Header */}
      <div className="mb-10">
        <Link
          href="/"
          className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          ← 返回首頁
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-bold text-neutral-950 dark:text-neutral-100">
            #{tag}
          </span>
          <span className="text-sm text-neutral-400 dark:text-neutral-500">
            {posts.length} 篇文章
          </span>
        </div>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          所有標記「{tag}」的文章
        </p>
      </div>

      {/* Article grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const { slug, frontmatter } = post
          const categoryLabel = CATEGORY_LABELS[frontmatter.category] ?? frontmatter.category
          const formattedDate = format(new Date(frontmatter.date), 'yyyy年M月d日', { locale: zhTW })

          return (
            <Link
              key={slug}
              href={`/posts/${slug}`}
              className="group flex flex-col rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
            >
              {/* Cover */}
              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {frontmatter.coverImage ? (
                  <CoverImage
                    src={frontmatter.coverImage}
                    alt={frontmatter.title}
                    categoryLabel={categoryLabel}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    imageClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center">
                    <span className="text-xs text-neutral-500 uppercase tracking-widest">{categoryLabel}</span>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col flex-1 p-4 gap-2">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                  {categoryLabel}
                </span>
                <h2 className="text-sm font-bold text-neutral-950 dark:text-neutral-100 leading-snug group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2">
                  {frontmatter.title}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2 flex-1">
                  {frontmatter.excerpt}
                </p>
                <time className="text-xs text-neutral-400 dark:text-neutral-500 mt-auto pt-2">
                  {formattedDate}
                </time>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
