'use client'

import { useState } from 'react'
import { useLang } from '@/lib/i18n'

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
  const { t } = useLang()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!question.trim()) {
      setError(t('errorContent'))
      return
    }
    if (!contact.trim()) {
      setError(t('errorContact'))
      return
    }

    setLoading(true)

    const body = new URLSearchParams()
    body.append('entry.2059990981', name.trim())
    body.append('entry.1851838457', question.trim())
    body.append('entry.1305016048', contact.trim())

    try {
      // Google Forms doesn't support CORS; use no-cors (opaque response)
      await fetch(FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      setSubmitted(true)
    } catch {
      setError(t('errorNetwork'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="ConsultForm mt-12 rounded-2xl bg-[#f5f0e8] dark:bg-neutral-800 px-8 py-10 text-center">
        <div className="mb-3 text-2xl">✓</div>
        <p className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
          {t('consultSuccess')}
        </p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {t('consultSuccessNote')}
        </p>
      </div>
    )
  }

  return (
    <div className="ConsultForm mt-12 rounded-2xl bg-[#f5f0e8] dark:bg-neutral-800 px-8 py-10">
      {/* Title */}
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
        {t('consultTitle')}
      </h2>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {t('consultDesc')}
      </p>

      {articleTitle && (
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          {t('consultRef')}{articleTitle}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {/* Name (optional) */}
        <div>
          <label
            htmlFor="consult-name"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            {t('consultName')}
            <span className="ml-1 text-xs text-neutral-400">
              {t('consultNameOptional')}
            </span>
          </label>
          <input
            id="consult-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('consultNamePlaceholder')}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition"
          />
        </div>

        {/* Question (required) */}
        <div>
          <label
            htmlFor="consult-question"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            {t('consultContent')}
            <span className="ml-1 text-xs text-red-400">
              {t('consultRequired')}
            </span>
          </label>
          <textarea
            id="consult-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('consultContentPlaceholder')}
            rows={4}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition resize-none"
          />
        </div>

        {/* Contact (required) */}
        <div>
          <label
            htmlFor="consult-contact"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            {t('consultContact')}
            <span className="ml-1 text-xs text-red-400">
              {t('consultRequired')}
            </span>
          </label>
          <input
            id="consult-contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('consultContactPlaceholder')}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition"
          />
        </div>

        {/* Error message */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-neutral-900 dark:bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('consultSubmitting') : t('consultSubmit')}
        </button>

        {/* Disclaimer */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed text-center pt-1">
          {t('disclaimer')}
        </p>
      </form>
    </div>
  )
}
