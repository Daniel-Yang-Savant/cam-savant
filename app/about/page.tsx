import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '關於',
  description: '關於 CAM Savant ── 整合醫學知識平台',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      {/* ── Header ── */}
      <div className="mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
          About
        </span>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold text-neutral-950 leading-tight">
          關於 CAM Savant
        </h1>
        <div className="mt-4 h-px bg-neutral-200 w-16" />
      </div>

      {/* ── Content ── */}
      <div className="prose prose-neutral max-w-none">
        <p>
          CAM Savant 是一個專注於整合醫學（Complementary and Alternative
          Medicine）知識分享的平台，涵蓋<strong>運動醫學</strong>、
          <strong>功能醫學</strong>與
          <strong>頻率特異性微電流（FSM）</strong>三大核心領域。
        </p>

        <p>
          我們相信，現代醫療的未來在於整合──在實證科學的基礎上，融合不同醫學系統的洞見，
          為患者提供更全面、更個人化的照護。
        </p>

        <h2>核心領域</h2>

        <h3>運動醫學 Sports Medicine</h3>
        <p>
          探討運動傷害的預防、診斷與復健策略。從急性損傷的初期處置、組織癒合的生物學，
          到長期功能恢復與重返運動的標準化評估，以最新實證為導向，結合現代復健科學。
        </p>

        <h3>功能醫學 Functional Medicine</h3>
        <p>
          以系統生物學視角探討慢性疾病的根本成因。關注腸道微生物體、荷爾蒙失衡、
          粒線體功能、神經發炎等核心機制，透過個人化的評估工具與介入策略，
          協助臨床工作者超越對症治療，真正解決疾病根源。
        </p>

        <h3>頻率特異性微電流 FSM</h3>
        <p>
          介紹 Frequency Specific Microcurrent 的理論基礎、臨床研究與實務應用。
          涵蓋疼痛管理、組織修復、神經系統調節等領域，以及最新的頻率協議與案例分析。
        </p>

        <h2>內容聲明</h2>
        <p>
          本站所有文章內容僅供具備醫療執照的專業人員學習參考，
          不構成針對個別患者的診療建議。臨床決策應基於患者的具體情況，
          並由具備相關執照的醫療提供者做出最終判斷。
        </p>
      </div>
    </div>
  )
}
