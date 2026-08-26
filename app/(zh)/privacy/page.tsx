import type { Metadata } from 'next'
import { LINE_ADD_URL, LINE_ID } from '@/lib/site'
export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  title: '隱私權政策',
  description: 'CAM Savant 隱私權政策',
}
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-neutral-950 dark:text-neutral-100 mb-2">隱私權政策</h1>
        <p className="text-sm text-neutral-500 mb-10">最後更新：2026年8月</p>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>一、資料收集範圍</h2>
          <p>當您透過本網站的醫療諮詢表單提交留言時，我們會收集以下資訊：</p>
          <ul>
            <li>姓名（選填）</li>
            <li>聯絡方式（電話或電子郵件，必填）</li>
            <li>您所詢問的醫療相關問題內容</li>
          </ul>
          <h2>二、資料使用目的</h2>
          <p>上述個人資料僅用於以下目的：</p>
          <ul>
            <li>由醫療團隊回覆您的醫療諮詢問題</li>
            <li>必要時安排門診預約</li>
          </ul>
          <p>我們不會將您的個人資料用於任何商業行銷目的。</p>
          <h2>三、第三方資料處理服務</h2>
          <p>本網站使用 Google Forms 作為諮詢資料的代管與處理服務。除為完成諮詢回覆所必要的服務提供者，或法律另有規定外，我們不會出售或揭露您的個人資料給其他第三方。</p>
          <h2>四、資料保存期間</h2>
          <p>諮詢資料以回覆完成日為基準保存 1 年。表單管理者每月檢查屆期紀錄，並從 Google Forms 與連結試算表刪除；執行紀錄只保留日期、執行者與刪除筆數，不保留個人資料或健康內容。</p>
          <h2>五、您的權利</h2>
          <p>依據《個人資料保護法》，您享有以下權利：</p>
          <ul>
            <li>查詢或請求閱覽您的個人資料</li>
            <li>請求製給複製本</li>
            <li>請求補充或更正</li>
            <li>請求停止蒐集、處理或利用</li>
            <li>請求刪除</li>
          </ul>
          <h2>六、聯絡方式</h2>
          <p>
            如需行使上述權利或有任何隱私權相關問題，不必再次提交醫療諮詢表單。請透過
            <a href={LINE_ADD_URL} target="_blank" rel="noopener noreferrer">
              CAM Savant 官方 LINE（{LINE_ID}）
            </a>
            聯繫，並在訊息開頭註明「資料權利申請」。初次聯絡不需提供病情內容；我們只會要求完成必要身分核對所需的最少資料。您也可於門診時直接告知醫療人員。
          </p>
          <h2>七、法規依據</h2>
          <p>本隱私權政策依據中華民國《個人資料保護法》及相關法規制定。</p>
        </div>
      </div>
    </div>
  )
}
