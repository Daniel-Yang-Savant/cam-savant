import assert from 'node:assert/strict'
import { Resolver } from 'node:dns/promises'
import { EventEmitter } from 'node:events'
import https from 'node:https'
import test from 'node:test'
import { requestPublicUrl } from './public-http'

test('public requests reject private and reserved DNS answers before opening an HTTP connection', async (t) => {
  const get = t.mock.method(https, 'get', () => assert.fail('Unexpected connection'))
  let ipv4: string[], ipv6: string[]
  t.mock.method(Resolver.prototype, 'resolve4', async () => ipv4)
  t.mock.method(Resolver.prototype, 'resolve6', async () => ipv6)
  for ([ipv4, ipv6] of [
    [['127.0.0.1'], []],
    [['169.254.169.254'], []],
    [['8.8.8.8', '100.64.1.1'], []],
    [['8.8.8.8'], ['::ffff:127.0.0.1']],
    [[], ['fd00::1']],
    [[], ['64:ff9b::a9fe:a9fe']],
    [[], ['2001:db8::1']],
  ]) {
    await assert.rejects(requestPublicUrl(new URL('https://source.example/')), /非公開 IP/u)
  }
  assert.equal(get.mock.callCount(), 0)
})

test('invalid targets never reach DNS or bypass the pinned lookup', async (t) => {
  const resolve4 = t.mock.method(Resolver.prototype, 'resolve4', () => assert.fail('Unexpected DNS lookup'))
  const resolve6 = t.mock.method(Resolver.prototype, 'resolve6', () => assert.fail('Unexpected DNS lookup'))
  for (const input of [
    'https://127.0.0.1/', 'https://0x7f000001/', 'http://[::1]/', 'https://[2001:4860::1]/',
    'https://source.example:80/', 'http://source.example:443/', 'https://source.example:8443/',
    'https://user:secret@source.example/', 'https://server.internal./', 'ftp://source.example/',
  ]) await assert.rejects(requestPublicUrl(new URL(input)), /標準 HTTP/u)
  assert.equal(resolve4.mock.callCount() + resolve6.mock.callCount(), 0)
})

test('transport preserves the host, connects only to validated addresses, and returns one response', async (t) => {
  t.mock.method(Resolver.prototype, 'resolve4', async () => ['8.8.8.8'])
  t.mock.method(Resolver.prototype, 'resolve6', async () => ['2606:4700::1111'])
  let destroyed = false
  const get = t.mock.method(https, 'get', (
    target: URL,
    options: https.RequestOptions,
    callback: (message: unknown) => void,
  ) => {
    assert.equal(target.href, 'https://source.example/paper?format=html')
    assert.deepEqual(options.headers, { 'User-Agent': 'CAM-Savant-Link-Audit/1.0' })
    assert.equal(options.agent, false)
    assert.equal(options.rejectUnauthorized, true)
    assert.ok(options.signal)
    assert.ok(options.lookup)
    options.lookup(target.hostname, { all: true }, (error, addresses) => {
      assert.equal(error, null)
      assert.deepEqual(addresses, [
        { address: '8.8.8.8', family: 4 },
        { address: '2606:4700::1111', family: 6 },
      ])
    })
    callback({
      statusCode: 302,
      rawHeaders: ['Location', 'https://next.example/'],
      destroy() { destroyed = true },
    })
    return new EventEmitter()
  })

  const result = await requestPublicUrl(new URL('https://source.example/paper?format=html'))
  assert.equal(get.mock.callCount(), 1)
  assert.equal(result.response.status, 302)
  assert.equal(result.response.headers.get('location'), 'https://next.example/')
  assert.equal(result.response.body, null)
  assert.equal(destroyed, true)
})
