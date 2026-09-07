import type { ClinicLocation } from './locations'

export interface DoctorClinic {
  doctorSlug: string
  clinicSlug: ClinicLocation['slug']
  schedule: string[]
  scheduleEn: string[]
  bookingUrl: string
  sourceUrl: string
  sourceLabel: string
  sourceLabelEn: string
  /** Date the linked official source was actually consulted; not a medical review date. */
  checkedAt?: string
  verificationStatus: 'verified' | 'pending'
  note?: string
  noteEn?: string
}

/**
 * The only source for each physician's clinic appointments.
 * Official public appointment pages were read on 2026-09-07, for September 7–12.
 * Links intentionally use stable department entry pages: individual appointment
 * links include a single visit date and expire. The UI names the doctor to select.
 * A source check does not establish a medical-content review or future availability.
 */
export const DOCTOR_CLINICS: DoctorClinic[] = [
  {
    doctorSlug: 'yu-kai-yang',
    clinicSlug: 'changhua',
    schedule: ['週一 晚上', '週三 下午', '週五 上午'],
    scheduleEn: ['Monday evening', 'Wednesday afternoon', 'Friday morning'],
    bookingUrl: 'https://www1.cch.org.tw/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceUrl: 'https://www1.cch.org.tw/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceLabel: '彰基官方復健醫學科門診表',
    sourceLabelEn: 'Changhua official rehabilitation appointment schedule',
    checkedAt: '2026-09-07',
    verificationStatus: 'verified',
    note: '已核對 2026-09-07 至 09-12 門診表。週二下午另列「體系醫院掛號」，請先洽院方；實際開診、名額與異動以官方系統為準。',
    noteEn: 'Checked against the September 7–12, 2026 schedule. Tuesday afternoon is separately listed for hospital-network registration; contact the hospital about that session. Confirm current sessions and availability in the official system.',
  },
  {
    doctorSlug: 'yu-kai-yang',
    clinicSlug: 'nantou',
    schedule: ['週一 上午', '週四 上午'],
    scheduleEn: ['Monday morning', 'Thursday morning'],
    bookingUrl: 'https://ny.cch.org.tw/nyrg/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceUrl: 'https://ny.cch.org.tw/nyrg/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceLabel: '南基官方復健醫學科門診表',
    sourceLabelEn: 'Nantou official rehabilitation appointment schedule',
    checkedAt: '2026-09-07',
    verificationStatus: 'verified',
    note: '已核對 2026-09-07 至 09-12 門診表；實際開診、名額與異動以官方系統為準。',
    noteEn: 'Checked against the September 7–12, 2026 schedule. Confirm current sessions and availability in the official system.',
  },
  {
    doctorSlug: 'yu-kai-yang',
    clinicSlug: 'erlin',
    schedule: ['週三 上午'],
    scheduleEn: ['Wednesday morning'],
    bookingUrl: 'https://erhlin.cch.org.tw/20rg/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceUrl: 'https://erhlin.cch.org.tw/20rg/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceLabel: '二基官方復健醫學科門診表',
    sourceLabelEn: 'Erlin official rehabilitation appointment schedule',
    checkedAt: '2026-09-07',
    verificationStatus: 'verified',
    note: '已核對 2026-09-07 至 09-12 門診表；實際開診、名額與異動以官方系統為準。',
    noteEn: 'Checked against the September 7–12, 2026 schedule. Confirm current sessions and availability in the official system.',
  },
  {
    doctorSlug: 'wen-wei-lai',
    clinicSlug: 'changhua',
    schedule: ['週一 下午', '週六 上午（請先確認是否開診）'],
    scheduleEn: ['Monday afternoon', 'Saturday morning (confirm availability first)'],
    bookingUrl: 'https://www1.cch.org.tw/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceUrl: 'https://www1.cch.org.tw/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceLabel: '彰基官方復健醫學科門診表',
    sourceLabelEn: 'Changhua official rehabilitation appointment schedule',
    checkedAt: '2026-09-07',
    verificationStatus: 'verified',
    note: '已核對 2026-09-07 至 09-12 門診表，其中 09-12 週六標示請假。週四上午超音波約診時段尚待院方確認；實際開診與約診安排請先洽院方。',
    noteEn: 'Checked against the September 7–12, 2026 schedule; September 12 is marked as leave. The Thursday morning ultrasound appointment session remains unconfirmed. Check sessions and appointment-only arrangements with the hospital.',
  },
  {
    doctorSlug: 'wen-wei-lai',
    clinicSlug: 'hanming',
    schedule: ['週一 上午', '週三 上午'],
    scheduleEn: ['Monday morning', 'Wednesday morning'],
    bookingUrl: 'https://opdhm.cch.org.tw/hmrg/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceUrl: 'https://opdhm.cch.org.tw/hmrg/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceLabel: '漢銘官方復健醫學科門診表',
    sourceLabelEn: 'Hanming official rehabilitation appointment schedule',
    checkedAt: '2026-09-07',
    verificationStatus: 'verified',
    note: '已核對 2026-09-07 至 09-12 門診表；實際開診、名額與異動以官方系統為準。',
    noteEn: 'Checked against the September 7–12, 2026 schedule. Confirm current sessions and availability in the official system.',
  },
  {
    doctorSlug: 'wen-wei-lai',
    clinicSlug: 'yuanlin',
    schedule: ['週五 下午'],
    scheduleEn: ['Friday afternoon'],
    bookingUrl: 'https://bc.cch.org.tw/bcrg/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceUrl: 'https://bc.cch.org.tw/bcrg/opd/service-e.aspx?id=1400&Page=11&#p',
    sourceLabel: '員基官方復健醫學科門診表',
    sourceLabelEn: 'Yuanlin official rehabilitation appointment schedule',
    checkedAt: '2026-09-07',
    verificationStatus: 'verified',
    note: '已核對 2026-09-07 至 09-12 門診表；實際開診、名額與異動以官方系統為準。',
    noteEn: 'Checked against the September 7–12, 2026 schedule. Confirm current sessions and availability in the official system.',
  },
]

export function getDoctorClinics(doctorSlug: string): DoctorClinic[] {
  return DOCTOR_CLINICS.filter((clinic) => clinic.doctorSlug === doctorSlug)
}

export function getClinicDoctors(clinicSlug: string): DoctorClinic[] {
  return DOCTOR_CLINICS.filter((clinic) => clinic.clinicSlug === clinicSlug)
}
