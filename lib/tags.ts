/**
 * 標籤治理規則集中於此，避免文章列表、標籤頁與 Sitemap 各自判斷。
 *
 * - aliases：合併近義詞或重複入口
 * - landing pages：已有完整分類頁的標籤直接導向分類頁
 * - descriptions：重要標籤頁使用獨立導讀，不只顯示通用句子
 */

export const TAG_INDEX_MIN_POSTS = 3

const TAG_ALIASES: Record<string, string> = {
  腰痛: '下背痛',
  下背部疼痛: '下背痛',
  運動創傷: '運動傷害',
  運動傷害防治: '傷害預防',
  恢復: '運動恢復',
  運動後恢復: '運動恢復',
  實證研究: '實證醫學',
  阿基里斯腱: '跟腱',
  頻率共振微電流: 'FSM',
  頻率特異性微電流: 'FSM',
  微電流治療: 'FSM',
  每週運動醫學論文精選: '每週論文精選',
}

const TAG_LANDING_PAGES: Record<string, string> = {
  運動醫學: '/sports-medicine',
  復健醫學: '/rehabilitation-medicine',
  功能醫學: '/functional-medicine',
  每週論文精選: '/weekly-picks',
  FSM: '/fsm',
}

const TAG_DESCRIPTIONS: Record<string, string> = {
  傷害預防:
    '整理常見運動傷害的風險因子、訓練調整、護具選擇與預防策略，協助不同運動族群降低受傷機會。',
  運動傷害:
    '從常見運動傷害的症狀、評估到復健與重返運動原則，提供以臨床實證為基礎的完整導讀。',
  物理治療:
    '整理運動傷害、疼痛與慢性疾病常見的物理治療觀念，說明適用情境、限制與相關研究。',
  保守治療:
    '彙整不以手術為第一選擇的治療與復健策略，包括運動治療、負荷管理及其他常見介入方式。',
  肌腱病變:
    '整理常見肌腱病變的成因、負荷管理、運動處方與治療選擇，並釐清恢復過程中的常見誤解。',
  訓練:
    '涵蓋運動訓練、恢復、營養與負荷安排，協助讀者在提升表現的同時兼顧健康與傷害預防。',
  慢性疾病:
    '從功能醫學與整合照護角度整理慢性疾病相關研究，說明生活型態、代謝、免疫與神經調節議題。',
  免疫:
    '整理運動、慢性發炎、感染後症候群與免疫調節相關內容，協助理解目前研究與臨床應用範圍。',
  迷走神經:
    '介紹迷走神經與自律神經調節的生理機轉、相關疾病及目前可用的臨床研究證據。',
  自律神經:
    '整理自律神經失衡、迷走神經與壓力反應的相關知識，說明常見症狀與評估方向。',
  實證醫學:
    '彙整研究證據、臨床指引與重要文獻，協助讀者理解醫療決策背後的證據品質與限制。',
  文獻回顧:
    '以主題方式整理近期復健與運動醫學文獻，快速掌握研究結果、臨床意義與應用限制。',
  情緒創傷:
    '探討情緒、壓力反應、神經系統與疼痛之間的關聯，並整理相關生理機轉與研究。',
  整合醫學:
    '從跨專業角度整理生活型態、功能醫學與輔助治療議題，並區分現有證據與仍待研究之處。',
  運動恢復:
    '整理運動後恢復、睡眠、肌肉痠痛與訓練調整策略，協助安排更安全且可持續的訓練節奏。',
  疼痛管理:
    '整理急性與慢性疼痛的評估觀念、治療選擇及自我管理原則，協助理解不同疼痛機轉。',
}

export function canonicalizeTag(tag: string): string {
  const trimmedTag = tag.trim()
  return TAG_ALIASES[trimmedTag] ?? trimmedTag
}

export function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(tags.map(canonicalizeTag).filter((tag) => tag.length > 0))
  )
}

export function getTagLandingPage(tag: string): string | undefined {
  return TAG_LANDING_PAGES[canonicalizeTag(tag)]
}

export function getTagHref(tag: string): string {
  const canonicalTag = canonicalizeTag(tag)
  return (
    getTagLandingPage(canonicalTag) ??
    `/tags/${encodeURIComponent(canonicalTag)}`
  )
}

export function getTagDescription(tag: string): string | undefined {
  return TAG_DESCRIPTIONS[canonicalizeTag(tag)]
}
