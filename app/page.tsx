import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'CAM Savant 官方網站｜復健醫學・運動醫學・功能醫學',
  },
  alternates: { canonical: '/' },
}

import Hero from '@/components/Hero'
import ArticleCard from '@/components/ArticleCard'
import FeaturedReadingList from '@/components/FeaturedReadingList'
import { getPublicPosts } from '@/lib/posts'
import Link from 'next/link'

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://camsavant.com/#website',
  url: 'https://camsavant.com/',
  name: 'CAM Savant',
  alternateName: ['CAMsavant', 'CAM SAVANT', 'camsavant.com'],
  publisher: {
    '@id': 'https://camsavant.com/#organization',
  },
}

export default function HomePage() {
  const allPosts = getPublicPosts()

  if (allPosts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-neutral-500 text-sm">尚無文章。</p>
      </div>
    )
  }

  const [heroPost, ...rest] = allPosts
  const latestPosts = rest.slice(0, 4)    // 最新 4 篇（Hero 以外）
  const featuredList = allPosts.slice(0, 6) // 精選閱讀前 6 篇

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ── Hero ── */}
      <Hero post={heroPost} />

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">

          {/* ── Latest articles (2/3) ── */}
          <section className="lg:col-span-2">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
                最新文章
              </h2>
              <Link
                href="/posts"
                className="text-xs text-neutral-500 hover:text-neutral-950 transition-colors"
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
          <aside className="lg:border-l lg:border-neutral-100 dark:lg:border-neutral-800 lg:pl-12">
            <FeaturedReadingList posts={featuredList} />
          </aside>

        </div>
      </div>

      {/* ── Brand identity ── */}
      <section
        aria-labelledby="cam-savant-introduction"
        className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent-700 dark:text-accent-400">
            Integrative Medical Knowledge
          </p>
          <h1
            id="cam-savant-introduction"
            className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-100"
          >
            CAM Savant
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-neutral-600 dark:text-neutral-400">
            CAM Savant（CAMsavant）是由醫療專業團隊建立的整合醫學知識平台，專注於復健醫學、運動醫學、功能醫學與輔助醫學。
          </p>
        </div>
      </section>
    </>
  )
}
