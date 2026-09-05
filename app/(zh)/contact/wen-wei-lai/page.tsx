import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { bilingualAlternates } from '@/lib/locales'
import { TrackedAnchor } from '@/components/TrackedLink'

export const metadata: Metadata = {
  title: '賴玟衛醫師 看診資訊',
  description: '賴玟衛醫師門診時間與預約方式——彰化基督教醫院、漢銘基督教醫院、員林基督教醫院復健科門診。',
  alternates: bilingualAlternates('/contact/wen-wei-lai'),
  openGraph: {
    title: '賴玟衛醫師 看診資訊 | CAM Savant',
    description: '賴玟衛醫師門診時間與預約方式，服務彰化地區患者。',
  },
}

// ── Clinic data ────────────────────────────────────────────────────────────

const clinics = [
  {
    slug: 'changhua',
    hospital: '彰化基督教醫院',
    hospitalEn: 'Changhua Christian Hospital',
    dept: '復健科',
    address: '彰化市南校街135號',
    mapUrl: 'https://maps.google.com/?q=彰化基督教醫院',
    bookingUrl: 'https://www1.cch.org.tw/opd/service-e.aspx?id=1400&Page=11&#p',
    phone: '(04) 723-8595',
    schedule: ['週一 下午', '週四 上午（超音波・約診）', '週六 上午'],
    color: 'blue',
  },
  {
    slug: 'hanming',
    hospital: '漢銘基督教醫院',
    hospitalEn: 'Hanming Christian Hospital',
    dept: '復健科',
    address: '彰化市中山路一段366號',
    mapUrl: 'https://maps.google.com/?q=漢銘基督教醫院',
    bookingUrl: 'https://opdhm.cch.org.tw/hmrg/opd/service-e.aspx?id=1400&Page=11&#p',
    phone: '(04) 711-3456',
    schedule: ['週一 上午', '週三 上午'],
    color: 'green',
  },
  {
    slug: 'yuanlin',
    hospital: '員林基督教醫院',
    hospitalEn: 'Yuanlin Christian Hospital',
    dept: '復健科',
    address: '彰化縣員林市莒光路456號',
    mapUrl: 'https://maps.google.com/?q=員林基督教醫院',
    bookingUrl: 'https://bc.cch.org.tw/bcrg/opd/service-e.aspx?id=1400&Page=11&#p',
    phone: '(04) 838-1456',
    schedule: ['週五 下午'],
    color: 'amber',
  },
]

const colorMap: Record<string, { badge: string; border: string; icon: string }> = {
  blue:  { badge: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-900', icon: 'text-blue-500' },
  green: { badge: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300', border: 'border-green-100 dark:border-green-900', icon: 'text-green-500' },
  amber: { badge: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300', border: 'border-amber-100 dark:border-amber-900', icon: 'text-amber-500' },
}

// ── Specialties ─────────────────────────────────────────────────────────────

const specialties = [
  '復健醫學',
  '肌肉骨骼超音波',
  '超音波導引注射',
]

// ── Page ───────────────────────────────────────────────────────────────────

export default function LaiContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">

      {/* ── Header ── */}
      <div className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
          Clinic Info
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
          看診資訊
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
          賴玟衛醫師目前服務於彰化、漢銘、員林三家基督教醫院復健科，提供復健醫學與超音波導引注射等專科門診。
        </p>
      </div>

      {/* ── Doctor card ── */}
      <div className="mb-12 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-start gap-5">
        <div
          className="relative overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0"
          style={{ width: 72, height: 90, borderRadius: '9999px 9999px 0 0' }}
        >
          <Image
            src="/images/team/wen-wei-lai.jpg"
            alt="賴玟衛醫師"
            fill
            className="object-cover object-top"
            sizes="72px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-100">賴玟衛 醫師</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">復健科醫師 · Wen-Wei Lai, MD</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['骨鬆醫學會會員', '增生醫學會會員'].map((c) => (
              <span key={c} className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                {c}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {specialties.map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Clinic cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {clinics.map((clinic) => {
          const c = colorMap[clinic.color]
          return (
            <div key={clinic.hospital} className={`rounded-2xl border ${c.border} bg-white dark:bg-neutral-900 p-6 flex flex-col gap-4`}>

              {/* Hospital name */}
              <div>
                <span className={`text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${c.badge}`}>
                  {clinic.dept}
                </span>
                <h3 className="mt-2 text-lg font-bold text-neutral-950 dark:text-neutral-100 leading-tight">
                  {clinic.hospital}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">{clinic.hospitalEn}</p>
              </div>

              {/* Info rows */}
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  {/* Map pin icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 flex-shrink-0 ${c.icon}`}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{clinic.address}</span>
                </li>
                <li className="flex items-center gap-2">
                  {/* Phone icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${c.icon}`}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 17.5z"/>
                  </svg>
                  <span>{clinic.phone}</span>
                </li>
                <li className="flex items-start gap-2">
                  {/* Clock icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-1 flex-shrink-0 ${c.icon}`}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div className="flex flex-wrap gap-1.5">
                    {clinic.schedule.map((s) => (
                      <span key={s} className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </li>
              </ul>

              {/* Action buttons */}
              <div className="mt-auto flex flex-col gap-2 pt-2">
                <TrackedAnchor
                  href={clinic.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="booking_clicked"
                  eventProperties={{ locale: 'zh-TW', placement: 'doctor_contact', clinic_slug: clinic.slug }}
                  className="w-full text-center text-sm font-semibold py-2.5 rounded-xl bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
                >
                  線上預約掛號
                </TrackedAnchor>
                <TrackedAnchor
                  href={clinic.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="location_opened"
                  eventProperties={{ locale: 'zh-TW', placement: 'doctor_contact_map', clinic_slug: clinic.slug }}
                  className="w-full text-center text-sm py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-950 dark:hover:border-neutral-100 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
                >
                  Google Maps 導航
                </TrackedAnchor>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Note ── */}
      <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-5 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        <p>
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">注意事項：</span>
          門診時間可能因假期或排班異動而更改，建議來電或至各醫院官網查詢最新門診表。約診項目（如超音波診）請先電話確認。初診患者建議提前確認是否需要轉診單。
        </p>
      </div>

      {/* ── Back to articles ── */}
      <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-6">
        <Link href="/about" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">
          ← 醫師團隊介紹
        </Link>
        <Link href="/" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">
          返回首頁
        </Link>
      </div>

    </div>
  )
}
