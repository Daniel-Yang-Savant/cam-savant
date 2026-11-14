import { readFileSync, realpathSync, statSync } from 'node:fs'
import path from 'node:path'
import { getPostsByTag } from '../../lib/posts'
import { canonicalizeTag, getTagHref, getTagLandingPage } from '../../lib/tags'
import { readBuiltPageArtifact } from '../seo-audit/build-artifacts'
import type { LinkTransport } from './http'

type BuildRoute = { page: string; regex: string }
type BuildRedirect = { source: string; destination: string; statusCode: number; regex: string; internal?: boolean }
type BuildManifest = { redirects: BuildRedirect[]; staticRoutes: BuildRoute[] }
type PrerenderManifest = { routes: Record<string, { srcRoute: string | null }> }

function builtResponse(status: number, html?: string, location?: string) {
  return { response: new Response(null, { status, headers: location ? { Location: location } : undefined }), html }
}

/** Resolve internal links against this deployment's output, never the live site's previous version. */
export function createBuildTransport(root = process.cwd()): LinkTransport {
  const dist = path.join(root, '.next')
  const publicDir = realpathSync(path.join(root, 'public'))
  const read = (file: string) => JSON.parse(readFileSync(path.join(dist, file), 'utf8'))
  const manifest = read('routes-manifest.json') as BuildManifest
  const prerender = read('prerender-manifest.json') as PrerenderManifest
  const owners = new Map(Object.entries(read('app-path-routes-manifest.json') as Record<string, string>).map(([owner, route]) => [route, owner]))
  const redirects = manifest.redirects.filter(({ internal }) => !internal).map((rule) => ({ ...rule, match: new RegExp(rule.regex) }))
  const staticRoutes = manifest.staticRoutes.map((rule) => ({ ...rule, match: new RegExp(rule.regex) }))
  const publicFile = (route: string) => {
    try {
      const file = realpathSync(path.join(publicDir, route.slice(1)))
      if (file.startsWith(publicDir + path.sep) && statSync(file).isFile()) return file
    } catch (error) {
      if (['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) return undefined
      throw error
    }
  }

  return async (url) => {
    const pathname = url.pathname
    if (pathname.length > 1 && pathname.endsWith('/')) {
      const destination = new URL(url)
      destination.pathname = pathname.replace(/\/+$/u, '')
      return builtResponse(308, undefined, destination.href)
    }
    const redirect = redirects.find(({ match }) => match.test(pathname))
    if (redirect) {
      // The site's redirects use literal destinations; do not guess at a future template.
      if (/:[a-z_]/i.test(redirect.source)) return builtResponse(503)
      const destination = new URL(redirect.destination, url)
      for (const [name, value] of url.searchParams) destination.searchParams.append(name, value)
      return builtResponse(redirect.statusCode, undefined, destination.href)
    }
    let route: string
    try {
      route = pathname.split('/').map((segment) => {
        const decoded = decodeURIComponent(segment)
        if (/[\/\\\x00-\x1f\x7f]/u.test(decoded) || decoded === '..' || decoded === '.') throw new Error('Invalid path segment')
        return decoded
      }).join('/')
    } catch {
      return builtResponse(404)
    }
    const output = Object.hasOwn(prerender.routes, route) ? prerender.routes[route] : undefined
    if (output) {
      const owner = owners.get(output.srcRoute ?? route)
      if (!owner?.endsWith('/page')) return builtResponse(200)
      const html = readBuiltPageArtifact(path.join(dist, 'server'), pathname, owner)
      if (html === undefined) throw new Error(`建置清單有 ${pathname}，但找不到對應的 HTML。`)
      return builtResponse(200, html)
    }
    // Below-index-threshold tags are rendered on demand by the existing tag page.
    if (route.startsWith('/tags/') && route.split('/').length === 3) {
      let rawTag = route.slice('/tags/'.length)
      for (let round = 0; round < 2 && /%[\da-f]{2}/i.test(rawTag); round++) {
        try { rawTag = decodeURIComponent(rawTag) } catch { break }
      }
      const tag = canonicalizeTag(rawTag)
      const landing = getTagLandingPage(tag)
      if (landing || rawTag !== tag) return builtResponse(308, undefined, landing ?? getTagHref(tag))
      return builtResponse(getPostsByTag(tag).length ? 200 : 404)
    }
    // Vercel's one public static rewrite, also available through the actual index.html path.
    const file = publicFile(route === '/fsm/studio' ? '/fsm/studio/index.html' : route)
    if (file) {
      const html = file.endsWith('.html') ? readFileSync(file, 'utf8') : undefined
      return builtResponse(200, html)
    }
    if (staticRoutes.some(({ match }) => match.test(pathname))) return builtResponse(200)
    return builtResponse(404)
  }
}
