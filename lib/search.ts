import { getPublicPosts, CATEGORY_LABELS } from '@/lib/posts'

export interface SearchItem {
  slug: string
  title: string
  excerpt: string
  category: string
  categoryLabel: string
  tags: string[]
  date: string
  coverImage?: string
}

export function buildSearchIndex(): SearchItem[] {
  return getPublicPosts().map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    excerpt: post.frontmatter.excerpt,
    category: post.frontmatter.category,
    categoryLabel:
      CATEGORY_LABELS[post.frontmatter.category] ?? post.frontmatter.category,
    tags: post.frontmatter.tags ?? [],
    date: post.frontmatter.date,
    coverImage: post.frontmatter.coverImage,
  }))
}
