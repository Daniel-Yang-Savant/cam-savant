'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/',                    label: 'Home'    },
  { href: '/about',               label: '關於'    },
  { href: '/fsm',                 label: 'FSM'     },
  { href: '/sports-medicine',     label: '運動醫學' },
  { href: '/functional-medicine', label: '功能醫學' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="text-lg font-bold tracking-[0.18em] text-neutral-950 hover:text-neutral-600 transition-colors"
          >
            CAM SAVANT
          </Link>

          {/* ── Desktop nav ── */}
          <ul className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) => {
              const active =
                href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={clsx(
                      'text-sm tracking-wide transition-colors',
                      active
                        ? 'text-neutral-950 font-medium'
                        : 'text-neutral-500 hover:text-neutral-950'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* ── Hamburger ── */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span
              className={clsx(
                'block w-5 h-0.5 bg-neutral-950 transition-transform origin-center',
                open && 'translate-y-2 rotate-45'
              )}
            />
            <span
              className={clsx(
                'block w-5 h-0.5 bg-neutral-950 transition-opacity',
                open && 'opacity-0'
              )}
            />
            <span
              className={clsx(
                'block w-5 h-0.5 bg-neutral-950 transition-transform origin-center',
                open && '-translate-y-2 -rotate-45'
              )}
            />
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {open && (
          <div className="md:hidden border-t border-neutral-100 py-4">
            <ul className="flex flex-col gap-4">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      'block text-sm tracking-wide py-1 transition-colors',
                      pathname === href
                        ? 'text-neutral-950 font-medium'
                        : 'text-neutral-500'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
