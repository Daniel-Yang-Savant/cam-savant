import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Our Team',
  description: '認識 CAM Savant 醫療團隊',
}

// ── Team data ──────────────────────────────────────────────────────────────

const team = [
  {
    name: '楊育愷',
    nameEn: 'Yu-Kai Yang, MD',
    photo: '/images/team/yu-kai-yang.jpg',
    title: '復健科主治醫師',
    location: '彰化縣・南投縣',
    specialties: ['增生療法', 'PRP治療', '運動醫學', '骨質疏鬆', '超音波導引注射', 'FSM'],
    credentials: ['骨質疏鬆專科醫師', '增生醫學會會員'],
  },
  {
    name: '楊育彰',
    nameEn: 'Yu-Chang Yang, MD',
    photo: '/images/team/yu-chang-yang.jpg',
    title: '家庭醫學科專科醫師',
    location: '台北・桃園',
    specialties: ['針灸', '減重', '醫美', '家庭醫學'],
    credentials: ['骨質疏鬆專科醫師', 'SCOPE 國際肥胖專科認證', '糖尿病 CDE 認證'],
  },
  {
    name: '賴玟衛',
    nameEn: 'Wen-Wei Lai, MD',
    photo: '/images/team/wen-wei-lai.jpg',
    title: '復健科醫師',
    location: '彰化基督教醫院',
    specialties: ['復健醫學'],
    credentials: ['骨鬆醫學會會員', '增生醫學會會員'],
  },
  {
    name: '黃雅琦',
    nameEn: 'Yachi Huang, MD',
    photo: '/images/team/yachi-huang.jpg',
    title: '復健科醫師',
    location: '彰化基督教醫院',
    specialties: [],
    credentials: [],
  },
]

// ── MapPin icon ────────────────────────────────────────────────────────────

function MapPin() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block flex-shrink-0 text-neutral-400"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

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
                className="relative overflow-hidden bg-neutral-200 mb-5 flex-shrink-0"
                style={{
                  width: 152,
                  height: 190,
                  borderRadius: '9999px 9999px 0 0',
                }}
              >
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                  sizes="152px"
                />
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-neutral-900 leading-tight">
                {member.name}
              </h3>
              <p className="mt-0.5 text-xs text-neutral-400 tracking-widest uppercase">
                {member.nameEn}
              </p>

              {/* Divider */}
              <div className="my-3 h-px w-8 bg-neutral-100" />

              {/* Title */}
              <p className="text-sm font-medium text-neutral-700">
                {member.title}
              </p>

              {/* Location */}
              <div className="mt-1.5 flex items-center gap-1 text-xs text-neutral-400">
                <MapPin />
                <span>{member.location}</span>
              </div>

              {/* Specialty badges */}
              {member.specialties.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {member.specialties.map((s) => (
                    <span
                      key={s}
                      className="inline-block bg-neutral-100 text-neutral-600 text-[10px] font-medium px-2.5 py-1 rounded-full leading-none"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Credentials */}
              {member.credentials.length > 0 && (
                <ul className="mt-4 space-y-1 w-full border-t border-neutral-100 pt-4">
                  {member.credentials.map((c) => (
                    <li
                      key={c}
                      className="text-[11px] text-neutral-500 leading-relaxed before:content-['·'] before:mr-1.5 before:text-neutral-300"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
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
