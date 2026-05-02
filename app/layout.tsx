import type { Metadata } from 'next'
import { Inter, Noto_Sans_TC } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingChatButton from '@/components/FloatingChatButton'
import BackToTop from '@/components/BackToTop'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-tc',
  display: 'swap',
})

const BASE_URL = 'https://cam-savant.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CAM Savant | 彰化・南投・台中・雲林 復健科・運動醫學・增生療法・PRP・FSM',
    template: '%s | CAM Savant',
  },
  description:
    '彰化、南投、台中、雲林地區復健科與運動醫學專業團隊，提供增生療法、PRP治療、骨質疏鬆、超音波導引注射、FSM頻率共振微電流與功能醫學服務。',
  keywords: [
    '彰化復健科', '南投復健科', '台中復健科', '雲林復健科', '二林復健科',
    '運動醫學', '復健醫學', '增生療法', 'PRP治療', '骨質疏鬆',
    'FSM', '功能醫學', '超音波導引注射',
    '彰化基督教醫院', '南投基督教醫院', '二林基督教醫院',
    '術後復健', '術前復健', 'ACL復健', '旋轉肌復健',
    '網球肘復健', '腳踝扭傷復健', '足底筋膜炎', '過度訓練症候群',
    '頭頸癌復健', '心肺復健', 'CABG術後', '肺癌手術復健', '彰化術後復健',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: 'CAM Savant',
    title: 'CAM Savant | 彰化・南投・台中・雲林 復健科・運動醫學・增生療法・PRP・FSM',
    description:
      '彰化、南投、台中、雲林地區復健科與運動醫學專業團隊，提供增生療法、PRP治療、骨質疏鬆、超音波導引注射、FSM及功能醫學服務。',
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

// ── JSON-LD Structured Data ────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalOrganization',
      '@id': 'https://cam-savant.vercel.app/#organization',
      name: 'CAM Savant',
      description:
        '彰化、南投、台中、雲林地區復健科・運動醫學・增生療法・PRP・FSM專業醫療團隊',
      url: 'https://cam-savant.vercel.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cam-savant.vercel.app/images/logo.png',
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'TW',
        addressRegion: '彰化縣',
        addressLocality: '彰化市',
      },
      areaServed: ['彰化縣', '南投縣', '台中市', '雲林縣'],
      medicalSpecialty: [
        'PhysicalMedicineAndRehabilitation',
        'SportsMedicine',
        'InternalMedicine',
        'PhysicalTherapy',
      ],
      member: [
        {
          '@type': 'Physician',
          '@id': 'https://cam-savant.vercel.app/#physician-yang-yu-kai',
          name: '楊育愷',
          alternateName: 'Yu-Kai Yang, MD',
          jobTitle: '復健科主治醫師',
          areaServed: ['彰化縣', '南投縣'],
          medicalSpecialty: [
            'PhysicalMedicineAndRehabilitation',
            'SportsMedicine',
          ],
          affiliation: [
            {
              '@type': 'Hospital',
              name: '彰化基督教醫院',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'TW',
                addressRegion: '彰化縣',
                addressLocality: '彰化市',
              },
            },
            {
              '@type': 'Hospital',
              name: '南投基督教醫院',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'TW',
                addressRegion: '南投縣',
                addressLocality: '南投市',
              },
            },
            {
              '@type': 'Hospital',
              name: '二林基督教醫院',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'TW',
                addressRegion: '彰化縣',
                addressLocality: '二林鎮',
              },
            },
          ],
          knowsAbout: ['增生療法', 'PRP治療', '骨質疏鬆', 'FSM頻率共振微電流', '超音波導引注射', '運動傷害'],
        },
        {
          '@type': 'Physician',
          '@id': 'https://cam-savant.vercel.app/#physician-yang-yu-chang',
          name: '楊育彰',
          alternateName: 'Yu-Chang Yang, MD',
          jobTitle: '家庭醫學科專科醫師',
          medicalSpecialty: ['FamilyMedicine'],
          knowsAbout: ['針灸', '減重', '醫美', '功能醫學'],
        },
        {
          '@type': 'Physician',
          '@id': 'https://cam-savant.vercel.app/#physician-lai-wen-wei',
          name: '賴玟衛',
          alternateName: 'Wen-Wei Lai, MD',
          jobTitle: '復健科醫師',
          areaServed: ['彰化縣', '南投縣'],
          medicalSpecialty: ['PhysicalMedicineAndRehabilitation'],
          knowsAbout: ['復健醫學', '骨質疏鬆', '增生療法'],
        },
        {
          '@type': 'Physician',
          '@id': 'https://cam-savant.vercel.app/#physician-huang-ya-chi',
          name: '黃雅琦',
          alternateName: 'Ya-Chi Huang, MD',
          jobTitle: '復健科醫師',
          medicalSpecialty: ['PhysicalMedicineAndRehabilitation'],
          knowsAbout: ['復健醫學'],
        },
      ],
    },
  ],
}

// ── Root Layout ────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${notoSansTC.variable}`} suppressHydrationWarning>
      <head>
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* ── Google Analytics 4 ── */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}',{page_path:window.location.pathname});`,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
        <script dangerouslySetInnerHTML={{ __html: `
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('keydown', function(e) {
    if (
      (e.ctrlKey || e.metaKey) &&
      ['c','u','s','a','p'].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }
    if (e.key === 'F12') e.preventDefault();
  });
` }} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingChatButton />
        <BackToTop />
        <Analytics />
      </body>
    </html>
  )
}
