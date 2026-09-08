import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OPD SOAP 工作區',
  description: '管理員專用的門診 SOAP 病歷整理工具。',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}

export default function OpdLayout({ children }: { children: React.ReactNode }) {
  return children
}
