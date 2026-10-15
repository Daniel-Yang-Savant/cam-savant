import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { getPagination, type PageParameter } from '../lib/pagination'
import { getPostsByCategory, getPublicPosts } from '../lib/posts'
import PostsPage, { generateMetadata as postsMetadata } from '../app/(zh)/posts/page'
import SportsMedicinePage, { generateMetadata as sportsMetadata } from '../app/(zh)/sports-medicine/page'
import RehabMedicinePage, { generateMetadata as rehabMetadata } from '../app/(zh)/rehabilitation-medicine/page'
import FunctionalMedicinePage, { generateMetadata as functionalMetadata } from '../app/(zh)/functional-medicine/page'
import FSMPage, { generateMetadata as fsmMetadata } from '../app/(zh)/fsm/page'
import WeeklyPicksPage, { generateMetadata as weeklyMetadata } from '../app/(zh)/weekly-picks/page'

test('pagination keeps every item reachable exactly once and uses clean first-page URLs', () => {
  const items = Array.from({ length: 29 }, (_, index) => index)
  const found: number[] = []
  for (const page of [1, 2, 3]) {
    const state = getPagination({ page: String(page), totalItems: items.length, basePath: '/articles' })
    found.push(...items.slice(state.startIndex, state.endIndex))
    assert.equal(state.totalPages, 3)
    assert.equal(state.canonicalPath, page === 1 ? '/articles' : `/articles?page=${page}`)
  }
  assert.deepEqual(found, items)
})

test('invalid or repeated page parameters resolve to the first page', () => {
  const invalid: PageParameter[] = [
    undefined, '', '0', '-1', '2abc', '2.5', '2e1', ' 2 ', 'Infinity',
    '9007199254740992', ['2', '3'], ['2', '2'], [],
  ]
  for (const page of invalid) {
    const state = getPagination({ page, totalItems: 29, basePath: '/articles' })
    assert.equal(state.currentPage, 1, JSON.stringify(page))
    assert.equal(state.canonicalPath, '/articles', JSON.stringify(page))
    assert.equal(state.startIndex, 0)
  }
})

test('numeric variants and pages beyond the end have a canonical matching the rendered slice', () => {
  const leadingZero = getPagination({ page: '02', totalItems: 29, basePath: '/articles' })
  assert.equal(leadingZero.currentPage, 2)
  assert.equal(leadingZero.canonicalPath, '/articles?page=2')

  const beyondEnd = getPagination({ page: '999', totalItems: 29, basePath: '/articles' })
  assert.equal(beyondEnd.currentPage, 3)
  assert.equal(beyondEnd.canonicalPath, '/articles?page=3')
  assert.equal(beyondEnd.startIndex, 24)

  for (const totalItems of [0, 1, 12]) {
    const singlePage = getPagination({ page: '2', totalItems, basePath: '/articles' })
    assert.equal(singlePage.currentPage, 1)
    assert.equal(singlePage.totalPages, 1)
    assert.equal(singlePage.canonicalPath, '/articles')
  }
})

const categories = [
  { category: 'sports-medicine', Page: SportsMedicinePage, metadata: sportsMetadata },
  { category: 'rehabilitation-medicine', Page: RehabMedicinePage, metadata: rehabMetadata },
  { category: 'functional-medicine', Page: FunctionalMedicinePage, metadata: functionalMetadata },
  { category: 'fsm', Page: FSMPage, metadata: fsmMetadata },
  { category: 'weekly-picks', Page: WeeklyPicksPage, metadata: weeklyMetadata },
]

for (const { category, Page, metadata } of categories) {
  test(`${category}: rendered articles, metadata and collection schema agree for every URL variant`, async () => {
    const posts = getPostsByCategory(category)
    const lastPage = Math.max(1, Math.ceil(posts.length / 12))
    const cases: { input: PageParameter; expected: number }[] = [
      { input: undefined, expected: 1 },
      { input: '1', expected: 1 },
      { input: '2', expected: Math.min(2, lastPage) },
      { input: '02', expected: Math.min(2, lastPage) },
      { input: '999', expected: lastPage },
      { input: '-1', expected: 1 },
      { input: '2abc', expected: 1 },
      { input: ['2', '3'], expected: 1 },
    ]

    for (const { input, expected } of cases) {
      const props = { searchParams: Promise.resolve({ page: input }) }
      const expectedPath = expected === 1 ? `/${category}` : `/${category}?page=${expected}`
      const pageMetadata = await metadata(props)
      const html = renderToStaticMarkup(await Page(props))
      const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1]
      assert.ok(json, `${category}: collection schema missing`)
      assert.equal(pageMetadata.alternates?.canonical, expectedPath, JSON.stringify(input))
      assert.equal(JSON.parse(json).url, `https://camsavant.com${expectedPath}`, JSON.stringify(input))
      assert.equal(pageMetadata.robots, undefined, 'public category pages stay indexable')

      const renderedSlugs = [...html.matchAll(/href="\/posts\/([^"]+)"/g)].map((match) => match[1])
      assert.deepEqual(
        renderedSlugs,
        posts.slice((expected - 1) * 12, expected * 12).map((post) => post.slug),
        `${category}: wrong article slice for ${JSON.stringify(input)}`,
      )
    }
  })
}

test('all articles are reachable exactly once by following rendered /posts pagination links without JavaScript', async () => {
  const expected = getPublicPosts().map((post) => post.slug)
  const queued = new Set(['/posts'])
  const pages = new Map<number, string[]>()

  for (const path of queued) {
    const url = new URL(path, 'https://camsavant.com')
    const page = url.searchParams.get('page') ?? undefined
    const props = { searchParams: Promise.resolve({ page }) }
    const html = renderToStaticMarkup(await PostsPage(props))
    const metadata = await postsMetadata(props)
    assert.equal(metadata.alternates?.canonical, path)
    assert.equal(metadata.robots, undefined)
    const pageNumber = page ? Number(page) : 1
    const slugs = [...html.matchAll(/href="\/posts\/([^"]+)"/g)].map((match) => match[1])
    assert.deepEqual(slugs, expected.slice((pageNumber - 1) * 12, pageNumber * 12))
    pages.set(pageNumber, slugs)

    const pagination = html.match(/<nav aria-label="文章分頁"[^>]*>(.*?)<\/nav>/)?.[1]
    assert.ok(pagination, 'the complete article index needs crawlable pagination')
    assert.doesNotMatch(pagination, /<button\b/)
    for (const [, href] of pagination.matchAll(/href="(\/posts(?:\?page=\d+)?)"/g)) {
      queued.add(href)
    }
  }

  assert.equal(pages.size, Math.ceil(expected.length / 12))
  assert.deepEqual([...pages].sort(([a], [b]) => a - b).flatMap(([, slugs]) => slugs), expected)
})

test('/posts URL variants keep their rendered articles and canonical on the same page', async () => {
  const posts = getPublicPosts()
  const lastPage = Math.max(1, Math.ceil(posts.length / 12))
  const cases: { input: PageParameter; expected: number }[] = [
    { input: undefined, expected: 1 },
    { input: '1', expected: 1 },
    { input: '2', expected: Math.min(2, lastPage) },
    { input: '02', expected: Math.min(2, lastPage) },
    { input: '999', expected: lastPage },
    { input: '-1', expected: 1 },
    { input: '2abc', expected: 1 },
    { input: ['2', '3'], expected: 1 },
  ]

  for (const { input, expected } of cases) {
    const props = { searchParams: Promise.resolve({ page: input }) }
    const html = renderToStaticMarkup(await PostsPage(props))
    const metadata = await postsMetadata(props)
    assert.equal(metadata.alternates?.canonical, expected === 1 ? '/posts' : `/posts?page=${expected}`)
    const slugs = [...html.matchAll(/href="\/posts\/([^"]+)"/g)].map((match) => match[1])
    assert.deepEqual(slugs, posts.slice((expected - 1) * 12, expected * 12).map((post) => post.slug))
  }
})
