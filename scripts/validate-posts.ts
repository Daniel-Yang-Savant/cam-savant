import fs from 'fs'
import path from 'path'
import { getAllPosts, PROTECTED_CATEGORIES } from '../lib/posts'

try {
  const posts = getAllPosts()
  console.log(`✓ ${posts.length} 篇文章 frontmatter 驗證通過`)

  const missing: string[] = []
  for (const post of posts) {
    // Protected postoperative articles use the section-level social image and
    // intentionally do not require an individual cover file.
    if (PROTECTED_CATEGORIES.includes(post.frontmatter.category)) continue

    if (post.frontmatter.coverImage) {
      const imgPath = path.join(
        process.cwd(),
        'public',
        post.frontmatter.coverImage
      )
      if (!fs.existsSync(imgPath)) {
        missing.push(`  • ${post.slug}: ${post.frontmatter.coverImage}`)
      }
    }
  }
  if (missing.length > 0) {
    console.warn(`\n⚠ ${missing.length} 篇文章 coverImage 找不到檔案：`)
    console.warn(missing.join('\n'))
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
}
