import { safeJsonLd } from '@/lib/safe-json'
import type { Metadata } from 'next'
import { generateOrganizationSchema } from '@/lib/schema'
import '../globals.css'
import PrivacyAnalytics from '@/components/PrivacyAnalytics'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingChatButton from '@/components/FloatingChatButton'
import BackToTop from '@/components/BackToTop'
import AdminPeriopQrButton from '@/components/AdminPeriopQrButton'
import { AdminSessionProvider } from '@/components/AdminSessionProvider'

const BASE_URL = 'https://camsavant.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CAM Savant｜中部復健科・運動醫學',
    template: '%s | CAM Savant',
  },
  description:
    '由醫師團隊主筆的復健醫學、運動醫學與家庭醫學知識平台，提供醫師介紹、醫療衛教與各醫師看診資訊。',
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: 'CAM Savant',
    title: 'CAM Savant｜中部復健科・運動醫學・增生療法',
    description:
      '由醫師團隊主筆的醫療衛教知識平台，提供醫師專長、官方資料與各院區看診入口。',
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'CAM Savant 整合醫學知識平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-default.png'],
  },
  verification: {
    google: 'euJh5fYdcIMwx-LX8iKntpCQVj2mSrlYckDt1f_wYew',
  },
}

const jsonLd = generateOrganizationSchema('zh')

// ── Root Layout ────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* ── PWA / App icons ── */}
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CAM Savant" />
        <meta name="theme-color" content="#0f766e" />
        {/* ── RSS feed discovery ── */}
        <link rel="alternate" type="application/rss+xml" title="CAM Savant RSS" href="/feed.xml" />
        {/* ── Dark-mode detection: runs before paint to prevent FOUC ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
        {/* ── Google Analytics 4（afterInteractive：不阻塞首屏渲染） ── */}

        {/* ── Service Worker registration ── */}
        <script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function() {});
    });
  }
` }} />
        <AdminSessionProvider>
          <Navbar locale="zh" />
          <main className="flex-1">{children}</main>
          <Footer locale="zh" />
          <FloatingChatButton locale="zh" />
          <AdminPeriopQrButton />
          <BackToTop locale="zh" />
          <PrivacyAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </AdminSessionProvider>
      </body>
    </html>
  )
}
