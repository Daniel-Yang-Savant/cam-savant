import RetryButton from '@/components/RetryButton'

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
        <svg
          width="30" height="30" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-neutral-400 dark:text-neutral-500"
        >
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
      </div>
      <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        目前沒有網路連線
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
        請檢查網路連線後再試。曾瀏覽過的文章頁面仍可離線查看。
      </p>
      <RetryButton />
    </div>
  )
}
