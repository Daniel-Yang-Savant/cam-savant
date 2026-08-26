import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
// next-mdx-remote v6: MDXRemote 仍從 /rsc 匯入，API 向下相容
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  CATEGORY_LABELS,
  PROTECTED_CATEGORIES,
  getPostBySlug,
  getPublicSlugs,
} from '@/lib/posts'
import Breadcrumbs from '@/components/Breadcrumbs'
import BookmarkButton from '@/components/BookmarkButton'
import ConsultForm from '@/components/ConsultForm'
import ReadingProgress from '@/components/ReadingProgress'
import TableOfContents from '@/components/TableOfContents'
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/schema'
import { extractFAQsFromMDX } from '@/lib/extract-faqs'
import RelatedArticles from '@/components/RelatedArticles'
import AuthorCard from '@/components/AuthorCard'
import ArticleTakeaways from '@/components/ArticleTakeaways'
import ContextualCareCTA from '@/components/ContextualCareCTA'
import { getReadingTime } from '@/lib/reading-time'
import { getTagHref } from '@/lib/tags'
import { injectContextualCareCTA } from '@/lib/article-enhancements'

interface Props {
  params: Promise<{ slug: string }>
}

// ── Static params ──────────────────────────────────────────────────────────

export function generateStaticParams() {
  return getPublicSlugs()
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
    return <h2 id={id} className="scroll-mt-24">{children}</h2>
  },
  h3: ({ children }: { children?: React.ReactNode }) => {
    const id = slugify(String(children ?? ''))
    return <h3 id={id} className="scroll-mt-24">{children}</h3>
  },
  ContextualCareCTA: () => <ContextualCareCTA />,
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  if (PROTECTED_CATEGORIES.includes(post.frontmatter.category)) {
    return {
      alternates: {
        canonical: `/perioperative-rehab/${slug}`,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const ogImage =
    post.frontmatter.coverImage ||
    '/images/og-default.png'

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    alternates: {
      canonical: `/posts/${slug}`,
    },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
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
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()
  if (PROTECTED_CATEGORIES.includes(post.frontmatter.category)) {
    permanentRedirect(`/perioperative-rehab/${slug}`)
  }

  const { frontmatter, content } = post!
  const categoryLabel = CATEGORY_LABELS[frontmatter.category] ?? frontmatter.category
  const categoryHref  = `/${frontmatter.category}`
  const formattedDate = format(new Date(frontmatter.date), 'yyyy年M月d日', {
    locale: zhTW,
  })
  const formattedModifiedDate = frontmatter.lastModified
    ? format(new Date(frontmatter.lastModified), 'yyyy年M月d日', { locale: zhTW })
    : null

  const BASE_URL = 'https://camsavant.com'
  const readingTime = getReadingTime(content)
  const faqs = extractFAQsFromMDX(content)
  const faqSchema = generateFAQSchema(faqs)
  const enhancedContent = injectContextualCareCTA(content)

  return (
    <>
      {/* ── JSON-LD: MedicalWebPage + BreadcrumbList + FAQ + Speakable ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...generateArticleSchema({
              title: frontmatter.title,
              excerpt: frontmatter.excerpt,
              date: frontmatter.date,
              slug: post!.slug,
              category: frontmatter.category,
              author: frontmatter.author,
              coverImage: frontmatter.coverImage,
              lastModified: frontmatter.lastModified,
            }),
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['article h1', 'article header p', 'article .prose h2', 'article .prose > p:first-of-type'],
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首頁', url: BASE_URL },
              { name: categoryLabel, url: `${BASE_URL}/${frontmatter.category}` },
              { name: frontmatter.title, url: `${BASE_URL}/posts/${post!.slug}` },
            ])
          ),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

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
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: '首頁', href: '/' },
              { label: categoryLabel, href: categoryHref },
              { label: frontmatter.title },
            ]}
          />

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

            <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-neutral-400 dark:text-neutral-500">
                  發布：
                  <time className="font-mono" dateTime={frontmatter.date}>
                    {formattedDate}
                  </time>
                </span>
                {formattedModifiedDate && frontmatter.lastModified && (
                  <>
                    <span className="text-sm text-neutral-300 dark:text-neutral-600">·</span>
                    <span className="text-sm text-neutral-400 dark:text-neutral-500">
                      最後更新：
                      <time className="font-mono" dateTime={frontmatter.lastModified}>
                        {formattedModifiedDate}
                      </time>
                    </span>
                  </>
                )}
                {frontmatter.author && (
                  <span className="text-sm text-neutral-400 dark:text-neutral-500">
                    {frontmatter.author}
                  </span>
                )}
                <span className="text-sm text-neutral-400 dark:text-neutral-500">·</span>
                <span className="text-sm text-neutral-400 dark:text-neutral-500">約 {readingTime} 分鐘閱讀</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Bookmark button */}
                <BookmarkButton slug={post!.slug} />
                {/* LINE share button */}
                <a
                  href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(`${BASE_URL}/posts/${post!.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="分享到 LINE"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#06C755] text-[#06C755] text-xs font-semibold hover:bg-[#06C755] hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  分享
                </a>
                {/* Facebook share button */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${BASE_URL}/posts/${post!.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="分享到 Facebook"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1877F2] text-[#1877F2] text-xs font-semibold hover:bg-[#1877F2] hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  分享
                </a>
                <Link
                  href={categoryHref}
                  className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-accent-50 dark:bg-accent-950 text-accent-700 dark:text-accent-400 border border-accent-200 dark:border-accent-800 hover:bg-accent-700 hover:text-white hover:border-accent-700 dark:hover:bg-accent-500 dark:hover:text-neutral-950 transition-colors"
                >
                  {categoryLabel}
                </Link>
              </div>
            </div>

            {/* Tags */}
            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {frontmatter.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={getTagHref(tag)}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <ArticleTakeaways takeaways={frontmatter.takeaways} />

          {/* Mobile table of contents */}
          <div className="mb-8 lg:hidden">
            <TableOfContents collapsible />
          </div>

          {/* MDX content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <MDXRemote source={enhancedContent} components={mdxComponents} />
          </div>

          {/* Author card（E-E-A-T） */}
          <AuthorCard author={frontmatter.author} />

          {/* Consultation form */}
          <ConsultForm articleTitle={frontmatter.title} />

          {/* Related articles */}
          <RelatedArticles currentSlug={post!.slug} category={frontmatter.category} tags={frontmatter.tags} />

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
