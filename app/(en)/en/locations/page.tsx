import type { Metadata } from 'next'
import Link from 'next/link'
import { CLINIC_LOCATIONS } from '@/lib/locations'
import { englishAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: 'Clinic Locations and Appointments',
  description: 'Rehabilitation location addresses, phone numbers, maps, and official appointment links for Changhua, Nantou, Erlin, and nearby Yunlin.',
  alternates: englishAlternates('/locations'),
  openGraph: {
    title: 'Clinic Locations | CAM Savant',
    description: 'Browse rehabilitation locations and official appointment information by area in central Taiwan.',
    url: '/en/locations',
  },
}

const regionMap = {
  changhua: {
    name: 'Changhua Area',
    description: 'Changhua City and central Changhua',
  },
  nantou: {
    name: 'Nantou Area',
    description: 'Nantou City and nearby communities',
  },
  erlin: {
    name: 'Erlin and Nearby Yunlin',
    description: 'Southern Changhua with convenient access from Yunlin',
  },
} as const

export default function EnglishLocationsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <header className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">Clinic Locations</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">Locations and Appointments</h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Browse rehabilitation locations by area. Each location page includes its address, phone number, transportation details, and official appointment link.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {CLINIC_LOCATIONS.map((clinic) => {
          const region = regionMap[clinic.slug]
          return (
            <article key={clinic.slug} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-4">
              <div>
                <h2 className="text-xs font-bold text-accent-700 dark:text-accent-400">{region.name}</h2>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{region.description}</p>
                <span className="mt-3 inline-block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 dark:text-neutral-400">{clinic.departmentEn}</span>
                <h3 className="mt-2 text-lg font-bold text-neutral-950 dark:text-neutral-100 leading-tight">{clinic.hospitalEn}</h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{clinic.addressEn}</p>
              </div>
              <dl className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Phone</dt>
                  <dd className="mt-1"><a href={clinic.phoneHref} className="hover:text-neutral-950 dark:hover:text-neutral-100">{clinic.phone}</a></dd>
                </div>
              </dl>
              <div className="mt-auto flex flex-col gap-2 pt-2">
                <Link href={`/en/locations/${clinic.slug}`} className="w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950">Location details</Link>
                <a href={clinic.bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full text-center text-sm font-semibold py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200">Online appointment ↗</a>
                <a href={clinic.mapUrl} target="_blank" rel="noopener noreferrer" className="w-full text-center text-sm py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">Google Maps ↗</a>
              </div>
            </article>
          )
        })}
      </div>

      <aside className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-5 text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
        <strong>Please confirm before traveling:</strong> Clinic schedules may change for holidays, staffing, or hospital operations. Check the hospital’s official website or call the hospital for the latest schedule. For emergencies, call 119 in Taiwan or go to the nearest emergency department.
      </aside>

      <nav className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-6">
        <Link href="/en/about" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100">← Medical team</Link>
        <Link href="/en" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100">Home</Link>
      </nav>
    </div>
  )
}
