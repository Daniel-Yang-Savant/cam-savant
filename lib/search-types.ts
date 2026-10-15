export type SearchItemType = 'article' | 'exercise' | 'doctor' | 'location' | 'directory'

/** Compact public metadata only. This module is safe to import in the browser. */
export interface SearchItem {
  id: string
  type: SearchItemType
  typeLabel: string
  href: string
  slug: string
  title: string
  excerpt: string
  category: string
  categoryLabel: string
  tags: string[]
  date: string
  coverImage?: string
}
