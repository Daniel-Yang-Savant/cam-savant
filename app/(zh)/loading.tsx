export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative aspect-[16/9] skeleton order-2 md:order-1" />
            <div className="order-1 md:order-2 space-y-4">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-8 w-full" />
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-4 w-full mt-4" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-4 w-24 mt-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Body skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <section className="lg:col-span-2">
            <div className="skeleton h-3 w-20 mb-8" />
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
              {[1, 2, 3, 4].map((i) => (
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
          </section>
          <aside className="hidden lg:block lg:border-l lg:border-neutral-100 dark:lg:border-neutral-800 lg:pl-12">
            <div className="skeleton h-3 w-16 mb-4" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="py-4 border-b border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-2.5 w-24" />
              </div>
            ))}
          </aside>
        </div>
      </div>
    </>
  )
}
