import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

// ── Types ──────────────────────────────────────────────────────────────────

export interface PostFrontmatter {
  title: string
  date: string
  category: string
  excerpt: string
  author?: string
  coverImage?: string
}

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  content: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  'sports-medicine':     '運動醫學',
  'functional-medicine': '功能醫學',
  'fsm':                 'FSM',
  'perioperative-rehab': '術後復健',
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'sports-medicine':     '運動傷害的預防、診斷與復健——以實證醫學為基礎的臨床應用。',
  'functional-medicine': '從根本原因探討慢性疾病，整合腸道、荷爾蒙與粒線體的系統性思維。',
  'fsm':                 '頻率特異性微電流（Frequency Specific Microcurrent）的臨床研究與應用。',
  'perioperative-rehab': '骨科、腫瘤科與心血管手術的個別化術前術後復健計畫。',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function readPost(fileName: string): Post {
  const slug = fileName.replace(/\.mdx?$/, '')
  const fullPath = path.join(postsDirectory, fileName)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content,
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/** 取得全部文章，依日期降序排列（最新在前）。 */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return []

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((f) => /\.mdx?$/.test(f))

  return fileNames
    .map(readPost)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    )
}

/** 依 slug 取得單篇文章，找不到則回傳 null。 */
export function getPostBySlug(slug: string): Post | null {
  for (const ext of ['.mdx', '.md']) {
    const fullPath = path.join(postsDirectory, `${slug}${ext}`)
    if (fs.existsSync(fullPath)) {
      return readPost(`${slug}${ext}`)
    }
  }
  return null
}

/** 依分類取得文章列表。 */
export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter(
    (post) => post.frontmatter.category === category
  )
}

/** 供 generateStaticParams 使用，回傳所有 slug 陣列。 */
export function getAllSlugs(): { slug: string }[] {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}
