import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import test from 'node:test'
import config from '../next.config.mjs'

const root = new URL('../', import.meta.url)
const source = file => fs.readFileSync(new URL(file, root), 'utf8')
const policy = (entries, route) => entries.find(entry => entry.source === route)?.headers.find(header => header.key === 'Content-Security-Policy')?.value
const directive = (csp, name) => csp.split(';').map(part => part.trim()).find(part => part.startsWith(name + ' ')) || ''

function inlineScripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(([, attrs, body]) => !/\bsrc\s*=/i.test(attrs) && body.trim()).map(([, , body]) => body)
}

test('FSM policy permits exactly the current inline script hashes and blocks injected scripts and event attributes', async () => {
  const headers = await config.headers()
  const csp = policy(headers, '/fsm/studio/:path*')
  assert.ok(csp)
  const script = directive(csp, 'script-src')
  assert.doesNotMatch(script, /unsafe-inline|unsafe-eval|unsafe-hashes|\*/)
  assert.match(script, /'self'/)
  assert.match(script, /https:\/\/accounts\.google\.com/)
  const scripts = inlineScripts(source('public/fsm/studio/index.html'))
  const hashes = scripts.map(body => `'sha256-${createHash('sha256').update(body).digest('base64')}'`)
  assert.ok(hashes.length)
  assert.deepEqual([...script.matchAll(/'sha256-[A-Za-z0-9+/=]+'/g)].map(match => match[0]).sort(), [...new Set(hashes)].sort())
  const injected = `'sha256-${createHash('sha256').update('alert("untrusted")').digest('base64')}'`
  assert.equal(script.includes(injected), false)
  assert.equal(directive(csp, 'script-src-attr'), "script-src-attr 'none'")
  assert.equal(directive(csp, 'object-src'), "object-src 'none'")
  assert.equal(directive(csp, 'base-uri'), "base-uri 'none'")
})

test('FSM retains Google login, iOS data audio, blob previews/encoders and its inline manifest', async () => {
  const csp = policy(await config.headers(), '/fsm/studio/:path*')
  assert.match(directive(csp, 'frame-src'), /https:\/\/accounts\.google\.com/)
  assert.match(directive(csp, 'connect-src'), /https:\/\/accounts\.google\.com/)
  assert.match(directive(csp, 'connect-src'), /https:\/\/oauth2\.googleapis\.com/)
  assert.match(directive(csp, 'media-src'), /'self' data: blob:/)
  assert.match(directive(csp, 'worker-src'), /'self' blob:/)
  assert.match(directive(csp, 'manifest-src'), /'self' data:/)
  assert.doesNotMatch(directive(csp, 'connect-src'), /google-analytics|vercel-insights|googletagmanager/)
  assert.equal(directive(csp, 'frame-ancestors'), "frame-ancestors 'none'")
})

test('the retired callback has its own current hash policy and public pages keep Next hydration compatible', async () => {
  const headers = await config.headers()
  const callbackCsp = policy(headers, '/fsm/studio/auth-callback.html')
  const callbackScripts = inlineScripts(source('public/fsm/studio/auth-callback.html'))
  const hashes = callbackScripts.map(body => `'sha256-${createHash('sha256').update(body).digest('base64')}'`)
  assert.deepEqual([...directive(callbackCsp, 'script-src').matchAll(/'sha256-[A-Za-z0-9+/=]+'/g)].map(match => match[0]).sort(), [...new Set(hashes)].sort())
  assert.doesNotMatch(directive(callbackCsp, 'script-src'), /unsafe-inline|unsafe-eval/)
  const main = policy(headers, '/(.*)')
  assert.match(directive(main, 'script-src'), /'unsafe-inline'/, 'Next static HTML still contains per-page hydration scripts')
  assert.match(directive(main, 'script-src'), /https:\/\/www\.googletagmanager\.com/)
})

test('sensitive Studio responses and same-origin referrers cannot expose query strings to collectors', async () => {
  const headers = await config.headers()
  const global = headers.find(entry => entry.source === '/(.*)').headers
  assert.equal(global.find(header => header.key === 'Referrer-Policy').value, 'strict-origin')
  const studio = headers.find(entry => entry.source === '/fsm/studio/:path*').headers
  assert.match(studio.find(header => header.key === 'Cache-Control').value, /private.*no-store/)
  assert.equal(studio.find(header => header.key === 'Referrer-Policy').value, 'strict-origin')
  assert.equal(studio.find(header => header.key === 'Cross-Origin-Resource-Policy').value, 'same-origin')
  const vercel = JSON.parse(source('vercel.json'))
  const override = vercel.headers.find(entry => entry.source === '/fsm/studio/(.*)')
  assert.equal(override.headers.find(header => header.key === 'Referrer-Policy').value, 'strict-origin')
})

test('Studio markup has no inline event attributes that a strict policy would break', () => {
  const html = source('public/fsm/studio/index.html')
  // Ignore the application source while checking actual markup attributes.
  const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
  assert.doesNotMatch(markup, /\son[a-z]+\s*=/i)
})
