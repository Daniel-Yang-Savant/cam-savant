import type { Metadata } from 'next'
import Link from 'next/link'
import { CLINIC_LOCATIONS } from '@/lib/locations'
import { bilingualAlternates } from '@/lib/locales'
import { TrackedAnchor, TrackedInternalLink } from '@/components/TrackedLink'

export const metadata: Metadata = {
  title: '地區看診資訊',
  description: '依彰化、員林、南投及二林／雲林鄰近地區整理復健科院所地址、電話、交通與官方掛號資訊。',
  alternates: bilingualAlternates('/locations'),
  openGraph: {
    title: '地區看診資訊 | CAM Savant',
    description: '依地區查看彰化、員林、南投及二林／雲林鄰近地區的復健科院所與官方掛號資訊。',
  },
}

const colorMap: Record<string, { badge: string; border: string; icon: string }> = {
  blue:  { badge: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-900', icon: 'text-blue-500' },
  green: { badge: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300', border: 'border-green-100 dark:border-green-900', icon: 'text-green-500' },
  amber: { badge: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300', border: 'border-amber-100 dark:border-amber-900', icon: 'text-amber-500' },
}

const regionGroups = [
  {
    key: 'changhua',
    name: '彰化地區',
    description: '彰化市與中彰地區，包含彰基總院及漢銘院區',
    slugs: ['changhua', 'hanming'],
    color: 'blue',
  },
  {
    key: 'yuanlin',
    name: '員林地區',
    description: '員林市與鄰近地區',
    slugs: ['yuanlin'],
    color: 'amber',
  },
  {
    key: 'erlin',
    name: '二林・雲林鄰近地區',
    description: '二林位於南彰化，鄰近雲林地區',
    slugs: ['erlin'],
    color: 'amber',
  },
  {
    key: 'nantou',
    name: '南投地區',
    description: '南投市與鄰近地區',
    slugs: ['nantou'],
    color: 'green',
  },
] as const

export default function LocationsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <header className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
          Clinic Locations
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-950 dark:text-neutral-100">
          看診資訊
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
          依地區查看團隊成員目前服務的復健科院所。各院區頁面提供地址、電話、交通方式與官方掛號連結。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 items-stretch">
        {regionGroups.map((region) => {
          const c = colorMap[region.color]
          const clinics = region.slugs
            .map((slug) => CLINIC_LOCATIONS.find((clinic) => clinic.slug === slug))
            .filter((clinic): clinic is NonNullable<typeof clinic> => clinic !== undefined)

          return (
            <section
              key={region.key}
              className={`rounded-2xl border ${c.border} bg-white dark:bg-neutral-900 p-6 ${region.key === 'changhua' ? 'lg:row-span-2' : ''} ${region.key === 'nantou' ? 'lg:col-span-2' : ''}`}
            >
              <header className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <h2 className={`text-base font-bold ${c.icon}`}>{region.name}</h2>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{region.description}</p>
              </header>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {clinics.map((clinic) => (
                  <article key={clinic.slug} className="py-5 last:pb-0 flex flex-col gap-4">
                    <div>
                      <span className={`inline-flex text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${c.badge}`}>
                        {clinic.department}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-neutral-950 dark:text-neutral-100 leading-tight">{clinic.hospital}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">{clinic.hospitalEn}</p>
                    </div>

                    <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                      <li className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 flex-shrink-0 ${c.icon}`}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{clinic.address}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${c.icon}`}>
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 17.5z"/>
                        </svg>
                        <a href={clinic.phoneHref} className="hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">{clinic.phone}</a>
                      </li>
                    </ul>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <TrackedInternalLink
                        href={`/locations/${clinic.slug}`}
                        eventName="location_opened"
                        eventProperties={{ locale: 'zh-TW', placement: 'locations_index_details', clinic_slug: clinic.slug }}
                        className="text-center text-xs font-semibold py-2.5 rounded-xl bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
                      >
                        院區詳情
                      </TrackedInternalLink>
                      <TrackedAnchor
                        href={clinic.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        eventName="booking_clicked"
                        eventProperties={{ locale: 'zh-TW', placement: 'locations_index', clinic_slug: clinic.slug }}
                        className="text-center text-xs font-semibold py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors"
                      >
                        預約掛號
                      </TrackedAnchor>
                      <TrackedAnchor
                        href={clinic.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        eventName="location_opened"
                        eventProperties={{ locale: 'zh-TW', placement: 'locations_index_map', clinic_slug: clinic.slug }}
                        className="text-center text-xs py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-950 dark:hover:border-neutral-100 transition-colors"
                      >
                        地圖導航
                      </TrackedAnchor>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <aside className="rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-5 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">注意事項：</span>
        門診時間可能因假期或排班異動而更改，建議來電或至各醫院官網查詢最新門診表。初診患者建議提前確認是否需要轉診單。
      </aside>

      <nav className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-6">
        <Link href="/about" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">
          ← 醫師團隊介紹
        </Link>
        <Link href="/" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors">
          返回首頁
        </Link>
      </nav>
    </div>
  )
}
