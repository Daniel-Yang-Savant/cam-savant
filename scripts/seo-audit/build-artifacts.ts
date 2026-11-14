import { createHash } from 'node:crypto'
import { readFileSync, realpathSync, statSync } from 'node:fs'
import path from 'node:path'

function readAppArtifact(serverDirectory: string, file: string, owner: string, kind: 'APP_PAGE' | 'APP_ROUTE'): string | undefined {
  const root = realpathSync(serverDirectory)
  // Next 16.4 adapters write owner-scoped payloads, without legacy aliases.
  // This matches next/dist/server/lib/route-cache-key's source-route identity.
  const hash = createHash('sha256').update(owner).digest('hex')
  const candidates = [path.join(root, 'route-cache', kind, hash, '$', file), path.join(root, 'app', file)]
  for (const candidate of candidates) {
    try {
      const actual = realpathSync(candidate)
      if (!actual.startsWith(root + path.sep)) throw new Error('Build artifact resolves outside the build directory.')
      if (!statSync(actual).isFile()) throw new Error('Build artifact is not a regular file.')
      return readFileSync(actual, 'utf8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
  }
  return undefined
}

/** Read exact HTML for an App Router page and its source-route owner. */
export function readBuiltPageArtifact(serverDirectory: string, route: string, owner: string): string | undefined {
  if (!owner.startsWith('/') || !owner.endsWith('/page')) throw new Error('Invalid App Router page owner.')
  if (!route.startsWith('/')) throw new Error('Invalid build page route.')
  const parts = route === '/' ? [] : route.slice(1).split('/')
  const segments = parts.map((part) => {
    let decoded: string
    try { decoded = decodeURIComponent(part) } catch { throw new Error('Invalid build page route.') }
    // Reject delimiters, traversal and double encoding before passing anything to path.join.
    if (!decoded || decoded === '.' || decoded === '..' || /[\p{Cc}\p{Zl}\p{Zp}\\/%?#]/u.test(decoded)) {
      throw new Error('Invalid build page route.')
    }
    return decoded
  })
  // Next reserves the index filename for the root; /index routes get an extra prefix.
  if (!segments.length || segments[0] === 'index') segments.unshift('index')
  return readAppArtifact(serverDirectory, `${segments.join('/')}.html`, owner, 'APP_PAGE')
}

/** Read exact public build outputs in both Next's adapter and local layouts. */
export function readPublicBuildArtifact(serverDirectory: string, route: string): string | undefined {
  if (route === '/sitemap.xml') return readAppArtifact(serverDirectory, 'sitemap.xml.body', '/sitemap.xml/route', 'APP_ROUTE')
  if (!/^\/posts\/[a-zA-Z0-9][a-zA-Z0-9_-]*$/u.test(route) || route.trim() !== route) {
    throw new Error('Only sitemap and published article build paths are supported.')
  }
  return readBuiltPageArtifact(serverDirectory, route, '/(zh)/posts/[slug]/page')
}
