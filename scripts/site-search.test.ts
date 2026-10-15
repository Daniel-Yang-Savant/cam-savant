import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSearchIndex, createSearchIndex } from '../lib/search'
import { createSiteSearch, searchSiteIndex } from '../lib/site-search'
import { EXERCISE_GUIDE_MODULES } from '../lib/exercise-guides'
import { TEAM } from '../lib/authors'
import { CLINIC_LOCATIONS } from '../lib/locations'
import type { Post } from '../lib/posts'

const index = buildSearchIndex()
const search = createSiteSearch(index)

test('patient queries reach exercises, clinics, doctors, booking information and articles at their own URLs', () => {
  const cases = [
    ['頸部放鬆', '/exercise-guides/neck-shoulder-reset', 'exercise'],
    ['員林', '/locations/yuanlin', 'location'],
    ['南投門診', '/locations/nantou', 'location'],
    ['彰化掛號', '/locations/changhua', 'location'],
    ['楊育愷', '/doctors/yu-kai-yang', 'doctor'],
    ['楊育愷 南投', '/doctors/yu-kai-yang', 'doctor'],
    ['掛號', '/locations', 'directory'],
    ['足底筋膜炎', '/posts/plantar-fasciitis-treatment', 'article'],
  ] as const
  for (const [query, href, type] of cases) {
    const result = searchSiteIndex(search, query).find((item) => item.href === href)
    assert.ok(result, `${query} should find ${href}`)
    assert.equal(result.type, type)
    assert.ok(result.typeLabel)
  }
})

test('blank or unrelated queries produce no results and multiple words must all match', () => {
  assert.deepEqual(searchSiteIndex(search, '   '), [])
  assert.deepEqual(searchSiteIndex(search, 'zqxzqxzqx'), [])
  assert.deepEqual(searchSiteIndex(search, '楊育愷 zqxzqxzqx'), [])
  assert.ok(searchSiteIndex(search, '運動').length <= 8)
})

function post(slug: string, category: Post['frontmatter']['category'], draft = false): Post {
  return {
    slug,
    frontmatter: { title: slug, excerpt: '用來測試公開搜尋索引的文章摘要。', category, draft, date: '2026-10-15', author: 'AUTHOR_ONLY_SENTINEL' },
    content: 'BODY_ONLY_SENTINEL',
  }
}

test('search excludes draft, protected and unknown-category articles even if supplied by a future source', () => {
  const items = createSearchIndex({
    posts: [
      post('public-article', 'sports-medicine'),
      post('draft-sentinel', 'sports-medicine', true),
      post('protected-sentinel', 'perioperative-rehab'),
      post('unknown-sentinel', 'future-private' as Post['frontmatter']['category']),
    ],
    guides: [], doctors: [], clinics: [],
  })
  assert.deepEqual(items.filter((item) => item.type === 'article').map((item) => item.slug), ['public-article'])
  assert.doesNotMatch(JSON.stringify(items), /draft-sentinel|protected-sentinel|unknown-sentinel|BODY_ONLY_SENTINEL|AUTHOR_ONLY_SENTINEL/)
})

test('public noindex exercise guides remain discoverable and pending review is visible', () => {
  const publicExerciseItems = index.filter((item) => item.type === 'exercise')
  assert.equal(publicExerciseItems.length, EXERCISE_GUIDE_MODULES.length)
  for (const guide of EXERCISE_GUIDE_MODULES.filter((item) => item.reviewStatus === 'pending')) {
    assert.match(publicExerciseItems.find((item) => item.slug === guide.id)!.typeLabel, /待醫療審閱/)
  }
})

test('public index contains only compact metadata and unique local destinations', () => {
  assert.equal(new Set(index.map((item) => item.id)).size, index.length)
  assert.equal(new Set(index.map((item) => item.href)).size, index.length)
  assert.equal(index.filter((item) => item.type === 'doctor').length, TEAM.length)
  assert.equal(index.filter((item) => item.type === 'location').length, CLINIC_LOCATIONS.length)
  for (const item of index) {
    assert.match(item.href, /^\/(posts|exercise-guides|doctors|locations)(\/[^/?#]+)?$|^\/about$/)
    assert.ok(!('content' in item) && !('sources' in item) && !('dosage' in item) && !('credentials' in item))
  }
})

test('same slug across articles and exercises cannot collide in search or article bookmarks', () => {
  const guide = EXERCISE_GUIDE_MODULES[0]
  const items = createSearchIndex({ posts: [post(guide.id, 'sports-medicine')], guides: [guide], doctors: [], clinics: [] })
  const matching = items.filter((item) => item.slug === guide.id)
  assert.equal(matching.length, 2)
  assert.equal(new Set(matching.map((item) => item.id)).size, 2)
  assert.deepEqual(matching.filter((item) => item.type === 'article').map((item) => item.href), [`/posts/${guide.id}`])
})
