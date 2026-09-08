import assert from 'node:assert/strict'
import test from 'node:test'
import { createPublicArticleSummaries } from '../lib/article-discovery'
import type { Post } from '../lib/posts'

function post(
  slug: string,
  category: Post['frontmatter']['category'],
  tags?: string[],
  draft = false,
): Post {
  return {
    slug,
    frontmatter: {
      title: `測試文章 ${slug}`,
      date: '2026-09-01',
      category,
      excerpt: '提供文章目錄測試使用的公開摘要。',
      author: '測試作者',
      coverImage: `/images/covers/${slug}.jpg`,
      tags,
      draft,
      lastModified: '2026-09-02',
      reviewedBy: '測試審閱者',
      lastReviewed: '2026-09-02',
    },
    content: `BODY_ONLY_SENTINEL ${'文'.repeat(1500)}`,
  }
}

const fixtures: Post[] = [
  post('sport-double', 'sports-medicine', ['strength', 'balance']),
  post('sport-running', 'sports-medicine', ['running']),
  post('rehab-balance', 'rehabilitation-medicine', ['balance']),
  post('weekly-research', 'weekly-picks', ['balance', 'research']),
  post('functional-nutrition', 'functional-medicine', ['nutrition']),
  post('fsm-without-tags', 'fsm'),
  post('protected-article', 'perioperative-rehab', ['balance']),
  post('draft-article', 'sports-medicine', ['balance'], true),
]

const summaries = createPublicArticleSummaries(fixtures)

test('public summaries exclude drafts, protected content, and categories not explicitly public', () => {
  // Simulate a category added by a future content source without adding it to
  // the public discovery allowlist.
  const futureCategory = post('future-private', 'fsm')
  futureCategory.frontmatter.category = 'future-private' as Post['frontmatter']['category']
  const publicArticles = createPublicArticleSummaries([...fixtures, futureCategory])

  assert.deepEqual(publicArticles.map(({ slug }) => slug), [
    'sport-double',
    'sport-running',
    'rehab-balance',
    'weekly-research',
    'functional-nutrition',
    'fsm-without-tags',
  ])
  assert.doesNotMatch(JSON.stringify(publicArticles), /protected-article|draft-article|future-private/)
})

test('the browser receives only card summaries and a precomputed reading time, never article bodies', () => {
  for (const summary of summaries) {
    assert.deepEqual(Object.keys(summary).sort(), ['frontmatter', 'readingTime', 'slug'])
    assert.deepEqual(Object.keys(summary.frontmatter).sort(), [
      'category', 'coverImage', 'date', 'excerpt', 'tags', 'title',
    ])
    assert.equal(summary.readingTime, 3)
  }
  assert.doesNotMatch(JSON.stringify(summaries), /BODY_ONLY_SENTINEL|測試作者|測試審閱者/)
  assert.ok(fixtures.every(({ content }) => content.includes('BODY_ONLY_SENTINEL')))
})
