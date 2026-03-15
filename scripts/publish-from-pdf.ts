#!/usr/bin/env ts-node
/**
 * publish-from-pdf.ts
 * PDF → Claude 改寫繁體中文 → Unsplash / Pexels 封面選圖 → .mdx → git push 自動部署
 *
 * 使用方式：
 *   npx ts-node scripts/publish-from-pdf.ts ./論文.pdf
 *
 * 圖片搜尋邏輯：
 *   1. 優先使用 Unsplash（需設定 UNSPLASH_ACCESS_KEY）
 *   2. Unsplash 未設定或失敗時，自動切換到 Pexels（需設定 PEXELS_API_KEY）
 */

import Anthropic from '@anthropic-ai/sdk'
import nodeFetch from 'node-fetch'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { execSync } from 'child_process'
import * as dotenv from 'dotenv'

// 載入環境變數（.env 優先，.env.local 可覆蓋）
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// ── Types ──────────────────────────────────────────────────────────────────

interface ArticleData {
  title: string
  excerpt: string
  category: 'sports-medicine' | 'functional-medicine' | 'fsm'
  slug: string
  content: string
  searchQuery: string
}

/** 統一格式，Unsplash / Pexels 都轉換成這個結構 */
interface PhotoResult {
  label: string
  photographer: string
  previewUrl: string   // 小尺寸預覽，終端機顯示用
  fullUrl: string      // 大尺寸，寫入 MDX 用
  source: 'Unsplash' | 'Pexels'
}

// Unsplash raw response
interface UnsplashPhoto {
  description: string | null
  alt_description: string | null
  urls: { regular: string; small: string }
  user: { name: string }
}

// Pexels raw response
interface PexelsPhoto {
  alt: string | null
  photographer: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve =>
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  )
}

function checkEnv() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ 缺少環境變數：ANTHROPIC_API_KEY')
    console.error('   請在 .env 填入 API 金鑰\n')
    process.exit(1)
  }
  if (!process.env.UNSPLASH_ACCESS_KEY && !process.env.PEXELS_API_KEY) {
    console.warn('\n⚠️  UNSPLASH_ACCESS_KEY 與 PEXELS_API_KEY 均未設定')
    console.warn('   將略過封面圖片搜尋，請稍後手動填入\n')
  }
}

// ── Step 1：Claude 讀取 PDF 並改寫 ────────────────────────────────────────

async function processPDF(pdfPath: string): Promise<ArticleData> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const pdfBase64 = fs.readFileSync(pdfPath).toString('base64')

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          } as any,
          {
            type: 'text',
            text: `你是一位復健科主治醫師，擅長運動醫學、功能醫學與輔助醫學。
請將以下論文改寫為繁體中文醫學知識文章，風格規範如下：

【結構】
- 開頭：用一個臨床情境或新聞事件帶入主題
- 主體：用 H2/H3 標題分段，每段聚焦一個核心概念
- 結尾：總結臨床重點，加上 References 列出原始論文

【語言風格】
- 保留英文醫學術語，第一次出現時加中文說明
  例如：心室顫動 Ventricular Fibrillation (VF)
- 重要數據、臨床建議用粗體標示
- 引用具體期刊名稱與研究數據
- 適當使用條列式整理臨床標準或步驟

【tone】
- 知識性：保留關鍵醫學資訊，不過度簡化
- 可讀性：一般民眾能理解，但不失專業深度
- 有個人觀點：可加入臨床視角的評論
- 不說教：提供資訊而非命令

【長度】1500～3000 字

---

改寫完成後，請直接輸出一個 JSON 物件（不要有其他說明文字）：
{
  "title": "文章標題（繁體中文，具吸引力）",
  "excerpt": "文章摘要（80-120字，繁體中文，概述核心內容）",
  "category": "sports-medicine | functional-medicine | fsm",
  "slug": "url-slug（英文小寫、連字號，例如 acl-rehabilitation）",
  "content": "文章正文（Markdown 格式，繁體中文，使用 ## 二級標題與 --- 分隔線，保留臨床數據與表格）",
  "searchQuery": "封面圖片搜尋關鍵字（3-5個英文單詞，例如 sports rehabilitation knee therapy）"
}

分類說明：
- sports-medicine：運動傷害、復健、運動表現
- functional-medicine：腸道健康、荷爾蒙、粒線體、慢性病根本原因
- fsm：頻率特異性微電流（Frequency Specific Microcurrent）

文章末尾請加上：
---
*本文內容僅供醫療專業人員學習參考，不構成個別診療建議。*`,
          },
        ],
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Claude 未回傳有效的 JSON，請重試')

  return JSON.parse(match[0]) as ArticleData
}

// ── Step 2a：Unsplash 搜尋 ─────────────────────────────────────────────────

async function searchUnsplash(query: string): Promise<PhotoResult[]> {
  const url =
    `https://api.unsplash.com/search/photos` +
    `?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&content_filter=high`

  const res = await nodeFetch(url, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
  })

  if (!res.ok) throw new Error(`Unsplash API 錯誤：${res.status} ${res.statusText}`)
  const data = (await res.json()) as { results: UnsplashPhoto[] }

  return (data.results ?? []).map(p => ({
    label: (p.description || p.alt_description || '無描述').slice(0, 60),
    photographer: p.user.name,
    previewUrl: p.urls.small,
    fullUrl: p.urls.regular,
    source: 'Unsplash' as const,
  }))
}

// ── Step 2b：Pexels 搜尋（備用）──────────────────────────────────────────

async function searchPexels(query: string): Promise<PhotoResult[]> {
  const url =
    `https://api.pexels.com/v1/search` +
    `?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`

  const res = await nodeFetch(url, {
    headers: { Authorization: process.env.PEXELS_API_KEY! },
  })

  if (!res.ok) throw new Error(`Pexels API 錯誤：${res.status} ${res.statusText}`)
  const data = (await res.json()) as { photos: PexelsPhoto[] }

  return (data.photos ?? []).map(p => ({
    label: (p.alt || '無描述').slice(0, 60),
    photographer: p.photographer,
    previewUrl: p.src.small,
    fullUrl: p.src.large2x || p.src.large,
    source: 'Pexels' as const,
  }))
}

// ── Step 2：雙來源搜尋（Unsplash → Pexels fallback）───────────────────────

async function searchPhotos(query: string): Promise<{ photos: PhotoResult[]; source: string }> {
  // 優先 Unsplash
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const photos = await searchUnsplash(query)
      if (photos.length > 0) return { photos, source: 'Unsplash' }
      console.warn('   ⚠️  Unsplash 搜尋結果為空，切換到 Pexels...')
    } catch (e: any) {
      console.warn(`   ⚠️  Unsplash 搜尋失敗：${e.message}，切換到 Pexels...`)
    }
  } else {
    console.log('   ℹ️  UNSPLASH_ACCESS_KEY 未設定，使用 Pexels...')
  }

  // 備用 Pexels
  if (process.env.PEXELS_API_KEY) {
    try {
      const photos = await searchPexels(query)
      return { photos, source: 'Pexels（Unsplash 備用）' }
    } catch (e: any) {
      console.warn(`   ⚠️  Pexels 搜尋失敗：${e.message}`)
    }
  } else {
    console.warn('   ⚠️  PEXELS_API_KEY 未設定，無法搜尋備用圖片')
  }

  return { photos: [], source: '無' }
}

// ── Step 3：建立 .mdx 檔案 ────────────────────────────────────────────────

function writeMDX(article: ArticleData, coverImage: string): string {
  const today = new Date().toISOString().split('T')[0]
  const escape = (s: string) => s.replace(/"/g, '\\"')

  const mdx = `---
title: "${escape(article.title)}"
date: "${today}"
category: "${article.category}"
excerpt: "${escape(article.excerpt)}"
coverImage: "${coverImage}"
---

${article.content}
`

  const filePath = path.join(process.cwd(), 'content', 'posts', `${article.slug}.mdx`)
  fs.writeFileSync(filePath, mdx, 'utf8')
  return filePath
}

// ── Step 4：git add / commit / push ───────────────────────────────────────

function gitPush(title: string) {
  const safeTitle = title.replace(/['"]/g, '').slice(0, 60)
  execSync('git add .', { stdio: 'inherit' })
  execSync(
    `git commit -m "feat: add post - ${safeTitle}\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"`,
    { stdio: 'inherit' }
  )
  execSync('git push origin main', { stdio: 'inherit' })
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const pdfPath = process.argv[2]

  if (!pdfPath) {
    console.error('\n使用方式：npx ts-node scripts/publish-from-pdf.ts ./論文.pdf\n')
    process.exit(1)
  }
  if (!fs.existsSync(pdfPath)) {
    console.error(`\n❌ 找不到檔案：${pdfPath}\n`)
    process.exit(1)
  }

  checkEnv()

  // ── 1. Claude 改寫 PDF
  console.log('\n📖 Claude 正在讀取 PDF 並改寫為繁體中文文章...\n')
  const article = await processPDF(pdfPath)

  console.log('✅ 改寫完成')
  console.log(`   標題：${article.title}`)
  console.log(`   分類：${article.category}`)
  console.log(`   Slug：${article.slug}`)

  // ── 2. 搜尋封面圖片（Unsplash → Pexels fallback）
  console.log(`\n🔍 搜尋封面圖片（關鍵字：${article.searchQuery}）...\n`)

  const { photos, source } = await searchPhotos(article.searchQuery)

  // ── 3. 顯示選項
  let coverImage = ''

  if (photos.length > 0) {
    console.log(`   圖片來源：${source}\n`)
    photos.forEach((photo, i) => {
      console.log(`  [${i + 1}] ${photo.label}`)
      console.log(`       📷 ${photo.photographer}`)
      console.log(`       🔗 ${photo.previewUrl}\n`)
    })
    console.log('  [0] 不選，我自己上傳圖片\n')

    const choice = await ask('請輸入數字選擇封面圖片（0–3）：')
    const num = parseInt(choice)

    if (num >= 1 && num <= photos.length) {
      coverImage = photos[num - 1].fullUrl
      console.log(`\n✅ 已選擇圖片（來源：${source}）`)
    } else {
      console.log('\n⚠️  coverImage 留空，請稍後在 .mdx 填入圖片路徑')
    }
  } else {
    console.log('⚠️  無圖片結果，coverImage 留空')
  }

  // ── 4. 寫入 .mdx
  const filePath = writeMDX(article, coverImage)
  console.log(`\n✅ 已建立文章：${path.relative(process.cwd(), filePath)}`)

  // ── 5. 確認發布
  const go = await ask('\n🚀 確認 git push 發布到 Vercel？(y/n)：')
  if (go.toLowerCase() === 'y') {
    console.log('')
    gitPush(article.title)
    console.log('\n🎉 文章已發布！Vercel 將在 1-2 分鐘內自動部署。')
  } else {
    console.log('\n📝 .mdx 已建立但尚未發布。執行以下指令即可發布：')
    console.log('   git add . && git commit -m "feat: add post" && git push origin main\n')
  }
}

main().catch(err => {
  console.error('\n❌ 發生錯誤：', err.message)
  process.exit(1)
})
