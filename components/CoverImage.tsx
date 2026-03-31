'use client'

import Image from 'next/image'
import { useState } from 'react'

interface CoverImageProps {
  src: string
  alt: string
  categoryLabel: string
  priority?: boolean
  /** Tailwind classes appended to the Image (e.g. transition / hover scale) */
  imageClassName?: string
  /**
   * Passed to <Image sizes> so Next.js generates correct srcset for
   * the given layout context. Defaults to a sensible 3-column grid value.
   */
  sizes?: string
}

export default function CoverImage({
  src,
  alt,
  categoryLabel,
  priority = false,
  imageClassName = 'object-cover transition-transform duration-500 group-hover:scale-105',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: CoverImageProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-accent-900 flex flex-col items-center justify-center gap-3">
        <svg
          className="w-10 h-10 text-neutral-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
          />
        </svg>
        <span className="text-xs text-neutral-400 tracking-widest uppercase font-medium">
          {categoryLabel}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={imageClassName}
      onError={() => setErrored(true)}
    />
  )
}
