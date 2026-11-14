import { execFileSync } from 'node:child_process'
import path from 'node:path'

function readGit(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'ignore'] }).trim()
}

export function checkArticleBeforePublish(file: string, production = false) {
  const article = path.relative(process.cwd(), file)
  if (!/^content\/posts\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.mdx?$/.test(article)) {
    throw new Error('發布文章必須位於 content/posts。')
  }

  const branch = readGit(['symbolic-ref', 'HEAD'])
  const [remote, ref] = readGit(['for-each-ref', '--format=%(upstream:remotename)%00%(upstream:remoteref)', '--', branch]).split('\0')
  if (!remote || !ref?.startsWith('refs/heads/')) {
    throw new Error('請先設定目前分支的遠端追蹤分支，再發布文章。')
  }
  if (production && (branch !== 'refs/heads/main' || remote !== 'origin' || ref !== 'refs/heads/main')) {
    throw new Error('請切換至追蹤 origin/main 的本機 main 分支，再發布文章。')
  }
  if (!production && readGit(['rev-parse', '--symbolic-full-name', '@{push}']) !== readGit(['rev-parse', '--symbolic-full-name', '@{upstream}'])) {
    throw new Error('目前分支的推送與追蹤目的地不同，請統一分支設定後再發布文章。')
  }

  // Compare with the current destination, including a separately configured push URL.
  const destinationUrls = readGit(['remote', 'get-url', '--push', '--all', '--', remote]).split('\n')
  if (destinationUrls.length !== 1) throw new Error('發布分支必須使用單一遠端推送位址。')
  let base: string
  try {
    const [commit, remoteRef] = readGit(['ls-remote', '--exit-code', '--refs', '--', destinationUrls[0], ref]).split('\t')
    if (remoteRef !== ref || !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit)) throw new Error('遠端提交無效。')
    base = commit
  } catch {
    throw new Error(`無法確認 ${remote}/${ref.slice('refs/heads/'.length)} 的目前版本，請確認遠端連線與分支設定。`)
  }

  const head = readGit(['rev-parse', 'HEAD'])
  try {
    readGit(['merge-base', '--is-ancestor', base, head])
  } catch {
    throw new Error('本機分支尚未包含遠端最新版本。請先同步分支，再重跑發布檢查。')
  }
  const articleHash = readGit(['hash-object', '--', article])
  execFileSync('npm', ['run', 'check:publish-links', '--', '--base', base, '--include', article], { stdio: 'inherit' })

  return (message: string, additionalFiles: string[] = []) => {
    if (readGit(['symbolic-ref', 'HEAD']) !== branch || readGit(['rev-parse', 'HEAD']) !== head || readGit(['hash-object', '--', article]) !== articleHash) {
      throw new Error('分支版本或文章在檢查期間有變動，請重新執行發布。')
    }
    const files = [article, ...additionalFiles]
    execFileSync('git', ['add', '--', ...files], { stdio: 'inherit' })
    execFileSync('git', ['commit', '--only', '-m', message, '--', ...files], { stdio: 'inherit' })
    execFileSync('git', ['push', '--', remote, `${branch}:${ref}`], { stdio: 'inherit' })
  }
}
