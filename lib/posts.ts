import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { z } from 'zod'
import { CATEGORY_KEYS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } from '@/lib/category'
import {
  TAG_INDEX_MIN_POSTS,
  canonicalizeTag,
  getTagLandingPage,
  normalizeTags,
} from '@/lib/tags'

// Re-export so existing server-side imports keep working
export { CATEGORY_KEYS, CATEGORY_LABELS, CATEGORY_DESCRIPTIONS }

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

// ── Schema ─────────────────────────────────────────────────────────────────

const PostFrontmatterSchema = z.object({
  title: z.string().min(1, 'title 不可為空'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date 格式須為 YYYY-MM-DD')
    .refine((s) => !Number.isNaN(new Date(s).getTime()), {
      message: 'date 不是有效日期',
    }),
    category: z.enum(CATEGORY_KEYS, {
    message: `category 必須為下列其一: ${CATEGORY_KEYS.join(', ')}`,
    }),
  excerpt: z
    .string()
    .min(10, 'excerpt 至少 10 字（SEO meta description 用）')
    .max(200, 'excerpt 建議不超過 200 字'),
  author: z.string().min(1, 'author 不可為空'),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  takeaways: z
    .array(z.string().min(1, 'takeaways 不可包含空白項目').max(160, '單項 takeaways 建議不超過 160 字'))
    .min(3, 'takeaways 至少需要 3 點')
    .max(5, 'takeaways 最多 5 點')
    .optional(),
  draft: z.boolean().optional().default(false),
  lastModified: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'lastModified 格式須為 YYYY-MM-DD')
    .optional(),
})

// ── Types ──────────────────────────────────────────────────────────────────

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  content: string
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
    frontmatter: {
      ...result.data,
      tags: result.data.tags ? normalizeTags(result.data.tags) : undefined,
    },
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

export function getPostsByTag(tag: string): Post[] {
  const canonicalTag = canonicalizeTag(tag)
  return getPublicPosts().filter(
    (post) => post.frontmatter.tags?.includes(canonicalTag)
  )
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const post of getPublicPosts()) {
    for (const tag of post.frontmatter.tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export function getIndexableTags(): { tag: string; count: number }[] {
  return getAllTags().filter(
    ({ tag, count }) =>
      count >= TAG_INDEX_MIN_POSTS && !getTagLandingPage(tag)
  )
}

export function getPublicSlugs(): { slug: string }[] {
  return getPublicPosts().map((post) => ({ slug: post.slug }))
}
