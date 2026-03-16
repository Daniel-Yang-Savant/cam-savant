import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* ── Brand ── */}
          <div className="max-w-xs">
            <Link
              href="/"
              className="text-base font-bold tracking-[0.18em] text-neutral-950 dark:text-neutral-100"
            >
              CAM SAVANT
            </Link>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              整合醫學知識平台，深入探索運動醫學、功能醫學與 FSM 頻率特異性微電流的臨床實證。
            </p>
          </div>

          {/* ── Links ── */}
          <div className="flex gap-14">
            <div>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                分類
              </h3>
              <ul className="space-y-2.5">
                {[
                  ['/sports-medicine',     '運動醫學'],
                  ['/functional-medicine', '功能醫學'],
                  ['/fsm',                 'FSM'],
                ].map(([href, label]) => (
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
                網站
              </h3>
              <ul className="space-y-2.5">
                {[
                  ['/',         '首頁'],
                  ['/posts',    '所有文章'],
                  ['/about',    '關於'],
                  ['/privacy',  '隱私權政策'],
                  ['/terms',    '使用條款'],
                ].map(([href, label]) => (
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
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            © {year} CAM Savant．本站內容僅供醫療專業人員學習參考，不構成個別診療建議。
          </p>
        </div>

        {/* ── Copyright ── */}
        <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center sm:text-left">
            © {year} CAM Savant．本網站所有內容（文字、圖片、復健計畫）著作權均歸 CAM Savant 醫療團隊所有，未經書面授權禁止轉載、複製或商業使用。
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/privacy" className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              隱私權政策
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <Link href="/terms" className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
              使用條款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
