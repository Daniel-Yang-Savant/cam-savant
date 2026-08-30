import Image from 'next/image'
import Link from 'next/link'

const PREVIEWS = [
  {
    src: '/images/exercise-guides/neck-1-support.webp',
    alt: '前臂支撐並放鬆肩膀的圖解運動',
  },
  {
    src: '/images/exercise-guides/legs-3-march.webp',
    alt: '手扶穩定表面做原地踏步的圖解運動',
  },
  {
    src: '/images/exercise-guides/back-2-bird-dog.webp',
    alt: '鳥狗式軀幹訓練圖解',
  },
]

export default function ExerciseGuidesPromo() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-950 text-white dark:border-neutral-800" aria-labelledby="exercise-guides-promo-title">
      <Link href="/exercise-guides" className="group block">
        <div className="max-w-7xl mx-auto grid gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:py-14 lg:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-teal-300">New · Visual Guides</p>
            <h2 id="exercise-guides-promo-title" className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              圖解運動專區
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-300">
              先選放鬆部位，或依適應證進入 RCT 運動方案，再查看圖解、劑量與停止警訊。
            </p>
            <span className="mt-7 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-neutral-950 transition-transform group-hover:translate-x-1">
              進入圖解運動專區 →
            </span>
          </div>

          <div className="grid h-64 grid-cols-3 gap-2 overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 sm:h-72">
            {PREVIEWS.map((preview, index) => (
              <div key={preview.src} className={`relative overflow-hidden rounded-2xl ${index === 1 ? 'translate-y-5' : ''}`}>
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  fill
                  sizes="(max-width: 768px) 33vw, 18vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </div>
      </Link>
    </section>
  )
}
