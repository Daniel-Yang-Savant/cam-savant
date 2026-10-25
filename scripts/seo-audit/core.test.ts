import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { auditPage, compareSnapshots, parsePage, type PageSnapshot } from './core'
import { auditPublicArticles } from './articles'
import { readPublicBuildArtifact } from './build-artifacts'

const url = 'https://camsavant.com/test'
const html = `<html><head><title>復健 &amp; 運動醫學</title>
<meta name="description" content="評估 &amp; 就醫資訊">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<link rel="alternate" hreflang="zh-TW" href="${url}">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"MedicalWebPage","name":"復健"}</script>
</head><body><h1>復健<strong>醫學</strong></h1><p>看診 &amp; 資訊</p>
<a href="/doctors?clinic=a&amp;locale=zh">醫師</a></body></html>`
const valid = () => parsePage('/test', html)
const codes = (findings: ReturnType<typeof auditPage>) => findings.map((finding) => finding.code)
const change = (fields: Partial<PageSnapshot>) => compareSnapshots([valid()], [{ ...valid(), ...fields }])

const articleOrigin = 'https://camsavant.com'
const articleUrl = `${articleOrigin}/posts/test-article`
const articlePost = () => ({ slug: 'test-article', frontmatter: {
  title: '運動傷害衛教', date: '2026-08-01', lastModified: '2026-09-10',
  category: 'sports-medicine' as const, excerpt: '測試已發布文章與結構化資料的對應', author: '楊育愷醫師', draft: false,
} })
const articleSchema = () => ({
  '@context': 'https://schema.org', '@type': ['MedicalWebPage', 'Article'],
  '@id': `${articleUrl}#article`, url: articleUrl, headline: articlePost().frontmatter.title,
  datePublished: '2026-08-01', dateModified: '2026-09-10',
})
function articleHtml(schema: Record<string, unknown> = articleSchema()) {
  return `<title>運動傷害衛教 | CAM Savant</title><meta name="description" content="已確認的衛教摘要">
    <link rel="canonical" href="${articleUrl}"><h1>運動傷害衛教</h1>
    <script type="application/ld+json">${JSON.stringify(schema)}</script>`
}
const auditArticleHtml = (html: string) => auditPublicArticles([articlePost()], articleOrigin, new Set([articleUrl]), () => html).findings

test('published article HTML matches canonical, heading, schema and recorded dates', () => {
  assert.deepEqual(auditArticleHtml(articleHtml()), [])
  const post = articlePost()
  delete (post.frontmatter as { lastModified?: string }).lastModified
  const schema = { ...articleSchema(), dateModified: post.frontmatter.date }
  assert.deepEqual(auditPublicArticles([post], articleOrigin, new Set([articleUrl]), () => articleHtml(schema)).findings, [])
})

test('article audit does not read draft or protected routes, even if built HTML remains', () => {
  const reads: string[] = []
  const post = articlePost()
  const result = auditPublicArticles([
    post,
    { ...post, slug: 'draft', frontmatter: { ...post.frontmatter, draft: true } },
    { ...post, slug: 'protected', frontmatter: { ...post.frontmatter, category: 'perioperative-rehab' } },
  ], articleOrigin, new Set([articleUrl]), (route) => { reads.push(route); return articleHtml() })
  assert.deepEqual(reads, ['/posts/test-article'])
  assert.equal(result.pages, 1)
  assert.equal(result.expectedPages, 1)
  assert.deepEqual(result.findings, [])
})

test('article gate detects missing HTML and sitemap entries', () => {
  const result = auditPublicArticles([articlePost()], articleOrigin, new Set(), () => undefined)
  assert.equal(result.pages, 0)
  assert.equal(result.expectedPages, 1)
  assert.deepEqual(result.findings.map((item) => item.code), ['article.sitemap', 'article.missing'])
  assert.ok(result.findings.every((item) => item.severity === 'error'))
})

test('article gate detects rendered canonical, noindex and visible title regressions', () => {
  for (const [html, code] of [
    [articleHtml().replace(`<link rel="canonical" href="${articleUrl}">`, ''), 'canonical.invalid'],
    [articleHtml() + '<meta name="robots" content="noindex">', 'indexability.blocked'],
    [articleHtml().replace('<h1>運動傷害衛教</h1>', '<h1>其他文章</h1>'), 'article.heading'],
    [articleHtml() + '<h1>重複標題</h1>', 'article.heading'],
  ]) {
    assert.ok(auditArticleHtml(html).some((item) => item.code === code && item.severity === 'error'), code)
  }
})

test('unrelated, duplicated or mismatched Article cannot satisfy this article identity', () => {
  for (const schema of [
    { ...articleSchema(), '@id': `${articleOrigin}/posts/other#article` },
    { ...articleSchema(), url: `${articleOrigin}/posts/other` },
    { ...articleSchema(), '@type': 'MedicalWebPage' },
  ]) assert.ok(auditArticleHtml(articleHtml(schema)).some((item) => item.code === 'article.identity'))
  const duplicate = articleHtml() + `<script type="application/ld+json">${JSON.stringify(articleSchema())}</script>`
  assert.ok(auditArticleHtml(duplicate).some((item) => item.code === 'article.identity'))
})

test('article gate rejects stale headlines and build dates replacing editorial dates', () => {
  for (const [property, value, code] of [
    ['headline', '錯誤標題', 'article.headline'],
    ['datePublished', '2026-10-25', 'article.datePublished'],
    ['dateModified', '2026-10-25', 'article.dateModified'],
  ]) {
    const findings = auditArticleHtml(articleHtml({ ...articleSchema(), [property]: value }))
    assert.ok(findings.some((item) => item.code === code && item.severity === 'error'), code)
  }
})

test('parses HTML entities and inline heading text without breaking Chinese words', () => {
  const page = valid()
  assert.equal(page.title, '復健 & 運動醫學')
  assert.equal(page.description, '評估 & 就醫資訊')
  assert.deepEqual(page.h1, ['復健醫學'])
  assert.deepEqual(page.links, ['/doctors?clinic=a&locale=zh'])
  assert.deepEqual(page.alternates, { 'zh-tw': url })
  assert.equal(page.visibleText, '復健醫學 看診 & 資訊 醫師')
  assert.deepEqual(auditPage(page, url), [])
})

test('ignores fake tags in scripts, CSS, comments and inert templates', () => {
  const payload = `<script>self.__next_f.push([1,'<title>fake</title><h1>fake</h1><meta name="robots" content="noindex"><a href="/fake">fake</a>'])</script>
<style>.x:after { content: '<h1>fake</h1>' }</style><!-- <title>fake</title> -->
<template><h1>fake</h1><meta name="robots" content="none"><script type="application/ld+json">{"@type":"Fake"}</script></template>`
  const page = parsePage('/test', html.replace('</head>', `${payload}</head>`))
  assert.equal(page.title, valid().title)
  assert.deepEqual(page.h1, valid().h1)
  assert.deepEqual(page.robots, ['index, follow'])
  assert.deepEqual(page.schemas, valid().schemas)
  assert.doesNotMatch(page.visibleText, /fake|self\.__next_f/u)
  assert.deepEqual(page.links, valid().links)
})

test('detects metadata streamed outside head and accepts case-insensitive tags and rel tokens', () => {
  const page = parsePage('/test', `<body><h1>頁面</h1></body>
<TITLE>頁面標題</TITLE><META NAME="DESCRIPTION" CONTENT="摘要">
<LINK REL="alternate CANONICAL" HREF="${url}"><META NAME="GOOGLEBOT" CONTENT="NoIndex, Follow">`)
  assert.equal(page.title, '頁面標題')
  assert.equal(page.description, '摘要')
  assert.deepEqual(page.canonicals, [url])
  assert.ok(codes(auditPage(page, url)).includes('indexability.blocked'))
})

test('flattens JSON-LD arrays and nested @graph while preserving typed graph wrappers', () => {
  const page = parsePage('/test', `<script type="application/ld+json">[
    {"@context":"https://schema.org","@graph":[{"@type":"Person"},{"@graph":[{"@type":["Article","MedicalWebPage"]}]}]},
    {"@type":"WebPage","@graph":[{"@type":"BreadcrumbList"}]}
  ]</script>`)
  assert.deepEqual(page.schemas.map((schema) => schema['@type']), ['Person', ['Article', 'MedicalWebPage'], 'WebPage', 'BreadcrumbList'])
  assert.deepEqual(page.schemaErrors, [])
})

test('JSON-LD string entities are not decoded as HTML', () => {
  const page = parsePage('/test', '<script type="application/ld+json">{"@type":"WebPage","name":"A &amp; B"}</script>')
  assert.equal(page.schemas[0].name, 'A &amp; B')
})

test('malformed JSON-LD is actionable and never throws out the whole audit', () => {
  for (const value of ['{"@type":', 'null', '42', '"text"', '[false]']) {
    const page = parsePage('/test', `<script type="application/ld+json">${value}</script>`)
    assert.ok(page.schemaErrors.length > 0, value)
    assert.ok(auditPage(page, url).some((finding) => finding.code === 'schema.invalid' && finding.severity === 'error'), value)
  }
})

test('noindex and none are case-insensitive directives, unlike nofollow', () => {
  for (const robots of ['NoIndex, Follow', 'NONE', 'max-snippet:50; noindex', 'index,follow\nnone']) {
    assert.ok(codes(auditPage({ ...valid(), robots: [robots] }, url)).includes('indexability.blocked'), robots)
  }
  for (const robots of ['NOFOLLOW', 'index, follow', 'nonetheless', 'max-image-preview:none']) {
    assert.ok(!codes(auditPage({ ...valid(), robots: [robots] }, url)).includes('indexability.blocked'), robots)
  }
})

test('requires the exact single canonical for explicitly public pages', () => {
  for (const canonicals of [[], [''], [url, url], ['https://other.example/test'], [url + '/']]) {
    const findings = auditPage({ ...valid(), canonicals }, url)
    assert.ok(findings.some((finding) => finding.code === 'canonical.invalid' && finding.severity === 'error'))
  }
})

test('checks missing metadata, blank headings and missing JSON-LD', () => {
  const page = parsePage('/test', '<h1> </h1>')
  const findings = codes(auditPage(page, url))
  for (const code of ['title.missing', 'description.missing', 'h1.invalid', 'schema.missing']) assert.ok(findings.includes(code))
  assert.ok(codes(auditPage({ ...valid(), h1: ['First', 'Second'] }, url)).includes('h1.invalid'))
})

test('excludes hidden and script text from heading and visible text', () => {
  const page = parsePage('/test', '<h1>標題<span hidden>秘密</span><script>bad()</script></h1><p aria-hidden="true">不可見</p><p>可見</p>')
  assert.deepEqual(page.h1, ['標題'])
  assert.equal(page.visibleText, '標題 可見')
})

test('SVG accessibility titles cannot satisfy the HTML page title requirement', () => {
  const page = parsePage('/test', '<h1><svg><title>Icon label</title></svg>主標題</h1>')
  assert.equal(page.title, '')
  assert.deepEqual(page.h1, ['主標題'])
  assert.equal(page.visibleText, '主標題')
  assert.ok(codes(auditPage(page, url)).includes('title.missing'))
})

test('includes confirmed React stream segments and excludes their replaced fallback', () => {
  const page = parsePage('/test', `<main><!--$?--><template id="B:0"></template>
    <h1>載入中</h1><a href="/fallback">稍候</a><!--/$--></main>
    <div hidden id="S:0"><h1>醫師介紹</h1><a href="/clinics">看診資訊</a><span hidden>秘密</span></div>
    <script>$RC("B:0","S:0")</script>`)
  assert.deepEqual(page.h1, ['醫師介紹'])
  assert.deepEqual(page.links, ['/clinics'])
  assert.equal(page.visibleText, '醫師介紹 看診資訊')
})

test('keeps unconfirmed segments hidden and ignores relocation-looking script strings', () => {
  for (const script of ['', 'const fake = \'$RC("B:0","S:0")\';', '// $RC("B:0","S:0")', '$RC("B:1","S:0")']) {
    const page = parsePage('/test', `<main><!--$?--><template id="B:0"></template><h1>載入中</h1><!--/$--></main>
      <div hidden id="S:0"><h1>未確認片段</h1><a href="/hidden">秘密</a></div><script>${script}</script>`)
    assert.deepEqual(page.h1, ['載入中'], script)
    assert.deepEqual(page.links, [], script)
  }
})

test('suppresses nested fallback boundaries while retaining subsequent normal content', () => {
  const page = parsePage('/test', `<!--$?--><template id="B:0"></template>載入中
    <!--$--><p>巢狀替代文字</p><!--/$--><!--/$--><p>正常文字</p>
    <div hidden id="S:0"><h1>主要內容</h1></div><script>$RB=[];$RC=function(){};$RC("B:0","S:0")</script>`)
  assert.deepEqual(page.h1, ['主要內容'])
  assert.equal(page.visibleText, '正常文字 主要內容')
})

test('unchanged snapshots and equivalent metadata order yield no findings', () => {
  assert.deepEqual(compareSnapshots([valid()], [valid()]), [])
  const before = { ...valid(), robots: ['index, FOLLOW'], alternates: { en: '/en', 'zh-tw': '/zh' } }
  const after = { ...valid(), robots: ['follow,index'], alternates: { 'zh-tw': '/zh', en: '/en' } }
  assert.deepEqual(compareSnapshots([before], [after]), [])
  assert.deepEqual(change({ robots: ['nofollow'] }), [])
})

test('canonical removal and either direction of indexability change are errors', () => {
  assert.ok(change({ canonicals: [] }).some((finding) => finding.code === 'canonical.changed' && finding.severity === 'error'))
  assert.ok(change({ robots: ['NONE'] }).some((finding) => finding.code === 'indexability.changed' && finding.severity === 'error'))
  const released = compareSnapshots([{ ...valid(), robots: ['noindex'] }], [valid()])
  assert.ok(released.some((finding) => finding.code === 'indexability.changed' && finding.severity === 'error'))
})

test('schema type removal is reported, including nested and array types', () => {
  const before = { ...valid(), schemas: [{ '@type': ['Article', 'MedicalWebPage'], author: { '@type': 'Person' } }] }
  const after = { ...valid(), schemas: [{ '@type': 'Article' }] }
  const finding = compareSnapshots([before], [after]).find((item) => item.code === 'schema.removed')
  assert.ok(finding)
  assert.equal(finding.severity, 'warning')
  assert.match(finding.evidence, /MedicalWebPage/u)
  assert.match(finding.evidence, /Person/u)
  assert.ok(codes(change({ schemas: [] })).includes('schema.removed'))
})

test('removed and added pages are distinct review events', () => {
  const findings = compareSnapshots([valid()], [{ ...valid(), path: '/new' }])
  assert.deepEqual(findings.map(({ code, severity, path }) => ({ code, severity, path })), [
    { code: 'page.removed', severity: 'error', path: '/test' },
    { code: 'page.added', severity: 'info', path: '/new' },
  ])
})

test('metadata and hreflang changes preserve before-and-after evidence', () => {
  const findings = change({ title: '新版標題', description: '新版摘要', h1: ['新版主標題'], alternates: { en: '/en/test' } })
  assert.deepEqual(codes(findings), ['title.changed', 'description.changed', 'h1.changed', 'hreflang.changed'])
  assert.ok(findings.every((finding) => finding.evidence.includes('→') && finding.action.length > 0))
})

function buildFixture(t: { after: (callback: () => void) => void }) {
  const directory = mkdtempSync(path.join(tmpdir(), 'cam-public-build-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const server = path.join(directory, 'server')
  mkdirSync(server)
  const write = (file: string, contents: string) => {
    const target = path.join(server, file)
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, contents)
    return target
  }
  return { directory, server, write }
}

// Hashes and owners cross-checked against Next 16.4 build metadata.
const articleCache = 'route-cache/APP_PAGE/627c36cf8651552cc7dec19190690d1203b11ebe1eaaebba2e75b450fbea1faf/$/posts/example.html'
const sitemapCache = 'route-cache/APP_ROUTE/eac4bd33ebe1853103da0ef2f81c8c91f16652d378ec724ba99b36d0db74c4eb/$/sitemap.xml.body'

test('adapter-only build outputs resolve without legacy aliases or metadata files', t => {
  const fixture = buildFixture(t)
  fixture.write(articleCache, '<h1>Current adapter article</h1>')
  fixture.write(sitemapCache, '<urlset><url><loc>https://camsavant.com/posts/example</loc></url></urlset>')
  assert.equal(readPublicBuildArtifact(fixture.server, '/posts/example'), '<h1>Current adapter article</h1>')
  assert.match(readPublicBuildArtifact(fixture.server, '/sitemap.xml')!, /<urlset>/)
})

test('scoped content wins over stale legacy output and empty scoped output never falls back', t => {
  const fixture = buildFixture(t)
  fixture.write('app/posts/example.html', 'old article')
  fixture.write(articleCache, 'current article')
  assert.equal(readPublicBuildArtifact(fixture.server, '/posts/example'), 'current article')
  fixture.write(articleCache, '')
  assert.equal(readPublicBuildArtifact(fixture.server, '/posts/example'), '')
})

test('legacy layout works only when scoped output is absent, and missing output stays missing', t => {
  const fixture = buildFixture(t)
  fixture.write('app/posts/example.html', 'legacy article')
  fixture.write('app/sitemap.xml.body', '<urlset />')
  assert.equal(readPublicBuildArtifact(fixture.server, '/posts/example'), 'legacy article')
  assert.equal(readPublicBuildArtifact(fixture.server, '/sitemap.xml'), '<urlset />')
  assert.equal(readPublicBuildArtifact(fixture.server, '/posts/missing'), undefined)
})

test('artifact reader rejects private paths, traversal, encoded delimiters and trailing newlines', t => {
  const fixture = buildFixture(t)
  for (const route of ['/admin/editor', '/perioperative-rehab/example', '/posts/../../.env', '/posts/%2e%2e', '/posts/example/extra', '/posts/example\n', '/posts/example\r\n', '/posts/example\u2028']) {
    assert.throws(() => readPublicBuildArtifact(fixture.server, route), /Only sitemap/)
  }
})

test('artifact reader rejects cache symlinks outside the build instead of reading a legacy substitute', t => {
  const fixture = buildFixture(t)
  fixture.write('app/posts/example.html', 'legacy article')
  const target = path.join(fixture.directory, 'outside.html')
  writeFileSync(target, 'outside sentinel')
  const cache = path.join(fixture.server, articleCache)
  mkdirSync(path.dirname(cache), { recursive: true })
  symlinkSync(target, cache)
  assert.throws(() => readPublicBuildArtifact(fixture.server, '/posts/example'), /outside the build/)
})
