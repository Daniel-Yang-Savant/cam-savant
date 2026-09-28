import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CURATED_MSK_GUIDES } from '../lib/exercise-guides-curated-msk'
import { CURATED_NEURO_GUIDES } from '../lib/exercise-guides-curated-neuro'
import { CURATED_CARDIO_GUIDES } from '../lib/exercise-guides-curated-cardio'
import { EXERCISE_GUIDE_MODULES, getExerciseGuideSupervision, isExerciseGuideIndexable } from '../lib/exercise-guides'
import { generateExerciseGuideSchema } from '../lib/schema'
import { generateMetadata } from '../app/(zh)/exercise-guides/[id]/page'
import ExerciseGuideModuleCard from '../components/ExerciseGuideModuleCard'
import sitemap from '../app/sitemap'

const additions = [...CURATED_MSK_GUIDES, ...CURATED_NEURO_GUIDES, ...CURATED_CARDIO_GUIDES]

test('100 guides include 28 distinct sourced additions with complete diagrams', () => {
  assert.equal(EXERCISE_GUIDE_MODULES.length, 100)
  assert.equal(additions.length, 28)
  assert.equal(new Set(EXERCISE_GUIDE_MODULES.map((guide) => guide.id)).size, 100)
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
