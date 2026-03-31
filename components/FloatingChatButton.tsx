'use client'

export default function FloatingChatButton() {
  return (
    <a
      href="https://docs.google.com/forms/d/e/1FAIpQLSce2gBT1hksmK27GyvqwCkngUJ1wdQJNLcO2zxCTjGGl0mcCw/viewform?usp=header"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-accent-700 dark:bg-accent-500 text-white dark:text-neutral-950 text-sm font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-accent-600 dark:hover:bg-accent-400 hover:scale-105 transition-all duration-200"
      aria-label="開啟醫療諮詢表單"
    >
      💬 諮詢提問
    </a>
  )
}
