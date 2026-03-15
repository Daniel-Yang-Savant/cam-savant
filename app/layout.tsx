import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CAM Savant | 彰化・南投・台中・雲林 復健科・運動醫學・增生療法・PRP・FSM',
    template: '%s | CAM Savant',
  },
  description:
    '彰化、南投、台中、雲林地區復健科與運動醫學專業團隊，提供增生療法、PRP治療、骨質疏鬆、超音波導引注射、FSM頻率共振微電流與功能醫學服務。',
  keywords: [
    '彰化復健科', '南投復健科', '台中復健科', '雲林復健科',
    '運動醫學', '增生療法', 'PRP治療', '骨質疏鬆',
    'FSM', '功能醫學', '超音波導引注射', '彰化基督教醫院',
  ],
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: 'CAM Savant',
    title: 'CAM Savant | 彰化・南投・台中・雲林 復健科・運動醫學・增生療法・PRP・FSM',
    description:
      '彰化、南投、台中、雲林地區復健科與運動醫學專業團隊，提供增生療法、PRP治療、骨質疏鬆、超音波導引注射、FSM及功能醫學服務。',
  },
}

// ── JSON-LD Structured Data ────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalOrganization',
      name: 'CAM Savant',
      description:
        '彰化、南投、台中、雲林地區復健科・運動醫學・增生療法・PRP・FSM專業醫療團隊',
      url: 'https://cam-savant.vercel.app',
      areaServed: ['彰化縣', '南投縣', '台中市', '雲林縣'],
      medicalSpecialty: [
        '復健醫學', '運動醫學', '增生療法', 'PRP治療',
        '骨質疏鬆', '超音波導引注射', 'FSM頻率共振微電流', '功能醫學',
      ],
      member: [
        {
          '@type': 'Physician',
          name: '楊育愷',
          alternateName: 'Yu-Kai Yang',
          jobTitle: '復健科主治醫師',
          areaServed: ['彰化縣', '南投縣'],
          medicalSpecialty: ['復健醫學', '運動醫學', '增生療法', 'PRP', '骨質疏鬆', 'FSM'],
        },
        {
          '@type': 'Physician',
          name: '楊育彰',
          alternateName: 'Yu-Chang Yang',
          jobTitle: '家庭醫學科專科醫師',
          areaServed: ['台北市', '桃園市'],
          medicalSpecialty: ['家庭醫學', '針灸', '減重', '醫美'],
        },
        {
          '@type': 'Physician',
          name: '賴玟衛',
          alternateName: 'Wen-wei Lai',
          jobTitle: '復健科醫師',
          medicalSpecialty: ['復健醫學', '骨質疏鬆', '增生療法'],
        },
        {
          '@type': 'Physician',
          name: '黃雅琦',
          alternateName: 'Yachi Huang',
          jobTitle: '復健科醫師',
          medicalSpecialty: ['復健醫學'],
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
    <html lang="zh-TW" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
