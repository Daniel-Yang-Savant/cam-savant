/**
 * Pure constants — no Node.js imports.
 * Safe to import from both server components and client components.
 */

export const CATEGORY_KEYS = [
  'weekly-picks',
  'sports-medicine',
  'rehabilitation-medicine',
  'functional-medicine',
  'fsm',
  'perioperative-rehab',
] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export const CATEGORY_LABELS: Record<string, string> = {
  'weekly-picks': '每週論文精選',
  'sports-medicine': '運動醫學',
  'rehabilitation-medicine': '復健醫學',
  'functional-medicine': '功能醫學',
  'fsm': 'FSM',
  'perioperative-rehab': '術後復健',
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'weekly-picks':
    '每週掃描運動醫學與復健頂尖期刊，精選最新且具臨床參考價值的實證研究導讀。',
  'sports-medicine':
    '運動表現、傷害預防與過度訓練——以實證醫學為基礎的運動科學臨床應用。',
  'rehabilitation-medicine':
    '骨骼肌肉傷病的診斷與保守治療復健，從急性處理到功能性回場的完整臨床路徑。',
  'functional-medicine':
    '從根本原因探討慢性疾病，整合腸道、荷爾蒙與粒線體的系統性思維。',
  'fsm':
    'FSM（頻率共振微電流）的臨床應用、生理機轉與實證研究。',
  'perioperative-rehab':
    '術前備戰與術後復健的完整照護路徑，加速功能恢復並降低手術風險。',
}
