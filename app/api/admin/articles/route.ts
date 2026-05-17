import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

export function GET() {
  if (!fs.existsSync(postsDirectory)) {
    return NextResponse.json([])
  }

  const files = fs
    .readdirSync(postsDirectory)
    .filter((f) => /\.mdx?$/.test(f))
    .sort()

  const articles = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, '')
    const fullPath = path.join(postsDirectory, filename)
    const raw = fs.readFileSync(fullPath, 'utf8')

    let frontmatter: Record<string, unknown> = {}
    try {
      const { data } = matter(raw)
      frontmatter = data
    } catch {
      // malformed frontmatter — still include the file
    }

    return {
      slug,
      filename,
      title: (frontmatter.title as string) ?? slug,
      date: (frontmatter.date as string) ?? '',
      category: (frontmatter.category as string) ?? '',
      draft: Boolean(frontmatter.draft),
    }
  })

  // Sort: newest first
  articles.sort((a, b) => (b.date > a.date ? 1 : -1))

  return NextResponse.json(articles)
}
