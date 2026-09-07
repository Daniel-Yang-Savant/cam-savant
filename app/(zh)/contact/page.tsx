import type { Metadata } from 'next'
import DoctorContactContent from '@/components/DoctorContactContent'
import { bilingualAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: '看診資訊',
  description: '楊育愷醫師門診時間與預約方式——彰化基督教醫院、南投基督教醫院、二林基督教醫院復健科門診。',
  alternates: bilingualAlternates('/contact'),
  openGraph: {
    title: '看診資訊 | CAM Savant',
    description: '楊育愷醫師門診時間與預約方式，服務彰化縣、南投縣地區患者。',
  },
}

export default function ContactPage() {
  return <DoctorContactContent doctorSlug="yu-kai-yang" locale="zh" />
}
