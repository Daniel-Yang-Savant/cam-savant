import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { changedArticlePaths, listChangedArticleFiles } from './changed-articles'

const nul = (...fields: string[]) => [...fields, ''].join('\0')

test('selects each newly added or edited article path once', () => {
  const tracked = nul(
    'M', 'content/posts/z-edited.mdx',
    'A', 'content/posts/z-edited.md',
    'A', 'content/posts/A_new.mdx',
    'T', 'content/posts/type-changed.mdx',
    'D', 'content/posts/deleted.mdx',
    'M', 'content/posts-en/translated.mdx',
    'M', 'content/posts/archive/nested.mdx',
    'M', 'content/posts/unsafe\nname.mdx',
    'M', 'content/posts/encoded%2Fname.mdx',
    'M', 'content/posts/.hidden.mdx',
    'M', 'content/posts/not-article.txt',
    'M', 'README.md',
  )
  const untracked = nul('content/posts/new.mdx', 'content/posts/z-edited.mdx', 'drafts/ready/new.mdx')
  assert.deepEqual(changedArticlePaths(tracked, untracked), [
    'content/posts-en/translated.mdx',
    'content/posts/A_new.mdx',
    'content/posts/new.mdx',
    'content/posts/type-changed.mdx',
    'content/posts/z-edited.md',
    'content/posts/z-edited.mdx',
  ])
})

test('uses final working files locally and only the selected commits for a release', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'cam-savant-link-changes-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  const git = (...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
  function save(file: string, contents = 'article\n') {
    writeFileSync(join(cwd, file), contents)
  }

  git('init', '-q')
  git('config', 'user.name', 'Link audit test')
  git('config', 'user.email', 'audit@example.test')
  git('config', 'commit.gpgSign', 'false')
  mkdirSync(join(cwd, 'content/posts'), { recursive: true })
  save('.gitignore', 'content/posts/ignored.mdx\n')
  save('content/posts/deleted.mdx')
  save('content/posts/unstaged.mdx')
  git('add', '.')
  git('commit', '-qm', 'Base')
  const base = git('rev-parse', 'HEAD')

  save('content/posts/committed.mdx')
  git('add', '.')
  git('commit', '-qm', 'Committed article')
  save('content/posts/staged.mdx')
  git('add', 'content/posts/staged.mdx')
  save('content/posts/unstaged.mdx', 'new wording\n')
  save('content/posts/untracked.md')
  save('content/posts/ignored.mdx')
  rmSync(join(cwd, 'content/posts/deleted.mdx'))

  const local = ['content/posts/staged.mdx', 'content/posts/unstaged.mdx', 'content/posts/untracked.md']
  const committed = 'content/posts/committed.mdx'
  assert.deepEqual(listChangedArticleFiles('HEAD', undefined, cwd), local)
  assert.deepEqual(listChangedArticleFiles(base, undefined, cwd), [committed, ...local])
  assert.deepEqual(listChangedArticleFiles(base, 'HEAD', cwd), [committed])
  assert.deepEqual(listChangedArticleFiles('HEAD', undefined, join(cwd, 'content')), local)
  assert.throws(() => listChangedArticleFiles('--invalid-ref', 'HEAD', cwd), /無法確認/u)

  const include = ['content/posts/untracked.md']
  assert.deepEqual(listChangedArticleFiles(base, undefined, cwd, include), [committed, ...include])
  assert.throws(() => listChangedArticleFiles(base, undefined, cwd, ['content/posts/../elsewhere.mdx']), /--include/u)
  mkdirSync(join(cwd, 'content/posts-en'))
  save('content/posts-en/committed.mdx')
  assert.deepEqual(listChangedArticleFiles(base, undefined, cwd, include), [committed, ...include])
  save('content/posts/committed.md')
  assert.throws(() => listChangedArticleFiles(base, undefined, cwd, include), /committed\.md/u)
  rmSync(join(cwd, 'content/posts/committed.md'))
  save(committed, 'dirty content for already committed article\n')
  assert.throws(() => listChangedArticleFiles(base, undefined, cwd, include), /committed\.mdx/u)
  assert.deepEqual(listChangedArticleFiles(base, undefined, cwd, [committed, ...include]), [committed, ...include])
  rmSync(join(cwd, committed))
  assert.throws(() => listChangedArticleFiles(base, undefined, cwd, include), /committed\.mdx/u)
})

test('does not silently pass malformed Git output', () => {
  assert.deepEqual(changedArticlePaths(''), [])
  assert.throws(() => changedArticlePaths('M\0content/posts/edited.mdx'), /格式不正確/u)
  assert.throws(() => changedArticlePaths(nul('M')), /缺少/u)
  assert.throws(() => changedArticlePaths(nul('M', '')), /無效/u)
})
