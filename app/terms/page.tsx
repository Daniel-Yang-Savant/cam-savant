import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: '使用條款',
  description: 'CAM Savant 使用條款',
}
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-neutral-950 dark:text-neutral-100 mb-2">使用條款</h1>
        <p className="text-sm text-neutral-400 mb-10">最後更新：2026年3月</p>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>一、網站性質聲明</h2>
          <p>CAM Savant（以下簡稱「本網站」）提供之所有內容，包含文章、復健計劃、衛教資訊等，均為醫療衛教資訊，目的在於提升醫療知識，不構成任何醫療診斷、治療建議或醫病關係之建立。</p>
          <h2>二、不取代面診</h2>
          <p>本網站內容不能取代醫師的面對面診察與個別評估。每位患者的身體狀況、手術方式及恢復進程均不相同，任何復健計劃的實際執行，均須由您的主責醫師依個別狀況評估後決定。</p>
          <h2>三、術後復健專區</h2>
          <p>術後復健專區之內容僅供醫療團隊之就診患者參考使用。患者在執行任何復健動作前，應先確認已獲得主責醫師的許可，並在專業人員指導下進行。</p>
          <h2>四、緊急醫療聲明</h2>
          <p>如有以下緊急狀況，請立即前往最近的急診室：</p>
          <ul>
            <li>術後傷口大量出血或滲液</li>
            <li>突發性劇烈疼痛</li>
            <li>肢體嚴重腫脹、發紫或失去感覺</li>
            <li>呼吸困難、胸痛或心悸</li>
            <li>高燒或其他感染症狀</li>
          </ul>
          <p><strong>本網站無法提供緊急醫療協助，請勿透過本網站尋求緊急醫療救援。</strong></p>
          <h2>五、著作權</h2>
          <p>本網站所有內容之著作權均歸 CAM Savant 醫療團隊所有，未經書面授權禁止轉載、複製或商業使用。</p>
          <h2>六、免責聲明</h2>
          <p>本網站對於因使用本網站資訊而產生之任何直接或間接損害，不負任何法律責任。使用本網站即表示您同意本使用條款。</p>
        </div>
      </div>
    </div>
  )
}
