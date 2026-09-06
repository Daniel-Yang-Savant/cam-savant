import assert from 'node:assert/strict'
import test from 'node:test'
import {
  generateArticleSchema,
  generateExerciseGuideSchema,
} from '../lib/schema'
import {
  EXERCISE_GUIDE_MODULES,
  getExerciseGuideFollowUp,
  getExerciseGuideSupervision,
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

    if (guide.kind === 'condition') {
      assert.doesNotMatch(getExerciseGuideFollowUp(guide), /規律執行 2–4 週/)
      assert.notEqual(getExerciseGuideSupervision(guide), 'self-guided')
    }
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

test('exercise guide schema links MedicalWebPage, reviewer, and ExercisePlan parts', () => {
  const guide = EXERCISE_GUIDE_MODULES.find(
    (item) => item.id === 'neck-shoulder-reset'
  )
  assert.ok(guide)

  const schema = generateExerciseGuideSchema(guide)
  const webPage = schema['@graph'][0]
  const exercisePlan = schema['@graph'][1] as {
    '@type': string
    '@id': string
    activityDuration?: string
    activityFrequency: string
    hasPart: { url: string }[]
  }

  assert.equal(webPage['@type'], 'MedicalWebPage')
  assert.equal(webPage.datePublished, '2026-08-31')
  assert.equal(webPage.dateModified, '2026-09-06')
  assert.equal(webPage.lastReviewed, '2026-09-05')
  assert.equal(webPage.reviewedBy.name, '楊育愷')
  assert.equal(webPage.reviewedBy.affiliation.name, '彰化基督教醫院復健醫學部')
  assert.equal(webPage.mainEntity['@id'], exercisePlan['@id'])
  assert.equal(exercisePlan['@type'], 'ExercisePlan')
  assert.equal(exercisePlan.activityDuration, 'PT60S')
  assert.equal(exercisePlan.activityFrequency, guide.dosage)
  assert.equal(exercisePlan.hasPart.length, guide.images.length)
  assert.equal(exercisePlan.hasPart[0].url, 'https://camsavant.com/exercise-guides/neck-shoulder-reset#step-1')
})

test('condition guide schema never infers a programme duration from prose', () => {
  const guide = EXERCISE_GUIDE_MODULES.find(
    (item) => item.id === 'achilles-rupture-early-loading-rct'
  )
  assert.ok(guide)

  const schema = generateExerciseGuideSchema(guide)
  const exercisePlan = schema['@graph'][1] as {
    '@type': string
    activityDuration?: string
  }

  assert.equal(exercisePlan['@type'], 'ExercisePlan')
  assert.equal(exercisePlan.activityDuration, undefined)
})

test('verified exercise-guide corrections remain attached to their sources', () => {
  const byId = (id: string) => {
    const guide = EXERCISE_GUIDE_MODULES.find((item) => item.id === id)
    assert.ok(guide)
    return guide
  }

  const cardioOncology = byId('cardio-oncology-core-rct')
  assert.equal(cardioOncology.selectionLabel, '腫瘤心臟復健')
  assert.match(cardioOncology.sources[0].label, /Viamonte.*JAMA Cardiol\. 2023/)
  assert.doesNotMatch(cardioOncology.sources[0].label, /Circulation/)

  const thumbCombo = byId('thumb-oa-combo-rct')
  assert.match(thumbCombo.dosage, /1% 雙氯芬酸鈉凝膠/)
  assert.match(thumbCombo.sources[0].label, /^Deveza/)

  const trio = byId('tka-trio-targeted-rct')
  assert.match(trio.dosage, /18 次運動/)
  assert.match(trio.sources[0].label, /^Hamilton/)

  const lungCancer = byId('lung-cancer-exercise-rct')
  assert.match(lungCancer.suitableFor, /完成所有根治性治療後 1 年至未滿 10 年/)
  assert.doesNotMatch(lungCancer.suitableFor, /正在穩定治療/)

  const postpartum = byId('postpartum-dra-rct')
  assert.match(postpartum.suitableFor, /72 小時內/)

  const plantar = byId('plantar-fascia-high-load-rct')
  assert.match(plantar.eyebrow, /^2015 /)

  const neckSupport = byId('neck-shoulder-reset')
  assert.match(neckSupport.images[0].alt, /雙手輕放於穩定桌面/)

  const deepNeck = byId('deep-cervical-flexor-rct')
  assert.match(deepNeck.sources[0].label, /^Suvarnnato/)
})
