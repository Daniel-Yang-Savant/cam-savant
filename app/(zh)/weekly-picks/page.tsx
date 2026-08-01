import type { Metadata } from 'next'
import { getPostsByCategory, CATEGORY_DESCRIPTIONS } from '@/lib/posts'
import { generateCollectionPageSchema } from '@/lib/schema'
import PostList from '@/components/PostList'
import Pagination from '@/components/Pagination'
import Breadcrumbs from '@/components/Breadcrumbs'

const BASE_URL = 'https://camsavant.com'
const POSTS_PER_PAGE = 12

export const metadata: Metadata = {
  alternates: { canonical: '/weekly-picks' },
  title: '每週論文精選',
  description: CATEGORY_DESCRIPTIONS['weekly-picks'],
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function WeeklyPicksPage({ searchParams }: Props) {
  const { page } = await searchParams
  const allPosts = getPostsByCategory('weekly-picks')
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
  const currentPage = Math.min(
    Math.max(1, parseInt(page ?? '1') || 1),
    Math.max(totalPages, 1)
  )
  const paginatedPosts = allPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateCollectionPageSchema({
              name: '每週論文精選',
              description: CATEGORY_DESCRIPTIONS['weekly-picks'],
              url: `${BASE_URL}/weekly-picks`,
              specialty: 'SportsMedicine',
            })
          ),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: '首頁', href: '/' },
            { label: '每週論文精選' },
          ]}
        />

        <div className="mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            Category
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
            每週論文精選
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            這是每週更新的運動醫學與復健文獻掃描。我們固定追蹤 British Journal of
            Sports Medicine、American Journal of Sports Medicine、JOSPT、Orthopaedic
            Journal of Sports Medicine、PM&amp;R、BMC Sports Science, Medicine and
            Rehabilitation 等十餘本期刊過去一週的新發表，依臨床實用性與研究設計品質，
            挑出最值得一讀的幾篇，並以實證數據摘要重點，每篇均附 DOI 連結，方便延伸閱讀原文。
          </p>
        </div>

        {allPosts.length > 0 ? (
          <>
            <PostList posts={paginatedPosts} activeCategory="weekly-picks" />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/weekly-picks" />
          </>
        ) : (
          <p className="text-neutral-500 text-sm">文章整備中，敬請期待。</p>
        )}
      </div>
    </>
  )
}
