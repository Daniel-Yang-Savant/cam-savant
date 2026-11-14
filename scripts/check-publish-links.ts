import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { getEnglishPostBySlug } from '../lib/english-posts'
import { BASE_URL } from '../lib/locales'
import { getPostBySlug, PROTECTED_CATEGORIES } from '../lib/posts'
import { listChangedArticleFiles } from './link-audit/changed-articles'
import { createBuildTransport } from './link-audit/next-build'
import { auditRenderedPages, printPageReport } from './link-audit/pages'
import { findPreviousProductionCommit, readPublicGithubJson } from './link-audit/production-baseline'
import { requestPublicUrl } from './link-audit/public-http'

const reportFile = '.seo-audit/publish-links.json'
const fullSha = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

async function committedArticleChanges(base: string, head: string) {
  if (base === head) return []
  // Some Vercel build containers omit Git or have only a shallow checkout.
  try {
    git(['cat-file', '-e', `${base}^{commit}`])
    git(['cat-file', '-e', `${head}^{commit}`])
    return listChangedArticleFiles(base, head)
  } catch {
    const comparison = await readPublicGithubJson(`/compare/${base}...${head}`) as {
      status?: string
      merge_base_commit?: { sha?: string }
      files?: { filename?: string; status?: string }[]
    }
    // GitHub compares from the merge base and caps the file list at 300.
    if (comparison.status !== 'ahead' || comparison.merge_base_commit?.sha !== base ||
        !Array.isArray(comparison.files) || comparison.files.length >= 300) {
      throw new Error('GitHub 無法提供完整的部署差異。請確認上次成功部署位於本次提交的歷史中，並以可讀取完整 Git 差異的環境建置。')
    }
    const files: string[] = []
    for (const file of comparison.files) {
      if (typeof file?.filename !== 'string' || !['added', 'modified', 'removed', 'renamed', 'copied', 'changed', 'unchanged'].includes(file.status ?? '')) {
        throw new Error('GitHub 回傳的部署差異格式不正確。')
      }
      if (file.status !== 'removed' && file.status !== 'unchanged' &&
          /^content\/posts(?:-en)?\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.mdx?$/u.test(file.filename)) files.push(file.filename)
    }
    return [...new Set(files)].sort()
  }
}

async function productionRange() {
  const { VERCEL_GIT_PREVIOUS_SHA: previous, VERCEL_GIT_COMMIT_SHA: current } = process.env
  let checkout: string | undefined
  try { checkout = git(['rev-parse', 'HEAD']) } catch { /* Git metadata can be absent from Vercel builds. */ }
  const head = current || checkout
  if (!head || !fullSha.test(head)) throw new Error('Vercel 建置缺少目前部署的 Git 提交。')
  if (checkout && checkout !== head) throw new Error('建置的 Git 提交與 Vercel 部署提交不一致。')
  if (previous && !fullSha.test(previous)) throw new Error('上次成功部署的 Git 提交格式不正確。')
  const base = previous || await findPreviousProductionCommit(head)
  console.log(`部署基準來源 ${previous ? 'Vercel' : 'GitHub 正式部署紀錄'}`)
  return { base, head }
}

function articleRoutes(files: string[]) {
  const routes = new Set<string>()
  for (const file of files) {
    if (!lstatSync(file).isFile()) throw new Error(`文章必須是一般檔案：${file}`)
    const english = file.startsWith('content/posts-en/')
    const slug = file.slice(file.lastIndexOf('/') + 1).replace(/\.mdx?$/u, '')
    if (file.endsWith('.md') && getFileHash(file + 'x') !== undefined) continue
    const post = english ? getEnglishPostBySlug(slug) : getPostBySlug(slug)
    if (!post) continue // Drafts have no published route.
    const section = PROTECTED_CATEGORIES.includes(post.frontmatter.category) ? 'perioperative-rehab' : 'posts'
    routes.add(`${english ? '/en' : ''}/${section}/${slug}`)
  }
  return [...routes].sort()
}

function getFileHash(file: string) {
  try {
    if (!lstatSync(file).isFile()) throw new Error(`文章必須是一般檔案：${file}`)
    return createHash('sha256').update(readFileSync(file)).digest('hex')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

async function main() {
  const { values } = parseArgs({ options: {
    base: { type: 'string' },
    include: { type: 'string', multiple: true },
    deployment: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  } })
  if (values.help) {
    console.log('npm run check:publish-links -- [--base Git提交] [--include content/posts/文章檔案]\n預設與上游分支比較；建置後檢查本次新增或修改、將發布的文章。')
    return
  }
  if (values.deployment && (values.base !== undefined || values.include !== undefined)) throw new Error('正式部署由 Vercel 決定檢查範圍。')
  if (values.deployment && process.env.VERCEL_ENV !== 'production') {
    if (process.env.VERCEL === '1' && !process.env.VERCEL_ENV) throw new Error('Vercel 建置缺少部署環境識別。')
    return
  }

  const range = values.deployment ? await productionRange() : undefined
  const head = range?.head
  const baselineVersion = range?.base ?? git([
    'rev-parse', '--verify', '--end-of-options', `${values.base ?? '@{upstream}'}^{commit}`,
  ])
  const files = range
    ? await committedArticleChanges(range.base, range.head)
    : listChangedArticleFiles(baselineVersion, undefined, process.cwd(), values.include)
  const routes = articleRoutes(files)
  console.log(`發布前連結檢查｜基準 ${baselineVersion.slice(0, 12)}｜本次 ${routes.length} 篇待發布文章`)
  for (const route of routes) console.log(`  ${route}`)
  const hashes = !values.deployment ? files.map(getFileHash) : undefined
  if (routes.length && !values.deployment) {
    execFileSync('npm', ['run', 'build'], { stdio: 'inherit' })
  }
  const report = await auditRenderedPages(BASE_URL, routes, routes.length ? { internal: createBuildTransport(), external: requestPublicUrl } : undefined)
  if (hashes && (files.some((file, index) => getFileHash(file) !== hashes[index]) ||
    JSON.stringify(listChangedArticleFiles(baselineVersion, undefined, process.cwd(), values.include)) !== JSON.stringify(files))) {
    throw new Error('文章在發布檢查期間變動，請重新執行。')
  }
  mkdirSync('.seo-audit', { recursive: true })
  writeFileSync(reportFile, JSON.stringify({ base: baselineVersion, head, ...report }, null, 2) + '\n')
  printPageReport(report)
  console.log(`報告 ${reportFile}`)
  if (report.summary.broken) {
    console.error('有失效連結，已中止發布。修正後請重新執行檢查。')
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error(`發布前連結檢查未完成：${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 2
})
