import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compileMDX } from 'next-mdx-remote/rsc'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { parseDocument, DomUtils } from 'htmlparser2'
import mdxSecurity from '../lib/mdx-security.ts'
import articleHeadings from '../lib/article-headings.ts'

const { stripActiveMdx } = mdxSecurity
const { addArticleHeadingIds } = articleHeadings

async function render(source) {
  const { content } = await compileMDX({
    source,
    options: { blockJS: true, mdxOptions: { remarkPlugins: [stripActiveMdx, addArticleHeadingIds] } },
  })
  return renderToStaticMarkup(content)
}

test('article rendering removes executable HTML while retaining ordinary document content', async () => {
  const html = await render('# Document\n\nNormal **content**.\n\n<script>void 0</script>\n\n<iframe src="https://example.invalid" />\n\n<form action="https://example.invalid"><input name="secret" /></form>\n\n<style>body</style>')
  const document = parseDocument(html)
  for (const tag of ['script', 'iframe', 'form', 'input', 'style']) {
    assert.equal(DomUtils.getElementsByTagName(tag, document.children).length, 0)
  }
  assert.match(html, /<h1>Document<\/h1>/)
  assert.match(html, /<strong>content<\/strong>/)
})

test('JSX event handlers and executable URL schemes are removed before React renders', async () => {
  const html = await render('<a href="java&#x73;cript:window.close()" onClick="void 0">Link</a>\n\n<a href="https://example.invalid/article#section">Safe</a>')
  const document = parseDocument(html)
  const links = DomUtils.getElementsByTagName('a', document.children)
  assert.equal(links[0].attribs.href, undefined)
  assert.equal(links[0].attribs.onclick, undefined)
  assert.equal(links[1].attribs.href, 'https://example.invalid/article#section')
})

test('MDX expressions cannot read runtime globals and ordinary inline formatting survives', async () => {
  const html = await render('Text {process.env.NODE_ENV}\n\n<sup>2</sup> and <br /> text.')
  assert.doesNotMatch(html, /development|production|process\.env/)
  assert.match(html, /<sup>2<\/sup>/)
  assert.match(html, /<br\/>/)
})

test('reviewed document components and literal code samples still render normally', async () => {
  const { content } = await compileMDX({
    source: '<ContextualCareCTA />\n\n```html\n<script>void 0</script>\n```',
    components: { ContextualCareCTA: () => createElement('aside', null, 'Known document component') },
    options: { blockJS: true, mdxOptions: { remarkPlugins: [stripActiveMdx] } },
  })
  const html = renderToStaticMarkup(content)
  assert.match(html, /<aside>Known document component<\/aside>/)
  const document = parseDocument(html)
  assert.equal(DomUtils.getElementsByTagName('script', document.children).length, 0)
  assert.match(html, /&lt;script&gt;void 0&lt;\/script&gt;/)
})

test('Markdown destinations and reference definitions reject active or non-web schemes', async () => {
  const html = await render('[Open](data:text/html;base64,dm9pZCAw)\n\n![Image](javascript:window.close())\n\n[Reference][unsafe]\n\n[unsafe]: vbscript:window.close()')
  assert.doesNotMatch(html, /(?:data|javascript|vbscript):/i)
  assert.match(html, /<a href="#">Open<\/a>/)
  assert.match(html, /<a href="#">Reference<\/a>/)
})

test('unknown and legacy browsing-context elements are excluded by the document allowlist', async () => {
  const html = await render('<fencedframe src="https://example.invalid" />\n\n<frame src="https://example.invalid" />\n\n<applet code="example" />\n\n<details><summary>Details</summary><p>Document text</p></details>')
  assert.doesNotMatch(html, /fencedframe|<frame|applet|example\.invalid/)
  assert.match(html, /<details><summary>Details<\/summary><p>Document text<\/p><\/details>/)
})

test('article anchors use formatted text, preserve existing plain anchors, and avoid collisions', async () => {
  const html = await render('## 復健 **步驟**\n\n## 復健 步驟\n\n### 復健 步驟-2\n\n## 復健 步驟\n\n## [Follow up](https://example.invalid) and `care`\n\n## 🏃\n\n## 🏃')
  const document = parseDocument(html)
  const headings = DomUtils.findAll(node => ['h2', 'h3'].includes(node.name), document.children)
  assert.deepEqual(headings.map(node => node.attribs.id), [
    '復健-步驟', '復健-步驟-2', '復健-步驟-2-2', '復健-步驟-3', 'follow-up-and-care', 'section', 'section-2',
  ])
  assert.match(html, /<strong>步驟<\/strong>/)
  assert.doesNotMatch(html, /object-object/)
})

test('article heading IDs reset for each document and never include executable expressions', async () => {
  const source = '## Same heading\n\n## Same heading\n\n## Safe {process.env.NODE_ENV}'
  const first = await render(source)
  assert.equal(first, await render(source))
  assert.match(first, /id="same-heading"/)
  assert.match(first, /id="same-heading-2"/)
  assert.doesNotMatch(first, /production|development|process\.env/)
})
