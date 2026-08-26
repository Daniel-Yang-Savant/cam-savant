export default function PostsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Category tabs skeleton */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-8 w-20 rounded-sm" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton aspect-[16/9]" />
            <div className="skeleton h-2.5 w-16" />
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton h-2.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
