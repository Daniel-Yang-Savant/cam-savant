import type { Metadata } from 'next'
import { bilingualAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: {
    absolute: 'CAM Savant 官方網站｜復健醫學・運動醫學・功能醫學',
  },
  alternates: bilingualAlternates('/'),
}

import ArticleCard from '@/components/ArticleCard'
import ExerciseGuidesPromo from '@/components/ExerciseGuidesPromo'
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
  const focusedPosts = allPosts.filter((post) =>
    ['rehabilitation-medicine', 'sports-medicine'].includes(post.frontmatter.category)
  )

  if (focusedPosts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p className="text-neutral-500 text-sm">尚無文章。</p>
      </div>
    )
  }

  const latestPosts = focusedPosts.slice(0, 4) // 復健與運動傷害最新 4 篇

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* ── Visual exercise guides ── */}
      <ExerciseGuidesPromo />

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
              最新復健與運動傷害文章
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
      </div>

    </>
  )
}
