import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'
import { parseDocument, DomUtils } from 'htmlparser2'
import { safeJsonLd } from '../lib/safe-json'

const originalDirectory = process.cwd()
const fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'cam-content-security-'))
let posts: typeof import('../lib/posts')
let englishPosts: typeof import('../lib/english-posts')

before(async () => {
  for (const locale of ['posts', 'posts-en']) {
    const directory = path.join(fixtureDirectory, 'content', locale)
    fs.mkdirSync(directory, { recursive: true })
    for (const draft of [true, false]) {
      fs.writeFileSync(path.join(directory, `${draft ? 'private-draft' : 'published'}.mdx`), `---
title: Security fixture
date: '2026-10-24'
category: ${locale === 'posts-en' ? 'perioperative-rehab' : 'sports-medicine'}
excerpt: This is a synthetic article used only for security tests.
author: 楊育愷醫師
translationOf: published
draft: ${draft}
---
Synthetic article body.
`)
    }
  }
  process.chdir(fixtureDirectory)
  posts = await import('../lib/posts')
  englishPosts = await import('../lib/english-posts')
})

after(() => {
  process.chdir(originalDirectory)
  fs.rmSync(fixtureDirectory, { recursive: true, force: true })
})

test('JSON-LD remains a single inert script and preserves the original data', () => {
  const data = { title: '</script><script>void 0</script>', body: '中文 < & > \u2028\u2029', list: [1, true, null] }
  const html = `<script type="application/ld+json">${safeJsonLd(data)}</script>`
  const document = parseDocument(html)
  const scripts = DomUtils.getElementsByTagName('script', document.children)
  assert.equal(scripts.length, 1)
  assert.deepEqual(JSON.parse(DomUtils.textContent(scripts[0])), data)
  assert.doesNotMatch(safeJsonLd(data), /[<>&\u2028\u2029]/)
})

test('published Chinese and English articles remain accessible', () => {
  assert.equal(posts.getPostBySlug('published')?.frontmatter.title, 'Security fixture')
  assert.equal(englishPosts.getEnglishPostBySlug('published')?.frontmatter.title, 'Security fixture')
})

test('drafts cannot be read by direct slug or returned by published listings', () => {
  assert.equal(posts.getPostBySlug('private-draft'), null)
  assert.equal(englishPosts.getEnglishPostBySlug('private-draft'), null)
  assert.deepEqual(posts.getAllPosts().map(post => post.slug), ['published'])
  assert.deepEqual(englishPosts.getAllEnglishPosts().map(post => post.slug), ['published'])
})

test('public article lookups reject directory separators and encoded traversal', () => {
  for (const slug of ['../published', '..\\published', 'a/published', '%2e%2e%2fpublished', '.', '', 'published.mdx']) {
    assert.equal(posts.getPostBySlug(slug), null)
    assert.equal(englishPosts.getEnglishPostBySlug(slug), null)
  }
})
