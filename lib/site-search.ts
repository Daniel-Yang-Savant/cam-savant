import Fuse from 'fuse.js'
import type { SearchItem } from './search-types'

export function createSiteSearch(items: SearchItem[]) {
  return new Fuse(items, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'tags', weight: 0.25 },
      { name: 'excerpt', weight: 0.15 },
      { name: 'categoryLabel', weight: 0.1 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 1,
  })
}

export function searchSiteIndex(search: Fuse<SearchItem>, query: string, limit = 8): SearchItem[] {
  const trimmed = query.trim()
  if (!trimmed) return []
  const terms = trimmed.split(/\s+/u)
  if (terms.length === 1) return search.search(trimmed, { limit }).map(({ item }) => item)

  // A name and a region may live in different metadata fields. Every entered
  // term must match; do not silently broaden a multiword request to any word.
  const remainingMatches = terms.slice(1).map((term) => new Set(search.search(term).map(({ item }) => item.id)))
  return search.search(terms[0])
    .filter(({ item }) => remainingMatches.every((matches) => matches.has(item.id)))
    .slice(0, limit)
    .map(({ item }) => item)
}
