import Image from 'next/image'
import Link from 'next/link'

const PREVIEWS = [
  {
    src: '/images/exercise-guides/relaxation/neck-cover.webp',
    alt: '穿著居家運動服示範頸部舒展',
    label: '頸部',
  },
  {
    src: '/images/exercise-guides/relaxation/hips-cover.webp',
    alt: '穿著健身服示範髖臀伸展',
    label: '髖臀',
  },
  {
    src: '/images/exercise-guides/relaxation/calves-cover.webp',
    alt: '穿著運動服示範小腿與足踝活動',
    label: '小腿與足踝',
  },
]

export default function ExerciseGuidesPromo() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-950 text-white dark:border-neutral-800" aria-labelledby="exercise-guides-promo-title">
      <Link
        href="/exercise-guides"
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-300"
      >
        <div className="max-w-7xl mx-auto grid gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:py-14 lg:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-teal-300">Daily Movement · Visual Guides</p>
            <h2 id="exercise-guides-promo-title" className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              圖解運動專區
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-300">
              從想放鬆的部位開始，跟著圖解輕輕活動。也能依症狀或已確認的診斷，查找適合了解的運動方向。
            </p>
            <span className="mt-7 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-neutral-950 transition-transform group-hover:translate-x-1">
              進入圖解運動專區 →
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/15 bg-white/5 p-2 sm:gap-3 sm:p-3">
            {PREVIEWS.map((preview) => (
              <div key={preview.src} className="overflow-hidden rounded-2xl bg-white/5">
                <div className="relative aspect-[4/3] bg-neutral-100">
                  <Image
                    src={preview.src}
                    alt={preview.alt}
                    fill
                    sizes="(max-width: 768px) 33vw, 18vw"
                    className="object-contain"
                  />
                </div>
                <p className="px-2 py-3 text-center text-xs font-semibold text-neutral-200 sm:text-sm">{preview.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </section>
  )
}
