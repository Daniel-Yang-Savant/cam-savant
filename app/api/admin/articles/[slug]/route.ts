import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

function findFile(slug: string): string | null {
  for (const ext of ['.mdx', '.md']) {
    const p = path.join(postsDirectory, `${slug}${ext}`)
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
  const filePath = findFile(slug)
  if (!filePath) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const content = fs.readFileSync(filePath, 'utf8')
  const ext = path.extname(filePath)
  return NextResponse.json({ slug, content, ext })
}

// PUT /api/admin/articles/[slug] — save raw file content
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  let body: { content?: string; ext?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body.content !== 'string') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  // Determine file extension: keep existing ext or default to .mdx
  let filePath = findFile(slug)
  if (!filePath) {
    const ext = body.ext ?? '.mdx'
    filePath = path.join(postsDirectory, `${slug}${ext}`)
  }

  // Safety check: resolved path must be inside postsDirectory
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(path.resolve(postsDirectory))) {
    return NextResponse.json({ error: 'Forbidden path' }, { status: 403 })
  }

  fs.writeFileSync(filePath, body.content, 'utf8')
  return NextResponse.json({ ok: true, slug })
}
