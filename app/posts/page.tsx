import type { Metadata } from 'next'
import { getPublicPosts } from '@/lib/posts'
import PostList from '@/components/PostList'
import Pagination from '@/components/Pagination'
import Breadcrumbs from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: '所有文章',
  description: '瀏覽所有運動醫學、功能醫學與 FSM 相關文章',
}

const POSTS_PER_PAGE = 12

interface Props {
  searchParams: { page?: string }
}

export default function PostsPage({ searchParams }: Props) {
  const allPosts = getPublicPosts()
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
  const currentPage = Math.min(
    Math.max(1, parseInt(searchParams.page ?? '1') || 1),
    Math.max(totalPages, 1)
  )
  const paginatedPosts = allPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

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
      <div className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
          Articles
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
          所有文章
        </h1>
        <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
          共 {allPosts.length} 篇 · 第 {currentPage} / {totalPages} 頁
        </p>
      </div>

      <PostList posts={paginatedPosts} activeCategory="all" />

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/posts" />
    </div>
  )
}
