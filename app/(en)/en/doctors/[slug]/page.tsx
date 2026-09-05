import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TEAM, getAuthorEntryBySlug } from '@/lib/authors'
import { englishAlternates } from '@/lib/locales'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return TEAM.map((doctor) => ({ slug: doctor.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getAuthorEntryBySlug(slug)
  if (!entry) return {}
  const { author } = entry
  const description = `${author.nameEn} — ${author.titleEn}. Clinical interests include ${author.specialtiesEn.join(', ') || 'patient care and medical education'}.`
  const profileImage = {
    url: author.photo,
    width: author.photoWidth,
    height: author.photoHeight,
    alt: author.nameEn,
  }

  return {
    title: `${author.nameEn} | ${author.titleEn}`,
    description,
    alternates: englishAlternates(`/doctors/${author.slug}`),
    openGraph: {
      type: 'profile',
      title: `${author.nameEn} | CAM Savant`,
      description,
      url: `/en/doctors/${author.slug}`,
      images: [profileImage],
    },
    twitter: {
      card: 'summary',
      title: `${author.nameEn} | CAM Savant`,
      description,
      images: [profileImage],
    },
  }
}

export default async function EnglishDoctorPage({ params }: Props) {
  const { slug } = await params
  const entry = getAuthorEntryBySlug(slug)
  if (!entry) notFound()
  const { author } = entry
  const pageUrl = `https://camsavant.com/en/doctors/${author.slug}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${pageUrl}#profile`,
    url: pageUrl,
    name: `${author.nameEn} | ${author.titleEn}`,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'Physician',
      name: author.nameEn,
      alternateName: author.name,
      jobTitle: author.titleEn,
      image: `https://camsavant.com${author.photo}`,
      url: pageUrl,
      knowsAbout: author.specialtiesEn,
      sameAs: author.sameAs,
    },
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <nav className="mb-8 text-xs text-neutral-500 dark:text-neutral-400">
          <Link href="/en/about" className="hover:text-neutral-950 dark:hover:text-neutral-100">Medical Team</Link>
          <span className="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
          <span>{author.nameEn}</span>
        </nav>

        <header className="rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-10">
          <div className="grid md:grid-cols-[220px_1fr] gap-8 md:gap-12 items-start">
            <div className="relative mx-auto md:mx-0 overflow-hidden bg-neutral-200 dark:bg-neutral-700" style={{ width: 220, height: 275, borderRadius: '9999px 9999px 0 0' }}>
              <Image src={author.photo} alt={author.nameEn} fill priority className="object-cover object-top" sizes="220px" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500">CAM Savant Medical Team</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">{author.nameEn}</h1>
              <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">{author.name}</p>
              <p className="mt-5 text-lg font-medium text-neutral-700 dark:text-neutral-300">{author.titleEn}</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{author.locationEn}</p>
              {author.specialtiesEn.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {author.specialtiesEn.map((specialty) => <span key={specialty} className="rounded-full bg-neutral-100 dark:bg-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">{specialty}</span>)}
                </div>
              )}
              <div className="mt-7 flex flex-wrap gap-3">
                {author.contactPath && <Link href={`/en${author.contactPath}`} className="rounded-full bg-neutral-950 dark:bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-neutral-950">Clinic information</Link>}
                <Link href="/en/about" className="rounded-full border border-neutral-200 dark:border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:text-neutral-300">Back to team</Link>
              </div>
            </div>
          </div>
        </header>

        {author.bioEn && (
          <section className="mt-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-9">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Professional Profile</h2>
            <p className="mt-4 text-sm sm:text-base leading-7 text-neutral-600 dark:text-neutral-300">{author.bioEn}</p>
          </section>
        )}

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {author.experienceEn && author.experienceEn.length > 0 && (
            <section className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Current Positions and Experience</h2>
              <ul className="mt-4 space-y-3">{author.experienceEn.map((item) => <li key={item} className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">{item}</li>)}</ul>
            </section>
          )}
          {(author.educationEn?.length || author.credentialsEn.length > 0) && (
            <section className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Education and Credentials</h2>
              <ul className="mt-4 space-y-3">
                {author.educationEn?.map((item) => <li key={item} className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">{item}</li>)}
                {author.credentialsEn.map((item) => <li key={item} className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">{item}</li>)}
              </ul>
            </section>
          )}
        </div>

        {author.publications && author.publications.length > 0 && (
          <section className="mt-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-9">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Research</p>
            <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">Selected Publications</h2>
            <div className="mt-6 divide-y divide-neutral-100 dark:divide-neutral-700">
              {author.publications.map((publication) => (
                <a key={publication.url} href={publication.url} target="_blank" rel="noopener noreferrer" className="group block py-5 first:pt-0 last:pb-0">
                  <h3 className="font-semibold leading-6 text-neutral-800 dark:text-neutral-200 group-hover:text-accent-700 dark:group-hover:text-accent-400">{publication.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{publication.citation} ↗</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
