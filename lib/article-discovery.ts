import type { Post, PostFrontmatter } from './posts'
import { getReadingTime } from './reading-time'

// Explicit public allowlist: protected or future categories must not silently
// appear in the browser's discovery data.
export const PUBLIC_ARTICLE_CATEGORIES = [
  'sports-medicine',
  'rehabilitation-medicine',
  'weekly-picks',
  'functional-medicine',
  'fsm',
] as const

export interface ArticleSummary {
  slug: string
  frontmatter: Pick<PostFrontmatter, 'title' | 'date' | 'category' | 'excerpt' | 'coverImage' | 'tags'>
  readingTime: number
}

export function createPublicArticleSummaries(posts: readonly Post[]): ArticleSummary[] {
  return posts
    .filter(({ frontmatter }) =>
      !frontmatter.draft && PUBLIC_ARTICLE_CATEGORIES.some((key) => key === frontmatter.category)
    )
    .map(({ slug, frontmatter, content }) => ({
      slug,
      frontmatter: {
        title: frontmatter.title,
        date: frontmatter.date,
        category: frontmatter.category,
        excerpt: frontmatter.excerpt,
        coverImage: frontmatter.coverImage,
        tags: frontmatter.tags,
      },
      readingTime: getReadingTime(content),
    }))
}
