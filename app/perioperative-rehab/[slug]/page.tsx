import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { getPostBySlug, getPostsByCategory } from '@/lib/posts'

interface Props {
  params: { slug: string }
}

// ── Static params ───────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getPostsByCategory('perioperative-rehab').map((post) => ({
    slug: post.slug,
  }))
}

// ── Metadata ────────────────────────────────────────────────────────────────

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post || post.frontmatter.category !== 'perioperative-rehab') return {}
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      images: post.frontmatter.coverImage ? [post.frontmatter.coverImage] : [],
    },
  }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function PerioperativeRehabArticlePage({ params }: Props) {
  const post = getPostBySlug(params.slug)

  // Only render MDX articles that belong to this category
  if (!post || post.frontmatter.category !== 'perioperative-rehab') {
    notFound()
  }

  const { frontmatter, content } = post
  const formattedDate = format(new Date(frontmatter.date), 'yyyy年M月d日', {
    locale: zhTW,
  })

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

        {/* ── Breadcrumb ── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-950 transition-colors">
            首頁
          </Link>
          <span>/</span>
          <Link
            href="/perioperative-rehab"
            className="hover:text-neutral-950 transition-colors"
          >
            術後復健
          </Link>
        </nav>

        {/* ── Article card ── */}
        <div className="bg-white rounded-2xl shadow-sm px-8 py-10 md:px-12 md:py-14">

          {/* ── Article header ── */}
          <header className="mb-10">
            <span className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold text-neutral-400">
              Perioperative Rehabilitation
            </span>

            <h1 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-950 leading-tight">
              {frontmatter.title}
            </h1>

            <p className="mt-4 text-base text-neutral-500 leading-relaxed">
              {frontmatter.excerpt}
            </p>

            <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <time
                  className="text-sm text-neutral-400 font-mono"
                  dateTime={frontmatter.date}
                >
                  {formattedDate}
                </time>
                {frontmatter.author && (
                  <span className="text-sm text-neutral-400">
                    {frontmatter.author}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                術後復健
              </span>
            </div>
          </header>

          {/* ── MDX content ── */}
          <div className="prose prose-neutral max-w-none">
            <MDXRemote source={content} />
          </div>

          {/* ── Brand signature ── */}
          <div className="mt-12 pt-6 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-400 leading-relaxed">
              CAM Savant 醫療團隊 | 彰化・南投・台中・雲林 復健科・運動醫學・功能醫學
            </p>
          </div>

          {/* ── Back link ── */}
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <Link
              href="/perioperative-rehab"
              className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors"
            >
              ← 返回術後復健
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
