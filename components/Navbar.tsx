'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import ThemeToggle from '@/components/ThemeToggle'
import SearchBar from '@/components/SearchBar'
import { translations, type Lang } from '@/lib/i18n'
import { useBookmarks } from '@/lib/useBookmarks'
import { ENGLISH_PERIOP_SLUGS } from '@/lib/locales'

type NavbarProps = {
  locale?: Lang
}

function englishAlternatePath(pathname: string): string {
  if (pathname === '/') return '/en'
  if (pathname === '/about') return '/en/about'
  if (pathname === '/contact') return '/en/locations'
  if (pathname === '/locations') return '/en/locations'
  if (pathname.startsWith('/doctors/')) return `/en${pathname}`
  if (pathname.startsWith('/locations/')) return `/en${pathname}`
  if (pathname === '/perioperative-rehab') return '/en/perioperative-rehab'

  const periopMatch = pathname.match(/^\/perioperative-rehab\/([^/]+)$/)
  if (periopMatch && ENGLISH_PERIOP_SLUGS.includes(periopMatch[1])) {
    return `/en${pathname}`
  }

  return '/en'
}

export default function Navbar({ locale = 'zh' }: NavbarProps) {
  const pathname = usePathname()
  const currentPath = pathname ?? (locale === 'en' ? '/en' : '/')
  const [open, setOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const articleMenuRef = useRef<HTMLDetailsElement>(null)
  const mobileMenuRef = useRef<HTMLDetailsElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const searchToggleRef = useRef<HTMLButtonElement>(null)
  const { slugs, mounted: bmMounted } = useBookmarks()
  const isEnglish = locale === 'en'
  const t = (key: keyof typeof translations.zh) => translations[locale][key]

  const NAV_LINKS = isEnglish
    ? [
        { href: '/en', label: t('home') },
        { href: '/en/about', label: t('about') },
        { href: '/en/locations', label: t('navContact') },
        { href: '/en/perioperative-rehab', label: t('navPerioperativeRehab') },
      ]
    : [
        { href: '/exercise-guides', label: '圖解運動' },
        { href: '/posts', label: '衛教文章' },
        { href: '/locations', label: t('navContact') },
        { href: '/about', label: t('about') },
      ]

  const ARTICLE_LINKS = [
    { href: '/sports-medicine', label: t('navSportsMedicine') },
    { href: '/rehabilitation-medicine', label: t('navRehabMedicine') },
    { href: '/functional-medicine', label: t('navFunctionalMedicine') },
    { href: '/weekly-picks', label: t('navWeeklyPicks') },
    { href: '/fsm', label: t('navFsm') },
    { href: '/perioperative-rehab', label: t('navPerioperativeRehab') },
  ]

  function isActive(href: string) {
    if (href === '/' || href === '/en') return currentPath === href
    if (href === '/about' || href === '/en/about') {
      return currentPath === href || currentPath.startsWith(isEnglish ? '/en/doctors/' : '/doctors/')
    }
    if (href === '/posts') {
      return currentPath.startsWith('/posts') || currentPath.startsWith('/tags/') ||
        ARTICLE_LINKS.some((link) => link.href !== '/perioperative-rehab' && currentPath.startsWith(link.href))
    }
    return currentPath === href || currentPath.startsWith(`${href}/`)
  }

  function closeMenus() {
    setOpen(false)
    setMobileSearchOpen(false)
    if (articleMenuRef.current) articleMenuRef.current.open = false
    if (mobileMenuRef.current) mobileMenuRef.current.open = false
  }

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const menu = articleMenuRef.current
      if (menu?.open && !menu.contains(event.target as Node)) menu.open = false
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      if (articleMenuRef.current?.open) {
        articleMenuRef.current.open = false
        articleMenuRef.current.querySelector('summary')?.focus()
      }
      if (mobileSearchOpen) {
        setMobileSearchOpen(false)
        searchToggleRef.current?.focus()
      }
      if (open) {
        setOpen(false)
        menuToggleRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, mobileSearchOpen])

  useEffect(() => {
    setOpen(false)
    setMobileSearchOpen(false)
    if (articleMenuRef.current) articleMenuRef.current.open = false
    if (mobileMenuRef.current) mobileMenuRef.current.open = false
  }, [currentPath])

  const languageHref = isEnglish
    ? currentPath.replace(/^\/en(?=\/|$)/, '') || '/'
    : englishAlternatePath(currentPath)

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <nav aria-label={isEnglish ? 'Main navigation' : '主要導覽'} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main row ── */}
        <div className="flex items-center justify-between gap-3 h-16">

          {/* Logo */}
          {currentPath === (isEnglish ? '/en' : '/') ? (
            <h1 className="shrink-0">
              <Link
                href={isEnglish ? '/en' : '/'}
                onClick={closeMenus}
                className="text-lg font-bold tracking-[0.18em] text-neutral-950 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                CAM SAVANT
              </Link>
            </h1>
          ) : (
            <Link
              href={isEnglish ? '/en' : '/'}
              onClick={closeMenus}
              className="text-lg font-bold tracking-[0.18em] text-neutral-950 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0"
            >
              CAM SAVANT
            </Link>
          )}

          {/* Desktop nav links */}
          <ul className="hidden xl:flex shrink-0 items-center gap-5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href)
              return (
                <li key={href} className="flex items-center">
                  <Link
                    href={href}
                    onClick={closeMenus}
                    aria-current={currentPath === href ? 'page' : undefined}
                    className={clsx(
                      'flex min-h-11 items-center whitespace-nowrap text-sm tracking-wide transition-colors',
                      active
                        ? 'text-accent-700 dark:text-accent-400 font-medium'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
                    )}
                  >
                    {label}
                  </Link>
                  {!isEnglish && href === '/posts' && (
                    <details ref={articleMenuRef} className="group relative">
                      <summary aria-label="開啟文章分類" className="flex h-11 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 [&::-webkit-details-marker]:hidden">
                        <svg aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                      </summary>
                      <ul className="absolute left-0 top-full z-50 w-52 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                        {ARTICLE_LINKS.map((link) => (
                          <li key={link.href}>
                            <Link href={link.href} onClick={closeMenus} aria-current={currentPath === link.href ? 'page' : undefined} className={clsx('flex min-h-11 items-center rounded-lg px-3 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800', isActive(link.href) ? 'font-medium text-accent-700 dark:text-accent-400' : 'text-neutral-600 dark:text-neutral-300')}>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Right controls */}
          <div className="flex shrink-0 items-center gap-2">

            {/* Desktop search */}
            {!isEnglish && (
              <div className="hidden xl:block">
                <SearchBar />
              </div>
            )}

            {/* Bookmark icon – desktop */}
            {!isEnglish && <Link
              href="/bookmarks"
              aria-label="收藏文章"
              title="收藏文章"
              className="hidden xl:flex relative items-center justify-center w-11 h-11 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              {bmMounted && slugs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-amber-400 text-neutral-950 text-[9px] font-bold leading-none">
                  {slugs.length > 9 ? '9+' : slugs.length}
                </span>
              )}
            </Link>}

            {/* Language toggle – desktop */}
            <Link
              href={languageHref}
              aria-label={isEnglish ? '切換至繁體中文' : 'Switch to English'}
              hrefLang={isEnglish ? 'zh-TW' : 'en'}
              className="hidden xl:flex min-h-11 items-center px-2 py-1 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isEnglish ? '中' : 'EN'}
            </Link>

            {/* Theme toggle – desktop */}
            <div className="hidden xl:block">
              <ThemeToggle />
            </div>

            {/* Mobile: search icon */}
            {!isEnglish && <button
              ref={searchToggleRef}
              className="xl:hidden flex h-11 w-11 items-center justify-center rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen)
                if (open) setOpen(false)
              }}
              aria-label="搜尋"
              aria-expanded={mobileSearchOpen}
              aria-controls="mobile-site-search"
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
            </button>}

            {/* Hamburger */}
            <button
              ref={menuToggleRef}
              className="xl:hidden flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => {
                setOpen(!open)
                if (mobileSearchOpen) setMobileSearchOpen(false)
              }}
              aria-label={isEnglish ? 'Toggle menu' : '開啟或關閉選單'}
              aria-expanded={open}
              aria-controls="mobile-site-menu"
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
        {!isEnglish && mobileSearchOpen && (
          <div id="mobile-site-search" className="xl:hidden pb-3">
            <SearchBar fullWidth autoFocus onNavigate={closeMenus} />
          </div>
        )}

        {/* ── Mobile menu ── */}
        {open && (
          <div id="mobile-site-menu" className="xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-neutral-100 dark:border-neutral-800 py-3">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenus}
                    aria-current={currentPath === href ? 'page' : undefined}
                    className={clsx(
                      'flex min-h-11 items-center text-sm tracking-wide transition-colors',
                      isActive(href)
                        ? 'text-accent-700 dark:text-accent-400 font-medium'
                        : 'text-neutral-500 dark:text-neutral-400'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {!isEnglish && (
              <details ref={mobileMenuRef} className="mt-2 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  文章分類與術後復健 <span aria-hidden="true">＋</span>
                </summary>
                <ul className="grid grid-cols-2 gap-x-3 pb-2">
                  {ARTICLE_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={closeMenus} aria-current={currentPath === link.href ? 'page' : undefined} className={clsx('flex min-h-11 items-center rounded-lg px-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800', isActive(link.href) ? 'font-medium text-accent-700 dark:text-accent-400' : 'text-neutral-500 dark:text-neutral-400')}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Bookmark link – mobile */}
            {!isEnglish && <Link
              href="/bookmarks"
              onClick={closeMenus}
              className="flex min-h-11 items-center gap-2 text-sm tracking-wide text-neutral-500 dark:text-neutral-400"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              收藏文章
              {bmMounted && slugs.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  {slugs.length}
                </span>
              )}
            </Link>}

            {/* Mobile: lang + theme row */}
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
              <Link
                href={languageHref}
                onClick={closeMenus}
                hrefLang={isEnglish ? 'zh-TW' : 'en'}
                className="inline-flex min-h-11 items-center rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                {isEnglish ? '繁體中文' : 'English'}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        )}

      </nav>
    </header>
  )
}
