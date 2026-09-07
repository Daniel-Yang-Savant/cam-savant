import { getAuthor } from './authors'
import { getClinicLocation } from './locations'

const reviewerKey = '楊育愷醫師'
const reviewer = getAuthor(reviewerKey)
const reviewClinic = getClinicLocation('changhua')!

export const EXERCISE_GUIDE_REVIEW = {
  publishedDate: '2026-08-31',
  modifiedDate: '2026-09-06',
  date: '2026-09-05',
  reviewerKey,
  reviewerSlug: reviewer.slug,
  reviewerName: `${reviewer.name}醫師`,
  reviewerTitle: reviewer.title,
  affiliation: `${reviewClinic.hospital}${reviewClinic.department}`,
} as const
