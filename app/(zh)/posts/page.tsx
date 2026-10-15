import type { Metadata } from 'next'
import { getPublicPosts, getIndexableTags } from '@/lib/posts'
import Breadcrumbs from '@/components/Breadcrumbs'
import PostsClient from '@/components/PostsClient'
import { createPublicArticleSummaries } from '@/lib/article-discovery'
import { getPagination, type PageParameter } from '@/lib/pagination'

interface Props {
  searchParams: Promise<{ page?: PageParameter }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams
  const { canonicalPath } = getPagination({
    page,
    totalItems: createPublicArticleSummaries(getPublicPosts()).length,
    basePath: '/posts',
  })

  return {
    alternates: { canonical: canonicalPath },
    title: '所有文章',
    description: '瀏覽所有運動醫學、功能醫學與 FSM 相關文章',
  }
}

export default async function PostsPage({ searchParams }: Props) {
  const { page } = await searchParams
  const allPosts = createPublicArticleSummaries(getPublicPosts())
  const allTags = getIndexableTags()
  const { currentPage } = getPagination({
    page,
    totalItems: allPosts.length,
    basePath: '/posts',
  })

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

      {/* The requested page is rendered before client-side tag filtering. */}
      <PostsClient allPosts={allPosts} allTags={allTags} currentPage={currentPage} />
    </div>
  )
}
