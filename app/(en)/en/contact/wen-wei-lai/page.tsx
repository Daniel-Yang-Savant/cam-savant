import type { Metadata } from 'next'
import DoctorContactContent from '@/components/DoctorContactContent'
import { englishAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: 'Wen-Wei Lai, MD | Clinic Information',
  description:
    'Clinic schedules and appointment links for Dr. Wen-Wei Lai at Changhua Christian Hospital, Hanming Christian Hospital, and Yuanlin Christian Hospital.',
  alternates: englishAlternates('/contact/wen-wei-lai'),
}

export default function LaiContactPage() {
  return <DoctorContactContent doctorSlug="wen-wei-lai" locale="en" />
}
