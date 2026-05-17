'use client'

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-6 px-5 py-2 text-sm font-medium rounded-lg bg-neutral-950 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
    >
      重試
    </button>
  )
}
