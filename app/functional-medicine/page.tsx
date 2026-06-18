import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostsByCategory, CATEGORY_DESCRIPTIONS } from '@/lib/posts'
import { generateCollectionPageSchema } from '@/lib/schema'
import PostList from '@/components/PostList'
import Pagination from '@/components/Pagination'
import Breadcrumbs from '@/components/Breadcrumbs'

const BASE_URL = 'https://camsavant.com'
const POSTS_PER_PAGE = 12

export const metadata: Metadata = {
  title: '功能醫學',
  description: CATEGORY_DESCRIPTIONS['functional-medicine'],
}

interface Props {
  searchParams: { page?: string }
}

export default function FunctionalMedicinePage({ searchParams }: Props) {
  const allPosts = getPostsByCategory('functional-medicine')
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateCollectionPageSchema({
              name: '功能醫學',
              description: CATEGORY_DESCRIPTIONS['functional-medicine'],
              url: `${BASE_URL}/functional-medicine`,
              specialty: 'InternalMedicine',
            })
          ),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: '首頁', href: '/' },
            { label: '功能醫學' },
          ]}
        />

        <div className="mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            Category
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
            功能醫學
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-xl">
            {CATEGORY_DESCRIPTIONS['functional-medicine']}
          </p>
        </div>

        {/* Supplement Recommender Tool Banner */}
        <Link
          href="/functional-medicine/supplement-recommender"
          className="group flex items-center gap-5 p-5 mb-10 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-2xl">
            💊
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-0.5">
              互動工具
            </p>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
              Metagenics 營養品推薦工具
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              輸入症狀，獲取個人化營養品前五名建議 →
            </p>
          </div>
          <div className="flex-shrink-0 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <PostList posts={paginatedPosts} activeCategory="functional-medicine" />
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/functional-medicine" />
      </div>
    </>
  )
}
