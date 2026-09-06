import assert from 'node:assert/strict'
import test from 'node:test'
import { getRelatedExerciseGuides } from '../lib/exercise-guide-related'
import { EXERCISE_GUIDE_MODULES } from '../lib/exercise-guides'

test('exercise guide titles remain unique when used as metadata', () => {
  const titles = EXERCISE_GUIDE_MODULES.map((guide) => guide.title)
  assert.equal(new Set(titles).size, titles.length)
})

test('related condition guides prioritize body region and matching condition', () => {
  const guide = EXERCISE_GUIDE_MODULES.find(
    (item) => item.id === 'low-back-pilates-rct'
  )
  assert.ok(guide)

  const related = getRelatedExerciseGuides(
    guide,
    EXERCISE_GUIDE_MODULES,
    8
  )

  assert.ok(related.every((item) => item.id !== guide.id))
  assert.ok(related.every((item) => item.bodyRegion === guide.bodyRegion))
  assert.deepEqual(
    related.slice(0, 2).map((item) => item.selectionLabel),
    ['慢性非特異性下背痛', '慢性非特異性下背痛']
  )
})

test('related guide ordering stays stable when relevance is tied', () => {
  const guide = {
    id: 'source',
    kind: 'condition' as const,
    selectionLabel: '來源',
    title: '來源主題',
  }
  const candidates = [
    guide,
    { id: 'first', kind: 'condition' as const, selectionLabel: '甲', title: '甲主題' },
    { id: 'second', kind: 'condition' as const, selectionLabel: '乙', title: '乙主題' },
  ]

  assert.deepEqual(
    getRelatedExerciseGuides(guide, candidates, 2).map((item) => item.id),
    ['first', 'second']
  )
})
