import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Our Team | CAM Savant',
  description: '認識 CAM Savant 醫療團隊',
}

// ── Team data ──────────────────────────────────────────────────────────────

const team = [
  {
    name: '楊育愷',
    nameEn: 'Yu-Kai Yang, MD',
    photo: '/images/team/yu-kai-yang.jpg',
    credentials: [
      '復健科專科醫師',
      '骨質疏鬆專科醫師',
      '增生醫學會會員',
    ],
  },
  {
    name: '楊育彰',
    nameEn: 'Yu-Chang Yang, MD',
    photo: '/images/team/yu-chang-yang.jpg',
    credentials: [
      '家庭醫學科專科醫師',
      '骨質疏鬆專科醫師',
      'SCOPE 國際肥胖專科認證',
      '糖尿病 CDE 認證',
    ],
  },
  {
    name: '賴玟衛',
    nameEn: 'Wen-Wei Lai, MD',
    photo: '/images/team/wen-wei-lai.jpg',
    credentials: [
      '復健科醫師',
      '骨鬆醫學會會員',
      '增生醫學會會員',
    ],
  },
  {
    name: '黃雅琦',
    nameEn: 'Yachi Huang, MD',
    photo: '/images/team/yachi-huang.jpg',
    credentials: [
      '復健科醫師',
    ],
  },
]

// ── Page ───────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">

        {/* ── Header ── */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
            Meet the Doctors
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-neutral-950 tracking-tight">
            Our Team
          </h1>
          <div className="mt-5 h-px w-12 bg-neutral-300 mx-auto" />
        </div>

        {/* ── Team Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {team.map((member) => (
            <div
              key={member.nameEn}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 px-6 pt-10 pb-8 flex flex-col items-center text-center"
            >
              {/* Arch photo frame */}
              <div
                className="relative overflow-hidden bg-neutral-200 mb-6 flex-shrink-0"
                style={{
                  width: 160,
                  height: 200,
                  borderRadius: '9999px 9999px 0 0',
                }}
              >
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                  sizes="160px"
                />
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-neutral-900 leading-tight">
                {member.name}
              </h3>
              <p className="mt-1 text-xs text-neutral-400 tracking-widest uppercase">
                {member.nameEn}
              </p>

              {/* Divider */}
              <div className="mt-4 mb-4 h-px w-8 bg-neutral-200" />

              {/* Credentials */}
              <ul className="space-y-1.5 w-full">
                {member.credentials.map((c) => (
                  <li
                    key={c}
                    className="text-xs text-neutral-500 leading-relaxed"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Mission blurb ── */}
        <div className="mt-20 max-w-2xl mx-auto text-center">
          <p className="text-sm text-neutral-500 leading-relaxed">
            CAM Savant 整合復健科、家庭醫學科與功能醫學的跨領域專業，
            致力於為患者提供以實證為基礎的整合醫療照護。
            本站所有內容僅供醫療專業人員學習參考，不構成個別診療建議。
          </p>
        </div>

      </div>
    </div>
  )
}
