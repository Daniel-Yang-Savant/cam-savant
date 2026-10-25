import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { Parser } from 'htmlparser2'
import { getPublicPosts } from '../lib/posts'
import { BASE_URL } from '../lib/locales'
import { auditPublicArticles } from './seo-audit/articles'
import { readPublicBuildArtifact } from './seo-audit/build-artifacts'

// Independent release gate: older local-care experiments are not required.
function main() {
  const { values } = parseArgs({ options: {
    output: { type: 'string', default: '.seo-audit/public-articles.json' },
    help: { type: 'boolean', short: 'h' },
  } })
  if (values.help) {
    console.log('npm run audit:articles -- [--output FILE]\n只讀取上次本機 build 的已發布公開文章；error 回傳 1，執行失敗回傳 2。')
    return
  }
  const serverDirectory = path.resolve('.next/server')
  const buildId = readFileSync('.next/BUILD_ID', 'utf8').trim()
  const urls = new Set<string>()
  let inLoc = false
  let text = ''
  const sitemap = readPublicBuildArtifact(serverDirectory, '/sitemap.xml')
  if (sitemap === undefined) throw new Error('找不到本機 sitemap 建置輸出，請重新 build。')
  new Parser({
    onopentag(tag) { if (tag === 'loc') { inLoc = true; text = '' } },
    ontext(value) { if (inLoc) text += value },
    onclosetag(tag) {
      if (tag === 'loc') { urls.add(text.trim()); inLoc = false }
    },
  }, { xmlMode: true, decodeEntities: true }).end(sitemap)
  if (!urls.size) throw new Error('本機 sitemap 為空，請重新 build。')
  const audit = auditPublicArticles(getPublicPosts(), BASE_URL, urls, route => readPublicBuildArtifact(serverDirectory, route))
  const summary = {
    pages: audit.pages, expectedPages: audit.expectedPages,
    errors: audit.findings.filter(item => item.severity === 'error').length,
    warnings: audit.findings.filter(item => item.severity === 'warning').length,
  }
  const output = path.resolve(values.output!)
  mkdirSync(path.dirname(output), { recursive: true })
  writeFileSync(output, JSON.stringify({
    version: 1, scope: 'public-articles', origin: BASE_URL,
    generatedAt: new Date().toISOString(), builtAt: statSync('.next/BUILD_ID').mtime.toISOString(),
    buildId, summary, findings: audit.findings,
    limitations: ['只檢查本機建置 HTML，非正式環境爬取、完整 Schema.org 驗證或搜尋排名量測。', '草稿與受保護文章不讀取；local-care 基準工具仍為獨立範圍。'],
  }, null, 2) + '\n')
  console.log(`公開文章稽核：${summary.pages}/${summary.expectedPages} 篇；${summary.errors} errors，${summary.warnings} warnings。\n報告：${output}`)
  for (const item of audit.findings) console.log(`[${item.severity}] ${item.code} ${item.path} — ${item.evidence}`)
  process.exitCode = summary.errors ? 1 : 0
}

try { main() } catch (error) {
  console.error(`公開文章稽核無法完成：${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 2
}
