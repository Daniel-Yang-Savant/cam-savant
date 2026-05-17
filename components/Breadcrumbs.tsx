import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 ${className}`}
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && (
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">
              /
            </span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-600 dark:text-neutral-300 truncate max-w-[200px] sm:max-w-xs">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
