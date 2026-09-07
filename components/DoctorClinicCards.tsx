import Link from 'next/link'
import { getAuthorEntryBySlug } from '@/lib/authors'
import { DOCTOR_CLINICS } from '@/lib/doctor-clinics'
import { getClinicLocation } from '@/lib/locations'
import { TrackedAnchor, TrackedInternalLink } from '@/components/TrackedLink'

type Props = {
  doctorSlug?: string
  clinicSlug?: string
  locale?: 'zh' | 'en'
}

export default function DoctorClinicCards({ doctorSlug, clinicSlug, locale = 'zh' }: Props) {
  const en = locale === 'en'
  const prefix = en ? '/en' : ''
  const records = DOCTOR_CLINICS.filter((record) =>
    (!doctorSlug || record.doctorSlug === doctorSlug) && (!clinicSlug || record.clinicSlug === clinicSlug)
  )

  if (records.length === 0) return null

  return (
    <div className={`grid grid-cols-1 gap-5 ${records.length > 1 ? 'md:grid-cols-2' : ''} ${records.length > 2 ? 'xl:grid-cols-3' : ''}`}>
      {records.map((record) => {
        const clinic = getClinicLocation(record.clinicSlug)
        const doctor = getAuthorEntryBySlug(record.doctorSlug)?.author
        if (!clinic || !doctor) return null
        const name = en ? doctor.nameEn : `${doctor.name}醫師`
        const schedule = en ? record.scheduleEn : record.schedule
        const note = en ? record.noteEn : record.note
        const verified = record.verificationStatus === 'verified'

        return (
          <article key={`${record.doctorSlug}-${record.clinicSlug}`} className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <Link href={`${prefix}/doctors/${doctor.slug}`} className="text-sm font-semibold text-accent-700 hover:underline dark:text-accent-400">{name}</Link>
            <h3 className="mt-2 text-lg font-bold leading-snug text-neutral-950 dark:text-neutral-100">{en ? clinic.hospitalEn : clinic.hospital}</h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{en ? clinic.departmentEn : clinic.department}</p>
            <dl className="mt-4 space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
              <div>
                <dt className="font-semibold">{en ? 'Clinic sessions' : '門診時段'}</dt>
                <dd className="mt-1 space-y-1">
                  {schedule.length > 0 ? schedule.map((time) => <p key={time}>{time}</p>) : <p>{en ? 'Please confirm the schedule with the hospital.' : '時段尚待確認，請洽院方。'}</p>}
                  {!verified && <p className="font-medium text-amber-800 dark:text-amber-300">{en ? 'Schedule verification pending' : '門診資料待核對'}</p>}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">{en ? 'Address and phone' : '院區地址與電話'}</dt>
                <dd className="mt-1 leading-6">{en ? clinic.addressEn : clinic.address}<br /><a href={clinic.phoneHref} className="hover:underline">{clinic.phone}</a></dd>
              </div>
              <div>
                <dt className="font-semibold">{en ? 'Source and check date' : '資料來源與核對日期'}</dt>
                <dd className="mt-1 text-xs leading-6 text-neutral-500 dark:text-neutral-400">
                  <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent-700 hover:underline dark:text-accent-400">{en ? record.sourceLabelEn : record.sourceLabel} ↗</a>
                  <p>{record.checkedAt ? <>{en ? 'Source checked: ' : '來源核對：'}<time dateTime={record.checkedAt}>{record.checkedAt}</time>{!verified && (en ? ' · schedule unresolved' : '・時段尚未確認')}</> : (en ? 'Not yet checked' : '尚未核對')}</p>
                </dd>
              </div>
            </dl>
            {note && <p className="mt-4 text-xs leading-6 text-neutral-500 dark:text-neutral-400">{note}</p>}
            <div className="mt-auto pt-5">
              <p className="mb-2 text-xs leading-5 text-neutral-500 dark:text-neutral-400">{en ? `In the hospital's rehabilitation schedule, select ${doctor.name} (${doctor.nameEn}).` : `進入院方復健醫學科門診表後，請選擇「${doctor.name}」。`}</p>
              <TrackedAnchor href={record.bookingUrl} target="_blank" rel="noopener noreferrer" eventName="booking_clicked" eventProperties={{ locale: en ? 'en' : 'zh-TW', placement: 'doctor_clinic_card', clinic_slug: clinic.slug }} className="block rounded-xl bg-neutral-950 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-300">{en ? 'Official hospital appointments ↗' : '前往院方官方掛號 ↗'}</TrackedAnchor>
              <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs">
                <TrackedInternalLink href={`${prefix}/locations/${clinic.slug}`} eventName="location_opened" eventProperties={{ locale: en ? 'en' : 'zh-TW', placement: 'doctor_clinic_card_details', clinic_slug: clinic.slug }} className="text-neutral-600 hover:underline dark:text-neutral-300">{en ? 'Location details →' : '院區詳情 →'}</TrackedInternalLink>
                <TrackedAnchor href={clinic.mapUrl} target="_blank" rel="noopener noreferrer" eventName="location_opened" eventProperties={{ locale: en ? 'en' : 'zh-TW', placement: 'doctor_clinic_card_map', clinic_slug: clinic.slug }} className="text-neutral-600 hover:underline dark:text-neutral-300">Google Maps ↗</TrackedAnchor>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
