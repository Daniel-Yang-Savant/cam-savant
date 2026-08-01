import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { englishAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: 'Wen-Wei Lai, MD | Clinic Information',
  description:
    'Clinic schedules and appointment links for Dr. Wen-Wei Lai at Changhua Christian Hospital, Hanming Christian Hospital, and Yuanlin Christian Hospital.',
  alternates: englishAlternates('/contact/wen-wei-lai'),
}

const clinics = [
  {
    hospital: 'Changhua Christian Hospital',
    address: 'No. 135, Nanxiao St., Changhua City, Taiwan',
    phone: '(04) 723-8595',
    phoneHref: 'tel:+88647238595',
    schedule: ['Monday afternoon', 'Thursday morning (ultrasound, by appointment)', 'Saturday morning'],
    mapUrl: 'https://maps.google.com/?q=彰化基督教醫院',
    bookingUrl: 'https://www1.cch.org.tw/opd/service-e.aspx?id=1400&Page=11&#p',
  },
  {
    hospital: 'Hanming Christian Hospital',
    address: 'No. 366, Sec. 1, Zhongshan Rd., Changhua City, Taiwan',
    phone: '(04) 711-3456',
    phoneHref: 'tel:+88647113456',
    schedule: ['Monday morning', 'Wednesday morning'],
    mapUrl: 'https://maps.google.com/?q=漢銘基督教醫院',
    bookingUrl: 'https://opdhm.cch.org.tw/hmrg/opd/service-e.aspx?id=1400&Page=11&#p',
  },
  {
    hospital: 'Yuanlin Christian Hospital',
    address: 'No. 456, Juguang Rd., Yuanlin City, Changhua County, Taiwan',
    phone: '(04) 838-1456',
    phoneHref: 'tel:+88648381456',
    schedule: ['Friday afternoon'],
    mapUrl: 'https://maps.google.com/?q=員林基督教醫院',
    bookingUrl: 'https://bc.cch.org.tw/bcrg/opd/service-e.aspx?id=1400&Page=11&#p',
  },
]

export default function EnglishLaiContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <header className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">Clinic Information</span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">Wen-Wei Lai, MD</h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">Rehabilitation medicine and ultrasound-guided procedures in Changhua. Hospital appointment systems may be available primarily in Chinese.</p>
      </header>

      <section className="mb-12 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-start gap-5">
        <div className="relative overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" style={{ width: 72, height: 90, borderRadius: '9999px 9999px 0 0' }}>
          <Image src="/images/team/wen-wei-lai.jpg" alt="Wen-Wei Lai, MD" fill className="object-cover object-top" sizes="72px" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-100">Wen-Wei Lai, MD</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Physician, Physical Medicine and Rehabilitation</p>
          <div className="mt-3 flex flex-wrap gap-2">{['Rehabilitation medicine', 'Musculoskeletal ultrasound', 'Ultrasound-guided injection'].map((item) => <span key={item} className="rounded-full border border-neutral-200 dark:border-neutral-600 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-300">{item}</span>)}</div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {clinics.map((clinic) => (
          <article key={clinic.hospital} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-4">
            <div><span className="text-[10px] font-semibold tracking-widest uppercase text-accent-700 dark:text-accent-400">Rehabilitation Medicine</span><h2 className="mt-2 text-lg font-bold text-neutral-950 dark:text-neutral-100">{clinic.hospital}</h2></div>
            <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300"><p>{clinic.address}</p><p><a href={clinic.phoneHref}>{clinic.phone}</a></p><div>{clinic.schedule.map((time) => <p key={time}>{time}</p>)}</div></div>
            <div className="mt-auto flex flex-col gap-2 pt-2"><a href={clinic.bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950">Online appointment ↗</a><a href={clinic.mapUrl} target="_blank" rel="noopener noreferrer" className="w-full text-center text-sm py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">Google Maps ↗</a></div>
          </article>
        ))}
      </div>

      <aside className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-5 text-sm leading-7 text-amber-900 dark:text-amber-100">Clinic schedules may change. Confirm the latest schedule with the hospital, especially for ultrasound appointments.</aside>
      <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800"><Link href="/en/about" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100">← Medical team</Link></div>
    </div>
  )
}
