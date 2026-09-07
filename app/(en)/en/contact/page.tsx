import type { Metadata } from 'next'
import DoctorContactContent from '@/components/DoctorContactContent'
import { englishAlternates } from '@/lib/locales'

export const metadata: Metadata = {
  title: 'Clinic Information and Appointments',
  description:
    'Clinic schedules, addresses, phone numbers, maps, and appointment links for CAM Savant rehabilitation services in Changhua, Nantou, and Erlin.',
  alternates: englishAlternates('/contact'),
  openGraph: {
    title: 'Clinic Information | CAM Savant',
    description: 'Rehabilitation clinic locations and appointment information in central Taiwan.',
    url: '/en/contact',
  },
}

export default function ContactPage() {
  return <DoctorContactContent doctorSlug="yu-kai-yang" locale="en" />
}
