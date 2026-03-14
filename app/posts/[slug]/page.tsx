import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { getAllSlugs, getPostBySlug, CATEGORY_LABELS } from '@/lib/posts'

interface Props {
  params: { slug: string }
}

// ── Static params ──────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getAllSlugs()
}

// ── Metadata ───────────────────────────────────────────────────────────────

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      images: post.frontmatter.coverImage
        ? [post.frontmatter.coverImage]
        : [],
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
    <article>
      {/* ── Cover image ── */}
      {frontmatter.coverImage && (
        <div className="relative w-full aspect-[21/9] max-h-[520px] overflow-hidden bg-neutral-100">
          <Image
            src={frontmatter.coverImage}
            alt={frontmatter.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* ── Breadcrumb ── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-neutral-950 transition-colors">首頁</Link>
          <span>/</span>
          <Link href={categoryHref} className="hover:text-neutral-950 transition-colors">
            {categoryLabel}
          </Link>
        </nav>

        {/* ── Header ── */}
        <header className="mb-12">
          <span className="text-[0.65rem] tracking-widest uppercase font-medium text-neutral-400">
            {categoryLabel}
          </span>

          <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-950 leading-tight">
            {frontmatter.title}
          </h1>

          <p className="mt-4 text-base md:text-lg text-neutral-500 leading-relaxed">
            {frontmatter.excerpt}
          </p>

          <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-between">
            <time className="text-sm text-neutral-400 font-mono" dateTime={frontmatter.date}>
              {formattedDate}
            </time>
            <Link
              href={categoryHref}
              className="tag hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-colors"
            >
              {categoryLabel}
            </Link>
          </div>
        </header>

        {/* ── MDX content ── */}
        <div className="prose prose-neutral max-w-none">
          <MDXRemote source={content} />
        </div>

        {/* ── Back link ── */}
        <div className="mt-16 pt-8 border-t border-neutral-100">
          <Link
            href={categoryHref}
            className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            ← 返回{categoryLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}
