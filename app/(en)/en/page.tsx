import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TEAM } from '@/lib/authors'
import { englishAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: { absolute: 'CAM Savant | Rehabilitation and Sports Medicine in Taiwan' },
  description:
    'Meet our medical team, find clinic locations in Changhua and Nantou, and read English postoperative rehabilitation guides for patients.',
  alternates: englishAlternates('/'),
  openGraph: {
    title: 'CAM Savant | Rehabilitation and Sports Medicine in Taiwan',
    description:
      'Physician-reviewed rehabilitation information and clinic guidance for international patients in central Taiwan.',
    url: '/en',
  },
}

const services = [
  'Physical medicine and rehabilitation',
  'Sports injury assessment and rehabilitation',
  'Ultrasound-guided injection',
  'Prolotherapy and PRP therapy',
  'Osteoporosis assessment and treatment',
  'Postoperative rehabilitation planning',
]

export default function EnglishHomePage() {
  return (
    <>
      <section className="border-b border-neutral-200 bg-[#f5f0e8] dark:border-neutral-800 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-accent-700 dark:text-accent-400">
            Rehabilitation care in central Taiwan
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl md:text-6xl font-bold tracking-tight text-neutral-950 dark:text-neutral-100 leading-tight">
            Clear medical information for recovery, movement, and better function.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
            CAM Savant is a physician-led knowledge platform covering rehabilitation medicine, sports medicine, regenerative medicine, and postoperative recovery. Our team serves patients in Changhua and Nantou, Taiwan.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/en/locations" className="rounded-full bg-neutral-950 dark:bg-neutral-100 px-6 py-3 text-sm font-semibold text-white dark:text-neutral-950 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors">
              Clinic information
            </Link>
            <Link href="/en/perioperative-rehab" className="rounded-full border border-neutral-300 dark:border-neutral-600 px-6 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors">
              Postoperative guides
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Clinical focus</p>
            <h2 className="mt-3 text-3xl font-bold text-neutral-950 dark:text-neutral-100">Integrated rehabilitation care</h2>
            <p className="mt-5 text-base leading-8 text-neutral-600 dark:text-neutral-300">
              We combine evidence-based rehabilitation with individualized assessment. Treatment availability and recommendations depend on an in-person medical evaluation and each hospital’s current policies.
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <li key={service} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-4 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                {service}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Medical team</p>
              <h2 className="mt-2 text-3xl font-bold text-neutral-950 dark:text-neutral-100">Meet our physicians</h2>
            </div>
            <Link href="/en/about" className="text-sm font-semibold text-accent-700 dark:text-accent-400 hover:underline">View all profiles →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TEAM.map((doctor) => (
              <Link key={doctor.slug} href={`/en/doctors/${doctor.slug}`} className="group rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-700">
                  <Image src={doctor.photo} alt={doctor.nameEn} fill className="object-cover object-top group-hover:scale-[1.02] transition-transform" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <h3 className="mt-4 font-bold text-neutral-900 dark:text-neutral-100">{doctor.nameEn}</h3>
                <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{doctor.titleEn}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
