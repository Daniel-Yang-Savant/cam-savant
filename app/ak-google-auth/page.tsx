import type { Metadata } from 'next'
import { GoogleAuthBridge } from './google-auth-bridge'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: '會員 Google 登入',
  robots: { index: false, follow: false },
}

const FALLBACK_GOOGLE_CLIENT_ID = '753627700752-rra259kisjdhhd2i7p4nrv04fcrbf7jf.apps.googleusercontent.com'
const DEFAULT_MEMBER_ORIGIN = 'https://members.camsavant.com'
const ALLOWED_MEMBER_ORIGINS = new Set([
  DEFAULT_MEMBER_ORIGIN,
  'https://art-clinical-reference.hermiterudite.chatgpt.site',
])

export default function AkGoogleAuthPage({ searchParams }: { searchParams: { state?: string; origin?: string } }) {
  const state = searchParams.state ?? ''
  const targetOrigin = searchParams.origin && ALLOWED_MEMBER_ORIGINS.has(searchParams.origin)
    ? searchParams.origin
    : DEFAULT_MEMBER_ORIGIN
  const clientId = process.env.GOOGLE_CLIENT_ID || FALLBACK_GOOGLE_CLIENT_ID

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-teal-400 uppercase">Clinical Reference</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">會員身分確認</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">選擇 Google 帳號後，系統會返回 CAM Savant 會員專區。</p>
        <GoogleAuthBridge clientId={clientId} state={state} targetOrigin={targetOrigin} />
        <p className="mt-6 text-xs leading-5 text-neutral-500">僅傳送 Google 簽章憑證至會員專區，用來驗證姓名與電子郵件。</p>
      </section>
    </main>
  )
}
