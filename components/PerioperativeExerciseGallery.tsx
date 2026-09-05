import Image from 'next/image'
import { getPerioperativeRehabExercises } from '@/lib/perioperative-rehab-exercises'

interface Props {
  slug: string
}

export default function PerioperativeExerciseGallery({ slug }: Props) {
  const exercises = getPerioperativeRehabExercises(slug)

  if (exercises.length === 0) return null

  return (
    <section
      aria-labelledby="exercise-gallery-title"
      className="not-prose my-10 border-y border-neutral-200 py-8 dark:border-neutral-700"
    >
      <div className="max-w-2xl">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
          居家動作參考
        </p>
        <h2
          id="exercise-gallery-title"
          className="mt-2 scroll-mt-24 text-xl font-bold text-neutral-950 dark:text-neutral-100"
        >
          動作示意圖：先確認你目前的復健階段
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          圖片用來幫助理解姿勢，不代表你現在就適合做。請先核對每張圖的適用階段，並以主刀醫師、傷口狀況、負重限制與治療師指示為準。
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {exercises.map((exercise, index) => (
          <figure
            key={exercise.src}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
              <Image
                src={exercise.src}
                alt={exercise.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                loading="eager"
                unoptimized
              />
            </div>
            <figcaption className="p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white dark:bg-teal-500 dark:text-neutral-950">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-neutral-100">
                    {exercise.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-amber-700 dark:text-amber-300">
                    適用：{exercise.stage}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {exercise.instruction}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800">
        若動作造成疼痛明顯增加、異常腫脹、傷口不適、頭暈、胸痛或喘不過氣，請立即停止，並依本文警示症狀處理。
      </p>
    </section>
  )
}
