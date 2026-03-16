'use client'

import { useState } from 'react'

interface Props {
  articleTitle?: string
}

const FORM_ACTION =
  'https://docs.google.com/forms/u/0/d/e/1FAIpQLSce2gBT1hksmK27GyvqwCkngUJ1wdQJNLcO2zxCTjGGl0mcCw/formResponse'

export default function ConsultForm({ articleTitle }: Props) {
  const [name, setName] = useState('')
  const [question, setQuestion] = useState('')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!question.trim()) {
      setError('請填寫您想了解的內容。')
      return
    }
    if (!contact.trim()) {
      setError('請填寫聯絡方式（電話或 Email）。')
      return
    }

    setLoading(true)

    const body = new URLSearchParams()
    body.append('entry.2059990981', name.trim())
    body.append('entry.1851838457', question.trim())
    body.append('entry.1305016048', contact.trim())

    try {
      // Google Forms 不支援 CORS，使用 no-cors 模式送出
      await fetch(FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      setSubmitted(true)
    } catch {
      // no-cors 模式下 fetch 不會拋出錯誤（opaque response），
      // 若真的發生網路錯誤才會到此處
      setError('送出失敗，請稍後再試或直接致電診所。')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="mt-12 rounded-2xl bg-[#f5f0e8] px-8 py-10 text-center">
        <div className="mb-3 text-2xl">✓</div>
        <p className="text-base font-semibold text-neutral-800">
          感謝您的留言，我們將盡快回覆。
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          醫療團隊將於門診時間內透過您留下的聯絡方式與您聯繫。
        </p>
      </div>
    )
  }

  return (
    <div className="mt-12 rounded-2xl bg-[#f5f0e8] px-8 py-10">
      {/* 標題 */}
      <h2 className="text-xl font-bold text-neutral-900">有問題想諮詢？</h2>
      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
        歡迎留下您想了解的復健或醫療相關問題，醫療團隊將於門診時間內回覆。
      </p>

      {articleTitle && (
        <p className="mt-1 text-xs text-neutral-400">
          參考文章：{articleTitle}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {/* 姓名（選填） */}
        <div>
          <label
            htmlFor="consult-name"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            姓名
            <span className="ml-1 text-xs text-neutral-400">（選填）</span>
          </label>
          <input
            id="consult-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="您的稱呼"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition"
          />
        </div>

        {/* 想了解的內容（必填） */}
        <div>
          <label
            htmlFor="consult-question"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            想了解的內容
            <span className="ml-1 text-xs text-red-400">（必填）</span>
          </label>
          <textarea
            id="consult-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="請描述您的症狀、疑問或想了解的復健主題…"
            rows={4}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition resize-none"
          />
        </div>

        {/* 聯絡方式（必填） */}
        <div>
          <label
            htmlFor="consult-contact"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            聯絡方式（電話或 Email）
            <span className="ml-1 text-xs text-red-400">（必填）</span>
          </label>
          <input
            id="consult-contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="0912-345-678 或 example@email.com"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition"
          />
        </div>

        {/* 錯誤提示 */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* 送出按鈕 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '送出中…' : '送出諮詢'}
        </button>

        {/* 免責聲明 */}
        <p className="text-xs text-neutral-400 leading-relaxed text-center pt-1">
          本表單僅供衛教諮詢，不構成個別診療建議。
        </p>
      </form>
    </div>
  )
}
