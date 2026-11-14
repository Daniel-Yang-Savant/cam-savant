import { isIP } from 'node:net'
import { BASE_URL } from '../../lib/locales'
import { parsePageLinks } from '../seo-audit/core'
import { createRequester, MAX_REDIRECTS, REDIRECT_STATUSES, REQUEST_WORKERS, type LinkTransport } from './http'

export const PILOT_PAGES = [
  '/doctors/yu-kai-yang',
  '/posts/acl-rupture-treatment-decision',
  '/posts/frozen-shoulder-treatment-rehabilitation',
  '/posts/plantar-fasciitis-treatment',
]

type Redirect = { from: string; to: string; status: number }
type PageLinks = ReturnType<typeof parsePageLinks>
type LinkResult = 'ok' | 'redirected' | 'review' | 'broken'
type Trace = {
  httpStatus: number | null
  finalUrl: string | null
  redirects: Redirect[]
  result: LinkResult
  reason?: string
  page?: PageLinks
}
const siteHost = new URL(BASE_URL).hostname
const protectedPath = /^\/(?:en\/)?(?:api|admin[^/]*|perioperative-rehab|ak-google-auth|login|workspace)(?:\/|$)/i
const rehabPath = /^\/(?:en\/)?perioperative-rehab(?:\/(?!access(?:\/|$))[a-z\d][a-z\d_-]*)?\/?$/i
const shareLinks = new Set(['www.facebook.com/sharer/sharer.php', 'social-plugins.line.me/lineit/share'])

function isWebUrl(url: URL) {
  return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
}

function allowedSitePath(url: URL, fromBuild: boolean) {
  // Decode escaped route names before checking routes that require access.
  try {
    const pathname = decodeURIComponent(url.pathname).replace(/\\/g, '/').replace(/\/{2,}/g, '/')
    const normalized = new URL(pathname.replace(/[%?#]/g, encodeURIComponent), BASE_URL).pathname
    return (!protectedPath.test(normalized) || (fromBuild && rehabPath.test(normalized))) &&
      ![...url.searchParams.keys()].some((key) => /^(?:access|access_token|token|code)$/i.test(key))
  } catch {
    return false
  }
}

function hostOf(url: URL) {
  return url.hostname.replace(/\.$/u, '')
}

function isSiteHost(host: string) {
  return host === siteHost || host === `www.${siteHost}`
}

function canRequest(url: URL, origin: URL, fromBuild: boolean, previous?: URL) {
  if (!isWebUrl(url)) return false
  const host = hostOf(url)
  if (url.origin === origin.origin) return allowedSitePath(url, fromBuild) && (!previous || previous.origin === origin.origin || origin.origin === BASE_URL)
  if (isSiteHost(host)) return allowedSitePath(url, fromBuild)
  return host.includes('.') && !isIP(host) && !/\.(?:localhost|local|internal)$/i.test(host) &&
    !host.endsWith(`.${siteHost}`) && !shareLinks.has(`${host}${url.pathname}`)
}

function requestAddress(url: URL) {
  const address = new URL(url)
  address.hash = ''
  return address
}

function pageUrl(path: string, origin: URL, fromBuild: boolean) {
  const url = new URL(path, origin)
  if (!path.startsWith('/') || url.origin !== origin.origin || url.href.includes('#') || !canRequest(url, origin, fromBuild)) {
    throw new Error(`--page 需使用公開頁面路徑：${path}`)
  }
  return url.href
}

type BuildTransports = { internal: LinkTransport; external: LinkTransport }

function createInspector(origin: URL, build?: BuildTransports) {
  const request = createRequester(build?.external)
  const cache = new Map<string, Promise<{ response: Response; page?: PageLinks }>>()

  function inspect(address: URL, internal: boolean) {
    let pending = cache.get(address.href)
    if (!pending) {
      const fetchLink = build && internal ? build.internal : request
      pending = fetchLink(address, internal).then(({ response, html }) => ({
        response, page: html === undefined ? undefined : parsePageLinks(html),
      }))
      cache.set(address.href, pending)
    }
    return pending
  }

  async function trace(url: URL, seed = false): Promise<Trace> {
    const redirects: Redirect[] = []
    const seen = new Set<string>()
    let httpStatus: number | null = null
    let finalUrl: string | null = null
    let downgrade = false
    let leftSite = false
    const finish = (result: LinkResult, reason?: string, page?: PageLinks): Trace => ({
      httpStatus, finalUrl, redirects, result, reason, page,
    })

    try {
      for (;;) {
        const address = requestAddress(url)
        if (seen.has(address.href)) return finish('broken', '轉址形成迴圈。')
        if (redirects.length > MAX_REDIRECTS) return finish('review', '轉址次數超過上限。')
        seen.add(address.href)
        const internal = url.origin === origin.origin || isSiteHost(hostOf(url))
        const { response, page } = await inspect(address, internal)
        httpStatus = response.status
        finalUrl = url.href

        if (REDIRECT_STATUSES.has(httpStatus)) {
          const location = response.headers.get('location')
          if (!location) return finish('broken', '重新導向缺少 Location。')
          let next: URL
          try { next = new URL(location, url) } catch { return finish('broken', '重新導向的 Location 無法解析。') }
          if (!location.includes('#')) next.hash = url.hash
          if (!canRequest(next, origin, Boolean(build), url) || (seed && next.origin !== origin.origin)) {
            return finish('review', '重新導向指向掃描範圍之外的網址。')
          }
          redirects.push({ from: url.href, to: next.href, status: httpStatus })
          downgrade ||= url.protocol === 'https:' && next.protocol === 'http:'
          leftSite ||= internal && next.origin !== origin.origin && !isSiteHost(hostOf(next))
          url = next
          continue
        }

        if (httpStatus === 404 || httpStatus === 410) return finish('broken', `HTTP ${httpStatus}。`)
        if (!response.ok || httpStatus === 203) return finish('review', `HTTP ${httpStatus}，請以瀏覽器確認。`)
        const fragment = url.hash.slice(1).split(':~:', 1)[0]
        if (internal && fragment && !/^top$/i.test(fragment)) {
          let id = fragment
          try { id = decodeURIComponent(fragment) } catch { /* The raw ID can contain a percent sign. */ }
          if (!page) return finish('review', '無法讀取 HTML 來核對錨點。')
          if (!page.fragments.has(id) && !page.fragments.has(fragment)) return finish('broken', `HTML 找不到錨點 #${id}。`)
        }
        if (downgrade) return finish('review', '重新導向從 HTTPS 降為 HTTP。', page)
        if (leftSite) return finish('review', '站內連結重新導向至外部網站。', page)
        return finish(redirects.length ? 'redirected' : 'ok', undefined, page)
      }
    } catch (error) {
      if (build && isSiteHost(hostOf(url))) throw error
      const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error
      return finish('review', cause instanceof Error ? cause.message : String(cause))
    }
  }

  return trace
}

export async function auditRenderedPages(originValue: string, paths: string[], build?: BuildTransports) {
  const checkedAt = new Date().toISOString()
  const origin = new URL(originValue)
  if (!isWebUrl(origin) || origin.href !== `${origin.origin}/`) throw new Error('--origin 只接受 HTTP(S) 網站根網址。')
  const pages = [...new Set(paths.map((path) => pageUrl(path, origin, Boolean(build))))].sort()
  const trace = createInspector(origin, build)
  const targets = new Map<string, Set<string>>()

  for (const source of pages) {
    const result = await trace(new URL(source), true)
    if (!result.page || !result.finalUrl) throw new Error(`無法讀取來源頁 ${source}：${result.reason ?? '未取得 HTML。'}`)
    // Keep redirected source pages in the report even when no link points to their old URL.
    if (result.result !== 'ok') targets.set(source, new Set([source]))
    let base = new URL(result.finalUrl)
    if (result.page.baseHref !== undefined) {
      try { base = new URL(result.page.baseHref, base) } catch { /* Ignore an invalid HTML base URL. */ }
    }
    for (const href of result.page.hrefs) {
      let url: URL
      try { url = new URL(href, base) } catch { continue }
      if (!canRequest(url, origin, Boolean(build))) continue
      // Absolute canonical links should also hit the preview when reviewing a local build.
      if (origin.origin !== BASE_URL && isSiteHost(hostOf(url))) {
        const preview = new URL(origin)
        preview.pathname = url.pathname
        preview.search = url.search
        preview.hash = url.hash
        url = preview
      }
      const sources = targets.get(url.href) ?? new Set<string>()
      sources.add(source)
      targets.set(url.href, sources)
    }
  }

  const summary: Record<LinkResult, number> = { ok: 0, redirected: 0, review: 0, broken: 0 }
  const links: (Omit<Trace, 'page'> & { requestUrl: string; sourcePages: string[] })[] = []
  const queue = targets.entries()
  await Promise.all(Array.from({ length: REQUEST_WORKERS }, async () => {
    for (const [requestUrl, sources] of queue) {
      const { httpStatus, finalUrl, redirects, result, reason } = await trace(new URL(requestUrl))
      summary[result]++
      links.push({ requestUrl, sourcePages: [...sources].sort(), httpStatus, finalUrl, redirects, result, reason })
    }
  }))
  links.sort((a, b) => a.requestUrl.localeCompare(b.requestUrl))
  return { checkedAt, origin: origin.origin, pages, summary, links }
}

export function printPageReport({ origin, pages, summary, links }: Awaited<ReturnType<typeof auditRenderedPages>>) {
  console.log(`${origin}｜掃描 ${pages.length} 頁正文、${links.length} 個連結`)
  console.log(`可連線 ${summary.ok}｜有轉址 ${summary.redirected}｜待複查 ${summary.review}｜失效 ${summary.broken}`)
  for (const [result, label] of [['broken', '失效'], ['review', '待複查'], ['redirected', '有轉址']] as const) {
    for (const link of links.filter((item) => item.result === result)) {
      console.log(`\n[${label}] ${link.requestUrl}${link.httpStatus === null ? '' : `（HTTP ${link.httpStatus}）`}`)
      for (const step of link.redirects) console.log(`  ${step.status} → ${step.to}`)
      if (link.reason) console.log(`  ${link.reason}`)
      for (const source of link.sourcePages) console.log(`  來源 ${source}`)
    }
  }
}
