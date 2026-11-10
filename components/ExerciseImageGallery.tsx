'use client'

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'

interface GalleryImage {
  src: string
  alt: string
  caption: string
  detail?: string
  instruction?: string
  paired?: boolean
}

interface Props {
  images: GalleryImage[]
  children: ReactNode
  as?: 'div' | 'ol'
  className?: string
  'aria-label'?: string
}

const controlClass = 'min-h-11 rounded-full border border-neutral-600 px-3 text-sm font-semibold text-white hover:bg-neutral-800 aria-disabled:text-neutral-400 aria-disabled:hover:bg-transparent'

export default function ExerciseImageGallery({ images, children, as: Tag = 'div', className, 'aria-label': label }: Props) {
  const [index, setIndex] = useState<number | null>(null)
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [zoomSize, setZoomSize] = useState<{ width: number; height: number } | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLAnchorElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const photo = useRef<HTMLImageElement>(null)
  const gesture = useRef<{ id: number; x: number; y: number; left: number; top: number } | null>(null)
  const pressedBackdrop = useRef(false)
  const titleId = useId()
  const image = index === null ? undefined : images[index]
  const isOpen = image !== undefined

  useLayoutEffect(() => {
    if (isOpen && !dialog.current?.open) dialog.current?.showModal()
  }, [isOpen])

  useLayoutEffect(() => {
    const area = viewport.current
    if (!zoomSize || !area) return
    area.scrollLeft = image?.paired ? 0 : (area.scrollWidth - area.clientWidth) / 2
    area.scrollTop = (area.scrollHeight - area.clientHeight) / 2
  }, [image?.paired, zoomSize])

  function selectImage(nextIndex: number) {
    gesture.current = null
    setImageStatus('loading')
    setZoomSize(null)
    setIndex(nextIndex)
  }

  function move(direction: number) {
    if (index === null) return
    const nextIndex = index + direction
    if (nextIndex >= 0 && nextIndex < images.length) selectImage(nextIndex)
  }

  function openImage(event: MouseEvent<HTMLElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!(event.target instanceof Element) || typeof dialog.current?.showModal !== 'function') return
    const link = event.target.closest<HTMLAnchorElement>('a[data-gallery-index]')
    if (!link || !event.currentTarget.contains(link)) return
    const nextIndex = Number(link.dataset.galleryIndex)
    if (!images[nextIndex]) return

    event.preventDefault()
    trigger.current = link
    selectImage(nextIndex)
  }

  function closeImage() {
    setIndex(null)
    trigger.current?.focus({ preventScroll: true })
    trigger.current = null
  }

  function toggleZoom() {
    if (imageStatus !== 'loaded') return
    const bounds = photo.current?.getBoundingClientRect()
    if (bounds?.width && bounds.height) {
      setZoomSize(zoomSize ? null : { width: bounds.width * 2, height: bounds.height * 2 })
    }
  }

  function handleKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (images.length < 2 || (zoomSize && event.target === viewport.current)) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    move(event.key === 'ArrowLeft' ? -1 : 1)
  }

  function startGesture(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) {
      gesture.current = null
      return
    }
    const area = event.currentTarget
    const drag = zoomSize && event.pointerType === 'mouse' && event.button === 0 && event.target === photo.current
    const swipe = !zoomSize && event.pointerType === 'touch' && images.length > 1
    if (!drag && !swipe) return

    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: area.scrollLeft, top: area.scrollTop }
    if (drag) area.setPointerCapture(event.pointerId)
  }

  function dragImage(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current
    if (!zoomSize || start?.id !== event.pointerId) return
    event.currentTarget.scrollLeft = start.left - (event.clientX - start.x)
    event.currentTarget.scrollTop = start.top - (event.clientY - start.y)
  }

  function endGesture(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current
    if (start?.id !== event.pointerId) return
    gesture.current = null
    if (zoomSize) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1)
  }

  return (
    <>
      <Tag className={className} aria-label={label} onClick={openImage}>{children}</Tag>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClose={closeImage}
        onKeyDown={handleKeys}
        onPointerDown={(event) => { pressedBackdrop.current = event.target === event.currentTarget }}
        onClick={(event) => {
          if (pressedBackdrop.current && event.target === event.currentTarget) event.currentTarget.close()
          pressedBackdrop.current = false
        }}
        className="ExerciseImageGalleryDialog ExerciseGuidePrintHide m-auto h-[min(94dvh,960px)] max-h-none w-[min(96vw,1200px)] max-w-none overflow-auto overscroll-contain rounded-2xl border border-neutral-700 bg-neutral-950 text-white shadow-2xl backdrop:bg-black/80"
      >
        {image && (
          <div className="grid h-full grid-rows-[auto_minmax(7rem,1fr)_auto]">
            <header className="flex items-center justify-between gap-3 px-3 py-2 sm:px-4">
              <h2 id={titleId} className="text-base font-bold">圖解檢視</h2>
              <button type="button" onClick={() => dialog.current?.close()} className={controlClass}>關閉</button>
            </header>

            <div
              ref={viewport}
              tabIndex={zoomSize ? 0 : undefined}
              aria-label={zoomSize ? '已放大圖解，可捲動查看' : undefined}
              role={zoomSize ? 'region' : undefined}
              onPointerDown={startGesture}
              onPointerMove={dragImage}
              onPointerUp={endGesture}
              onPointerCancel={() => { gesture.current = null }}
              className={`bg-black select-none ${zoomSize ? 'overflow-auto overscroll-contain' : 'overflow-hidden [touch-action:pan-y_pinch-zoom]'}`}
            >
              <div className="relative h-full min-h-full w-full min-w-full" style={zoomSize ?? undefined}>
                {imageStatus === 'error' ? (
                  <p role="status" className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-neutral-300">圖片無法載入</p>
                ) : (
                  // The viewer mounts only the selected original so small thumbnails can keep their own sizes.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={index}
                    ref={photo}
                    src={image.src}
                    alt={image.alt}
                    draggable={false}
                    onLoad={() => setImageStatus('loaded')}
                    onError={() => setImageStatus('error')}
                    className={`absolute inset-0 m-auto block h-auto w-auto max-h-full max-w-full ${zoomSize ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    style={zoomSize ?? undefined}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2 px-3 py-2 sm:px-4">
              <div aria-live="polite" aria-atomic="true" className="space-y-1 text-sm leading-5">
                <p className="font-semibold">
                  {images.length > 1 && <span className="mr-2 tabular-nums text-neutral-300">{(index ?? 0) + 1} / {images.length}</span>}
                  {image.caption}
                </p>
                {image.detail && <p className="font-semibold text-amber-200">{image.detail}</p>}
                {image.instruction && <p className="text-neutral-200">{image.instruction}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {images.length > 1 && (
                  <>
                    <button type="button" aria-disabled={index === 0} onClick={() => move(-1)} className={controlClass}>上一張</button>
                    <button type="button" aria-disabled={index === images.length - 1} onClick={() => move(1)} className={controlClass}>下一張</button>
                  </>
                )}
                <button type="button" aria-disabled={imageStatus !== 'loaded'} onClick={toggleZoom} className={controlClass}>
                  {zoomSize ? '還原大小' : '放大 2 倍'}
                </button>
                {(zoomSize || images.length > 1) && (
                  <p className="hidden text-xs text-neutral-300 [@media(pointer:coarse)]:block">
                    {zoomSize ? '拖動查看細節' : '左右滑動換圖'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
