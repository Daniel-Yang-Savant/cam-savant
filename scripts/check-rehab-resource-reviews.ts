import { REHAB_RESOURCES } from '../lib/rehab-resources'
import { taipeiDate } from '../lib/rehab-resources/matching'
import { formatResourceReviewWarnings, resourceReviewWarnings } from '../lib/rehab-resources/review-warnings'

try {
  console.warn(formatResourceReviewWarnings(resourceReviewWarnings(REHAB_RESOURCES, taipeiDate())))
} catch (error) {
  // Review reminders must never block a build, including a malformed review date.
  console.warn('[補助與援助複核提醒] 無法產生到期提醒，請檢查資料；建置將繼續。', error instanceof Error ? error.message : String(error))
}
