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
}

export default function CoverImage({
  src,
  alt,
  categoryLabel,
  priority = false,
  imageClassName = 'object-cover transition-transform duration-500 group-hover:scale-105',
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
      className={imageClassName}
      onError={() => setErrored(true)}
    />
  )
}
