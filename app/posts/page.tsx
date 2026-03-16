import type { Metadata } from 'next'
import { getPublicPosts } from '@/lib/posts'
import PostList from '@/components/PostList'

export const metadata: Metadata = {
  title: '所有文章',
  description: '瀏覽所有運動醫學、功能醫學與 FSM 相關文章',
}

export default function PostsPage() {
  const posts = getPublicPosts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      {/* ── Page header ── */}
      <div className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
          Articles
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
          所有文章
        </h1>
      </div>

      <PostList posts={posts} activeCategory="all" />
    </div>
  )
}
