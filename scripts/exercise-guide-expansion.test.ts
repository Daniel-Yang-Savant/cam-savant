import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CURATED_MSK_GUIDES } from '../lib/exercise-guides-curated-msk'
import { CURATED_NEURO_GUIDES } from '../lib/exercise-guides-curated-neuro'
import { CURATED_CARDIO_GUIDES } from '../lib/exercise-guides-curated-cardio'
import { EXERCISE_GUIDE_MODULES, getExerciseGuideDates, getExerciseGuideSupervision, isExerciseGuideIndexable } from '../lib/exercise-guides'
import { generateExerciseGuideSchema } from '../lib/schema'
import { generateMetadata } from '../app/(zh)/exercise-guides/[id]/page'
import ExerciseGuideModuleCard from '../components/ExerciseGuideModuleCard'
import sitemap from '../app/sitemap'

const additions = [...CURATED_MSK_GUIDES, ...CURATED_NEURO_GUIDES, ...CURATED_CARDIO_GUIDES]
const relaxationIds = [
  'neck-shoulder-reset',
  'shoulder-thoracic-reset',
  'hand-forearm-reset',
  'low-back-mobility',
  'hip-glute-reset',
  'thigh-reset',
  'lower-limb-reset',
  'three-minute-downshift',
]
const legacyRelaxationIds = new Set([
  'neck-shoulder-reset',
  'hand-forearm-reset',
  'lower-limb-reset',
  'three-minute-downshift',
])

test('104 guides retain 28 distinct sourced additions with complete diagrams', () => {
  assert.equal(EXERCISE_GUIDE_MODULES.length, 104)
  assert.equal(additions.length, 28)
  assert.equal(new Set(EXERCISE_GUIDE_MODULES.map((guide) => guide.id)).size, EXERCISE_GUIDE_MODULES.length)
  assert.equal(new Set(additions.map((guide) => guide.sources[0].href)).size, 28)
  for (const guide of additions) {
    assert.equal(EXERCISE_GUIDE_MODULES.filter((item) => item.id === guide.id).length, 1)
    assert.equal(guide.steps?.length, 4, guide.id)
    assert.ok(guide.bodyRegion && guide.searchAliases?.length, guide.id)
    assert.notEqual(getExerciseGuideSupervision(guide), 'self-guided', guide.id)
    assert.match(guide.sources[0].label, /doi:/i, guide.id)
    assert.match(guide.sources[0].href, /^https:\/\/(pubmed\.ncbi\.nlm\.nih\.gov|pmc\.ncbi\.nlm\.nih\.gov|doi\.org|www\.bmj\.com|jamanetwork\.com|www\.nejm\.org)/, guide.id)
    const asset = join(process.cwd(), 'public', guide.images[0].src)
    assert.ok(existsSync(asset), guide.id)
    const svg = readFileSync(asset, 'utf8')
    assert.match(svg, /viewBox="0 0 1200 900"/, guide.id)
    assert.match(svg, /原創研究方案示意/, guide.id)
    assert.doesNotMatch(svg, /<script|<foreignObject|(?:href|src)="https?:/i, guide.id)
  }
})

test('all 28 approved additions are indexable and listed in sitemap without inheriting a physician review', async () => {
  const entries = sitemap()
  for (const guide of additions) {
    assert.equal(guide.reviewStatus, 'approved', guide.id)
    assert.equal(guide.approvalDate, '2026-09-28', guide.id)
    assert.equal(isExerciseGuideIndexable(guide), true, guide.id)
    const metadata = await generateMetadata({ params: Promise.resolve({ id: guide.id }) })
    assert.equal(metadata.robots, undefined, guide.id)
    assert.equal(metadata.alternates?.canonical, `/exercise-guides/${guide.id}`)
    assert.equal(entries.some((entry) => entry.url.endsWith(`/exercise-guides/${guide.id}`)), true, guide.id)
    const page = generateExerciseGuideSchema(guide)['@graph'][0]
    assert.equal('reviewedBy' in page, false, guide.id)
    assert.equal('lastReviewed' in page, false, guide.id)
    assert.equal(page.dateModified, '2026-09-28', guide.id)
  }
})

test('approved content identifies the website content owner and retains research arrangement labels', () => {
  for (const guide of additions) {
    const html = renderToStaticMarkup(createElement(ExerciseGuideModuleCard, { guide, asPage: true }))
    assert.match(html, /內容確認：網站內容負責人/, guide.id)
    assert.match(html, /<time dateTime="2026-09-28">2026-09-28<\/time>/, guide.id)
    assert.doesNotMatch(html, /待醫療審閱/, guide.id)
    assert.match(html, /研究方案如何進行/, guide.id)
    assert.match(html, /研究安排／調整/, guide.id)
    assert.doesNotMatch(html, /<strong>起步量：<\/strong>/, guide.id)
    assert.doesNotMatch(html, /醫療審閱：<a/, guide.id)
  }
})

test('relaxation redesign supplies seven body areas, a separate breathing option and complete teaching assets', () => {
  const guides = EXERCISE_GUIDE_MODULES.filter((guide) => guide.kind === 'relaxation')
  assert.deepEqual(new Set(guides.map((guide) => guide.id)), new Set(relaxationIds))
  assert.equal(guides.filter((guide) => guide.relaxationArea === 'region').length, 7)
  assert.deepEqual(
    guides.filter((guide) => guide.relaxationArea === 'whole-body').map((guide) => guide.id),
    ['three-minute-downshift']
  )
  assert.equal(EXERCISE_GUIDE_MODULES.filter((guide) => guide.kind === 'condition').length, 96)

  for (const guide of guides) {
    assert.ok(guide.cover?.src && guide.cover.alt, guide.id)
    assert.ok(existsSync(join(process.cwd(), 'public', guide.cover.src)), `${guide.id} cover`)
    assert.notEqual(guide.cover.src, guide.images[0].src, `${guide.id} needs a separate cover`)
    assert.ok(guide.images.length > 0, guide.id)
    assert.equal(guide.steps?.length, guide.images.length, `${guide.id} image/instruction alignment`)
    guide.images.forEach((image, index) => {
      assert.ok(existsSync(join(process.cwd(), 'public', image.src)), `${guide.id} step ${index + 1}`)
      assert.ok(image.alt && image.caption, `${guide.id} accessible image description`)
      assert.ok(guide.steps?.[index].instruction && guide.steps[index].dosage, `${guide.id} readable instructions`)
    })
  }
})

test('remade relaxation drafts preserve URLs and publication history without inheriting clinical approval', async () => {
  const entries = sitemap()
  for (const guide of EXERCISE_GUIDE_MODULES.filter((item) => item.kind === 'relaxation')) {
    assert.equal(guide.reviewStatus, 'pending', guide.id)
    assert.equal(guide.approvalDate, undefined, guide.id)
    assert.equal(getExerciseGuideDates(guide).modifiedDate, '2026-10-11', guide.id)
    assert.equal(
      getExerciseGuideDates(guide).publishedDate,
      legacyRelaxationIds.has(guide.id) ? '2026-08-31' : '2026-10-11',
      guide.id
    )
    assert.equal(isExerciseGuideIndexable(guide), false, guide.id)
    assert.equal(entries.some((entry) => entry.url.endsWith(`/exercise-guides/${guide.id}`)), false, guide.id)
    const metadata = await generateMetadata({ params: Promise.resolve({ id: guide.id }) })
    assert.deepEqual(metadata.robots, { index: false, follow: true }, guide.id)
    assert.equal(metadata.alternates?.canonical, `/exercise-guides/${guide.id}`, guide.id)
    const page = generateExerciseGuideSchema(guide)['@graph'][0]
    assert.equal('reviewedBy' in page, false, guide.id)
    assert.equal('lastReviewed' in page, false, guide.id)
    assert.equal('author' in page, false, guide.id)
    const html = renderToStaticMarkup(createElement(ExerciseGuideModuleCard, { guide, asPage: true }))
    assert.match(html, /待醫療審閱/, guide.id)
    assert.doesNotMatch(html, /醫療審閱：<a|內容確認：網站內容負責人/, guide.id)
    for (let index = 0; index < guide.images.length; index += 1) {
      assert.ok(html.includes(`id="step-${index + 1}"`), `${guide.id} linked step ${index + 1}`)
    }
  }
})
