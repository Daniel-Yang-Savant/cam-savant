import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '存取受限 | CAM Savant',
  robots: { index: false, follow: false },
}

export default function LockedPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-neutral-300 bg-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-neutral-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V7a4.5 4.5 0 10-9 0v3.5M5 10.5h14a1 1 0 011 1V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-8.5a1 1 0 011-1z"
            />
          </svg>
        </div>

        {/* Brand */}
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-4">
          CAM SAVANT
        </p>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950 mb-3">
          此頁面僅供就診患者閱覽
        </h1>

        {/* Description */}
        <p className="text-sm text-neutral-500 leading-relaxed mb-8">
          請於診間掃描醫療團隊提供的 QR Code 以取得存取權限。
        </p>

        {/* Back button */}
        <Link
          href="/"
          className="inline-block px-6 py-2.5 text-sm font-medium tracking-wide border border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white transition-colors"
        >
          返回首頁
        </Link>
      </div>
    </main>
  )
}
