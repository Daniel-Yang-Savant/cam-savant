import Link from 'next/link'
import type { Lang } from '@/lib/i18n'

export default function Footer({ locale = 'zh' }: { locale?: Lang }) {
  const year = new Date().getFullYear()
  const isEnglish = locale === 'en'
  const homeHref = isEnglish ? '/en' : '/'
  const categoryLinks = isEnglish
    ? [
        ['/en/about', 'Medical Team'],
        ['/en/locations', 'Clinic Information'],
        ['/en/perioperative-rehab', 'Postoperative Rehabilitation'],
      ]
    : [
        ['/sports-medicine', '運動醫學'],
        ['/rehabilitation-medicine', '復健醫學'],
        ['/functional-medicine', '功能醫學'],
        ['/weekly-picks', '每週論文精選'],
        ['/fsm', 'FSM'],
      ]
  const siteLinks = isEnglish
    ? [
        ['/en', 'Home'],
        ['/en/about', 'Medical Team'],
        ['/en/locations', 'Clinic Information'],
      ]
    : [
        ['/', '首頁'],
        ['/posts', '所有文章'],
        ['/about', '醫師團隊'],
        ['/locations', '看診資訊'],
      ]

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* ── Brand ── */}
          <div className="max-w-md">
            <Link
              href={homeHref}
              className="text-base font-bold tracking-[0.18em] text-neutral-950 dark:text-neutral-100"
            >
              CAM SAVANT
            </Link>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {isEnglish
                ? 'An integrative medical knowledge platform focused on rehabilitation medicine, sports medicine, functional medicine, and Frequency Specific Microcurrent.'
                : '整合醫學知識平台，深入探索復健醫學、運動醫學、功能醫學與 FSM 頻率特異性微電流的臨床實證。'}
            </p>
          </div>

          {/* ── Links ── */}
          <div className="flex gap-16">
            <div>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                {isEnglish ? 'Explore' : '分類'}
              </h3>
              <ul className="space-y-2.5">
                {categoryLinks.map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                {isEnglish ? 'Website' : '網站'}
              </h3>
              <ul className="space-y-2.5">
                {siteLinks.map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="https://members.camsavant.com/login?returnTo=%2Fworkspace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
                  >
                    {isEnglish ? 'Member Portal' : '會員專區'}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Copyright ── */}
        <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
            {isEnglish
              ? `© ${year} CAM Savant Medical Team · Content is provided for education only and does not replace individualized medical advice.`
              : `© ${year} CAM Savant 醫療團隊 · 臨床實證內容供醫療專業人員參考；圖解運動專區亦提供一般民眾健康教育。所有內容均不構成個別診療建議，未經書面授權禁止轉載、複製或商業使用。`}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/privacy" className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              {isEnglish ? 'Privacy Policy (Chinese)' : '隱私權政策'}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <Link href="/terms" className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              {isEnglish ? 'Terms (Chinese)' : '使用條款'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
