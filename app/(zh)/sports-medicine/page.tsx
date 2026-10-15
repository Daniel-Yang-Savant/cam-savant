import type { Metadata } from 'next'
import { getPostsByCategory, CATEGORY_DESCRIPTIONS } from '@/lib/posts'
import { generateCollectionPageSchema } from '@/lib/schema'
import { getPagination, type PageParameter } from '@/lib/pagination'
import PostList from '@/components/PostList'
import Pagination from '@/components/Pagination'
import Breadcrumbs from '@/components/Breadcrumbs'

const BASE_URL = 'https://camsavant.com'

interface Props {
  searchParams: Promise<{ page?: PageParameter }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams
  const { canonicalPath } = getPagination({
    page,
    totalItems: getPostsByCategory('sports-medicine').length,
    basePath: '/sports-medicine',
  })

  return {
    alternates: { canonical: canonicalPath },
    title: '運動醫學',
    description: CATEGORY_DESCRIPTIONS['sports-medicine'],
  }
}

export default async function SportsMedicinePage({ searchParams }: Props) {
  const { page } = await searchParams
  const allPosts = getPostsByCategory('sports-medicine')
  const { currentPage, totalPages, canonicalPath, startIndex, endIndex } = getPagination({
    page,
    totalItems: allPosts.length,
    basePath: '/sports-medicine',
  })
  const paginatedPosts = allPosts.slice(startIndex, endIndex)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateCollectionPageSchema({
              name: '運動醫學',
              description: CATEGORY_DESCRIPTIONS['sports-medicine'],
              url: `${BASE_URL}${canonicalPath}`,
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
            { label: '運動醫學' },
          ]}
        />

        <div className="mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            Category
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
            運動醫學
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-xl">
            {CATEGORY_DESCRIPTIONS['sports-medicine']}
          </p>
        </div>

        {allPosts.length > 0 ? (
          <>
            <PostList posts={paginatedPosts} activeCategory="sports-medicine" />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/sports-medicine" />
          </>
        ) : (
          <p className="text-neutral-500 text-sm">文章整備中，敬請期待。</p>
        )}
      </div>
    </>
  )
}
