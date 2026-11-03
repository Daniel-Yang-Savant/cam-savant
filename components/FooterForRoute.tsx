'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export default function FooterForRoute({
  home,
  children,
}: {
  home: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  return pathname === '/' ? home : children
}
