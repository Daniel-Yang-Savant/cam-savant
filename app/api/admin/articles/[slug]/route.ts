import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { checkRateLimit, getClientIp, isAllowedWriteOrigin, rateLimitError } from '@/lib/rate-limit'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')
const allowedExtensions = new Set(['.mdx', '.md'])

function validSlug(slug: string): boolean {
  return slug.length <= 200 && /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(slug)
}

function articlePath(slug: string, ext: string): string {
  const candidate = path.resolve(postsDirectory, `${slug}${ext}`)
  const relative = path.relative(path.resolve(postsDirectory), candidate)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Forbidden article path')
  }
  // Do not follow a repository symlink out of the article directory.
  const stat = fs.lstatSync(candidate, { throwIfNoEntry: false })
  if (stat && (!stat.isFile() || stat.isSymbolicLink())) {
    throw new Error('Forbidden article file')
  }
  return candidate
}

function findFile(slug: string): string | null {
  for (const ext of ['.mdx', '.md']) {
    const p = articlePath(slug, ext)
    if (fs.existsSync(p)) return p
  }
  return null
}

// GET /api/admin/articles/[slug] — return raw file content
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!validSlug(slug)) {
    return NextResponse.json({ error: 'Invalid article slug' }, { status: 400 })
  }
  let filePath: string | null
  try {
    filePath = findFile(slug)
  } catch {
    return NextResponse.json({ error: 'Forbidden article path' }, { status: 403 })
  }
  if (!filePath) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const descriptor = fs.openSync(filePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW)
  let content: string
  try {
    content = fs.readFileSync(descriptor, 'utf8')
  } finally {
    fs.closeSync(descriptor)
  }
  const ext = path.extname(filePath)
  return NextResponse.json({ slug, content, ext })
}

// PUT /api/admin/articles/[slug] — save raw file content
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAllowedWriteOrigin(req.headers, req.nextUrl.origin)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const limit = await checkRateLimit(`admin-article-write:${getClientIp(req.headers)}`, 60, 60_000)
  if (!limit.allowed) {
    const error = rateLimitError(limit)
    return NextResponse.json({ error: error.error, code: error.code }, { status: error.status, headers: error.headers })
  }
  const { slug } = await params
  if (!validSlug(slug)) {
    return NextResponse.json({ error: 'Invalid article slug' }, { status: 400 })
  }
  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return NextResponse.json({ error: 'Invalid JSON object' }, { status: 400 })
  }
  const body = parsed as { content?: unknown; ext?: unknown }
  if (typeof body.content !== 'string') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }
  if (body.ext !== undefined && (typeof body.ext !== 'string' || !allowedExtensions.has(body.ext))) {
    return NextResponse.json({ error: 'Invalid article extension' }, { status: 400 })
  }

  // Determine file extension: keep existing ext or default to .mdx
  let filePath: string
  try {
    filePath = findFile(slug) ?? articlePath(slug, (body.ext as string | undefined) ?? '.mdx')
  } catch {
    return NextResponse.json({ error: 'Forbidden article path' }, { status: 403 })
  }

  const descriptor = fs.openSync(
    filePath,
    fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_NOFOLLOW,
    0o644
  )
  try {
    fs.writeFileSync(descriptor, body.content, 'utf8')
  } finally {
    fs.closeSync(descriptor)
  }
  return NextResponse.json({ ok: true, slug })
}
