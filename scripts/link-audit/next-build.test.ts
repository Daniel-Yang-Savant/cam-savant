import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { BASE_URL } from '../../lib/locales'
import { createBuildTransport } from './next-build'
import { auditRenderedPages } from './pages'

const postOwner = '/(zh)/posts/[slug]/page'
const rehabOwner = '/(zh)/perioperative-rehab/[slug]/page'

function buildFixture(t: { after: (cleanup: () => void) => void }) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'cam-savant-links-build-'))
  t.after(() => rmSync(root, { force: true, recursive: true }))
  const write = (file: string, value: string) => {
    const absolute = path.join(root, file)
    mkdirSync(path.dirname(absolute), { recursive: true })
    writeFileSync(absolute, value)
  }
  const json = (file: string, value: unknown) => write(`.next/${file}`, JSON.stringify(value))
  json('routes-manifest.json', {
    redirects: [{ source: '/old', destination: '/posts/related', statusCode: 308, regex: '^/old$' }],
    staticRoutes: [],
  })
  json('prerender-manifest.json', {
    routes: {
      '/posts/changed': { srcRoute: '/posts/[slug]' },
      '/posts/related': { srcRoute: '/posts/[slug]' },
      '/posts/missing-artifact': { srcRoute: '/posts/[slug]' },
      '/perioperative-rehab/handout': { srcRoute: '/perioperative-rehab/[slug]' },
    },
  })
  json('app-path-routes-manifest.json', {
    [postOwner]: '/posts/[slug]',
    [rehabOwner]: '/perioperative-rehab/[slug]',
  })
  write('public/handout.pdf', 'Example PDF artifact')
  write('.next/server/app/posts/related.html', `<main><h2 id="段落">Related section</h2>
    <a href="https://recursive.example/missing">An unchanged article's outgoing link</a></main>`)
  write('.next/server/app/perioperative-rehab/handout.html', '<main><h2 id="保護內容">Protected section</h2></main>')

  // A new article may only have the adapter's owner-scoped HTML, with no legacy mirror.
  const ownerHash = createHash('sha256').update(postOwner).digest('hex')
  write(`.next/server/route-cache/APP_PAGE/${ownerHash}/$/posts/changed.html`, `<body>
    <header><a href="/missing-from-layout">Shared header link</a></header><main>
      <h2 id="新文章">New heading</h2><a href="#新文章">New anchor</a>
      <a href="related#段落">Related article anchor</a>
      <a href="/posts/related#missing">Missing anchor</a>
      <a href="/posts/removed">Missing article</a>
      <a href="/old#段落">Moved article</a>
      <a href="/handout.pdf">Static asset</a>
      <a href="/perioperative-rehab/handout#保護內容">Protected HTML target</a>
      <a href="/perioperative-rehab/handout?access=example">Patient access link</a>
      <a href="/perioperative-rehab/access">Patient access endpoint</a>
      <a href="/admin/editor">Admin</a>
      <a href="/api/admin/articles">Admin API</a>
      <a href="https://members.camsavant.com/login">Member sign-in</a>
      <a href="https://forbidden.example/paper">Forbidden publisher</a>
      <a href="https://limited.example/paper">Rate-limiting publisher</a>
      <a href="https://timeout.example/paper">Slow publisher</a>
      <a href="https://removed.example/paper">Removed external reference</a>
    </main></body>`)
  return root
}

test('checks the changed article against its current build and only requests public external destinations', async (t) => {
  const internal = createBuildTransport(buildFixture(t))
  const localRequests = new Set<string>()
  const externalRequests = new Set<string>()
  const report = await auditRenderedPages(BASE_URL, ['/posts/changed'], {
    internal: async (url, includeHtml) => {
      localRequests.add(url.href)
      return internal(url, includeHtml)
    },
    external: async (url) => {
      externalRequests.add(url.href)
      switch (url.hostname) {
        case 'forbidden.example': return { response: new Response(null, { status: 403 }) }
        case 'limited.example': return { response: new Response(null, { status: 429 }) }
        case 'timeout.example': throw new DOMException('Request timed out', 'TimeoutError')
        case 'removed.example': return { response: new Response(null, { status: 410 }) }
        default: assert.fail(`Unexpected external request: ${url.href}`)
      }
    },
  })
  const source = `${BASE_URL}/posts/changed`
  const link = (relative: string) => {
    const href = new URL(relative, source).href
    const result = report.links.find(({ requestUrl }) => requestUrl === href)
    assert.ok(result, `Missing result for ${href}`)
    return result
  }
  assert.deepEqual(report.pages, [source])
  assert.ok(report.links.every(({ sourcePages }) => sourcePages.length === 1 && sourcePages[0] === source))
  assert.equal(link('#新文章').result, 'ok')
  assert.equal(link('related#段落').result, 'ok')
  assert.equal(link('/posts/related#missing').result, 'broken')
  assert.equal(link('/posts/removed').result, 'broken')
  assert.equal(link('/posts/removed').httpStatus, 404)
  assert.equal(link('/old#段落').result, 'redirected')
  assert.equal(link('/old#段落').finalUrl, new URL('/posts/related#段落', BASE_URL).href)
  assert.equal(link('/handout.pdf').result, 'ok')
  assert.equal(link('/perioperative-rehab/handout#保護內容').result, 'ok')
  assert.equal(link('https://forbidden.example/paper').result, 'review')
  assert.equal(link('https://forbidden.example/paper').httpStatus, 403)
  assert.equal(link('https://limited.example/paper').result, 'review')
  assert.equal(link('https://limited.example/paper').httpStatus, 429)
  assert.equal(link('https://timeout.example/paper').result, 'review')
  assert.match(link('https://timeout.example/paper').reason ?? '', /timed out/)
  assert.equal(link('https://removed.example/paper').result, 'broken')
  assert.deepEqual(report.summary, { ok: 4, redirected: 1, review: 3, broken: 3 })
  assert.deepEqual(localRequests, new Set([
    source, `${BASE_URL}/posts/related`, `${BASE_URL}/posts/removed`, `${BASE_URL}/old`,
    `${BASE_URL}/handout.pdf`, `${BASE_URL}/perioperative-rehab/handout`,
  ]))
  assert.deepEqual(externalRequests, new Set([
    'https://forbidden.example/paper', 'https://limited.example/paper',
    'https://timeout.example/paper', 'https://removed.example/paper',
  ]))
})

test('fails if the build is missing a selected article artifact', async (t) => {
  const internal = createBuildTransport(buildFixture(t))
  await assert.rejects(auditRenderedPages(BASE_URL, ['/posts/missing-artifact'], {
    internal,
    external: async (url) => assert.fail(`Unexpected external request: ${url.href}`),
  }), /找不到對應的 HTML/)
})
