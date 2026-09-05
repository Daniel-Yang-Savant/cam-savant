import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { CLINIC_LOCATIONS } from '@/lib/locations'
import { LINE_ADD_URL } from '@/lib/site'
import { englishAlternates } from '@/lib/locales'
import { TrackedAnchor, TrackedInternalLink } from '@/components/TrackedLink'

export const metadata: Metadata = {
  title: 'Clinic Information and Appointments',
  description:
    'Clinic schedules, addresses, phone numbers, maps, and appointment links for CAM Savant rehabilitation services in Changhua, Nantou, and Erlin.',
  alternates: englishAlternates('/contact'),
  openGraph: {
    title: 'Clinic Information | CAM Savant',
    description: 'Rehabilitation clinic locations and appointment information in central Taiwan.',
    url: '/en/contact',
  },
}

const specialties = [
  'Prolotherapy',
  'Platelet-rich plasma (PRP) therapy',
  'Ultrasound-guided injection',
  'Frequency Specific Microcurrent (FSM)',
  'Osteoporosis assessment and treatment',
  'Sports injury rehabilitation',
  'Postoperative rehabilitation planning',
  'Musculoskeletal pain management',
]

export default function EnglishContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <header className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">Clinic Information</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">Locations and Appointments</h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Dr. Yu-Kai Yang provides rehabilitation medicine services at Changhua Christian Hospital, Nantou Christian Hospital, and Erlin Christian Hospital. Appointment systems on hospital websites may be available primarily in Chinese.
        </p>
      </header>

      <section className="mb-10 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-start gap-5">
        <div className="relative overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" style={{ width: 72, height: 90, borderRadius: '9999px 9999px 0 0' }}>
          <Image src="/images/team/yu-kai-yang.jpg" alt="Yu-Kai Yang, MD" fill className="object-cover object-top" sizes="72px" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-100">Yu-Kai Yang, MD</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Attending Physician, Physical Medicine and Rehabilitation</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {specialties.map((specialty) => <span key={specialty} className="text-[10px] px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400">{specialty}</span>)}
          </div>
        </div>
      </section>

      <section className="mb-12 rounded-2xl border border-[#06C755]/30 bg-[#06C755]/5 p-6">
        <h2 className="font-bold text-neutral-900 dark:text-neutral-100">Contact us on LINE</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          Use the official LINE account for schedule notices and general inquiries. Hospital appointments must still be made through the hospital registration system.
        </p>
        <TrackedAnchor href={LINE_ADD_URL} target="_blank" rel="noopener noreferrer" eventName="line_clicked" eventProperties={{ locale: 'en', placement: 'contact_line_card' }} className="mt-4 inline-flex rounded-full bg-[#06C755] px-5 py-2.5 text-sm font-semibold text-white">Open LINE →</TrackedAnchor>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {CLINIC_LOCATIONS.map((clinic) => (
          <article key={clinic.slug} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-accent-700 dark:text-accent-400">{clinic.departmentEn}</span>
              <h2 className="mt-2 text-lg font-bold text-neutral-950 dark:text-neutral-100 leading-tight">{clinic.hospitalEn}</h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{clinic.addressEn}</p>
            </div>
            <dl className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              <div><dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Phone</dt><dd className="mt-1"><a href={clinic.phoneHref} className="hover:text-neutral-950 dark:hover:text-neutral-100">{clinic.phone}</a></dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Current clinic times</dt><dd className="mt-1 space-y-1">{clinic.scheduleEn.map((time) => <span key={time} className="block">{time}</span>)}</dd></div>
            </dl>
            <div className="mt-auto flex flex-col gap-2 pt-2">
              <TrackedInternalLink href={`/en/locations/${clinic.slug}`} eventName="location_opened" eventProperties={{ locale: 'en', placement: 'doctor_contact_details', clinic_slug: clinic.slug }} className="w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950">Location details</TrackedInternalLink>
              <TrackedAnchor href={clinic.bookingUrl} target="_blank" rel="noopener noreferrer" eventName="booking_clicked" eventProperties={{ locale: 'en', placement: 'doctor_contact', clinic_slug: clinic.slug }} className="w-full text-center text-sm font-semibold py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200">Online appointment ↗</TrackedAnchor>
              <TrackedAnchor href={clinic.mapUrl} target="_blank" rel="noopener noreferrer" eventName="location_opened" eventProperties={{ locale: 'en', placement: 'doctor_contact_map', clinic_slug: clinic.slug }} className="w-full text-center text-sm py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">Google Maps ↗</TrackedAnchor>
            </div>
          </article>
        ))}
      </div>

      <aside className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-5 text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
        <strong>Please confirm before traveling:</strong> Clinic schedules may change for holidays, staffing, or hospital operations. Check the hospital’s official website or call the hospital for the latest schedule. For emergencies, call 119 in Taiwan or go to the nearest emergency department.
      </aside>

      <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-6">
        <Link href="/en/about" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100">← Medical team</Link>
        <Link href="/en" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100">Home</Link>
      </div>
    </div>
  )
}
