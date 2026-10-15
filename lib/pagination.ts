export type PageParameter = string | string[] | undefined

export function getPageHref(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}?page=${page}`
}

/** Keep the displayed slice, canonical, and collection schema on the same page. */
export function getPagination({
  page,
  totalItems,
  basePath,
  pageSize = 12,
}: {
  page: PageParameter
  totalItems: number
  basePath: string
  pageSize?: number
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  // Repeated parameters and partially numeric values ("2abc", "2.5") are
  // ambiguous. Use the first page rather than interpreting only a prefix.
  const parsedPage = typeof page === 'string' && /^\d+$/.test(page) ? Number(page) : 1
  const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  // Preserve the existing behavior for positive page numbers beyond the end.
  const currentPage = Math.min(requestedPage, totalPages)

  return {
    currentPage,
    totalPages,
    canonicalPath: getPageHref(basePath, currentPage),
    startIndex: (currentPage - 1) * pageSize,
    endIndex: currentPage * pageSize,
  }
}
