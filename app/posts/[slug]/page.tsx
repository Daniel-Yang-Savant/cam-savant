import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
// next-mdx-remote v6: MDXRemote 仍從 /rsc 匯入，API 向下相容
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { getAllSlugs, getPostBySlug, CATEGORY_LABELS } from '@/lib/posts'
import ConsultForm from '@/components/ConsultForm'
import ReadingProgress from '@/components/ReadingProgress'
import TableOfContents from '@/components/TableOfContents'

interface Props {
  params: { slug: string }
}

// ── Static params ──────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllSlugs()
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

// ── Metadata ───────────────────────────────────────────────────────────────

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  const ogImage =
    post.frontmatter.coverImage ||
    `/images/covers/${post.frontmatter.category}.jpg`

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

// ── Page ───────────────────────────────────────────────────────────────────

export default async function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const { frontmatter, content } = post!
  const categoryLabel = CATEGORY_LABELS[frontmatter.category] ?? frontmatter.category
  const categoryHref  = `/${frontmatter.category}`
  const formattedDate = format(new Date(frontmatter.date), 'yyyy年M月d日', {
    locale: zhTW,
  })

  return (
    <>
      <ReadingProgress />

      {/* ── Cover image (full-width) ── */}
      {frontmatter.coverImage && (
        <div className="relative w-full aspect-[21/9] max-h-[520px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={frontmatter.coverImage}
            alt={frontmatter.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex gap-12">

        {/* ── Article column ── */}
        <article className="flex-1 min-w-0">

          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <Link href="/" className="hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">首頁</Link>
            <span>/</span>
            <Link href={categoryHref} className="hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">
              {categoryLabel}
            </Link>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <span className="text-[0.65rem] tracking-widest uppercase font-medium text-neutral-400 dark:text-neutral-500">
              {categoryLabel}
            </span>

            <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-950 dark:text-neutral-100 leading-tight">
              {frontmatter.title}
            </h1>

            <p className="mt-4 text-base md:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {frontmatter.excerpt}
            </p>

            <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <time className="text-sm text-neutral-400 dark:text-neutral-500 font-mono" dateTime={frontmatter.date}>
                {formattedDate}
              </time>
              <Link
                href={categoryHref}
                className="tag hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-colors dark:border-neutral-700 dark:text-neutral-400"
              >
                {categoryLabel}
              </Link>
            </div>
          </header>

          {/* MDX content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <MDXRemote source={content} components={mdxComponents} />
          </div>

          {/* Consultation form */}
          <ConsultForm articleTitle={frontmatter.title} />

          {/* Brand signature */}
          <div className="mt-12 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
              CAM Savant 醫療團隊 | 彰化・南投・台中・雲林 復健科・運動醫學・功能醫學
            </p>
          </div>

          {/* Back link */}
          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              href={categoryHref}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
            >
              ← 返回{categoryLabel}
            </Link>
          </div>
        </article>

        {/* ── Sidebar: Table of Contents ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <TableOfContents />
          </div>
        </aside>

      </div>
    </>
  )
}
