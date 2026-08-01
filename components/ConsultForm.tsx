'use client'

import Link from 'next/link'
import { useState } from 'react'
import { translations, type Lang } from '@/lib/i18n'

interface Props {
  articleTitle?: string
  locale?: Lang
}

export default function ConsultForm({ articleTitle, locale = 'zh' }: Props) {
  const [name, setName] = useState('')
  const [question, setQuestion] = useState('')
  const [contact, setContact] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const t = (key: keyof typeof translations.zh) => translations[locale][key]

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
    if (!privacyAccepted) {
      setError(t('errorPrivacy'))
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          question: question.trim(),
          contact: contact.trim(),
          articleTitle,
          sourcePath: `${window.location.pathname}${window.location.search}`,
        }),
      })

      if (!response.ok) throw new Error('Consult submission failed')
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
            maxLength={100}
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
            maxLength={3000}
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
            maxLength={200}
            placeholder={t('consultContactPlaceholder')}
            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition"
          />
        </div>

        {/* Privacy acknowledgement */}
        <label className="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-accent-700 focus:ring-accent-600"
          />
          <span>
            {t('consultPrivacyPrefix')}
            <Link
              href={locale === 'en' ? '/privacy' : '/privacy'}
              target="_blank"
              className="underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              {t('consultPrivacyLink')}
            </Link>
            {t('consultPrivacySuffix')}
          </span>
        </label>

        {/* Error message */}
        {error && <p className="text-sm text-red-500" role="alert" aria-live="polite">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent-700 dark:bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 dark:hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
