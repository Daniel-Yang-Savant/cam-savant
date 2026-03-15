#!/usr/bin/env ts-node
/**
 * import-from-wix.ts
 * 互動式 CLI：輸入文章資訊 → 整理成 MDX frontmatter → 存檔 → git push
 *
 * 使用方式：
 *   npx ts-node scripts/import-from-wix.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { execSync } from 'child_process'

// ── Types ──────────────────────────────────────────────────────────────────

type Category = 'sports-medicine' | 'functional-medicine' | 'fsm'

const CATEGORY_OPTIONS: { key: string; value: Category; label: string }[] = [
  { key: '1', value: 'sports-medicine',    label: '運動醫學 (sports-medicine)' },
  { key: '2', value: 'functional-medicine', label: '功能醫學 (functional-medicine)' },
  { key: '3', value: 'fsm',               label: 'FSM (fsm)' },
]

// ── Utilities ──────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question: string): Promise<string> {
  return new Promise(resolve =>
    rl.question(question, answer => resolve(answer.trim()))
  )
}

function askMultiline(prompt: string): Promise<string> {
  console.log(prompt)
  console.log('（輸入完畢後，在新的一行輸入 "END" 並按 Enter）\n')
  return new Promise(resolve => {
    const lines: string[] = []
    rl.on('line', (line) => {
      if (line === 'END') {
        rl.removeAllListeners('line')
        resolve(lines.join('\n'))
      } else {
        lines.push(line)
      }
    })
  })
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function escape(s: string): string {
  return s.replace(/"/g, '\\"')
}

// ── Git ────────────────────────────────────────────────────────────────────

function gitPush(title: string) {
  const safeTitle = title.replace(/['"]/g, '').slice(0, 60)
  execSync('git add .', { stdio: 'inherit' })
  execSync(
    `git commit -m "feat: add post - ${safeTitle}\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"`,
    { stdio: 'inherit' }
  )
  execSync('git push origin main', { stdio: 'inherit' })
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════╗')
  console.log('║      CAM Savant — 從 Wix 匯入文章       ║')
  console.log('╚══════════════════════════════════════════╝\n')

  // ── 1. 標題
  const title = await ask('📝 文章標題：')
  if (!title) {
    console.error('❌ 標題不能為空')
    process.exit(1)
  }

  // ── 2. 日期
  const today = new Date().toISOString().split('T')[0]
  const rawDate = await ask(`📅 發佈日期（留空則使用今天 ${today}）：`)
  const date = rawDate || today

  // 驗證日期格式
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error('❌ 日期格式錯誤，請使用 YYYY-MM-DD（例如 2024-03-15）')
    process.exit(1)
  }

  // ── 3. 分類
  console.log('\n📂 請選擇分類：')
  CATEGORY_OPTIONS.forEach(o => console.log(`  [${o.key}] ${o.label}`))
  const catChoice = await ask('\n請輸入數字（1-3）：')
  const catOption = CATEGORY_OPTIONS.find(o => o.key === catChoice)
  if (!catOption) {
    console.error('❌ 無效的分類選項')
    process.exit(1)
  }
  const category = catOption.value

  // ── 4. 摘要（excerpt）
  const excerpt = await ask('\n💬 文章摘要（80–120 字，用於卡片預覽）：')

  // ── 5. 封面圖片
  const coverImage = await ask('\n🖼️  封面圖片 URL（Unsplash 或留空跳過）：')

  // ── 6. Slug
  const autoSlug = slugify(title)
  const rawSlug = await ask(`\n🔗 文章 Slug（留空使用自動產生的：${autoSlug}）：`)
  const slug = rawSlug || autoSlug

  // ── 7. 正文內容
  const content = await askMultiline('\n📄 請貼入文章正文（Markdown 格式）：')

  rl.close()

  if (!content.trim()) {
    console.error('\n❌ 文章內容不能為空')
    process.exit(1)
  }

  // ── 8. 組合 MDX
  const mdx = `---
title: "${escape(title)}"
date: "${date}"
category: "${category}"
excerpt: "${escape(excerpt)}"
coverImage: "${coverImage}"
---

${content.trim()}

---

*本文內容僅供醫療專業人員學習參考，不構成個別診療建議。*
`

  // ── 9. 存檔
  const outputPath = path.join(process.cwd(), 'content', 'posts', `${slug}.mdx`)

  if (fs.existsSync(outputPath)) {
    const rlConfirm = readline.createInterface({ input: process.stdin, output: process.stdout })
    const overwrite = await new Promise<string>(resolve =>
      rlConfirm.question(`\n⚠️  檔案已存在：${outputPath}\n   確認覆寫？(y/n)：`, ans => {
        rlConfirm.close()
        resolve(ans.trim().toLowerCase())
      })
    )
    if (overwrite !== 'y') {
      console.log('\n🚫 已取消，未覆寫現有檔案。')
      process.exit(0)
    }
  }

  fs.writeFileSync(outputPath, mdx, 'utf8')
  console.log(`\n✅ 已建立文章：content/posts/${slug}.mdx`)
  console.log(`   標題：${title}`)
  console.log(`   分類：${category}`)
  console.log(`   日期：${date}`)

  // ── 10. 確認發布
  const rlPush = readline.createInterface({ input: process.stdin, output: process.stdout })
  const go = await new Promise<string>(resolve =>
    rlPush.question('\n🚀 確認 git push 發布到 Vercel？(y/n)：', ans => {
      rlPush.close()
      resolve(ans.trim().toLowerCase())
    })
  )

  if (go === 'y') {
    console.log('')
    gitPush(title)
    console.log('\n🎉 文章已發布！Vercel 將在 1-2 分鐘內自動部署。')
  } else {
    console.log('\n📝 .mdx 已建立但尚未發布。執行以下指令即可發布：')
    console.log('   git add . && git commit -m "feat: add post" && git push origin main\n')
  }
}

main().catch(err => {
  rl.close()
  console.error('\n❌ 發生錯誤：', err.message)
  process.exit(1)
})
