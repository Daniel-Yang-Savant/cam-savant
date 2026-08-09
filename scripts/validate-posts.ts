import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { getAllPosts, PROTECTED_CATEGORIES } from '../lib/posts'
import { getAllEnglishPosts } from '../lib/english-posts'
import { ENGLISH_PERIOP_SLUGS } from '../lib/locales'
import { AUTHORS } from '../lib/authors'

const MAX_COVER_BYTES = 2 * 1024 * 1024
const TARGET_ASPECT_RATIO = 16 / 9
const ASPECT_RATIO_TOLERANCE = 0.04

async function main() {
  const posts = getAllPosts()
  console.log(`✓ ${posts.length} 篇文章 frontmatter 驗證通過`)
  const englishPosts = getAllEnglishPosts()
  console.log(`✓ ${englishPosts.length} English article frontmatter records validated`)

  const englishSlugs = new Set(englishPosts.map((post) => post.slug))
  const missingEnglish = ENGLISH_PERIOP_SLUGS.filter((slug) => !englishSlugs.has(slug))
  const unexpectedEnglish = englishPosts.filter(
    (post) =>
      post.frontmatter.translationOf !== post.slug ||
      !posts.some((sourcePost) => sourcePost.slug === post.frontmatter.translationOf)
  )

  if (missingEnglish.length > 0) {
    throw new Error(`Missing English postoperative translations: ${missingEnglish.join(', ')}`)
  }
  if (unexpectedEnglish.length > 0) {
    throw new Error(
      `Invalid English translationOf mapping: ${unexpectedEnglish
        .map((post) => post.slug)
        .join(', ')}`
    )
  }

  const issues: string[] = []
  for (const post of posts) {
    if (!AUTHORS[post.frontmatter.author]) {
      issues.push(`  • ${post.slug}: 未知作者 ${post.frontmatter.author}`)
    }

    // Protected postoperative articles use the section-level social image and
    // intentionally do not require an individual cover file.
    if (PROTECTED_CATEGORIES.includes(post.frontmatter.category)) continue

    if (post.frontmatter.coverImage) {
      if (!post.frontmatter.coverImage.startsWith('/images/covers/')) {
        issues.push(`  • ${post.slug}: coverImage 必須位於 /images/covers/`)
        continue
      }

      const imgPath = path.join(
        process.cwd(),
        'public',
        post.frontmatter.coverImage
      )
      if (!fs.existsSync(imgPath)) {
        issues.push(`  • ${post.slug}: 找不到 ${post.frontmatter.coverImage}`)
        continue
      }

      const metadata = await sharp(imgPath).metadata()
      const extension = path.extname(imgPath).toLowerCase()
      const fileSize = fs.statSync(imgPath).size
      const aspectRatio = (metadata.width ?? 0) / (metadata.height ?? 1)

      if (!['.jpg', '.jpeg'].includes(extension) || metadata.format !== 'jpeg') {
        issues.push(
          `  • ${post.slug}: 封面必須是實際 JPEG，不可只把 ${metadata.format ?? '未知格式'} 改名為 ${extension}`
        )
      }
      if (fileSize > MAX_COVER_BYTES) {
        issues.push(
          `  • ${post.slug}: 封面 ${Math.round(fileSize / 1024)} KB，超過 2048 KB`
        )
      }
      if (Math.abs(aspectRatio - TARGET_ASPECT_RATIO) > ASPECT_RATIO_TOLERANCE) {
        issues.push(
          `  • ${post.slug}: 封面比例 ${aspectRatio.toFixed(3)}，應接近 16:9`
        )
      }
    }
  }
  if (issues.length > 0) {
    throw new Error(
      `\n封面或作者驗證失敗（可先執行 npm run optimize:covers 修正圖片）：\n${issues.join('\n')}`
    )
  }
  console.log('✓ 文章作者與封面圖片格式驗證通過')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
