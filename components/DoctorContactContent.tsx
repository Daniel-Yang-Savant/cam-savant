import Image from 'next/image'
import Link from 'next/link'
import DoctorClinicCards from '@/components/DoctorClinicCards'
import LineFollow from '@/components/LineFollow'
import { TrackedAnchor } from '@/components/TrackedLink'
import { getAuthorEntryBySlug } from '@/lib/authors'
import { getDoctorClinics } from '@/lib/doctor-clinics'
import { getClinicLocation } from '@/lib/locations'
import { LINE_ADD_URL } from '@/lib/site'

export default function DoctorContactContent({ doctorSlug, locale = 'zh' }: { doctorSlug: string; locale?: 'zh' | 'en' }) {
  const doctor = getAuthorEntryBySlug(doctorSlug)?.author
  if (!doctor) return null
  const en = locale === 'en'
  const prefix = en ? '/en' : ''
  const name = en ? doctor.nameEn : `${doctor.name}醫師`
  const hospitals = getDoctorClinics(doctorSlug).flatMap((entry) => {
    const clinic = getClinicLocation(entry.clinicSlug)
    return clinic ? [en ? clinic.hospitalEn : clinic.hospital] : []
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <header className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Clinic Information</span>
        <h1 className="mt-2 text-3xl font-bold text-neutral-950 dark:text-neutral-100 md:text-4xl">{en ? `${name}: Locations and Appointments` : `${name}看診資訊`}</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-neutral-500 dark:text-neutral-400">{hospitals.join(en ? ' · ' : '、')}{en ? '. Select the physician in the hospital’s official appointment system.' : '。以下依醫師與院區列出時段、官方掛號入口及資料核對日期。'}</p>
      </header>

      <section className="mb-10 flex items-start gap-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
        <Image src={doctor.photo} alt={name} width={72} height={90} className="h-[90px] w-[72px] shrink-0 rounded-xl object-cover object-top" />
        <div>
          <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-100">{name}</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{en ? doctor.titleEn : doctor.title}</p>
          <div className="mt-3 flex flex-wrap gap-2">{(en ? doctor.credentialsEn : doctor.credentials).map((credential) => <span key={credential} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">{credential}</span>)}</div>
          <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{(en ? doctor.specialtiesEn : doctor.specialties).join(en ? ' · ' : '、')}</p>
          <Link href={`${prefix}/doctors/${doctor.slug}`} className="mt-4 inline-block text-sm font-semibold text-accent-700 hover:underline dark:text-accent-400">{en ? 'Physician profile and sources →' : '醫師完整介紹與資料來源 →'}</Link>
        </div>
      </section>

      <section id="clinics" className="mb-10 scroll-mt-24">
        <h2 className="mb-5 text-2xl font-bold text-neutral-950 dark:text-neutral-100">{en ? 'Clinic sessions and official appointments' : '各院區門診與官方掛號'}</h2>
        <DoctorClinicCards doctorSlug={doctorSlug} locale={locale} />
      </section>

      {doctorSlug === 'yu-kai-yang' && (en ? (
        <section className="mb-10 rounded-2xl border border-[#06C755]/30 bg-[#06C755]/5 p-6">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100">Contact us on LINE</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">Use the official LINE account for schedule notices and general inquiries. Hospital appointments must be made through the hospital registration system.</p>
          <TrackedAnchor href={LINE_ADD_URL} target="_blank" rel="noopener noreferrer" eventName="line_clicked" eventProperties={{ locale: 'en', placement: 'contact_line_card' }} className="mt-4 inline-flex rounded-full bg-[#06C755] px-5 py-2.5 text-sm font-semibold text-white">Open LINE →</TrackedAnchor>
        </section>
      ) : <div className="mb-10"><LineFollow title="加入楊醫師官方 LINE" subtitle="門診異動提醒、一般諮詢與衛教新知。掛號仍請透過各醫院官方系統。" /></div>)}

      <aside className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm leading-7 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{en ? 'Hospital schedules and appointment arrangements may change. Confirm your physician, campus, date and time in the hospital’s official system before traveling.' : '門診與約診安排可能異動，就醫前請向院方確認醫師、院區、日期與時段。'}</aside>
      <nav className="mt-10 flex gap-6 border-t border-neutral-100 pt-8 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        <Link href={`${prefix}/about`} className="hover:underline">{en ? '← Medical team' : '← 醫師團隊介紹'}</Link>
        <Link href={`${prefix}/locations`} className="hover:underline">{en ? 'All locations' : '全部院區'}</Link>
      </nav>
    </div>
  )
}
