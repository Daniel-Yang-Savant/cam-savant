import { setTimeout as delay } from 'node:timers/promises'

export const REQUEST_WORKERS = 10
export const MAX_REDIRECTS = 10
export const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

async function readHtml(response: Response): Promise<string | undefined> {
  if (!response.body || !/^(?:text\/html|application\/xhtml\+xml)(?:;|$)/i.test(response.headers.get('content-type') ?? '')) return
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const chunks: string[] = []
  let bytes = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > 4 * 1024 * 1024) throw new Error('HTML 超過 4 MiB 檢查上限。')
      chunks.push(decoder.decode(value, { stream: true }))
    }
    return chunks.join('') + decoder.decode()
  } finally {
    await reader.cancel().catch(() => undefined)
  }
}

export type LinkTransport = (url: URL, includeHtml: boolean) => Promise<{ response: Response; html?: string }>

async function requestUrl(url: URL, includeHtml: boolean) {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'manual',
    credentials: 'omit',
    headers: { 'User-Agent': 'CAM-Savant-Link-Audit/1.0' },
    signal: AbortSignal.timeout(10_000),
  })
  try {
    const html = includeHtml && response.ok && response.status !== 203 ? await readHtml(response) : undefined
    return { response, html }
  } finally {
    if (response.body && !response.body.locked) await response.body.cancel().catch(() => undefined)
  }
}

export function createRequester(transport: LinkTransport = requestUrl) {
  const hostQueues = new Map<string, Promise<void>>()
  return function request(url: URL, includeHtml = false) {
    const host = url.hostname.replace(/\.$/u, '')
    const pending = hostQueues.get(host) ?? Promise.resolve()
    const result = pending.then(() => transport(url, includeHtml))
    hostQueues.set(host, result.catch(() => undefined).then(() => delay(350)))
    return result
  }
}
