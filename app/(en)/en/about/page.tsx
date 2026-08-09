import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TEAM } from '@/lib/authors'
import { englishAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: 'Medical Team',
  description:
    'Meet the CAM Savant physicians in rehabilitation medicine, sports medicine, family medicine, regenerative medicine, and functional medicine.',
  alternates: englishAlternates('/about'),
  openGraph: {
    title: 'Medical Team | CAM Savant',
    description: 'Physician profiles and clinical expertise at CAM Savant in Taiwan.',
    url: '/en/about',
  },
}

export default function EnglishAboutPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'CAM Savant',
    url: 'https://camsavant.com/en',
    inLanguage: 'en',
    member: TEAM.map((doctor) => ({
      '@type': 'Physician',
      name: doctor.nameEn,
      alternateName: doctor.name,
      jobTitle: doctor.titleEn,
      url: `https://camsavant.com/en/doctors/${doctor.slug}`,
      image: `https://camsavant.com${doctor.photo}`,
      knowsAbout: doctor.specialtiesEn,
      sameAs: doctor.sameAs,
    })),
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <header className="text-center mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">CAM Savant</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-neutral-950 dark:text-neutral-100 tracking-tight">Medical Team</h1>
          <div className="mt-5 h-px w-12 bg-neutral-300 dark:bg-neutral-600 mx-auto" />
          <p className="mt-5 max-w-2xl mx-auto text-sm md:text-base leading-7 text-neutral-500 dark:text-neutral-400">
            Our physicians write and review CAM Savant content, bringing together perspectives from rehabilitation medicine, sports medicine, family medicine, and functional medicine.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {TEAM.map((doctor) => (
            <article key={doctor.slug} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm px-6 pt-10 pb-8 flex flex-col items-center text-center">
              <div className="relative overflow-hidden bg-neutral-200 dark:bg-neutral-700 mb-5 flex-shrink-0" style={{ width: 152, height: 190, borderRadius: '9999px 9999px 0 0' }}>
                <Image src={doctor.photo} alt={doctor.nameEn} fill className="object-cover object-top" sizes="152px" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">{doctor.nameEn}</h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{doctor.titleEn}</p>
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">{doctor.locationEn}</p>
              {doctor.specialtiesEn.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {doctor.specialtiesEn.map((specialty) => (
                    <span key={specialty} className="rounded-full bg-neutral-100 dark:bg-neutral-700 px-2.5 py-1 text-[10px] font-medium text-neutral-600 dark:text-neutral-300">{specialty}</span>
                  ))}
                </div>
              )}
              <Link href={`/en/doctors/${doctor.slug}`} className="mt-auto pt-6 text-xs font-semibold text-accent-700 dark:text-accent-400 hover:underline">Full profile →</Link>
              {doctor.contactPath && (
                <Link href={`/en${doctor.contactPath}`} className="mt-3 w-full rounded-xl border border-neutral-200 dark:border-neutral-700 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors">Clinic information →</Link>
              )}
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/en/locations" className="inline-flex rounded-full bg-neutral-950 dark:bg-neutral-100 px-6 py-3 text-sm font-semibold text-white dark:text-neutral-950 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors">Browse clinic locations →</Link>
        </div>
      </div>
    </div>
  )
}
