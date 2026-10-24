/** In-process EVAL fixture. Never forwards requests to real KV or external APIs. */
export function installRateLimitFixture(): () => void {
  const keys = ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'RATE_LIMIT_SECRET'] as const
  const previous = keys.map(key => [key, process.env[key]] as const)
  const originalFetch = globalThis.fetch
  const counts = new Map<string, number>()
  process.env.KV_REST_API_URL = 'https://synthetic-rate-limit.invalid'
  process.env.KV_REST_API_TOKEN = 'synthetic-rate-limit-kv-token'
  process.env.RATE_LIMIT_SECRET = 'synthetic-rate-limit-private-key'
  globalThis.fetch = async (input, options) => {
    if (String(input) !== 'https://synthetic-rate-limit.invalid/' || options?.method !== 'POST') {
      throw new Error('Security tests must never contact an external service')
    }
    const [command, , keyCount, bucket, windowMs] = JSON.parse(String(options.body))
    if (command !== 'EVAL' || keyCount !== '1' || !/^request-limit:v1:[a-f0-9]{64}$/.test(bucket)) {
      throw new Error('Unexpected synthetic rate-limit command')
    }
    const count = (counts.get(bucket) ?? 0) + 1
    counts.set(bucket, count)
    return new Response(JSON.stringify({ result: [count, Number(windowMs)] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return () => {
    globalThis.fetch = originalFetch
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}
