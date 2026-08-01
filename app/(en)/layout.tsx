import type { Metadata } from 'next'
import Script from 'next/script'
import '../globals.css'
import { Analytics } from '@vercel/analytics/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingChatButton from '@/components/FloatingChatButton'
import BackToTop from '@/components/BackToTop'
import AdminPeriopQrButton from '@/components/AdminPeriopQrButton'

const BASE_URL = 'https://camsavant.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CAM Savant | Rehabilitation and Sports Medicine in Central Taiwan',
    template: '%s | CAM Savant',
  },
  description:
    'A physician-led medical knowledge platform serving international patients in Changhua and Nantou, Taiwan, with rehabilitation, sports medicine, regenerative medicine, and postoperative care information.',
  keywords: [
    'rehabilitation Taiwan',
    'sports medicine Taiwan',
    'Changhua rehabilitation doctor',
    'Nantou rehabilitation doctor',
    'postoperative rehabilitation',
    'PRP therapy Taiwan',
    'prolotherapy Taiwan',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_TW'],
    siteName: 'CAM Savant',
    title: 'CAM Savant | Rehabilitation and Sports Medicine in Taiwan',
    description:
      'English information about our medical team, clinic locations, and postoperative rehabilitation guides.',
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'CAM Savant medical knowledge platform',
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  '@id': `${BASE_URL}/#organization`,
  name: 'CAM Savant',
  alternateName: ['CAMsavant', 'CAM SAVANT'],
  description:
    'A physician-led rehabilitation medicine, sports medicine, regenerative medicine, and postoperative rehabilitation knowledge platform in central Taiwan.',
  url: `${BASE_URL}/en`,
  logo: `${BASE_URL}/images/logo.png`,
  areaServed: ['Changhua County', 'Nantou County', 'Taichung City', 'Yunlin County'],
  medicalSpecialty: [
    'PhysicalMedicineAndRehabilitation',
    'SportsMedicine',
    'FamilyMedicine',
  ],
}

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CAM Savant" />
        <meta name="theme-color" content="#0f766e" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script
              id="ga4-init-en"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}',{page_path:window.location.pathname});`,
              }}
            />
          </>
        )}
        <script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function() {});
    });
  }
` }} />
        <Navbar locale="en" />
        <main className="flex-1">{children}</main>
        <Footer locale="en" />
        <FloatingChatButton locale="en" />
        <AdminPeriopQrButton locale="en" />
        <BackToTop locale="en" />
        <Analytics />
      </body>
    </html>
  )
}
