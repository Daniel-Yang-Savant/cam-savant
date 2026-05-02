/**
 * 估算閱讀時間
 * 中文閱讀速度約 500 字/分鐘
 */
export function getReadingTime(content: string): number {
  // 移除 MDX frontmatter、HTML 標籤、程式碼區塊
  const cleaned = content
    .replace(/^---[\s\S]*?---/, '')       // frontmatter
    .replace(/```[\s\S]*?```/g, '')        // code blocks
    .replace(/<[^>]+>/g, '')               // HTML tags
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown links → text only
    .replace(/[#*`>_~\-|]/g, '')           // markdown symbols

  // 計算中文字元 + 英文單字
  const chineseChars = (cleaned.match(/[一-鿿㐀-䶿]/g) || []).length
  const englishWords = (cleaned.match(/[a-zA-Z]+/g) || []).length

  // 中文 500 字/分，英文 200 字/分（加權混合）
  const minutes = chineseChars / 500 + englishWords / 200

  return Math.max(1, Math.round(minutes))
}
