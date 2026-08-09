import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAuthorEntryBySlug } from '@/lib/authors'
import { CLINIC_LOCATIONS, getClinicLocation } from '@/lib/locations'
import { englishAlternates } from '@/lib/locales'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return CLINIC_LOCATIONS.map(({ slug }) => ({ slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const location = getClinicLocation(slug)
  if (!location) return {}
  const title = `${location.hospitalEn} | Rehabilitation Clinic Information`
  const description = `${location.departmentEn} at ${location.hospitalEn}: address, phone number, clinic times, transportation, physicians, and appointment links.`
  return {
    title,
    description,
    alternates: englishAlternates(`/locations/${location.slug}`),
    openGraph: { title: `${title} | CAM Savant`, description, url: `/en/locations/${location.slug}` },
  }
}

export default async function EnglishLocationPage({ params }: Props) {
  const { slug } = await params
  const location = getClinicLocation(slug)
  if (!location) notFound()
  const doctors = location.doctorSlugs.flatMap((doctorSlug) => {
    const entry = getAuthorEntryBySlug(doctorSlug)
    return entry ? [entry.author] : []
  })
  const pageUrl = `https://camsavant.com/en/locations/${location.slug}`
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${location.hospitalEn} rehabilitation clinic information`,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'Hospital',
      name: location.hospitalEn,
      alternateName: location.hospital,
      url: location.officialUrl,
      telephone: location.phoneHref.replace('tel:', ''),
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.streetAddress,
        addressLocality: location.addressLocality,
        addressRegion: location.addressRegion,
        postalCode: location.postalCode,
        addressCountry: 'TW',
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <nav className="mb-8 text-xs text-neutral-500 dark:text-neutral-400"><Link href="/en/locations" className="hover:text-neutral-950 dark:hover:text-neutral-100">Clinic information</Link><span className="mx-2">/</span><span>{location.hospitalEn}</span></nav>

        <header className="rounded-3xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-7 sm:p-10">
          <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">
            <div>
              <span className="inline-flex rounded-full bg-accent-50 dark:bg-accent-950 px-3 py-1 text-xs font-semibold text-accent-700 dark:text-accent-300">{location.departmentEn}</span>
              <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-neutral-950 dark:text-neutral-100">{location.hospitalEn}</h1>
              <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">{location.hospital}</p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">{location.areaDescriptionEn}</p>
            </div>
            <dl className="rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-700 p-5 space-y-4">
              <div><dt className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Address</dt><dd className="mt-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300">{location.addressEn}</dd></div>
              <div><dt className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Phone</dt><dd className="mt-1"><a href={location.phoneHref} className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{location.phone}</a></dd></div>
              <div><dt className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Current clinic times</dt><dd className="mt-2 flex flex-wrap gap-2">{location.scheduleEn.map((time) => <span key={time} className="rounded-full bg-neutral-200 dark:bg-neutral-700 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200">{time}</span>)}</dd></div>
            </dl>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={location.bookingUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-neutral-950 dark:bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-neutral-950">Official appointment system ↗</a>
            <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-neutral-300 dark:border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Google Maps ↗</a>
            <a href={location.officialUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-neutral-300 dark:border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Hospital website ↗</a>
          </div>
        </header>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <section className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Clinical Focus</p>
            <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100">Services to discuss with the physician</h2>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3">{location.servicesEn.map((service) => <li key={service} className="flex items-start gap-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent-600 flex-shrink-0" />{service}</li>)}</ul>
            <p className="mt-6 text-xs leading-6 text-neutral-400 dark:text-neutral-500">Examinations, treatments, and self-pay services depend on medical assessment and current hospital policy.</p>
          </section>
          <section className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Transportation</p>
            <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100">Getting to the hospital</h2>
            <ul className="mt-6 space-y-4">{location.transportNotesEn.map((note) => <li key={note} className="flex items-start gap-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300"><span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-neutral-400 flex-shrink-0" />{note}</li>)}</ul>
            <a href={location.transportUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex text-sm font-semibold text-accent-700 dark:text-accent-400 hover:underline">Latest hospital transportation information ↗</a>
          </section>
        </div>

        <section className="mt-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Physicians</p>
          <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100">Medical team at this location</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doctor) => (
              <Link key={doctor.slug} href={`/en/doctors/${doctor.slug}`} className="group flex items-center gap-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-4 hover:border-neutral-300 dark:hover:border-neutral-500">
                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-700"><Image src={doctor.photo} alt={doctor.nameEn} fill className="object-cover object-top" sizes="64px" /></div>
                <div><h3 className="font-bold text-neutral-900 dark:text-neutral-100">{doctor.nameEn}</h3><p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{doctor.titleEn}</p><p className="mt-2 text-xs font-medium text-accent-700 dark:text-accent-400">View profile →</p></div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="mt-8 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-6 text-sm leading-7 text-amber-900 dark:text-amber-100">
          Clinic, transportation, and appointment information may change without notice. Confirm details on the hospital’s official website or appointment system before traveling.
        </aside>

        <nav className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-700 flex flex-wrap gap-3">
          {CLINIC_LOCATIONS.filter((item) => item.slug !== location.slug).map((item) => <Link key={item.slug} href={`/en/locations/${item.slug}`} className="rounded-full border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300">{item.hospitalEn}</Link>)}
          <Link href="/en/locations" className="rounded-full border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300">All clinic information</Link>
        </nav>
      </div>
    </div>
  )
}
