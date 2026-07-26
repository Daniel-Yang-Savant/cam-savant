import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getAuthorEntryBySlug } from '@/lib/authors'
import { CLINIC_LOCATIONS, getClinicLocation } from '@/lib/locations'
import { generateBreadcrumbSchema, generatePhysicianSchema } from '@/lib/schema'

const BASE_URL = 'https://camsavant.com'

type Props = {
  params: { slug: string }
}

const accentMap = {
  blue: {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    border: 'border-blue-100 dark:border-blue-900',
    dot: 'bg-blue-500',
  },
  green: {
    badge: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    border: 'border-green-100 dark:border-green-900',
    dot: 'bg-green-500',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    border: 'border-amber-100 dark:border-amber-900',
    dot: 'bg-amber-500',
  },
}

export function generateStaticParams() {
  return CLINIC_LOCATIONS.map(({ slug }) => ({ slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: Props): Metadata {
  const location = getClinicLocation(params.slug)
  if (!location) return {}

  const title = `${location.hospital}${location.department}｜地址・電話・交通`
  const description = `${location.hospital}${location.department}看診資訊：${location.address}、電話${location.phone}，並提供官方掛號、地圖、交通方式與醫師介紹。`

  return {
    title,
    description,
    alternates: { canonical: `/locations/${location.slug}` },
    openGraph: {
      title: `${title} | CAM Savant`,
      description,
      type: 'website',
    },
  }
}

export default function LocationPage({ params }: Props) {
  const location = getClinicLocation(params.slug)
  if (!location) notFound()

  const doctors = location.doctorSlugs.flatMap((slug) => {
    const entry = getAuthorEntryBySlug(slug)
    return entry ? [entry.author] : []
  })
  const accent = accentMap[location.color]
  const pageUrl = `${BASE_URL}/locations/${location.slug}`
  const description = `${location.hospital}${location.department}的地址、電話、交通、掛號方式與看診醫師資訊。`

  const locationSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: `${location.hospital}${location.department}看診資訊`,
    description,
    inLanguage: 'zh-TW',
    mainEntity: {
      '@type': 'Hospital',
      '@id': `${location.officialUrl}#hospital`,
      name: location.hospital,
      alternateName: [location.hospitalEn, location.shortName],
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
      medicalSpecialty: 'PhysicalMedicineAndRehabilitation',
    },
    mentions: doctors.map((doctor) => generatePhysicianSchema(doctor)),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首頁', url: BASE_URL },
              { name: '看診資訊', url: `${BASE_URL}/contact` },
              { name: location.hospital, url: pageUrl },
            ])
          ),
        }}
      />

      <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: '首頁', href: '/' },
              { label: '看診資訊', href: '/contact' },
              { label: location.hospital },
            ]}
          />

          <header className={`rounded-3xl border ${accent.border} bg-white dark:bg-neutral-800 p-7 sm:p-10`}>
            <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-start">
              <div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                  {location.department}
                </span>
                <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-neutral-950 dark:text-neutral-100">
                  {location.hospital}
                </h1>
                <p className="mt-2 text-sm tracking-wide text-neutral-400 dark:text-neutral-500">
                  {location.hospitalEn}
                </p>
                <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600 dark:text-neutral-300">
                  {location.areaDescription}
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-700 p-5">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-semibold tracking-widest uppercase text-neutral-400">地址</dt>
                    <dd className="mt-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                      {location.address}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-widest uppercase text-neutral-400">電話</dt>
                    <dd className="mt-1">
                      <a
                        href={location.phoneHref}
                        className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:text-accent-700 dark:hover:text-accent-400"
                      >
                        {location.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-widest uppercase text-neutral-400">現有門診時段</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {location.schedule.map((schedule) => (
                        <span
                          key={schedule}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${accent.badge}`}
                        >
                          {schedule}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={location.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-neutral-950 dark:bg-neutral-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-neutral-950 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
              >
                官方線上掛號 ↗
              </a>
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors"
              >
                Google Maps 導航 ↗
              </a>
              <a
                href={location.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-600 px-5 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors"
              >
                醫院官方網站 ↗
              </a>
            </div>
          </header>

          <div className="mt-8 grid lg:grid-cols-2 gap-8">
            <section className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
                Clinical Focus
              </p>
              <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100">
                可諮詢的復健與疼痛問題
              </h2>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {location.services.map((service) => (
                  <li
                    key={service}
                    className="flex items-start gap-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300"
                  >
                    <span className={`mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 ${accent.dot}`} />
                    {service}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-6 text-neutral-400 dark:text-neutral-500">
                實際檢查、治療與自費項目，須依醫師評估及各院最新規定辦理。
              </p>
            </section>

            <section className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
                Transportation
              </p>
              <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100">
                到院交通
              </h2>
              <ul className="mt-6 space-y-4">
                {location.transportNotes.map((note) => (
                  <li
                    key={note}
                    className="flex items-start gap-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
              <a
                href={location.transportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex text-sm font-semibold text-accent-700 dark:text-accent-400 hover:underline"
              >
                查看院方最新交通資訊 ↗
              </a>
            </section>
          </div>

          <section className="mt-8 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-7 sm:p-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              Physicians
            </p>
            <h2 className="mt-2 text-2xl font-bold text-neutral-950 dark:text-neutral-100">
              看診醫師
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map((doctor) => (
                <Link
                  key={doctor.slug}
                  href={`/doctors/${doctor.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-4 hover:border-neutral-300 dark:hover:border-neutral-500 transition-colors"
                >
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-700">
                    <Image
                      src={doctor.photo}
                      alt={`${doctor.name}醫師`}
                      fill
                      className="object-cover object-top"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">
                      {doctor.name} 醫師
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {doctor.title}
                    </p>
                    <p className="mt-2 text-xs font-medium text-accent-700 dark:text-accent-400">
                      查看醫師介紹 →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-6">
            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              資訊來源與門診異動
            </h2>
            <p className="mt-2 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
              CAM Savant 為醫療知識平台。本頁地址、電話與院區資訊整理自醫院官方網站；
              門診、交通與掛號資訊可能臨時調整，就醫前請以院方官網及掛號系統的最新公告為準。
            </p>
          </section>

          <nav className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              Other Locations
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {CLINIC_LOCATIONS.filter((item) => item.slug !== location.slug).map((item) => (
                <Link
                  key={item.slug}
                  href={`/locations/${item.slug}`}
                  className="rounded-full border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors"
                >
                  {item.hospital}
                </Link>
              ))}
              <Link
                href="/contact"
                className="rounded-full border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors"
              >
                返回完整看診資訊
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
