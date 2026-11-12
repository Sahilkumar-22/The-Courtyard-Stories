import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { StudioPhoto } from '@/types/studio'
import { Icon } from './Icon'
import { SetPhoto } from './SetPhoto'

interface LightboxProps {
  photos: StudioPhoto[]
  index: number
  title: string
  onIndexChange: (index: number) => void
  onClose: () => void
}

/** Fullscreen photograph viewer with keyboard, button and swipe navigation. */
export function Lightbox({ photos, index, title, onIndexChange, onClose }: LightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const swipeStart = useRef<number | null>(null)
  const count = photos.length
  const photo = photos[index]

  const step = useCallback(
    (direction: 1 | -1) => onIndexChange((index + direction + count) % count),
    [index, count, onIndexChange],
  )

  // A native modal dialog traps focus, closes on Escape and returns focus when closed.
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (!element.open) element.showModal()
    return () => {
      if (element.open) element.close()
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  if (!photo) return null

  return createPortal(
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={`${title} photographs`}
      // The close event arrives a moment after close() is called. If the dialog has been
      // shown again by then (React remounts effects in development), it is stale: ignore it.
      onClose={(event) => {
        if (!event.currentTarget.open) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="lightbox__stage"
        onPointerDown={(event) => {
          swipeStart.current = event.clientX
        }}
        onPointerUp={(event) => {
          if (swipeStart.current === null || count < 2) return
          const travel = event.clientX - swipeStart.current
          swipeStart.current = null
          if (Math.abs(travel) > 60) step(travel < 0 ? 1 : -1)
        }}
      >
        <SetPhoto key={photo.id} photo={photo} sizes="100vw" className="lightbox__image" eager />
      </div>
      <div className="lightbox__bar">
        <p className="lightbox__caption">
          <span>{title}</span>
          <span aria-live="polite">
            {index + 1} / {count}
          </span>
        </p>
        <button type="button" className="icon-button icon-button--light" onClick={onClose} aria-label="Close photograph viewer">
          <Icon name="close" />
        </button>
      </div>
      {count > 1 && (
        <>
          <button type="button" className="lightbox__step lightbox__step--previous icon-button icon-button--light" onClick={() => step(-1)} aria-label="Previous photograph">
            <Icon name="arrow-left" size={22} />
          </button>
          <button type="button" className="lightbox__step lightbox__step--next icon-button icon-button--light" onClick={() => step(1)} aria-label="Next photograph">
            <Icon name="arrow-right" size={22} />
          </button>
        </>
      )}
    </dialog>,
    document.body,
  )
}
