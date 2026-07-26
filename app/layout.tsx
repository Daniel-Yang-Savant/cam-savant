import type { Metadata } from 'next'
import Script from 'next/script'
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
  preload: true,
})

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-noto-tc',
  display: 'swap',
  preload: false, // CJK 字型龐大，不 preload 避免阻塞渲染
})

const BASE_URL = 'https://camsavant.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CAM Savant｜中部復健科・運動醫學',
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
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: 'CAM Savant',
    title: 'CAM Savant｜中部復健科・運動醫學・增生療法',
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

// 👉 待補：各醫師的權威外部檔案 URL，例如：
//    - 彰化基督教醫院／南投基督教醫院官網的醫師介紹頁
//    - Google 商家（Google Business Profile）連結
//    - 台灣運動醫學醫學會、增生醫學會等學會會員頁
//    - 官方 Facebook／Instagram 專頁
// 填入真實網址後，ChatGPT／Gemini／Claude 更容易確認醫師身分並具名推薦。
// 留空陣列則不會輸出 sameAs（切勿填入非本人的網址）。
const PHYSICIAN_SAME_AS: Record<string, string[]> = {
  'yang-yu-kai': [
    'https://dpt.cch.org.tw/layout/layout_1/doctor.aspx?ID=1400&Key=11334', // 彰化基督教醫院 復健醫學部 醫師介紹
    'https://ny.cch.org.tw/doctor_1_detial.aspx?cID=65&key=1400', // 南投基督教醫院 醫師介紹
    'https://www.toa1997.org.tw/orthopedist/?n=%E6%A5%8A%E8%82%B2%E6%84%B7', // 中華民國骨質疏鬆症學會 專科醫師名錄（證號905）
  ],
  'yang-yu-chang': [],
  'lai-wen-wei': [],
  'huang-ya-chi': [],
}

// 將字串證照轉為 schema.org 的 EducationalOccupationalCredential
const cred = (names: string[]) =>
  names.map((name) => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'professional certification',
    name,
  }))

// 若有外部檔案 URL 才輸出 sameAs
const sameAs = (key: string) => {
  const urls = PHYSICIAN_SAME_AS[key] ?? []
  return urls.length ? { sameAs: urls } : {}
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalOrganization',
      '@id': 'https://camsavant.com/#organization',
      name: 'CAM Savant',
      alternateName: ['CAMsavant', 'CAM SAVANT'],
      description:
        '彰化、南投、台中、雲林地區復健科・運動醫學・增生療法・PRP・FSM專業醫療團隊',
      url: 'https://camsavant.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://camsavant.com/images/logo.png',
        width: 512,
        height: 512,
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
          '@id': 'https://camsavant.com/doctors/yu-kai-yang#physician',
          name: '楊育愷',
          alternateName: 'Yu-Kai Yang, MD',
          jobTitle: [
            '彰化基督教醫院復健醫學部主治醫師',
            '南投基督教醫院復健科主任',
            '二林基督教醫院復健醫學科主治醫師',
          ],
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
          url: 'https://camsavant.com/doctors/yu-kai-yang',
          alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: '國立陽明大學醫學系',
          },
          hasCredential: cred([
            '中華民國骨質疏鬆症學會 骨質疏鬆症專科醫師（證號905）',
            '台灣增生療法醫學會會員',
            '台灣運動醫學醫學會會員',
          ]),
          ...sameAs('yang-yu-kai'),
        },
        {
          '@type': 'Physician',
          '@id': 'https://camsavant.com/doctors/yu-chang-yang#physician',
          name: '楊育彰',
          alternateName: 'Yu-Chang Yang, MD',
          jobTitle: '家庭醫學科專科醫師',
          medicalSpecialty: ['FamilyMedicine'],
          knowsAbout: ['針灸', '減重', '醫美', '功能醫學'],
          url: 'https://camsavant.com/doctors/yu-chang-yang',
          hasCredential: cred(['骨質疏鬆專科醫師', 'SCOPE 國際肥胖專科認證', '糖尿病 CDE 認證']),
          ...sameAs('yang-yu-chang'),
        },
        {
          '@type': 'Physician',
          '@id': 'https://camsavant.com/doctors/wen-wei-lai#physician',
          name: '賴玟衛',
          alternateName: 'Wen-Wei Lai, MD',
          jobTitle: '復健科醫師',
          areaServed: ['彰化縣', '南投縣'],
          medicalSpecialty: ['PhysicalMedicineAndRehabilitation'],
          knowsAbout: ['復健醫學', '骨質疏鬆', '增生療法'],
          url: 'https://camsavant.com/doctors/wen-wei-lai',
          hasCredential: cred(['骨鬆醫學會會員', '增生醫學會會員']),
          ...sameAs('lai-wen-wei'),
        },
        {
          '@type': 'Physician',
          '@id': 'https://camsavant.com/doctors/huang-yachi#physician',
          name: '黃雅琦',
          alternateName: 'Ya-Chi Huang, MD',
          jobTitle: '復健科醫師',
          medicalSpecialty: ['PhysicalMedicineAndRehabilitation'],
          knowsAbout: ['復健醫學'],
          url: 'https://camsavant.com/doctors/huang-yachi',
          ...sameAs('huang-ya-chi'),
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
        {/* ── Google Analytics 4（afterInteractive：不阻塞首屏渲染） ── */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}',{page_path:window.location.pathname});`,
              }}
            />
          </>
        )}
        {/* ── Service Worker registration ── */}
        <script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
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
