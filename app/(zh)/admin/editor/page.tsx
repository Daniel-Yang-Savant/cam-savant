'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

interface ArticleMeta {
  slug: string
  filename: string
  title: string
  date: string
  category: string
  draft: boolean
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ── Simple Markdown → HTML renderer (no deps) ──────────────────────────────

function renderMarkdown(raw: string): string {
  // Strip frontmatter for preview
  const withoutFm = raw.replace(/^---[\s\S]*?---\n?/, '')

  const html = withoutFm
    // Code blocks (before inline code)
    .replace(
      /```[\w]*\n?([\s\S]*?)```/g,
      '<pre class="bg-neutral-100 dark:bg-neutral-800 rounded p-3 text-xs overflow-x-auto my-3"><code>$1</code></pre>'
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-neutral-100 dark:bg-neutral-800 px-1 rounded text-sm font-mono">$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-5 mb-1.5 text-neutral-800 dark:text-neutral-100">$1</h3>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-7 mb-2 text-neutral-900 dark:text-neutral-50 border-b border-neutral-200 dark:border-neutral-700 pb-1">$1</h2>')
    // H1
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-3 text-neutral-950 dark:text-white">$1</h1>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic text-neutral-500 dark:text-neutral-400 my-3">$1</blockquote>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="list-disc ml-5 my-0.5">$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="list-decimal ml-5 my-0.5">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-6 border-neutral-200 dark:border-neutral-700"/>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline">$1</a>')
    // Paragraphs (double newline)
    .replace(/\n\n(?!<)/g, '</p><p class="my-3 leading-relaxed">')

  return `<div class="text-sm text-neutral-700 dark:text-neutral-300"><p class="my-3 leading-relaxed">${html}</p></div>`
}

// ── Category label map ─────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  'sports-medicine': '運動醫學',
  'weekly-picks': '每週論文精選',
  'rehabilitation-medicine': '復健醫學',
  'functional-medicine': '功能醫學',
  'fsm': 'FSM',
  'perioperative-rehab': '術後復健',
}

// ── Main Editor component ──────────────────────────────────────────────────

export default function AdminEditorPage() {
  const [articles, setArticles] = useState<ArticleMeta[]>([])
  const [search, setSearch] = useState('')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Fetch article list ──
  useEffect(() => {
    fetch('/api/admin/articles')
      .then((r) => r.json())
      .then(setArticles)
      .catch(console.error)
  }, [])

  // ── Select article ──
  const selectArticle = useCallback(async (slug: string) => {
    if (content !== originalContent) {
      const ok = confirm('目前有未儲存的變更，確定要切換文章嗎？')
      if (!ok) return
    }
    setLoading(true)
    setSelectedSlug(slug)
    setTab('edit')
    setSaveStatus('idle')
    try {
      const res = await fetch(`/api/admin/articles/${slug}`)
      const data = await res.json()
      setContent(data.content)
      setOriginalContent(data.content)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [content, originalContent])

  // ── Save ──
  const save = useCallback(async () => {
    if (!selectedSlug) return
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/admin/articles/${selectedSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Save failed')
      setOriginalContent(content)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [selectedSlug, content])

  // ── Keyboard shortcut: Cmd/Ctrl + S ──
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [save])

  const isDirty = content !== originalContent
  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase()) ||
      CATEGORY_LABELS[a.category]?.includes(search)
  )

  return (
    <div className="flex h-[calc(100vh-64px)] bg-neutral-50 dark:bg-neutral-950 overflow-hidden">

      {/* ── Left sidebar: article list ── */}
      <aside className="w-72 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            文章編輯器
          </h1>
          <input
            type="search"
            placeholder="搜尋標題、slug 或分類…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500"
          />
        </div>

        {/* Article list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-xs text-neutral-400 dark:text-neutral-600 text-center">
              {search ? '找不到符合的文章' : '載入中…'}
            </p>
          ) : (
            filtered.map((article) => (
              <button
                key={article.slug}
                onClick={() => selectArticle(article.slug)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 transition-colors ${
                  selectedSlug === article.slug
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium leading-snug line-clamp-2 flex-1">
                    {article.title}
                  </span>
                  {article.draft && (
                    <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
                      草稿
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`text-[10px] ${
                      selectedSlug === article.slug
                        ? 'text-neutral-400 dark:text-neutral-600'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {CATEGORY_LABELS[article.category] ?? article.category}
                  </span>
                  <span className={`text-[10px] ${selectedSlug === article.slug ? 'text-neutral-400 dark:text-neutral-600' : 'text-neutral-300 dark:text-neutral-700'}`}>·</span>
                  <span
                    className={`text-[10px] font-mono ${
                      selectedSlug === article.slug
                        ? 'text-neutral-400 dark:text-neutral-600'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {article.date}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-[10px] text-neutral-400 dark:text-neutral-600">
            共 {articles.length} 篇文章
          </p>
        </div>
      </aside>

      {/* ── Main editor area ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedSlug ? (
          <>
            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Edit / Preview tabs */}
                <div className="flex rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 text-xs">
                  <button
                    onClick={() => setTab('edit')}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      tab === 'edit'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                        : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => setTab('preview')}
                    className={`px-3 py-1.5 font-medium transition-colors border-l border-neutral-200 dark:border-neutral-700 ${
                      tab === 'preview'
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                        : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    預覽
                  </button>
                </div>

                {/* File name */}
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-600">
                  {selectedSlug}.mdx
                </span>

                {/* Dirty indicator */}
                {isDirty && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
                    未儲存
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Save status */}
                {saveStatus === 'saved' && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ 已儲存
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-xs text-red-500 font-medium">
                    儲存失敗
                  </span>
                )}

                {/* External preview link */}
                <a
                  href={`/posts/${selectedSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  在網站查看 ↗
                </a>

                {/* Save button */}
                <button
                  onClick={save}
                  disabled={saveStatus === 'saving' || !isDirty}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {saveStatus === 'saving' ? '儲存中…' : '儲存'}
                </button>
              </div>
            </div>

            {/* ── Editor / Preview ── */}
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-sm text-neutral-400 dark:text-neutral-600">載入中…</div>
                </div>
              ) : tab === 'edit' ? (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  spellCheck={false}
                  className="w-full h-full px-6 py-5 font-mono text-sm text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 resize-none focus:outline-none leading-relaxed"
                  placeholder="MDX 內容會顯示在此…"
                />
              ) : (
                <div className="h-full overflow-y-auto">
                  <div
                    className="max-w-3xl mx-auto px-8 py-8 prose prose-neutral dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Empty state ── */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 dark:text-neutral-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              選擇一篇文章開始編輯
            </h2>
            <p className="text-sm text-neutral-400 dark:text-neutral-600 max-w-sm">
              從左側列表點選文章，即可在此編輯 MDX 原始內容，並切換「預覽」查看渲染結果。
            </p>
            <p className="mt-3 text-xs text-neutral-300 dark:text-neutral-700 font-mono">
              ⌘S 快速儲存
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
