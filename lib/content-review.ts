import { z } from 'zod'
import { AUTHORS, getAuthor } from './authors'

export const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}, '日期須為有效的 YYYY-MM-DD')

export const contentReviewFields = {
  reviewedBy: z.string().min(1).optional(),
  lastReviewed: calendarDateSchema.optional(),
}

export interface ContentReviewMetadata {
  reviewedBy?: string
  lastReviewed?: string
}

export function validateContentReview(
  value: ContentReviewMetadata,
  context: z.RefinementCtx,
) {
  if (Boolean(value.reviewedBy) !== Boolean(value.lastReviewed)) {
    context.addIssue({ code: 'custom', path: ['lastReviewed'], message: '審閱者與審閱日期必須一起提供，不能由發布或更新日期推定' })
  }
  if (value.reviewedBy && !Object.hasOwn(AUTHORS, value.reviewedBy)) {
    context.addIssue({ code: 'custom', path: ['reviewedBy'], message: '審閱者必須對應既有醫師資料' })
  }
}

export const contentReviewSchema = z.object(contentReviewFields).superRefine(validateContentReview)

/** Only an explicit, paired review record counts as a medical review. */
export function getContentReview(metadata: ContentReviewMetadata) {
  const review = contentReviewSchema.parse(metadata)
  return review.reviewedBy && review.lastReviewed
    ? { reviewer: getAuthor(review.reviewedBy), date: review.lastReviewed }
    : null
}
