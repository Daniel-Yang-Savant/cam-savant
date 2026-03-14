import type { Metadata } from 'next'
import { getPostsByCategory, CATEGORY_DESCRIPTIONS } from '@/lib/posts'
import PostList from '@/components/PostList'

export const metadata: Metadata = {
  title: '運動醫學',
  description: CATEGORY_DESCRIPTIONS['sports-medicine'],
}

export default function SportsMedicinePage() {
  const posts = getPostsByCategory('sports-medicine')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <div className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
          Category
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950">運動醫學</h1>
        <p className="mt-2 text-neutral-500 max-w-xl">
          {CATEGORY_DESCRIPTIONS['sports-medicine']}
        </p>
      </div>

      <PostList posts={posts} activeCategory="sports-medicine" />
    </div>
  )
}
