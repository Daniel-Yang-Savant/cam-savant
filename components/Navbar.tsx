'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'
import ThemeToggle from '@/components/ThemeToggle'
import SearchBar from '@/components/SearchBar'
import { useLang } from '@/lib/i18n'

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { lang, toggleLang, t } = useLang()

  const NAV_LINKS = [
    { href: '/',                    label: t('home')                  },
    { href: '/about',               label: t('about')                 },
    { href: '/fsm',                 label: t('navFsm')                },
    { href: '/sports-medicine',     label: t('navSportsMedicine')     },
    { href: '/functional-medicine', label: t('navFunctionalMedicine') },
    { href: '/perioperative-rehab', label: t('navPerioperativeRehab') },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main row ── */}
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-[0.18em] text-neutral-950 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0"
          >
            CAM SAVANT
          </Link>

          {/* Desktop nav links */}
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
                        ? 'text-neutral-950 dark:text-neutral-100 font-medium'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Desktop search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Language toggle – desktop */}
            <button
              onClick={toggleLang}
              aria-label="切換語言"
              className="hidden md:flex items-center px-2 py-1 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {lang === 'zh' ? 'EN' : '中'}
            </button>

            {/* Theme toggle – desktop */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Mobile: search icon */}
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen)
                if (open) setOpen(false)
              }}
              aria-label="搜尋"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => {
                setOpen(!open)
                if (mobileSearchOpen) setMobileSearchOpen(false)
              }}
              aria-label="Toggle menu"
            >
              <span
                className={clsx(
                  'block w-5 h-0.5 bg-neutral-950 dark:bg-neutral-100 transition-transform origin-center',
                  open && 'translate-y-2 rotate-45'
                )}
              />
              <span
                className={clsx(
                  'block w-5 h-0.5 bg-neutral-950 dark:bg-neutral-100 transition-opacity',
                  open && 'opacity-0'
                )}
              />
              <span
                className={clsx(
                  'block w-5 h-0.5 bg-neutral-950 dark:bg-neutral-100 transition-transform origin-center',
                  open && '-translate-y-2 -rotate-45'
                )}
              />
            </button>
          </div>
        </div>

        {/* ── Mobile search expansion (full-width row below main row) ── */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3">
            <SearchBar fullWidth />
          </div>
        )}

        {/* ── Mobile menu ── */}
        {open && (
          <div className="md:hidden border-t border-neutral-100 dark:border-neutral-800 py-4">
            <ul className="flex flex-col gap-4">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      'block text-sm tracking-wide py-1 transition-colors',
                      pathname === href
                        ? 'text-neutral-950 dark:text-neutral-100 font-medium'
                        : 'text-neutral-500 dark:text-neutral-400'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile: lang + theme row */}
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
              <button
                onClick={toggleLang}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                {lang === 'zh' ? 'EN' : '中'}
              </button>
              <ThemeToggle />
            </div>
          </div>
        )}

      </nav>
    </header>
  )
}
