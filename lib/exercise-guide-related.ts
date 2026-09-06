import type {
  ExerciseGuideBodyRegion,
  ExerciseGuideKind,
} from './exercise-guides'

export interface RelatedExerciseGuideCandidate {
  id: string
  kind: ExerciseGuideKind
  selectionLabel: string
  bodyRegion?: ExerciseGuideBodyRegion
  searchAliases?: string[]
  title: string
}

const GENERIC_TERMS = new Set([
  'rct',
  '運動',
  '訓練',
  '復健',
  '方案',
  '研究',
  '居家運動',
  '隨機對照試驗',
])

function normalizeTerm(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('zh-TW')
}

function splitTitleTerms(value: string): string[] {
  return value
    .split(/[\s:：,，、/／｜|＋+()（）·・—–-]+/u)
    .map(normalizeTerm)
    .filter((term) => term.length >= 2 && !GENERIC_TERMS.has(term))
}

function guideTerms(guide: RelatedExerciseGuideCandidate): Set<string> {
  const aliases = guide.searchAliases ?? []
  const terms = [
    normalizeTerm(guide.selectionLabel),
    ...aliases.flatMap((alias) => [normalizeTerm(alias), ...splitTitleTerms(alias)]),
    ...splitTitleTerms(guide.title),
  ]

  return new Set(terms.filter((term) => term && !GENERIC_TERMS.has(term)))
}

function sharedTermScore(
  sourceTerms: Set<string>,
  candidate: RelatedExerciseGuideCandidate
): number {
  return [...guideTerms(candidate)].reduce(
    (score, term) => score + (sourceTerms.has(term) ? Math.max(term.length, 1) : 0),
    0
  )
}

export function getRelatedExerciseGuides<
  T extends RelatedExerciseGuideCandidate,
>(guide: T, guides: readonly T[], limit: number): T[] {
  const sourceTerms = guideTerms(guide)
  const normalizedLabel = normalizeTerm(guide.selectionLabel)

  return guides
    .map((candidate, index) => ({
      candidate,
      index,
      sameRegion: Boolean(
        guide.bodyRegion && candidate.bodyRegion === guide.bodyRegion
      ),
      sameLabel: normalizeTerm(candidate.selectionLabel) === normalizedLabel,
      sharedTerms: sharedTermScore(sourceTerms, candidate),
    }))
    .filter(({ candidate }) => candidate.kind === guide.kind && candidate.id !== guide.id)
    .sort(
      (a, b) =>
        Number(b.sameRegion) - Number(a.sameRegion) ||
        Number(b.sameLabel) - Number(a.sameLabel) ||
        b.sharedTerms - a.sharedTerms ||
        a.index - b.index
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}
