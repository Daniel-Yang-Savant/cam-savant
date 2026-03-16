import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { getPostBySlug, getPostsByCategory } from '@/lib/posts'
import ConsultForm from '@/components/ConsultForm'
import ReadingProgress from '@/components/ReadingProgress'
import TableOfContents from '@/components/TableOfContents'
import PrintButton from '@/components/PrintButton'

interface Props {
  params: { slug: string }
}

// ── Static params ───────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getPostsByCategory('perioperative-rehab').map((post) => ({
    slug: post.slug,
  }))
}

// ── Custom heading components (add id for ToC anchors) ─────────────────────

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
}

const mdxComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => {
    const id = slugify(String(children ?? ''))
    return <h2 id={id}>{children}</h2>
  },
  h3: ({ children }: { children?: React.ReactNode }) => {
    const id = slugify(String(children ?? ''))
    return <h3 id={id}>{children}</h3>
  },
}

// ── Metadata ────────────────────────────────────────────────────────────────

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post || post.frontmatter.category !== 'perioperative-rehab') return {}

  const ogImage =
    post.frontmatter.coverImage || '/images/covers/perioperative-rehab.jpg'

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 800,
          alt: post.frontmatter.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
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
    <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900">
      <ReadingProgress />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 flex gap-12">

        {/* ── Article column ── */}
        <div className="flex-1 min-w-0">

          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <Link href="/" className="hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">
              首頁
            </Link>
            <span>/</span>
            <Link
              href="/perioperative-rehab"
              className="hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
            >
              術後復健
            </Link>
          </nav>

          {/* Article card */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm px-8 py-10 md:px-12 md:py-14">

            {/* Article header */}
            <header className="mb-8">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold text-neutral-400 dark:text-neutral-500">
                Perioperative Rehabilitation
              </span>

              <h1 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-950 dark:text-neutral-100 leading-tight">
                {frontmatter.title}
              </h1>

              <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {frontmatter.excerpt}
              </p>

              <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <time
                    className="text-sm text-neutral-400 dark:text-neutral-500 font-mono"
                    dateTime={frontmatter.date}
                  >
                    {formattedDate}
                  </time>
                  {frontmatter.author && (
                    <span className="text-sm text-neutral-400 dark:text-neutral-500">
                      {frontmatter.author}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600">
                  術後復健
                </span>
              </div>
            </header>

            {/* Print button */}
            <PrintButton />

            {/* MDX content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <MDXRemote source={content} components={mdxComponents} />
            </div>

            {/* Consultation form */}
            <ConsultForm articleTitle={frontmatter.title} />

            {/* Brand signature */}
            <div className="mt-12 pt-6 border-t border-neutral-100 dark:border-neutral-700 text-center">
              <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
                CAM Savant 醫療團隊 | 彰化・南投・台中・雲林 復健科・運動醫學・功能醫學
              </p>
            </div>

            {/* Back link */}
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-700">
              <Link
                href="/perioperative-rehab"
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
              >
                ← 返回術後復健
              </Link>
            </div>
          </div>

        </div>

        {/* ── Sidebar: Table of Contents ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </aside>

      </div>
    </div>
  )
}
