import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { z } from 'zod'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

// ── Schema ─────────────────────────────────────────────────────────────────

export const CATEGORY_KEYS = [
  'sports-medicine',
  'rehabilitation-medicine',
  'functional-medicine',
  'fsm',
  'perioperative-rehab',
] as const

const PostFrontmatterSchema = z.object({
  title: z.string().min(1, 'title 不可為空'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date 格式須為 YYYY-MM-DD')
    .refine((s) => !Number.isNaN(new Date(s).getTime()), {
      message: 'date 不是有效日期',
    }),
  category: z.enum(CATEGORY_KEYS, {
    errorMap: () => ({
      message: `category 必須為下列其一: ${CATEGORY_KEYS.join(', ')}`,
    }),
  }),
  excerpt: z
    .string()
    .min(10, 'excerpt 至少 10 字（SEO meta description 用）')
    .max(200, 'excerpt 建議不超過 200 字'),
  author: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(false),
})

// ── Types ──────────────────────────────────────────────────────────────────

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  content: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  'sports-medicine': '運動醫學',
  'rehabilitation-medicine': '復健醫學',
  'functional-medicine': '功能醫學',
  'fsm': 'FSM',
  'perioperative-rehab': '術後復健',
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'sports-medicine':
    '運動表現、傷害預防與過度訓練——以實證醫學為基礎的運動科學臨床應用。',
  'rehabilitation-medicine':
    '骨骼肌肉傷病的診斷與保守治療復健，從急性處理到功能性回場的完整臨床路徑。',
  'functional-medicine':
    '從根本原因探討慢性疾病，整合腸道、荷爾蒙與粒線體的系統性思維。',
  'fsm':
    '頻率特異性微電流（Frequency Specific Microcurrent）的臨床研究與應用。',
  'perioperative-rehab':
    '骨科、腫瘤科與心血管手術的個別化術前術後復健計畫。',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function readPost(fileName: string): Post {
  const slug = fileName.replace(/\.mdx?$/, '')
  const fullPath = path.join(postsDirectory, fileName)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const result = PostFrontmatterSchema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    throw new Error(
      `\n[frontmatter 驗證失敗] content/posts/${fileName}\n${issues}\n`
    )
  }

  return {
    slug,
    frontmatter: result.data,
    content,
  }
}

// ── Protected categories ───────────────────────────────────────────────────

export const PROTECTED_CATEGORIES = ['perioperative-rehab']

// ── Public API ─────────────────────────────────────────────────────────────

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return []

  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((f) => /\.mdx?$/.test(f))

  return fileNames
    .map(readPost)
    .filter((post) => !post.frontmatter.draft)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    )
}

export function getPostBySlug(slug: string): Post | null {
  for (const ext of ['.mdx', '.md']) {
    const fullPath = path.join(postsDirectory, `${slug}${ext}`)
    if (fs.existsSync(fullPath)) {
      return readPost(`${slug}${ext}`)
    }
  }
  return null
}

export function getPublicPosts(): Post[] {
  return getAllPosts().filter(
    (post) => !PROTECTED_CATEGORIES.includes(post.frontmatter.category)
  )
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter(
    (post) => post.frontmatter.category === category
  )
}

export function getAllSlugs(): { slug: string }[] {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}