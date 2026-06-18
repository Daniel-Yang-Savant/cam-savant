import Link from 'next/link'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import type { Post } from '@/lib/posts'
import { CATEGORY_LABELS } from '@/lib/posts'
import CoverImage from '@/components/CoverImage'
import LineFollow from '@/components/LineFollow'

interface HeroProps {
  post: Post
}

export default function Hero({ post }: HeroProps) {
  const { slug, frontmatter } = post
  const categoryLabel = CATEGORY_LABELS[frontmatter.category] ?? frontmatter.category
  const formattedDate = format(new Date(frontmatter.date), 'yyyy年M月d日', {
    locale: zhTW,
  })

  return (
    <section className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <Link href={`/posts/${slug}`} className="group block">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* ── Cover image ── */}
            <div className="relative aspect-[4/3] overflow-hidden order-2 md:order-1">
              {frontmatter.coverImage ? (
                <CoverImage
                  src={frontmatter.coverImage}
                  alt={frontmatter.title}
                  categoryLabel={categoryLabel}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-accent-900 flex flex-col items-center justify-center gap-3">
                  <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                  <span className="text-xs text-neutral-500 tracking-widest uppercase font-medium">{categoryLabel}</span>
                </div>
              )}
            </div>

            {/* ── Text ── */}
            <div className="order-1 md:order-2">
              <p className="text-xs tracking-widest uppercase font-medium text-neutral-500 mb-3">
                精選文章 &middot; {categoryLabel}
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold text-neutral-950 dark:text-neutral-100 leading-tight group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                {frontmatter.title}
              </h1>

              <p className="mt-5 text-base md:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {frontmatter.excerpt}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <span className="text-sm font-semibold text-accent-700 dark:text-accent-400 group-hover:text-accent-600 dark:group-hover:text-accent-300 transition-colors flex items-center gap-1.5">
                  閱讀文章
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
                <span className="text-xs text-neutral-500">{formattedDate}</span>
              </div>
            </div>

          </div>
        </Link>

        {/* ── LINE CTA ── */}
        <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              追蹤楊育愷醫師官方 LINE
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              門診提醒、衛教新知與線上諮詢，加入好友不漏接。
            </p>
          </div>
          <div className="flex-shrink-0">
            <LineFollow card={false} />
          </div>
        </div>
      </div>
    </section>
  )
}
