export default function ArticleLoading() {
  return (
    <>
      {/* Cover image skeleton */}
      <div className="skeleton w-full aspect-[21/9] max-h-[520px]" />

      {/* Two-column layout skeleton */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex gap-12">
        <article className="flex-1 min-w-0 space-y-4">
          {/* Breadcrumb */}
          <div className="skeleton h-3 w-32 mb-6" />

          {/* Header */}
          <div className="skeleton h-2.5 w-16" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-4 w-full mt-4" />
          <div className="skeleton h-4 w-2/3" />

          <div className="border-t border-neutral-100 dark:border-neutral-800 mt-6 pt-6 flex items-center gap-4">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>

          {/* Content body */}
          <div className="mt-12 space-y-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="skeleton h-4"
                style={{ width: `${70 + Math.random() * 30}%` }}
              />
            ))}
            <div className="skeleton h-6 w-48 mt-8" />
            {[...Array(8)].map((_, i) => (
              <div
                key={`b-${i}`}
                className="skeleton h-4"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        </article>

        {/* TOC sidebar skeleton */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-3">
            <div className="skeleton h-3 w-12 mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-3" style={{ width: `${50 + Math.random() * 50}%` }} />
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}
