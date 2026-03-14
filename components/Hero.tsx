import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import type { Post } from '@/lib/posts'
import { CATEGORY_LABELS } from '@/lib/posts'

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
    <section className="border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <Link href={`/posts/${slug}`} className="group block">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-20 items-center">

            {/* ── Cover image ── */}
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 order-2 md:order-1">
              {frontmatter.coverImage ? (
                <Image
                  src={frontmatter.coverImage}
                  alt={frontmatter.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                /* Placeholder when no cover image */
                <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
                  <span className="text-xs tracking-widest uppercase text-neutral-300">
                    {categoryLabel}
                  </span>
                </div>
              )}
            </div>

            {/* ── Text ── */}
            <div className="order-1 md:order-2">
              <p className="text-xs tracking-widest uppercase font-medium text-neutral-400 mb-3">
                精選文章 &middot; {categoryLabel}
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold text-neutral-950 leading-tight group-hover:text-neutral-600 transition-colors">
                {frontmatter.title}
              </h1>

              <p className="mt-5 text-base md:text-lg text-neutral-500 leading-relaxed">
                {frontmatter.excerpt}
              </p>

              <div className="mt-7 flex items-center gap-5">
                <span className="text-sm font-semibold text-neutral-950 group-hover:text-neutral-600 transition-colors flex items-center gap-1.5">
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
                <span className="text-xs text-neutral-400">{formattedDate}</span>
              </div>
            </div>

          </div>
        </Link>
      </div>
    </section>
  )
}
