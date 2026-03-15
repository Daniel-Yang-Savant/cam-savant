import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '術前・術後復健',
  description:
    '彰化・南投・台中・雲林地區骨科、腫瘤科、心血管手術術後復健計畫，涵蓋ACL重建、旋轉肌袖修復、頭頸癌、肺癌、CABG術後心肺復健。',
}

// ── Condition data ──────────────────────────────────────────────────────────

type Condition = {
  slug: string
  name: string
  nameEn: string
  summary: string
}

type Category = {
  id: string
  label: string
  labelEn: string
  conditions: Condition[]
}

const categories: Category[] = [
  {
    id: 'oncology',
    label: '腫瘤科',
    labelEn: 'Oncology',
    conditions: [
      {
        slug: 'head-neck-cancer',
        name: '頭頸癌手術復健',
        nameEn: 'Head & Neck Cancer Rehab',
        summary: '術後吞嚥、頸肩活動度與淋巴水腫管理',
      },
      {
        slug: 'lung-cancer-surgery',
        name: '肺癌手術復健',
        nameEn: 'Lung Cancer Surgery Rehab',
        summary: '胸廓活動訓練、呼吸肌強化與體能恢復',
      },
      {
        slug: 'esophageal-cancer-surgery',
        name: '食道癌手術復健',
        nameEn: 'Esophageal Cancer Surgery Rehab',
        summary: '術後體能重建、姿勢訓練與營養管理協作',
      },
    ],
  },
  {
    id: 'orthopedics',
    label: '骨科',
    labelEn: 'Orthopedics',
    conditions: [
      {
        slug: 'acl-reconstruction',
        name: 'ACL 重建術後復健',
        nameEn: 'ACL Reconstruction Rehab',
        summary: '分階段肌力訓練、本體感覺恢復與重返運動',
      },
      {
        slug: 'pcl-reconstruction',
        name: 'PCL 重建術後復健',
        nameEn: 'PCL Reconstruction Rehab',
        summary: '後十字韌帶重建後的股四頭肌強化與步態訓練',
      },
      {
        slug: 'meniscus-surgery',
        name: '半月板手術復健',
        nameEn: 'Meniscus Surgery Rehab',
        summary: '依修補或切除術式調整負重進程與關節保護',
      },
      {
        slug: 'rotator-cuff-repair',
        name: '旋轉肌袖重建術後',
        nameEn: 'Rotator Cuff Repair Rehab',
        summary: '保護期至強化期漸進式肩關節活動與肌力恢復',
      },
      {
        slug: 'slap-repair',
        name: 'SLAP 修復術後復健',
        nameEn: 'SLAP Repair Rehab',
        summary: '上盂唇修復後的肩關節穩定度重建與投擲恢復',
      },
    ],
  },
  {
    id: 'cardiovascular',
    label: '心血管科',
    labelEn: 'Cardiovascular',
    conditions: [
      {
        slug: 'cabg-cardiac-rehab',
        name: 'CABG 術後心肺復健',
        nameEn: 'CABG Cardiac Rehab',
        summary: '冠狀動脈繞道術後有氧訓練、胸廓復健與風險管控',
      },
      {
        slug: 'cardiovascular-surgery',
        name: '其他心血管手術復健',
        nameEn: 'Cardiovascular Surgery Rehab',
        summary: '瓣膜置換、主動脈手術後的心肺適能分期重建',
      },
    ],
  },
]

// ── Category accent colors ──────────────────────────────────────────────────

const ACCENT: Record<string, string> = {
  oncology:      'bg-rose-50 text-rose-700 border-rose-200',
  orthopedics:   'bg-sky-50 text-sky-700 border-sky-200',
  cardiovascular: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PerioperativeRehabPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      {/* ── Hero ── */}
      <section className="bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400">
            Perioperative Rehabilitation
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            術前・術後復健專區
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-neutral-400 leading-relaxed">
            從手術前體能預備到術後各階段功能恢復，
            CAM Savant 醫療團隊提供骨科、腫瘤科與心血管手術的個別化復健計畫。
          </p>
          <div className="mt-8 h-px w-12 bg-neutral-700 mx-auto" />
        </div>
      </section>

      {/* ── Categories ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-16">
        {categories.map((cat) => (
          <section key={cat.id}>

            {/* Category header */}
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-2xl font-bold text-neutral-950">{cat.label}</h2>
              <span
                className={`text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full border ${ACCENT[cat.id]}`}
              >
                {cat.labelEn}
              </span>
            </div>
            <div className="h-px bg-neutral-200 mb-8" />

            {/* Condition cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cat.conditions.map((cond) => (
                <div
                  key={cond.slug}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                      {cond.name}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-400 tracking-widest uppercase">
                      {cond.nameEn}
                    </p>
                    <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                      {cond.summary}
                    </p>
                  </div>

                  <Link
                    href={`/perioperative-rehab/${cond.slug}`}
                    className="mt-5 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-neutral-950 text-white text-xs font-medium tracking-wide py-2.5 hover:bg-neutral-700 transition-colors"
                  >
                    查看復健計畫
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── Disclaimer ── */}
      <div className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <p className="text-xs text-neutral-400 leading-relaxed">
          本頁內容僅供醫療專業人員學習參考，不構成個別診療建議。
          實際復健計畫須由主責醫師依個別病況評估後制定。
        </p>
      </div>

    </div>
  )
}
