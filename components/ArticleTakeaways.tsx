import type { Lang } from '@/lib/i18n'

interface ArticleTakeawaysProps {
  takeaways?: string[]
  locale?: Lang
}

export default function ArticleTakeaways({
  takeaways,
  locale = 'zh',
}: ArticleTakeawaysProps) {
  if (!takeaways || takeaways.length < 3) return null

  return (
    <section
      className="mb-8 rounded-2xl border border-accent-200 bg-accent-50/70 px-5 py-5 dark:border-accent-800 dark:bg-accent-950/40 sm:px-6"
      aria-label={locale === 'en' ? 'Key takeaways' : '先看結論'}
    >
      <h2 className="text-base font-bold text-neutral-950 dark:text-neutral-100">
        {locale === 'en' ? 'Key takeaways' : '先看結論'}
      </h2>
      <ul className="mt-3 space-y-2.5">
        {takeaways.slice(0, 5).map((takeaway) => (
          <li
            key={takeaway}
            className="flex gap-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300"
          >
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600 dark:bg-accent-400"
              aria-hidden="true"
            />
            <span>{takeaway}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
