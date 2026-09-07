import type { Metadata } from 'next'
import DoctorContactContent from '@/components/DoctorContactContent'
import { bilingualAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: '賴玟衛醫師 看診資訊',
  description: '賴玟衛醫師門診時間與預約方式——彰化基督教醫院、漢銘基督教醫院、員林基督教醫院復健科門診。',
  alternates: bilingualAlternates('/contact/wen-wei-lai'),
  openGraph: {
    title: '賴玟衛醫師 看診資訊 | CAM Savant',
    description: '賴玟衛醫師門診時間與預約方式，服務彰化地區患者。',
  },
}

export default function LaiContactPage() {
  return <DoctorContactContent doctorSlug="wen-wei-lai" locale="zh" />
}
