import assert from 'node:assert/strict'
import test from 'node:test'
import { getAllPosts, getPublicPosts } from '../lib/posts'
import { getRelatedArticles, type RelatedArticleCandidate } from '../lib/related-articles'

const publicPosts = getPublicPosts()

test('marathon readers can continue to hydration and running injury guidance', () => {
  const slugs = getRelatedArticles('marathon-running-injuries-prevention', publicPosts)
    .map((post) => post.slug)
  assert.equal(slugs.length, 3)
  assert.ok(slugs.includes('sports-hydration-guide'))
  assert.ok(slugs.includes('running-shin-pain-bone-stress-injury'))
  assert.ok(!slugs.includes('golf-injuries-prevention'))
  assert.ok(!slugs.includes('pickleball-injuries-prevention'))
})

test('tennis readers can continue to the elbow and ankle conditions discussed in the article', () => {
  const slugs = getRelatedArticles('tennis-injuries-prevention', publicPosts)
    .map((post) => post.slug)
  assert.equal(slugs.length, 3)
  assert.ok(slugs.includes('lateral-epicondylitis-rehab'))
  assert.ok(slugs.includes('lateral-ankle-sprain-rehab'))
  assert.ok(slugs.includes('medial-epicondylitis-rehab'))
  assert.ok(!slugs.includes('golf-injuries-prevention'))
  assert.ok(!slugs.includes('pickleball-injuries-prevention'))
})

function article(
  slug: string,
  tags: string[] = [],
  date = '2026-01-01',
  content = ''
): RelatedArticleCandidate {
  return { slug, content, frontmatter: { category: 'sports-medicine', date, tags } }
}

test('a specific shared topic outranks a newer article that only shares broad labels', () => {
  const posts = [
    article('source', ['運動醫學', '傷害預防', '跑步']),
    article('recent-unrelated-sport', ['運動醫學', '傷害預防'], '2026-10-20'),
    article('older-running-guide', ['跑步'], '2020-01-01'),
  ]
  assert.equal(getRelatedArticles('source', posts, 1)[0]?.slug, 'older-running-guide')
})

test('non-FSM articles do not acquire FSM case recommendations from overlapping tags', () => {
  for (const source of publicPosts.filter((post) => post.frontmatter.category !== 'fsm')) {
    assert.ok(
      getRelatedArticles(source.slug, publicPosts).every((post) => post.frontmatter.category !== 'fsm'),
      source.slug
    )
  }
})

test('an explicit prose link can intentionally connect a non-FSM article to an FSM discussion', () => {
  const source = article('source', ['免疫'])
  const fsm = article('fsm-discussion', ['免疫'])
  fsm.frontmatter.category = 'fsm'
  assert.deepEqual(getRelatedArticles(source.slug, [source, fsm]), [])
  source.content = '[相關病例討論](/posts/fsm-discussion)'
  assert.deepEqual(getRelatedArticles(source.slug, [source, fsm]).map((post) => post.slug), ['fsm-discussion'])
})

test('PCL rehabilitation does not lead to lumbar spondylolisthesis solely through treatment labels', () => {
  const related = getRelatedArticles('partial-pcl-tear-nonoperative-treatment', publicPosts)
  assert.ok(!related.some((post) => post.slug === 'lumbar-spondylolisthesis-rehabilitation'))
  assert.ok(related.some((post) => post.slug === 'acl-rupture-treatment-decision'))
})

test('existing relative and absolute prose links take priority over recency', () => {
  const posts = [
    article('source', [], '2026-01-01', [
      '[繼續閱讀](/posts/relative-guide#section)',
      '<a href="https://camsavant.com/posts/absolute-guide">延伸閱讀</a>',
      '[外站](https://example.com/posts/foreign-path)',
      '```md\n[範例](/posts/code-example)\n```',
    ].join('\n')),
    article('relative-guide', [], '2020-01-01'),
    article('absolute-guide', [], '2020-01-02'),
    article('foreign-path', [], '2026-10-20'),
    article('code-example', [], '2026-10-20'),
    article('recent-unrelated-sport', [], '2026-10-20'),
  ]
  assert.deepEqual(
    new Set(getRelatedArticles('source', posts, 2).map((post) => post.slug)),
    new Set(['relative-guide', 'absolute-guide'])
  )
})

test('every public article gets three unique public destinations with deterministic ordering', () => {
  const allPosts = getAllPosts()
  const candidates = [
    ...allPosts,
    ...publicPosts,
    { ...publicPosts[0], slug: 'unpublished-example', frontmatter: { ...publicPosts[0].frontmatter, draft: true } },
    { ...publicPosts[0], slug: 'future-category-example', frontmatter: { ...publicPosts[0].frontmatter, category: 'future-category' } },
  ]
  const publicSlugs = new Set(publicPosts.map((post) => post.slug))
  for (const source of publicPosts) {
    const related = getRelatedArticles(source.slug, candidates)
    const slugs = related.map((post) => post.slug)
    assert.equal(slugs.length, 3, source.slug)
    assert.equal(new Set(slugs).size, 3, source.slug)
    assert.ok(slugs.every((slug) => slug !== source.slug && publicSlugs.has(slug)), source.slug)
    assert.deepEqual(
      getRelatedArticles(source.slug, [...candidates].reverse()).map((post) => post.slug),
      slugs,
      source.slug
    )
  }
  for (const source of allPosts.filter((post) => !publicSlugs.has(post.slug))) {
    assert.deepEqual(getRelatedArticles(source.slug, candidates), [])
  }
})

test('editorial and prose links cannot bypass draft or protected destination filters', () => {
  const source = article('marathon-running-injuries-prevention', [], '2026-01-01', '[草稿](/posts/draft-example)')
  const draft = article('draft-example')
  draft.frontmatter.draft = true
  const hydration = article('sports-hydration-guide')
  hydration.frontmatter.draft = true
  const protectedPost = article('running-shin-pain-bone-stress-injury')
  protectedPost.frontmatter.category = 'perioperative-rehab'

  assert.deepEqual(getRelatedArticles(source.slug, [source, draft, hydration, protectedPost]), [])
  assert.deepEqual(getRelatedArticles('missing-source', [source]), [])
  assert.deepEqual(getRelatedArticles(source.slug, [source], 0), [])
})
