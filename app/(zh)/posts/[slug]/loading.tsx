const BODY_WIDTHS = [84, 92, 76, 88, 95, 80, 90, 72, 86, 98, 78, 93]
const SECONDARY_WIDTHS = [74, 88, 65, 94, 79, 100, 70, 85]
const TOC_WIDTHS = [82, 68, 91, 75, 86]

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
            {BODY_WIDTHS.map((width, i) => (
              <div
                key={i}
                className="skeleton h-4"
                style={{ width: `${width}%` }}
              />
            ))}
            <div className="skeleton h-6 w-48 mt-8" />
            {SECONDARY_WIDTHS.map((width, i) => (
              <div
                key={`b-${i}`}
                className="skeleton h-4"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
        </article>

        {/* TOC sidebar skeleton */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-3">
            <div className="skeleton h-3 w-12 mb-4" />
            {TOC_WIDTHS.map((width, i) => (
              <div key={i} className="skeleton h-3" style={{ width: `${width}%` }} />
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}
