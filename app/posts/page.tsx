import type { Metadata } from 'next'
import { getPublicPosts, getAllTags } from '@/lib/posts'
import Breadcrumbs from '@/components/Breadcrumbs'
import PostsClient from '@/components/PostsClient'

export const metadata: Metadata = {
  alternates: { canonical: '/posts' },
  title: '所有文章',
  description: '瀏覽所有運動醫學、功能醫學與 FSM 相關文章',
}

export default function PostsPage() {
  const allPosts = getPublicPosts()
  const allTags = getAllTags()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      {/* ── Breadcrumbs ── */}
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: '首頁', href: '/' },
          { label: '所有文章' },
        ]}
      />

      {/* ── Page header ── */}
      <div className="mb-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
          Articles
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
          所有文章
        </h1>
        <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
          共 {allPosts.length} 篇
        </p>
      </div>

      {/* ── Client component: tag filter + pagination ── */}
      <PostsClient allPosts={allPosts} allTags={allTags} />
    </div>
  )
}
