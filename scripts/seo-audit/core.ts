import { Parser } from 'htmlparser2'

export type PageSnapshot = {
  path: string
  title: string
  description: string
  canonicals: string[]
  robots: string[]
  h1: string[]
  alternates: Record<string, string>
  schemas: Record<string, unknown>[]
  schemaErrors: string[]
  links: string[]
  visibleText: string
}

export type Finding = {
  severity: 'error' | 'warning' | 'info'
  code: string
  path: string
  evidence: string
  action: string
}

const normalize = (text: string) => text.replace(/\s+/gu, ' ').trim()
const blockTags = new Set(['address', 'article', 'aside', 'br', 'div', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'li', 'main', 'nav', 'p', 'section', 'td', 'th'])
type Frame = { tag: string; excluded: boolean; inert: boolean; text: string; jsonLd: boolean }

// Recognize React's emitted relocation markers without evaluating JavaScript.
function streamedSegments(html: string) {
  const templates = new Set<string>(), segments = new Set<string>()
  const pairs: string[][] = []
  const inert: boolean[] = []
  let script: string | undefined
  new Parser({
    onopentag(tag, attrs) {
      const skip = Boolean(inert.at(-1) || ['template', 'noscript', 'svg', 'math'].includes(tag))
      if (!inert.at(-1) && tag === 'template' && attrs.id) templates.add(attrs.id)
      inert.push(skip)
      if (!skip && tag === 'div' && 'hidden' in attrs && attrs.id) segments.add(attrs.id)
      if (!skip && tag === 'script' && !attrs.src && (!attrs.type || attrs.type === 'text/javascript')) script = ''
    },
    ontext(text) { if (script !== undefined) script += text },
    onclosetag(tag) {
      if (tag === 'script' && script !== undefined) {
        const source = script.trim()
        const call = source.match(/(?:^|;)\s*\$RC\("(B:[0-9a-f]+)",\s*"(S:[0-9a-f]+)"\)\s*;?$/u)
        if (call && (source.startsWith('$RC(') || (source.startsWith('$RB=[];') && source.includes('$RC=function')))) pairs.push([call[1], call[2]])
        script = undefined
      }
      inert.pop()
    },
  }).end(html)
  const found = pairs.filter(([boundary, segment]) => templates.has(boundary) && segments.has(segment))
  return { boundaries: new Set(found.map(([boundary]) => boundary)), segments: new Set(found.map(([, segment]) => segment)) }
}

/** Parse tags, never strings embedded in Next.js hydration scripts. No scripts execute. */
export function parsePage(path: string, html: string): PageSnapshot {
  const page: PageSnapshot = {
    path, title: '', description: '', canonicals: [], robots: [], h1: [],
    alternates: {}, schemas: [], schemaErrors: [], links: [], visibleText: '',
  }
  const frames: Frame[] = []
  const visible: string[] = []
  const streamed = streamedSegments(html)
  const suspense: boolean[] = []
  const collectSchema = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(collectSchema)
    } else if (value && typeof value === 'object') {
      const node = value as Record<string, unknown>
      if ('@graph' in node) {
        if (node['@type']) page.schemas.push(node)
        collectSchema(node['@graph'])
      } else {
        page.schemas.push(node)
      }
    } else {
      page.schemaErrors.push('JSON-LD 必須是物件或物件陣列。')
    }
  }
  const parser = new Parser({
    onopentag(tag, attrs) {
      if (tag === 'template' && streamed.boundaries.has(attrs.id) && suspense.length) suspense[suspense.length - 1] = true
      const parent = frames.at(-1)
      const inert = Boolean(parent?.inert || suspense.some(Boolean) || ['template', 'noscript', 'svg', 'math'].includes(tag))
      const relocated = tag === 'div' && streamed.segments.has(attrs.id)
      const excluded = Boolean(parent?.excluded || inert || ['head', 'script', 'style', 'title'].includes(tag) || ('hidden' in attrs && !relocated) || attrs['aria-hidden'] === 'true')
      frames.push({ tag, excluded, inert, text: '', jsonLd: tag === 'script' && !inert && attrs.type?.toLowerCase().trim() === 'application/ld+json' })
      if (!excluded && blockTags.has(tag)) visible.push(' ')
      if (inert) return
      if (tag === 'meta') {
        const name = attrs.name?.toLowerCase()
        if (name === 'description' && !page.description) page.description = normalize(attrs.content ?? '')
        if (name && ['robots', 'googlebot', 'bingbot'].includes(name)) page.robots.push(attrs.content ?? '')
      }
      if (tag === 'link') {
        const rel = (attrs.rel ?? '').toLowerCase().split(/\s+/u)
        if (rel.includes('canonical')) page.canonicals.push(attrs.href?.trim() ?? '')
        if (rel.includes('alternate') && attrs.hreflang && attrs.href) {
          Object.defineProperty(page.alternates, attrs.hreflang.toLowerCase(), { value: attrs.href.trim(), enumerable: true, configurable: true, writable: true })
        }
      }
      if (tag === 'a' && attrs.href && !excluded) page.links.push(attrs.href.trim())
    },
    ontext(text) {
      if (suspense.some(Boolean)) return
      const current = frames.at(-1)
      if (current?.tag === 'script') {
        current.text += text
        return
      }
      if (current?.tag === 'style') return
      for (const frame of frames) {
        if (frame.tag === 'title' || (frame.tag === 'h1' && !current?.excluded)) frame.text += text
      }
      if (!current?.excluded) visible.push(text)
    },
    oncomment(text) {
      if (['$', '$?', '$!'].includes(text)) suspense.push(false)
      if (text === '/$') suspense.pop()
    },
    onclosetag() {
      const frame = frames.pop()
      if (!frame) return
      if (frame.tag === 'title' && !frame.inert && !page.title) page.title = normalize(frame.text)
      if (frame.tag === 'h1' && !frame.excluded) page.h1.push(normalize(frame.text))
      if (frame.jsonLd) {
        try {
          collectSchema(JSON.parse(frame.text))
        } catch {
          page.schemaErrors.push('JSON-LD 無法解析為有效 JSON。')
        }
      }
      if (!frame.excluded && blockTags.has(frame.tag)) visible.push(' ')
    },
  }, { decodeEntities: true })
  parser.end(html)
  page.visibleText = normalize(visible.join(''))
  page.links = [...new Set(page.links)]
  return page
}

const isNoindex = (page: PageSnapshot) => page.robots.some((value) => /(?:^|[\s,;])(?:noindex|none)(?=$|[\s,;])/iu.test(value))
const excerpt = (value: unknown) => JSON.stringify(value).slice(0, 240)
const sorted = (values: string[]) => JSON.stringify([...values].sort())

/** Only call for a page explicitly expected to be public and indexable. */
export function auditPage(page: PageSnapshot, expectedUrl: string): Finding[] {
  const findings: Finding[] = []
  const add = (severity: Finding['severity'], code: string, evidence: string, action: string) => findings.push({ severity, code, path: page.path, evidence, action })
  if (!page.title) add('error', 'title.missing', '未找到非空白 title。', '提供與可見內容一致的頁面標題。')
  if (!page.description) add('warning', 'description.missing', '未找到非空白 meta description。', '以既有內容撰寫簡潔摘要，避免新增未驗證宣稱。')
  if (page.h1.length !== 1 || !page.h1[0]) add('warning', 'h1.invalid', `可見 H1：${excerpt(page.h1)}`, '確認頁面有一個清楚、非空白的主要標題。')
  if (page.canonicals.length !== 1 || page.canonicals[0] !== expectedUrl) {
    add('error', 'canonical.invalid', `預期 ${expectedUrl}；實際 ${excerpt(page.canonicals)}`, '確認只輸出一個指向正確公開 URL 的 canonical。')
  }
  if (isNoindex(page)) add('error', 'indexability.blocked', `公開頁面輸出 robots：${excerpt(page.robots)}`, '先確認頁面是否應公開；應公開時移除誤設的 noindex／none，否則移出公開清單。')
  for (const error of page.schemaErrors) add('error', 'schema.invalid', error, '修正 JSON-LD 語法後重新建置；此檢查不代表通過 Google 複合搜尋結果驗證。')
  if (!page.schemas.length) add('warning', 'schema.missing', '未找到可解析的 JSON-LD 物件。', '確認此頁是否需要與可見內容一致的結構化資料。')
  return findings
}

function schemaTypes(schemas: Record<string, unknown>[]): Set<string> {
  const types = new Set<string>()
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(visit)
    if (!value || typeof value !== 'object') return
    const object = value as Record<string, unknown>
    const type = object['@type']
    for (const item of Array.isArray(type) ? type : [type]) if (typeof item === 'string') types.add(item)
    Object.values(object).forEach(visit)
  }
  visit(schemas)
  return types
}

/** Changes are review prompts; warnings are not ranking predictions. */
export function compareSnapshots(before: PageSnapshot[], after: PageSnapshot[]): Finding[] {
  const findings: Finding[] = []
  const previous = new Map(before.map((page) => [page.path, page]))
  const current = new Map(after.map((page) => [page.path, page]))
  for (const old of before) {
    const page = current.get(old.path)
    const add = (severity: Finding['severity'], code: string, evidence: string, action: string) => findings.push({ severity, code, path: old.path, evidence, action })
    if (!page) {
      add('error', 'page.removed', '基準清單中的公開頁面已消失。', '確認是否意外移除；若為改址，另行驗證正式環境的重新導向及 sitemap。')
      continue
    }
    if (sorted(old.canonicals) !== sorted(page.canonicals)) add('error', 'canonical.changed', `${excerpt(old.canonicals)} → ${excerpt(page.canonicals)}`, '確認 canonical 變更符合預期，並檢查內部連結與 sitemap。')
    if (isNoindex(old) !== isNoindex(page)) add('error', 'indexability.changed', `noindex：${isNoindex(old)} → ${isNoindex(page)}`, '確認公開狀態變更已獲核准；私人或待審內容不可因修正 SEO 而公開。')
    const nextTypes = schemaTypes(page.schemas)
    const removedTypes = [...schemaTypes(old.schemas)].filter((type) => !nextTypes.has(type))
    if (removedTypes.length) add('warning', 'schema.removed', `移除類型：${removedTypes.sort().join('、')}`, '確認結構化資料的移除符合可見內容與頁面用途。')
    if (old.title !== page.title) add('warning', 'title.changed', `${excerpt(old.title)} → ${excerpt(page.title)}`, '確認標題仍準確表達頁面內容與搜尋意圖。')
    if (old.description !== page.description) add('info', 'description.changed', `${excerpt(old.description)} → ${excerpt(page.description)}`, '確認摘要沒有誇大療效或新增未驗證宣稱。')
    if (JSON.stringify(old.h1) !== JSON.stringify(page.h1)) add('warning', 'h1.changed', `${excerpt(old.h1)} → ${excerpt(page.h1)}`, '確認主要標題變更符合可見內容。')
    const alternates = (value: Record<string, string>) => JSON.stringify(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
    if (alternates(old.alternates) !== alternates(page.alternates)) add('warning', 'hreflang.changed', `${excerpt(old.alternates)} → ${excerpt(page.alternates)}`, '確認語言對應、雙向 hreflang 與各頁 canonical 一致。')
  }
  for (const page of after) {
    if (!previous.has(page.path)) findings.push({ severity: 'info', code: 'page.added', path: page.path, evidence: '本次新增公開頁面。', action: '確認內容已完成審閱，並檢查 canonical、索引與 sitemap。' })
  }
  return findings
}
