import Link from 'next/link'
import { format } from 'date-fns'
import type { Post } from '@/lib/posts'
import { CATEGORY_LABELS } from '@/lib/posts'

interface FeaturedReadingListProps {
  posts: Post[]
}

export default function FeaturedReadingList({ posts }: FeaturedReadingListProps) {
  return (
    <section>
      {/* ── Section header ── */}
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
          精選閱讀
        </h2>
        <Link
          href="/posts"
          className="text-xs text-neutral-400 hover:text-neutral-950 transition-colors"
        >
          所有文章 →
        </Link>
      </div>

      {/* ── List ── */}
      <ol className="divide-y divide-neutral-100">
        {posts.map((post, i) => {
          const categoryLabel =
            CATEGORY_LABELS[post.frontmatter.category] ?? post.frontmatter.category
          const dateStr = format(new Date(post.frontmatter.date), 'yyyy.MM.dd')

          return (
            <li key={post.slug} className="py-4">
              <Link href={`/posts/${post.slug}`} className="group flex items-start gap-4">
                {/* Number */}
                <span className="shrink-0 w-5 text-right text-[0.65rem] font-mono text-neutral-300 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 group-hover:text-neutral-500 transition-colors leading-snug">
                    {post.frontmatter.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2.5">
                    <span className="text-xs text-neutral-400">{categoryLabel}</span>
                    <span className="text-neutral-300 text-xs">·</span>
                    <span className="text-xs text-neutral-400 font-mono">{dateStr}</span>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
