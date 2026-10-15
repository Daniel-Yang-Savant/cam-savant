import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Metagenics 營養品查找工具',
  description:
    '依中英文品名查找 Metagenics 營養品，前往台灣代理平台核對最新標示與供應資訊；附一般使用安全來源，不提供症狀配對、療效排名或個人用量。',
  alternates: {
    canonical: '/functional-medicine/supplement-recommender',
  },
  openGraph: {
    title: 'Metagenics 營養品查找工具 | CAM Savant',
    description:
      '以中英文品名查找既有產品清單，並查看一般使用安全資訊與台灣代理平台入口。',
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
