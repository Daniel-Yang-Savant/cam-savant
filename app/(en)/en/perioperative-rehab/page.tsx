import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllEnglishPosts } from '@/lib/english-posts'
import { englishAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: 'Postoperative Rehabilitation Guides',
  description:
    'Physician-reviewed English rehabilitation guides for orthopedic, cancer, spine, and cardiovascular surgery patients.',
  alternates: englishAlternates('/perioperative-rehab'),
  robots: { index: false, follow: false },
}

const groups = [
  {
    id: 'orthopedic',
    label: 'Orthopedic and Spine Surgery',
    slugs: [
      'acl-reconstruction-rehab',
      'acl-meniscus-repair-rehab',
      'pcl-reconstruction',
      'rotator-cuff-slap-rehab',
      'tkr-rehab',
      'thr-rehab',
      'hip-fracture-rehab',
      'ankle-fracture-rehab',
      'distal-radius-fracture-rehab',
      'achilles-repair-rehab',
      'lumbar-discectomy-rehab',
      'lumbar-fusion-rehab',
    ],
  },
  {
    id: 'oncology',
    label: 'Cancer Surgery',
    slugs: [
      'oral-neck-cancer-rehab',
      'lung-cancer-rehab',
      'esophageal-cancer-rehab',
      'breast-cancer-rehab',
      'gynecologic-cancer-rehab',
      'prostate-cancer-rehab',
    ],
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular Surgery',
    slugs: ['cabg-ami-rehab', 'cardiovascular-surgery'],
  },
]

export default function EnglishPerioperativeRehabPage() {
  const posts = getAllEnglishPosts()
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]))

  return (
    <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-xs text-neutral-500 dark:text-neutral-400">
        <Link href="/en" className="hover:text-neutral-950 dark:hover:text-neutral-100">Home</Link>
        <span className="mx-2">/</span>
        <span>Postoperative Rehabilitation</span>
      </div>

      <section className="bg-neutral-950 text-white mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">Patient Education</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Postoperative Rehabilitation Guides</h1>
          <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-neutral-400 leading-relaxed">
            Twenty English guides covering recovery after orthopedic, spine, cancer, and cardiovascular procedures. Follow the instructions from your own surgeon and rehabilitation team whenever they differ from these general guides.
          </p>
          <div className="mt-8 inline-flex rounded-full border border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-300">20 guides available in English</div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16">
        {groups.map((group) => (
          <section key={group.id}>
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-2xl font-bold text-neutral-950 dark:text-neutral-100">{group.label}</h2>
              <span className="text-xs font-semibold rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-neutral-500 dark:text-neutral-400">{group.slugs.length}</span>
            </div>
            <div className="h-px bg-neutral-200 dark:bg-neutral-700 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.slugs.map((slug) => {
                const post = postsBySlug.get(slug)
                if (!post) return null
                return (
                  <article key={slug} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-6 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-snug">{post.frontmatter.title}</h3>
                      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{post.frontmatter.excerpt}</p>
                    </div>
                    <Link href={`/en/perioperative-rehab/${slug}`} className="mt-5 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-medium tracking-wide py-2.5 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors">Read guide →</Link>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="max-w-2xl mx-auto px-4 pb-16 text-center text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
        These guides provide general education and do not replace individualized medical advice. Your surgeon’s restrictions, wound status, imaging, and rehabilitation assessment determine your actual progression.
      </aside>
    </div>
  )
}
