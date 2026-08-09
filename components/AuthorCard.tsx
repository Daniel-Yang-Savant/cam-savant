import Image from 'next/image'
import Link from 'next/link'
import { getAuthor } from '@/lib/authors'

/**
 * 文章作者卡片（E-E-A-T）
 * 顯示作者頭像、職稱、專業認證，並連結至獨立醫師介紹頁。
 */
export default function AuthorCard({ author }: { author: string }) {
  const a = getAuthor(author)

  return (
    <aside
      aria-label="關於作者"
      className="mt-10 rounded-2xl border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 p-6 sm:p-7"
    >
      <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-4">
        關於作者
      </p>
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
          <Image
            src={a.photo}
            alt={a.name}
            fill
            className="object-cover object-top"
            sizes="80px"
          />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {a.name}醫師
            <span className="ml-2 text-xs font-normal text-neutral-400 dark:text-neutral-500 tracking-wider">
              {a.nameEn}
            </span>
          </p>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">
            {a.title}
            {a.affiliation ? `｜${a.affiliation}` : `｜${a.location}`}
          </p>
          {a.credentials.length > 0 && (
            <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {a.credentials.join('・')}
            </p>
          )}
          <Link
            href={`/doctors/${a.slug}`}
            className="mt-2.5 inline-block text-xs font-semibold text-accent-700 dark:text-accent-400 hover:underline"
          >
            查看完整介紹 →
          </Link>
        </div>
      </div>
    </aside>
  )
}
