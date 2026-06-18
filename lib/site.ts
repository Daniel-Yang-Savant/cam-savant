// ─────────────────────────────────────────────────────────────────────────
// 全站聯絡管道設定（集中管理，改這裡即可全站生效）
//
// LINE 官方帳號申請完成後，把下面兩個值換成你自己的：
//   1. LINE_ADD_URL — 加好友連結，形如 https://lin.ee/XXXXXXX
//   2. LINE_ID      — 官方帳號 ID，形如 @xxxxxxx（含 @）
//
// 也可改用環境變數（Vercel → Settings → Environment Variables）：
//   NEXT_PUBLIC_LINE_URL = https://lin.ee/XXXXXXX
//   NEXT_PUBLIC_LINE_ID  = @xxxxxxx
// 設了環境變數就會優先採用，否則用下面的預設值。
// ─────────────────────────────────────────────────────────────────────────

/** LINE 官方帳號加好友連結（由基本 ID 組成，掃 QR 或點擊皆會開啟加好友） */
export const LINE_ADD_URL =
  process.env.NEXT_PUBLIC_LINE_URL || 'https://line.me/R/ti/p/@181bgbcg'

/** LINE 官方帳號 ID，含 @ */
export const LINE_ID =
  process.env.NEXT_PUBLIC_LINE_ID || '@181bgbcg'

/** 是否已完成設定（連結尚未替換時為 false，可用來決定要不要顯示入口） */
export const LINE_READY = !LINE_ADD_URL.includes('REPLACE_ME')

/** 諮詢提問 Google 表單 */
export const CONSULT_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSce2gBT1hksmK27GyvqwCkngUJ1wdQJNLcO2zxCTjGGl0mcCw/viewform?usp=header'

/** LINE 品牌綠 */
export const LINE_GREEN = '#06C755'
