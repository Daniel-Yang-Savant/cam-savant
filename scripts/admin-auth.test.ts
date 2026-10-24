import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { NextRequest } from 'next/server'
import { installRateLimitFixture } from './rate-limit-fixture'
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSession,
  verifyAdminSession,
} from '../lib/admin-auth'

const SECRET = 'synthetic-admin-security-private-secret'
const FIXED_NOW = 1_800_000_000_000
const ORIGIN = 'https://admin-security.example.test'

describe('administrator sessions', { concurrency: false }, () => {
  let login: typeof import('../app/api/admin-login/route').POST
  let proxy: typeof import('../proxy').proxy
  const originalSecret = process.env.ADMIN_SECRET
  const originalNodeEnv = process.env.NODE_ENV
  let requestCounter = 0
  let restoreRateLimit = () => {}

  before(async () => {
    process.env.ADMIN_SECRET = SECRET
    Object.assign(process.env, { NODE_ENV: 'production' })
    restoreRateLimit = installRateLimitFixture()
    ;({ POST: login } = await import('../app/api/admin-login/route'))
    ;({ proxy } = await import('../proxy'))
  })

  after(() => {
    restoreRateLimit()
    if (originalSecret === undefined) delete process.env.ADMIN_SECRET
    else process.env.ADMIN_SECRET = originalSecret
    if (originalNodeEnv === undefined) Reflect.deleteProperty(process.env, 'NODE_ENV')
    else Object.assign(process.env, { NODE_ENV: originalNodeEnv })
  })

  function loginRequest(body: unknown) {
    return new NextRequest(`${ORIGIN}/api/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `synthetic-login-${++requestCounter}`,
      },
      body: JSON.stringify(body),
    })
  }

  function authenticatedRequest(url: string, cookie: string) {
    return new NextRequest(`${ORIGIN}${url}`, {
      headers: { cookie: `${ADMIN_COOKIE_NAME}=${cookie}` },
    })
  }

  test('successful login issues a scoped session rather than the reusable password', async () => {
    const response = await login(loginRequest({ password: SECRET }))
    assert.equal(response.status, 200)
    const cookie = response.cookies.get(ADMIN_COOKIE_NAME)
    assert.ok(cookie)
    assert.notEqual(cookie.value, SECRET)
    assert.equal(cookie.value.includes(SECRET), false)
    assert.equal(cookie.maxAge, ADMIN_SESSION_MAX_AGE_SECONDS)
    assert.equal(cookie.httpOnly, true)
    assert.equal(cookie.secure, true)
    assert.equal(cookie.sameSite, 'strict')
    assert.match(response.headers.get('cache-control') ?? '', /no-store/)
    assert.equal(await verifyAdminSession(cookie.value, SECRET), true)
    for (const url of ['/admin/editor', '/api/admin/session']) {
      const allowed = await proxy(authenticatedRequest(url, cookie.value))
      assert.equal(allowed.headers.get('x-middleware-next'), '1')
    }
  })

  test('server enforces the six-hour boundary even when a client keeps the cookie', async () => {
    const issuedAt = Date.now()
    const cookie = await createAdminSession(SECRET, issuedAt)
    assert.equal(await verifyAdminSession(cookie, SECRET, issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS * 1000 - 1000), true)
    assert.equal(await verifyAdminSession(cookie, SECRET, issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS * 1000), false)
    const originalNow = Date.now
    Date.now = () => issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS * 1000
    try {
      assert.equal((await proxy(authenticatedRequest('/admin/editor', cookie))).status, 404)
      assert.equal((await proxy(authenticatedRequest('/api/admin/session', cookie))).status, 401)
    } finally {
      Date.now = originalNow
    }
  })

  test('forged, malformed, overlong, differently signed and raw-password cookies fail closed', async () => {
    const valid = await createAdminSession(SECRET, FIXED_NOW)
    const parts = valid.split('.')
    parts[3] = (parts[3][0] === 'A' ? 'B' : 'A') + parts[3].slice(1)
    for (const cookie of [undefined, '', SECRET, 'v1.1.a.b', valid + '.extra', parts.join('.'), 'x'.repeat(1000)]) {
      assert.equal(await verifyAdminSession(cookie, SECRET, FIXED_NOW), false)
    }
    assert.equal(await verifyAdminSession(valid, undefined, FIXED_NOW), false)
    assert.equal(await verifyAdminSession(valid, 'rotated-private-secret', FIXED_NOW), false)
    const tooFarInFuture = await createAdminSession(SECRET, FIXED_NOW + 1000)
    assert.equal(await verifyAdminSession(tooFarInFuture, SECRET, FIXED_NOW), false)
    assert.equal((await proxy(authenticatedRequest('/api/admin/session', SECRET))).status, 401)
    assert.notEqual(await createAdminSession(SECRET, FIXED_NOW), valid, 'Sessions need independently random nonces')
  })

  test('invalid bodies and bad passwords do not issue sessions; missing configuration fails closed', async () => {
    for (const body of [null, [], { password: 'incorrect' }]) {
      const response = await login(loginRequest(body))
      assert.ok(response.status === 400 || response.status === 401)
      assert.equal(response.cookies.get(ADMIN_COOKIE_NAME), undefined)
    }
    delete process.env.ADMIN_SECRET
    try {
      const response = await login(loginRequest({ password: SECRET }))
      assert.equal(response.status, 503)
      assert.equal(response.cookies.get(ADMIN_COOKIE_NAME), undefined)
      const previouslyIssued = await createAdminSession(SECRET)
      assert.equal((await proxy(authenticatedRequest('/api/admin/session', previouslyIssued))).status, 401)
    } finally {
      process.env.ADMIN_SECRET = SECRET
    }
  })
})

describe('article file boundaries', { concurrency: false }, () => {
  let getArticle: typeof import('../app/api/admin/articles/[slug]/route').GET
  let putArticle: typeof import('../app/api/admin/articles/[slug]/route').PUT
  let fixtureDirectory: string
  let postsDirectory: string
  let restoreRateLimit = () => {}

  before(async () => {
    restoreRateLimit = installRateLimitFixture()
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'cam-savant-admin-security-'))
    postsDirectory = path.join(fixtureDirectory, 'content', 'posts')
    fs.mkdirSync(postsDirectory, { recursive: true })
    fs.mkdirSync(path.join(fixtureDirectory, 'content', 'posts-backup'))
    fs.writeFileSync(path.join(fixtureDirectory, 'AGENTS.md'), 'private fixture')
    fs.writeFileSync(path.join(fixtureDirectory, 'content', 'posts-backup', 'private.md'), 'sibling fixture')
    fs.writeFileSync(path.join(postsDirectory, 'existing.mdx'), '# Existing article')
    fs.symlinkSync(path.join(fixtureDirectory, 'AGENTS.md'), path.join(postsDirectory, 'linked.md'))
    fs.symlinkSync(path.join(fixtureDirectory, 'missing.md'), path.join(postsDirectory, 'broken.md'))
    const originalDirectory = process.cwd()
    try {
      process.chdir(fixtureDirectory)
      ;({ GET: getArticle, PUT: putArticle } = await import('../app/api/admin/articles/[slug]/route'))
    } finally {
      process.chdir(originalDirectory)
    }
  })

  after(() => {
    restoreRateLimit()
    fs.rmSync(fixtureDirectory, { recursive: true, force: true })
  })

  function params(slug: string) {
    return { params: Promise.resolve({ slug }) }
  }

  function putRequest(body: unknown) {
    return new NextRequest(`${ORIGIN}/api/admin/articles/fixture`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
  }

  test('valid article reads, updates and .md creation still work', async () => {
    const read = await getArticle(new NextRequest(`${ORIGIN}/api/admin/articles/existing`), params('existing'))
    assert.equal(read.status, 200)
    assert.equal((await read.json()).content, '# Existing article')
    const update = await putArticle(putRequest({ content: '# Updated article' }), params('existing'))
    assert.equal(update.status, 200)
    assert.equal(fs.readFileSync(path.join(postsDirectory, 'existing.mdx'), 'utf8'), '# Updated article')
    const create = await putArticle(putRequest({ content: '# New article', ext: '.md' }), params('new-article'))
    assert.equal(create.status, 200)
    assert.equal(fs.readFileSync(path.join(postsDirectory, 'new-article.md'), 'utf8'), '# New article')
  })

  test('traversal and encoded traversal are rejected for both reads and writes', async () => {
    for (const slug of ['../../AGENTS', '../posts-backup/private', '..%2F..%2FAGENTS', 'x/../../AGENTS', '..\\..\\AGENTS', 'test\0']) {
      const read = await getArticle(new NextRequest(`${ORIGIN}/api/admin/articles/fixture`), params(slug))
      assert.equal(read.status, 400)
      assert.equal((await putArticle(putRequest({ content: 'malicious replacement' }), params(slug))).status, 400)
    }
    assert.equal(fs.readFileSync(path.join(fixtureDirectory, 'AGENTS.md'), 'utf8'), 'private fixture')
    assert.equal(fs.readFileSync(path.join(fixtureDirectory, 'content', 'posts-backup', 'private.md'), 'utf8'), 'sibling fixture')
  })

  test('only article extensions are accepted and symlinks cannot expose or overwrite other files', async () => {
    for (const ext of ['.ts', '.js', '.md/../../escape', null, 123]) {
      assert.equal((await putArticle(putRequest({ content: 'malicious', ext }), params('new'))).status, 400)
    }
    for (const slug of ['linked', 'broken']) {
      assert.equal((await getArticle(new NextRequest(`${ORIGIN}/api/admin/articles/${slug}`), params(slug))).status, 403)
      assert.equal((await putArticle(putRequest({ content: 'malicious' }), params(slug))).status, 403)
    }
    assert.equal(fs.readFileSync(path.join(fixtureDirectory, 'AGENTS.md'), 'utf8'), 'private fixture')
    assert.equal(fs.existsSync(path.join(fixtureDirectory, 'missing.md')), false)
    assert.equal((await putArticle(putRequest(null), params('new'))).status, 400)
  })
})
