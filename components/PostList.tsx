import Link from 'next/link'
import clsx from 'clsx'
import ArticleCard from './ArticleCard'
import type { Post } from '@/lib/posts'

interface PostListProps {
  posts: Post[]
  activeCategory?: string
}

const CATEGORY_TABS = [
  { key: 'all',                 href: '/posts',              label: '全部'   },
  { key: 'sports-medicine',     href: '/sports-medicine',    label: '運動醫學' },
  { key: 'functional-medicine', href: '/functional-medicine',label: '功能醫學' },
  { key: 'fsm',                 href: '/fsm',                label: 'FSM'   },
]

export default function PostList({
  posts,
  activeCategory = 'all',
}: PostListProps) {
  return (
    <div>
      {/* ── Category filter ── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORY_TABS.map(({ key, href, label }) => (
          <Link
            key={key}
            href={href}
            className={clsx(
              'px-4 py-1.5 text-xs tracking-widest uppercase font-medium border transition-colors',
              activeCategory === key
                ? 'bg-neutral-950 text-white border-neutral-950 dark:bg-neutral-100 dark:text-neutral-950 dark:border-neutral-100'
                : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── Grid ── */}
      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-neutral-400 dark:text-neutral-500 text-sm">此分類目前尚無文章。</p>
        </div>
      )}
    </div>
  )
}
