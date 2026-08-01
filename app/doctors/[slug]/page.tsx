import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TEAM, getAuthorEntryBySlug } from '@/lib/authors'
import { generateBreadcrumbSchema, generatePhysicianSchema } from '@/lib/schema'

const BASE_URL = 'https://camsavant.com'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return TEAM.map((author) => ({ slug: author.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getAuthorEntryBySlug(slug)
  if (!entry) return {}

  const { author } = entry
  const description = `${author.name}醫師，${author.title}。專長包含${author.specialties.join('、') || '臨床醫療與健康照護'}。`

  return {
    title: `${author.name}醫師｜${author.title}`,
    description,
    alternates: { canonical: `/doctors/${author.slug}` },
    openGraph: {
      type: 'profile',
      title: `${author.name}醫師 | CAM Savant`,
      description,
      images: [{ url: author.photo, alt: `${author.name}醫師` }],
    },
  }
}

export default async function DoctorProfilePage({ params }: Props) {
  const { slug } = await params
  const entry = getAuthorEntryBySlug(slug)
  if (!entry) notFound()

  const { author } = entry

  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${BASE_URL}/doctors/${author.slug}#profile`,
    url: `${BASE_URL}/doctors/${author.slug}`,
    name: `${author.name}醫師｜${author.title}`,
    mainEntity: generatePhysicianSchema(author),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首頁', url: BASE_URL },
              { name: '醫師團隊', url: `${BASE_URL}/about` },
              { name: `${author.name}醫師`, url: `${BASE_URL}/doctors/${author.slug}` },
            ])
          ),
        }}
      />

      <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <nav className="mb-8 text-xs text-neutral-500 dark:text-neutral-400">
            <Link href="/about" className="hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">
              醫師團隊
            </Link>
            <span className="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
            <span>{author.name}醫師</span>
          </nav>

          <header className="rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-10">
            <div className="grid md:grid-cols-[220px_1fr] gap-8 md:gap-12 items-start">
              <div
                className="relative mx-auto md:mx-0 overflow-hidden bg-neutral-200 dark:bg-neutral-700"
                style={{ width: 220, height: 275, borderRadius: '9999px 9999px 0 0' }}
              >
                <Image
                  src={author.photo}
                  alt={`${author.name}醫師`}
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="220px"
                />
              </div>

              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                  CAM Savant 醫師團隊
                </p>
                <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
                  {author.name} 醫師
                </h1>
                <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500 tracking-wider">
                  {author.nameEn}
                </p>
                <p className="mt-5 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                  {author.title}
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {author.location}
                </p>

                {author.specialties.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {author.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-neutral-100 dark:bg-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap gap-3">
                  {author.contactPath && (
                    <Link
                      href={author.contactPath}
                      className="inline-flex items-center rounded-full bg-neutral-950 dark:bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-neutral-950 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
                    >
                      看診資訊
                    </Link>
                  )}
                  <Link
                    href="/about"
                    className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors"
                  >
                    返回醫師團隊
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {author.experience && author.experience.length > 0 && (
              <section className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">現職與經歷</h2>
                <ul className="mt-4 space-y-2">
                  {author.experience.map((item) => (
                    <li key={item} className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(author.education?.length || author.credentials.length > 0) && (
              <section className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">學歷與專業認證</h2>
                <ul className="mt-4 space-y-2">
                  {author.education?.map((item) => (
                    <li key={item} className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                      {item}
                    </li>
                  ))}
                  {author.credentials.map((item) => (
                    <li key={item} className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {author.publications && author.publications.length > 0 && (
            <section className="mt-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-9">
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500">
                Selected Works
              </p>
              <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                相關著作
              </h2>
              <div className="mt-6 divide-y divide-neutral-100 dark:divide-neutral-700">
                {author.publications.map((publication) => (
                  <a
                    key={publication.url}
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block py-5 first:pt-0 last:pb-0"
                  >
                    <h3 className="font-semibold leading-6 text-neutral-800 dark:text-neutral-200 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">
                      {publication.title}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {publication.citation} ↗
                    </p>
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  )
}
