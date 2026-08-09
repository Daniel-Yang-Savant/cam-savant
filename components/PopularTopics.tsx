import Link from 'next/link'
import { getTagDescription, getTagHref } from '@/lib/tags'

interface PopularTopicsProps {
  topics: { tag: string; count: number }[]
}

export default function PopularTopics({ topics }: PopularTopicsProps) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-500">
          熱門主題
        </h2>
        <Link
          href="/posts"
          className="text-xs text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-100 transition-colors"
        >
          所有文章 →
        </Link>
      </div>

      <ol className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {topics.map(({ tag, count }, index) => (
          <li key={tag} className="py-4">
            <Link href={getTagHref(tag)} className="group flex items-start gap-4">
              <span className="shrink-0 w-5 text-right text-[0.65rem] font-mono text-neutral-300 dark:text-neutral-600 mt-0.5">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">
                    #{tag}
                  </p>
                  <span className="shrink-0 text-[11px] text-neutral-400 dark:text-neutral-500">
                    {count} 篇
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {getTagDescription(tag) ?? `瀏覽所有與「${tag}」相關的文章。`}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
