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
    default: 'CAM Savant | 楊育愷醫師 - 復健科・運動醫學・增生療法・骨質疏鬆',
    template: '%s | CAM Savant',
  },
  description:
    '彰化基督教醫院、二林基督教醫院、南投基督教醫院復健科主治醫師楊育愷，專長增生療法、PRP治療、運動醫學、骨質疏鬆、超音波導引注射與FSM頻率共振微電流。',
  keywords: [
    '彰化復健科', '二林復健科', '南投復健科',
    '增生療法', 'PRP', '運動醫學',
    '骨質疏鬆', '超音波導引注射', 'FSM',
    '彰化基督教醫院',
  ],
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: 'CAM Savant',
    title: 'CAM Savant | 楊育愷醫師 - 復健科・運動醫學・增生療法',
    description:
      '彰化基督教醫院、二林基督教醫院、南投基督教醫院復健科主治醫師楊育愷，專長增生療法、PRP、運動醫學、骨質疏鬆。',
  },
}

// ── JSON-LD Structured Data ────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: '楊育愷',
  alternateName: 'Yu-Kai Yang',
  jobTitle: '復健科主治醫師',
  worksFor: [
    {
      '@type': 'Hospital',
      name: '彰化基督教醫院',
      addressLocality: '彰化市',
    },
    {
      '@type': 'Hospital',
      name: '二林基督教醫院',
      addressLocality: '彰化縣二林鎮',
    },
    {
      '@type': 'Hospital',
      name: '南投基督教醫院',
      addressLocality: '南投市',
    },
  ],
  medicalSpecialty: [
    '復健醫學',
    '運動醫學',
    '增生療法',
    'PRP治療',
    '骨質疏鬆',
    '超音波導引注射',
    'FSM頻率共振微電流',
    '功能醫學',
  ],
  url: 'https://cam-savant.vercel.app',
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
