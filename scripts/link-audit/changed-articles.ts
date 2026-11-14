import { execFileSync } from 'node:child_process'

const articlePath = /^(content\/posts(?:-en)?\/[a-zA-Z0-9][a-zA-Z0-9_-]*)\.mdx?$/u
const articleDirectories = [':(top)content/posts', ':(top)content/posts-en']

function gitFields(output: string): string[] {
  if (!output) return []
  if (!output.endsWith('\0')) throw new Error('Git 檔案清單格式不正確。')
  return output.slice(0, -1).split('\0')
}

/** Read NUL-delimited paths produced by Git with rename detection disabled. */
export function changedArticlePaths(nameStatus: string, untracked = '', includeRemovals = false): string[] {
  const fields = gitFields(nameStatus)
  if (fields.length % 2 !== 0) throw new Error('Git 變更清單缺少狀態或檔名。')
  const files = gitFields(untracked)

  for (let index = 0; index < fields.length; index += 2) {
    const [status, file] = [fields[index], fields[index + 1]]
    if (!/^[ADMTUXB]$/u.test(status) || !file) throw new Error('Git 變更清單含有無效狀態或檔名。')
    if (includeRemovals || status === 'A' || status === 'M' || status === 'T') files.push(file)
  }

  return [...new Set(files.filter((file) => articlePath.test(file)))].sort()
}

export function listChangedArticleFiles(base: string, head?: string, cwd?: string, include?: string[]): string[] {
  const git = (args: string[]) => execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  function commit(ref: string) {
    try {
      return git(['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]).trim()
    } catch (error) {
      throw new Error(`無法確認文章連結檢查的 Git 提交 ${ref}。`, { cause: error })
    }
  }

  function diff(commits: string[], filter: string) {
    return git(['diff', '--no-ext-diff', '--no-relative', '--name-status', '--no-renames', `--diff-filter=${filter}`, '-z', ...commits, '--', ...articleDirectories])
  }

  const includes = new Set(include)
  for (const path of includes) {
    if (!articlePath.test(path)) throw new Error(`--include 需要 content/posts 或 content/posts-en 下的文章檔案路徑：${path}`)
  }

  const baseCommit = commit(base)
  if (head !== undefined) {
    const outgoing = changedArticlePaths(diff([baseCommit, commit(head)], 'AMT'))
    return include === undefined ? outgoing : outgoing.filter((file) => includes.has(file))
  }

  const untracked = git(['ls-files', '--full-name', '--others', '--exclude-standard', '-z', '--', ...articleDirectories])
  const working = changedArticlePaths(diff([baseCommit], 'AMT'), untracked)
  if (include === undefined) return working

  const headCommit = commit('HEAD')
  const committed = changedArticlePaths(diff([baseCommit, headCommit], 'AMT'))
  // The publisher pushes existing local commits and creates a commit limited to the included paths.
  const selected = [
    ...committed.filter((file) => !includes.has(file)),
    ...working.filter((file) => includes.has(file)),
  ]
  const stem = (file: string) => file.replace(/\.mdx?$/u, '')
  const selectedStems = new Set(selected.map(stem))
  // A local edit or an alternate extension could cause the build to render different content.
  const localOnly = changedArticlePaths(diff([headCommit], 'ADMTUXB'), untracked, true)
    .filter((file) => !includes.has(file) && selectedStems.has(stem(file)))
  if (localOnly.length) {
    throw new Error(`以下文章檔案的本機內容與本次發布版本不同：${localOnly.join('、')}`)
  }
  return selected.sort()
}
