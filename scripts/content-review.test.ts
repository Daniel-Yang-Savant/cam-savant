import assert from 'node:assert/strict'
import test from 'node:test'
import { contentReviewSchema, getContentReview } from '../lib/content-review'
import { generateArticleSchema, generateOrganizationSchema, generatePhysicianSchema } from '../lib/schema'
import { AUTHORS, TEAM } from '../lib/authors'
import { generateLlmsText } from '../lib/llms'
import { getPublicPosts, getAllPosts, PROTECTED_CATEGORIES } from '../lib/posts'
import { getAllEnglishPosts } from '../lib/english-posts'

const article = {
  title: 'Review metadata test', excerpt: 'No implied clinical review', date: '2026-08-01',
  lastModified: '2026-08-13', slug: 'test-review', category: 'rehabilitation-medicine', author: '楊育愷醫師',
}

test('publishing or updating an article never implies a medical review', () => {
  const schema = generateArticleSchema(article)
  assert.equal(schema.datePublished, article.date)
  assert.equal(schema.dateModified, article.lastModified)
  assert.equal('lastReviewed' in schema, false)
  assert.equal('reviewedBy' in schema, false)
  assert.equal(getContentReview({}), null)
})

test('only a complete review record produces the shared physician identity and review date', () => {
  const metadata = { reviewedBy: '賴玟衛醫師', lastReviewed: '2026-08-10' }
  const schema = generateArticleSchema({ ...article, ...metadata })
  assert.equal(schema.lastReviewed, metadata.lastReviewed)
  assert.equal(schema.reviewedBy?.['@id'], 'https://camsavant.com/doctors/wen-wei-lai#physician')
  assert.equal(getContentReview(metadata)?.reviewer.name, '賴玟衛')
  assert.equal(schema.dateModified, article.lastModified)
})

test('reject orphaned reviews, unknown reviewers, and impossible calendar dates', () => {
  for (const metadata of [
    { reviewedBy: '楊育愷醫師' },
    { lastReviewed: '2026-09-07' },
    { reviewedBy: 'unknown', lastReviewed: '2026-09-07' },
    { reviewedBy: '楊育愷醫師', lastReviewed: '2026-02-30' },
    { reviewedBy: '楊育愷醫師', lastReviewed: '2026-13-01' },
  ]) assert.equal(contentReviewSchema.safeParse(metadata).success, false)
})

test('English bylines resolve legacy display names to the shared author records', () => {
  for (const post of getAllEnglishPosts()) {
    assert.ok(post.frontmatter.author && Object.hasOwn(AUTHORS, post.frontmatter.author))
  }
})

test('all locales and organization members share canonical physician IDs and official sources', () => {
  for (const author of TEAM) {
    const zh = generatePhysicianSchema(author)
    const en = generatePhysicianSchema(author, 'en')
    assert.equal(en['@id'], zh['@id'])
    assert.equal(en.url, `https://camsavant.com/en/doctors/${author.slug}`)
    assert.equal(zh.jobTitle, author.title)
    assert.deepEqual(zh.sameAs ?? [], author.profileSources?.map((source) => source.url) ?? [])
    assert.deepEqual(generateOrganizationSchema().member.find((member) => member['@id'] === zh['@id']), zh)
  }
  const mainDoctor = generatePhysicianSchema(AUTHORS['楊育愷醫師'])
  assert.equal(Array.isArray(mainDoctor.affiliation) && mainDoctor.affiliation.length, 3)
})

test('generated AI indexes include all public articles, no protected URLs, and current physician titles', () => {
  const full = generateLlmsText(true)
  for (const post of getPublicPosts()) assert.ok(full.includes(`https://camsavant.com/posts/${post.slug})`))
  for (const post of getAllPosts().filter((post) => PROTECTED_CATEGORIES.includes(post.frontmatter.category))) {
    assert.equal(full.includes(`/posts/${post.slug})`), false)
    assert.equal(full.includes(`/perioperative-rehab/${post.slug}`), false)
  }
  for (const author of TEAM) {
    assert.ok(full.includes(`職稱：${author.title}`))
    assert.ok(generateLlmsText().includes(`/doctors/${author.slug}`))
  }
})
