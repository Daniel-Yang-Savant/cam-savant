import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import path from 'node:path'

/** Read exact public build outputs in both Next's adapter and local layouts. */
export function readPublicBuildArtifact(serverDirectory: string, route: string): string | undefined {
  const sitemap = route === '/sitemap.xml'
  if (!sitemap && (!/^\/posts\/[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(route) || route.trim() !== route)) {
    throw new Error('Only sitemap and published article build paths are supported.')
  }
  const root = realpathSync(serverDirectory)
  const kind = sitemap ? 'APP_ROUTE' : 'APP_PAGE'
  const owner = sitemap ? '/sitemap.xml/route' : '/(zh)/posts/[slug]/page'
  // Next 16.4 adapters write owner-scoped payloads, without legacy aliases.
  // This matches next/dist/server/lib/route-cache-key's source-route identity.
  const hash = createHash('sha256').update(owner).digest('hex')
  const file = `${route.slice(1)}${sitemap ? '.body' : '.html'}`
  const candidates = [path.join(root, 'route-cache', kind, hash, '$', file), path.join(root, 'app', file)]
  for (const candidate of candidates) {
    try {
      const actual = realpathSync(candidate)
      if (!actual.startsWith(root + path.sep)) throw new Error('Build artifact resolves outside the build directory.')
      return readFileSync(actual, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
  return undefined
}
