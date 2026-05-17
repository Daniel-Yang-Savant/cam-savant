import Link from 'next/link'
import clsx from 'clsx'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Base path, e.g. "/posts" or "/sports-medicine" */
  basePath: string
}

function pageHref(basePath: string, page: number) {
  if (page === 1) return basePath
  return `${basePath}?page=${page}`
}

function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = [1]
  if (current > 3) pages.push('ellipsis')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageList(currentPage, totalPages)

  const btnBase =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-2.5 text-sm border rounded transition-colors'
  const btnActive =
    'bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-950 border-neutral-950 dark:border-neutral-100 font-semibold'
  const btnDefault =
    'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-950 dark:hover:border-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100'
  const btnDisabled =
    'border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700 cursor-not-allowed'

  return (
    <nav
      aria-label="文章分頁"
      className="flex items-center justify-center gap-1 mt-14 flex-wrap"
    >
      {/* ← Prev */}
      {currentPage > 1 ? (
        <Link href={pageHref(basePath, currentPage - 1)} className={clsx(btnBase, btnDefault)}>
          ←
        </Link>
      ) : (
        <span className={clsx(btnBase, btnDisabled)} aria-disabled="true">←</span>
      )}

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`e${i}`} className="inline-flex items-center justify-center min-w-[36px] h-9 text-sm text-neutral-400 dark:text-neutral-600">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(basePath, page)}
            className={clsx(btnBase, page === currentPage ? btnActive : btnDefault)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      )}

      {/* → Next */}
      {currentPage < totalPages ? (
        <Link href={pageHref(basePath, currentPage + 1)} className={clsx(btnBase, btnDefault)}>
          →
        </Link>
      ) : (
        <span className={clsx(btnBase, btnDisabled)} aria-disabled="true">→</span>
      )}
    </nav>
  )
}
