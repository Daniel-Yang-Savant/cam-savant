import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Metagenics 營養品推薦工具',
  description:
    '依健康需求快速整理 Metagenics 營養品參考清單，查看建議用法、參考價格與官方購買方式。實際使用前請諮詢醫師或醫療專業人員。',
  alternates: {
    canonical: '/functional-medicine/supplement-recommender',
  },
  openGraph: {
    title: 'Metagenics 營養品推薦工具 | CAM Savant',
    description:
      '勾選健康需求，快速取得營養品參考清單、建議用法與官方購買方式。',
    url: '/functional-medicine/supplement-recommender',
    type: 'website',
  },
}

export default function SupplementRecommenderLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
