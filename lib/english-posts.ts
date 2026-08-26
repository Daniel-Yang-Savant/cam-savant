import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { z } from 'zod'

const englishPostsDirectory = path.join(process.cwd(), 'content', 'posts-en')

const EnglishPostFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  author: z.string().optional(),
  category: z.literal('perioperative-rehab'),
  excerpt: z.string().min(10).max(240),
  tags: z.array(z.string()).optional(),
  takeaways: z.array(z.string().min(1).max(200)).min(3).max(5).optional(),
  translationOf: z.string().min(1),
  draft: z.boolean().optional().default(false),
  lastModified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type EnglishPostFrontmatter = z.infer<typeof EnglishPostFrontmatterSchema>

export type EnglishPost = {
  slug: string
  frontmatter: EnglishPostFrontmatter
  content: string
}

function readEnglishPost(fileName: string): EnglishPost {
  const slug = fileName.replace(/\.mdx?$/, '')
  const fileContents = fs.readFileSync(path.join(englishPostsDirectory, fileName), 'utf8')
  const { data, content } = matter(fileContents)
  const result = EnglishPostFrontmatterSchema.safeParse(data)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`\n[English frontmatter validation failed] content/posts-en/${fileName}\n${issues}\n`)
  }

  return { slug, frontmatter: result.data, content }
}

export function getAllEnglishPosts(): EnglishPost[] {
  if (!fs.existsSync(englishPostsDirectory)) return []

  return fs
    .readdirSync(englishPostsDirectory)
    .filter((fileName) => /\.mdx?$/.test(fileName))
    .map(readEnglishPost)
    .filter((post) => !post.frontmatter.draft)
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title, 'en'))
}

export function getEnglishPostBySlug(slug: string): EnglishPost | null {
  for (const extension of ['.mdx', '.md']) {
    const fileName = `${slug}${extension}`
    if (fs.existsSync(path.join(englishPostsDirectory, fileName))) {
      return readEnglishPost(fileName)
    }
  }
  return null
}
