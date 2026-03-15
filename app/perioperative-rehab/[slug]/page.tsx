import type { Metadata } from 'next'
import Link from 'next/link'

interface Props {
  params: { slug: string }
}

export const metadata: Metadata = {
  title: '術後復健計畫',
  description: '術後復健計畫內容籌備中，歡迎來電諮詢 CAM Savant 醫療團隊。',
}

export default function PerioperativeRehabSlugPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-10 text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-500"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900">
          內容籌備中
        </h1>
        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
          此術後復健計畫頁面正在由 CAM Savant 醫療團隊整理撰寫中，
          歡迎透過電話或門診直接與醫師諮詢個別化復健方案。
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/perioperative-rehab"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-sm font-medium px-5 py-2.5 hover:bg-neutral-50 transition-colors"
          >
            ← 返回術後復健
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-950 text-white text-sm font-medium px-5 py-2.5 hover:bg-neutral-700 transition-colors"
          >
            聯絡醫療團隊
          </Link>
        </div>

      </div>
    </div>
  )
}
