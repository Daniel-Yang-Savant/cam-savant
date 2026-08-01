import type { Metadata } from 'next'
import { getPostsByCategory, CATEGORY_DESCRIPTIONS } from '@/lib/posts'
import { generateCollectionPageSchema } from '@/lib/schema'
import PostList from '@/components/PostList'

const BASE_URL = 'https://cam-savant.vercel.app'

export const metadata: Metadata = {
  title: '功能醫學',
  description: CATEGORY_DESCRIPTIONS['functional-medicine'],
}

export default function FunctionalMedicinePage() {
  const posts = getPostsByCategory('functional-medicine')

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
        <div className="mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
            Category
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">功能醫學</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 max-w-xl">
            {CATEGORY_DESCRIPTIONS['functional-medicine']}
          </p>
        </div>

        <PostList posts={posts} activeCategory="functional-medicine" />
      </div>
    </>
  )
}
