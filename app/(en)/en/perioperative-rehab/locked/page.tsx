import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Patient Access Required',
  robots: { index: false, follow: false },
}

export default function EnglishLockedPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] dark:bg-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <span className="text-2xl" aria-hidden="true">🔒</span>
        </div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-4">CAM SAVANT</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-100 mb-3">This area is for current patients</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">Please scan the QR code provided by the medical team during your clinic visit to obtain access.</p>
        <Link href="/en" className="inline-block px-6 py-2.5 text-sm font-medium tracking-wide border border-neutral-950 dark:border-neutral-100 text-neutral-950 dark:text-neutral-100 hover:bg-neutral-950 hover:text-white dark:hover:bg-neutral-100 dark:hover:text-neutral-950 transition-colors">Back to English home</Link>
        <div className="mt-5"><Link href="/admin-login" className="text-xs text-neutral-400 underline-offset-4 hover:text-neutral-700 dark:hover:text-neutral-200 hover:underline">Administrator sign-in</Link></div>
      </div>
    </div>
  )
}
