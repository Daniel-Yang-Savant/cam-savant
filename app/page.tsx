import Hero from '@/components/Hero'
import ArticleCard from '@/components/ArticleCard'
import FeaturedReadingList from '@/components/FeaturedReadingList'
import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'

export default function HomePage() {
  const allPosts = getAllPosts()

  if (allPosts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-neutral-400 text-sm">尚無文章。</p>
      </div>
    )
  }

  const [heroPost, ...rest] = allPosts
  const latestPosts = rest.slice(0, 4)    // 最新 4 篇（Hero 以外）
  const featuredList = allPosts.slice(0, 6) // 精選閱讀前 6 篇

  return (
    <>
      {/* ── Hero ── */}
      <Hero post={heroPost} />

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">

          {/* ── Latest articles (2/3) ── */}
          <section className="lg:col-span-2">
            <div className="flex items-baseline justify-between mb-7">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
                最新文章
              </h2>
              <Link
                href="/posts"
                className="text-xs text-neutral-400 hover:text-neutral-950 transition-colors"
              >
                更多 →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
              {latestPosts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </section>

          {/* ── Featured reading list (1/3) ── */}
          <aside className="lg:border-l lg:border-neutral-100 lg:pl-12">
            <FeaturedReadingList posts={featuredList} />
          </aside>

        </div>
      </div>
    </>
  )
}
