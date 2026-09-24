import assert from 'node:assert/strict'
import test from 'node:test'
import {
  generateArticleSchema,
  generateExerciseGuideSchema,
} from '../lib/schema'
import {
  EXERCISE_GUIDE_MODULES,
  getExerciseGuideFollowUp,
  getExerciseGuideDates,
  getExerciseGuideCollectionModifiedDate,
  getExerciseGuideSupervision,
  isExerciseGuideIndexable,
  type ExerciseGuideModule,
} from '../lib/exercise-guides'
import { AUTHORS } from '../lib/authors'
import { EXERCISE_GUIDE_REVIEW } from '../lib/exercise-guide-review'
import sitemap from '../app/sitemap'
import { generateMetadata as generateExerciseGuideMetadata } from '../app/(zh)/exercise-guides/[id]/page'
import ExerciseGuidesPage from '../app/(zh)/exercise-guides/page'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ExerciseGuideModuleCard from '../components/ExerciseGuideModuleCard'
import ExerciseGuideDirectory from '../components/ExerciseGuideDirectory'

function pendingEducationGuide(): ExerciseGuideModule {
  return {
    ...EXERCISE_GUIDE_MODULES[0],
    id: 'test-pending-education',
    kind: 'condition',
    evidenceKind: 'education',
    reviewStatus: 'pending',
    publishedDate: '2026-09-24',
    modifiedDate: '2026-09-25',
    title: '待審運動衛教',
    summary: '測試一般運動方向',
    evidence: '一般衛教來源',
    sources: [{ label: '測試來源', href: 'https://example.com/education' }],
    steps: [{ title: '測試動作', instruction: '依個別能力調整幅度', dosage: '先做一回' }],
  }
}

test('pending exercise education keeps its own dates without inheriting a physician review', () => {
  const guide = pendingEducationGuide()
  const schema = generateExerciseGuideSchema(guide)
  const webPage = schema['@graph'][0]
  assert.equal(webPage.datePublished, guide.publishedDate)
  assert.equal(webPage.dateModified, guide.modifiedDate)
  assert.equal('lastReviewed' in webPage, false)
  assert.equal('reviewedBy' in webPage, false)
  assert.equal('author' in webPage, false)
  assert.equal(isExerciseGuideIndexable(guide), false)
  assert.deepEqual(getExerciseGuideDates(EXERCISE_GUIDE_MODULES[0]), {
    publishedDate: EXERCISE_GUIDE_REVIEW.publishedDate,
    modifiedDate: EXERCISE_GUIDE_REVIEW.modifiedDate,
  })
  assert.equal(getExerciseGuideCollectionModifiedDate([EXERCISE_GUIDE_MODULES[0], guide]), guide.modifiedDate)
})

test('pending exercise education is noindex and absent from the sitemap', async () => {
  const guide = pendingEducationGuide()
  EXERCISE_GUIDE_MODULES.push(guide)
  try {
    const metadata = await generateExerciseGuideMetadata({ params: Promise.resolve({ id: guide.id }) })
    assert.deepEqual(metadata.robots, { index: false, follow: true })
    const entries = sitemap()
    assert.equal(entries.some((entry) => entry.url.endsWith(`/exercise-guides/${guide.id}`)), false)
    const existingGuide = EXERCISE_GUIDE_MODULES[0]
    const existingEntry = entries.find((entry) => entry.url.endsWith(`/exercise-guides/${existingGuide.id}`))
    assert.equal((existingEntry?.lastModified as Date).toISOString().slice(0, 10), EXERCISE_GUIDE_REVIEW.modifiedDate)
    const collectionEntry = entries.find((entry) => entry.url === 'https://camsavant.com/exercise-guides')
    assert.equal((collectionEntry?.lastModified as Date).toISOString().slice(0, 10), guide.modifiedDate)
    const collectionHtml = renderToStaticMarkup(createElement(ExerciseGuidesPage))
    const collectionJson = collectionHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1]
    assert.ok(collectionJson)
    const collectionSchema = JSON.parse(collectionJson)
    assert.equal('lastReviewed' in collectionSchema, false)
    assert.equal('reviewedBy' in collectionSchema, false)
    assert.equal(collectionSchema.dateModified, guide.modifiedDate)
    const existingMetadata = await generateExerciseGuideMetadata({ params: Promise.resolve({ id: existingGuide.id }) })
    assert.equal(existingMetadata.robots, undefined)
  } finally {
    EXERCISE_GUIDE_MODULES.pop()
  }
})

test('education cards show pending review and instructions without labeling them as RCTs', () => {
  const guide = pendingEducationGuide()
  const detail = renderToStaticMarkup(createElement(ExerciseGuideModuleCard, { guide, asPage: true }))
  assert.match(detail, /待醫療審閱/)
  assert.match(detail, /動作怎麼做/)
  assert.match(detail, /依個別能力調整幅度/)
  assert.match(detail, /起步量/)
  assert.doesNotMatch(detail, /研究方案摘要|隨機對照試驗|RCT|楊育愷|2026-09-05/)
  const directory = renderToStaticMarkup(createElement(ExerciseGuideDirectory, {
    items: [{ ...guide, supervision: getExerciseGuideSupervision(guide), image: guide.images[0], bodyRegion: '脊椎與軀幹' }],
  }))
  assert.match(directory, /運動衛教/)
  assert.match(directory, /待醫療審閱/)
  assert.match(directory, /查看圖解、起步方式與提醒/)
  assert.doesNotMatch(directory, /研究主題|研究劑量|隨機對照試驗/)
})

test('approved exercise education is indexable without implying a named physician review', async () => {
  const guide: ExerciseGuideModule = {
    ...pendingEducationGuide(),
    id: 'test-approved-education',
    title: '已確認運動衛教',
    reviewStatus: 'approved',
    approvalDate: '2026-09-24',
  }
  const webPage = generateExerciseGuideSchema(guide)['@graph'][0]
  assert.equal(isExerciseGuideIndexable(guide), true)
  assert.equal(webPage.datePublished, guide.publishedDate)
  assert.equal(webPage.dateModified, guide.modifiedDate)
  assert.equal('lastReviewed' in webPage, false)
  assert.equal('reviewedBy' in webPage, false)
  assert.equal('author' in webPage, false)

  const detail = renderToStaticMarkup(createElement(ExerciseGuideModuleCard, { guide, asPage: true }))
  assert.match(detail, /內容確認：網站內容負責人/)
  assert.match(detail, /<time dateTime="2026-09-24">2026-09-24<\/time>/)
  assert.doesNotMatch(detail, /待醫療審閱|楊育愷|2026-09-05/)
  const directory = renderToStaticMarkup(createElement(ExerciseGuideDirectory, {
    items: [{ ...guide, supervision: getExerciseGuideSupervision(guide), image: guide.images[0], bodyRegion: '脊椎與軀幹' }],
  }))
  assert.match(directory, /運動衛教/)
  assert.doesNotMatch(directory, /待醫療審閱/)

  EXERCISE_GUIDE_MODULES.push(guide)
  try {
    const metadata = await generateExerciseGuideMetadata({ params: Promise.resolve({ id: guide.id }) })
    assert.equal(metadata.robots, undefined)
    const entry = sitemap().find((item) => item.url.endsWith(`/exercise-guides/${guide.id}`))
    assert.ok(entry)
    assert.equal((entry.lastModified as Date).toISOString().slice(0, 10), guide.modifiedDate)
    const collectionHtml = renderToStaticMarkup(createElement(ExerciseGuidesPage))
    const collectionJson = collectionHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1]
    assert.ok(collectionJson)
    const collectionSchema = JSON.parse(collectionJson)
    assert.equal('lastReviewed' in collectionSchema, false)
    assert.equal('reviewedBy' in collectionSchema, false)
    assert.match(collectionHtml, /內容確認與醫療審閱資訊請以各運動頁面標示為準/)
  } finally {
    EXERCISE_GUIDE_MODULES.pop()
  }
})

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

test('every exercise guide has a reassessment rule and stable URL', () => {
  assert.equal(
    EXERCISE_GUIDE_MODULES.filter((guide) => guide.kind === 'relaxation').length,
    5
  )
  assert.equal(
    EXERCISE_GUIDE_MODULES.filter((guide) => guide.kind === 'condition' && guide.evidenceKind !== 'education').length,
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
  assert.equal(author.contactPath, '/doctors/yu-kai-yang#clinics')
  assert.equal(author.photoWidth, 1122)
  assert.equal(author.photoHeight, 1402)
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
  assert.ok(webPage.reviewedBy)
  assert.equal(webPage.reviewedBy.name, '楊育愷')
  assert.ok('affiliation' in webPage.reviewedBy)
  assert.ok(Array.isArray(webPage.reviewedBy.affiliation))
  assert.ok(webPage.reviewedBy.affiliation.some((clinic) => clinic.name === '彰化基督教醫院'))
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
