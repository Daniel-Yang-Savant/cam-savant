import assert from 'node:assert/strict'
import test from 'node:test'
import {
  generateArticleSchema,
  generateExerciseGuideSchema,
} from '../lib/schema'
import {
  EXERCISE_GUIDE_MODULES,
  getExerciseGuideFollowUp,
} from '../lib/exercise-guides'
import { AUTHORS } from '../lib/authors'

test('article schema keeps medical semantics and Google Article fields', () => {
  const schema = generateArticleSchema({
    title: '測試文章',
    excerpt: '測試摘要',
    date: '2026-08-01',
    lastModified: '2026-08-13',
    slug: 'test-article',
    category: 'rehabilitation-medicine',
    author: '楊育愷醫師',
    coverImage: '/images/covers/test-article.jpg',
  })

  assert.deepEqual(schema['@type'], ['MedicalWebPage', 'Article'])
  assert.equal(schema.headline, '測試文章')
  assert.equal(schema.datePublished, '2026-08-01')
  assert.equal(schema.dateModified, '2026-08-13')
  assert.equal(schema.mainEntityOfPage['@id'], 'https://camsavant.com/posts/test-article')
  assert.equal(schema.author.url, 'https://camsavant.com/doctors/yu-kai-yang')
  assert.equal(schema.publisher['@id'], 'https://camsavant.com/#organization')
})

test('every exercise guide has a reassessment rule and indexable URL', () => {
  assert.equal(
    EXERCISE_GUIDE_MODULES.filter((guide) => guide.kind === 'relaxation').length,
    5
  )
  assert.equal(
    EXERCISE_GUIDE_MODULES.filter((guide) => guide.kind === 'condition').length,
    66
  )

  for (const guide of EXERCISE_GUIDE_MODULES) {
    assert.ok(getExerciseGuideFollowUp(guide).length > 0)
    assert.ok(guide.id.length > 0)
  }

  const handGuide = EXERCISE_GUIDE_MODULES.find((guide) => guide.id === 'hand-forearm-reset')
  assert.ok(handGuide)
  assert.equal(handGuide.followUpLabel, '何時需要重新分類評估')
  assert.match(getExerciseGuideFollowUp(handGuide), /重新確認是否屬於/)
  assert.doesNotMatch(getExerciseGuideFollowUp(handGuide), /2–4 週/)

  const lowerLimbGuide = EXERCISE_GUIDE_MODULES.find((guide) => guide.id === 'lower-limb-reset')
  assert.ok(lowerLimbGuide)
  assert.equal(lowerLimbGuide.followUpLabel, '什麼情況要停止並評估')
  assert.match(getExerciseGuideFollowUp(lowerLimbGuide), /不需設定「連續做幾週」/)
  assert.doesNotMatch(getExerciseGuideFollowUp(lowerLimbGuide), /2–4 週/)

  const relaxationGuide = EXERCISE_GUIDE_MODULES.find((guide) => guide.id === 'three-minute-downshift')
  assert.ok(relaxationGuide)
  assert.match(relaxationGuide.evidence, /30 名長期焦慮成人/)
  assert.doesNotMatch(JSON.stringify(relaxationGuide), /17\s*%|17％/)
})

test('doctor clinic CTA uses the canonical locations path and photo dimensions', () => {
  const author = AUTHORS['楊育愷醫師']
  assert.equal(author.contactPath, '/locations')
  assert.equal(author.photoWidth, 800)
  assert.equal(author.photoHeight, 1032)
})

test('exercise guide schema links MedicalWebPage, reviewer, and HowTo steps', () => {
  const guide = EXERCISE_GUIDE_MODULES.find(
    (item) => item.id === 'neck-shoulder-reset'
  )
  assert.ok(guide)

  const schema = generateExerciseGuideSchema(guide)
  const webPage = schema['@graph'][0]
  const howTo = schema['@graph'][1] as {
    '@type': string
    '@id': string
    totalTime?: string
    step: { url: string }[]
  }

  assert.equal(webPage['@type'], 'MedicalWebPage')
  assert.equal(webPage.lastReviewed, '2026-09-05')
  assert.equal(webPage.reviewedBy.name, '楊育愷')
  assert.equal(webPage.reviewedBy.affiliation.name, '彰化基督教醫院復健醫學部')
  assert.equal(webPage.mainEntity['@id'], howTo['@id'])
  assert.equal(howTo['@type'], 'HowTo')
  assert.equal(howTo.totalTime, 'PT60S')
  assert.equal(howTo.step.length, guide.images.length)
  assert.equal(howTo.step[0].url, 'https://camsavant.com/exercise-guides/neck-shoulder-reset#step-1')
})
