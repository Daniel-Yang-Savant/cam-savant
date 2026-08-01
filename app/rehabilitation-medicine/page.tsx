import type { Metadata } from 'next'
import { getPostsByCategory, CATEGORY_DESCRIPTIONS } from '@/lib/posts'
import { generateCollectionPageSchema } from '@/lib/schema'
import PostList from '@/components/PostList'
import Pagination from '@/components/Pagination'
import Breadcrumbs from '@/components/Breadcrumbs'

const BASE_URL = 'https://camsavant.com'
const POSTS_PER_PAGE = 12

export const metadata: Metadata = {
  alternates: { canonical: '/rehabilitation-medicine' },
  title: '復健醫學',
  description: CATEGORY_DESCRIPTIONS['rehabilitation-medicine'],
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function RehabMedicinePage({ searchParams }: Props) {
  const { page } = await searchParams
  const allPosts = getPostsByCategory('rehabilitation-medicine')
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
              name: '復健醫學',
              description: CATEGORY_DESCRIPTIONS['rehabilitation-medicine'],
              url: `${BASE_URL}/rehabilitation-medicine`,
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
