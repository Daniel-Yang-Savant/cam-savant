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
      <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
        <span className="text-sm text-neutral-400 tracking-widest uppercase">
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
