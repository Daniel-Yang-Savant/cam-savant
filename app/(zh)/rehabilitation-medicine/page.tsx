import { safeJsonLd } from '@/lib/safe-json'
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
    totalItems: getPostsByCategory('rehabilitation-medicine').length,
    basePath: '/rehabilitation-medicine',
  })

  return {
    alternates: { canonical: canonicalPath },
    title: '復健醫學',
    description: CATEGORY_DESCRIPTIONS['rehabilitation-medicine'],
  }
}

export default async function RehabMedicinePage({ searchParams }: Props) {
  const { page } = await searchParams
  const allPosts = getPostsByCategory('rehabilitation-medicine')
  const { currentPage, totalPages, canonicalPath, startIndex, endIndex } = getPagination({
    page,
    totalItems: allPosts.length,
    basePath: '/rehabilitation-medicine',
  })
  const paginatedPosts = allPosts.slice(startIndex, endIndex)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            generateCollectionPageSchema({
              name: '復健醫學',
              description: CATEGORY_DESCRIPTIONS['rehabilitation-medicine'],
              url: `${BASE_URL}${canonicalPath}`,
              specialty: 'PhysicalMedicineAndRehabilitation',
            })
          ),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: '首頁', href: '/' },
            { label: '復健醫學' },
          ]}
        />

        <div className="mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
            Category
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
            復健醫學
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-xl">
            {CATEGORY_DESCRIPTIONS['rehabilitation-medicine']}
          </p>
        </div>

        <PostList posts={paginatedPosts} activeCategory="rehabilitation-medicine" />
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/rehabilitation-medicine" />
      </div>
    </>
  )
}
