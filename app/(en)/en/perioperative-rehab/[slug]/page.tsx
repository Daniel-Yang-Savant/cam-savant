import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllEnglishPosts, getEnglishPostBySlug } from '@/lib/english-posts'
import { englishAlternates } from '@/lib/locales'
import ReadingProgress from '@/components/ReadingProgress'
import TableOfContents from '@/components/TableOfContents'
import PrintButton from '@/components/PrintButton'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getAllEnglishPosts().map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false

function slugify(text: string) {
  return String(text).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

const mdxComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => <h2 id={slugify(String(children ?? ''))}>{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 id={slugify(String(children ?? ''))}>{children}</h3>,
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getEnglishPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    alternates: englishAlternates(`/perioperative-rehab/${slug}`),
    robots: { index: false, follow: false },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      url: `/en/perioperative-rehab/${slug}`,
      locale: 'en_US',
    },
  }
}

export default async function EnglishPerioperativeArticlePage({ params }: Props) {
  const { slug } = await params
  const post = getEnglishPostBySlug(slug)
  if (!post) notFound()
  const { frontmatter, content } = post
  const formattedDate = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${frontmatter.date}T00:00:00Z`))

  return (
    <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900">
      <ReadingProgress />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 flex gap-12">
        <div className="flex-1 min-w-0">
          <nav className="mb-6 text-xs text-neutral-500 dark:text-neutral-400">
            <Link href="/en" className="hover:text-neutral-950 dark:hover:text-neutral-100">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/en/perioperative-rehab" className="hover:text-neutral-950 dark:hover:text-neutral-100">Postoperative Rehabilitation</Link>
            <span className="mx-2">/</span>
            <span>{frontmatter.title}</span>
          </nav>

          <article className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm px-8 py-10 md:px-12 md:py-14">
            <header className="mb-8">
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold text-neutral-400 dark:text-neutral-500">Patient Education · Postoperative Rehabilitation</span>
              <h1 className="mt-2 text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-950 dark:text-neutral-100 leading-tight">{frontmatter.title}</h1>
              <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">{frontmatter.excerpt}</p>
              <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4"><time className="text-sm text-neutral-400 dark:text-neutral-500 font-mono" dateTime={frontmatter.date}>{formattedDate}</time>{frontmatter.author && <span className="text-sm text-neutral-400 dark:text-neutral-500">Reviewed by {frontmatter.author}</span>}</div>
                <span className="text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600">English</span>
              </div>
            </header>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-4 mb-8 text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
              <strong>Important:</strong> This guide provides general education only. Follow your surgeon’s and rehabilitation team’s instructions if they differ. Stop the exercise and seek medical advice for increasing pain, unusual swelling, wound problems, fever, chest pain, shortness of breath, or other concerning symptoms.
            </div>

            <PrintButton locale="en" />
            <div className="prose prose-neutral dark:prose-invert max-w-none"><MDXRemote source={content} components={mdxComponents} /></div>

            <div className="mt-12 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700 p-6">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Need individualized guidance?</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">Bring this guide and your surgeon’s instructions to your rehabilitation appointment. Your actual program should be adjusted to the procedure, wound healing, symptoms, and functional assessment.</p>
              <Link href="/en/contact" className="mt-4 inline-flex text-sm font-semibold text-accent-700 dark:text-accent-400 hover:underline">Clinic information →</Link>
            </div>

            <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-700"><Link href="/en/perioperative-rehab" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100">← All postoperative guides</Link></div>
          </article>
        </div>
        <aside className="hidden lg:block w-56 flex-shrink-0"><div className="sticky top-24"><TableOfContents locale="en" /></div></aside>
      </div>
    </div>
  )
}
