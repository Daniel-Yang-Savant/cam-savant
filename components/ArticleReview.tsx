import Link from 'next/link'
import { getContentReview, type ContentReviewMetadata } from '@/lib/content-review'

export default function ArticleReview({ metadata, locale = 'zh' }: {
  metadata: ContentReviewMetadata
  locale?: 'zh' | 'en'
}) {
  const review = getContentReview(metadata)
  if (!review) return null
  const english = locale === 'en'

  return (
    <p className="mt-4 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
      {english ? 'Medical review: ' : '醫療審閱：'}
      <Link href={`${english ? '/en' : ''}/doctors/${review.reviewer.slug}`} className="underline underline-offset-4 hover:text-accent-700">
        {english ? review.reviewer.nameEn : `${review.reviewer.name}醫師`}
      </Link>
      {' · '}<time dateTime={review.date}>{review.date}</time>
    </p>
  )
}
