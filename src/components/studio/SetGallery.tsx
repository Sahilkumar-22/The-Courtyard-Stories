import { useEffect, useRef, useState } from 'react'
import type { StudioSet } from '@/types/studio'
import { Icon } from './Icon'
import { Lightbox } from './Lightbox'
import { SetArtwork, SetPhoto } from './SetPhoto'

interface SetGalleryProps {
  set: StudioSet
  /** 'panel' is the compact gallery in the explorer; 'page' is the full one on the set's page. */
  variant?: 'panel' | 'page'
}

/**
 * The set's real photographs: a large preview, a thumbnail strip, previous/next
 * navigation and a fullscreen viewer. When the studio has not yet supplied photographs
 * for a set, it says so rather than showing a substitute.
 */
export function SetGallery({ set, variant = 'panel' }: SetGalleryProps) {
  const photos = set.gallery
  const [index, setIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const strip = useRef<HTMLDivElement>(null)

  // A different set starts from its first photograph.
  useEffect(() => {
    setIndex(0)
    setViewerOpen(false)
  }, [set.id])

  // Keep the active thumbnail in view without scrolling the page.
  useEffect(() => {
    const container = strip.current
    const active = container?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!container || !active) return
    const target = active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2
    container.scrollTo({ left: target, behavior: 'smooth' })
  }, [index])

  if (photos.length === 0) {
    return (
      <div className={`set-gallery set-gallery--${variant} set-gallery--empty`}>
        <SetArtwork set={set} note={false} className="set-gallery__placeholder" />
        <p className="set-gallery__empty-note">
          Photographs of this set have not been added yet. You can still enquire about it.
        </p>
      </div>
    )
  }

  const photo = photos[Math.min(index, photos.length - 1)]
  const step = (direction: 1 | -1) => setIndex((current) => (current + direction + photos.length) % photos.length)
  const previewSizes = variant === 'page' ? '(max-width: 820px) 100vw, 70vw' : '(max-width: 820px) 100vw, 400px'

  return (
    <div className={`set-gallery set-gallery--${variant}`}>
      <div className="set-gallery__preview">
        <button
          type="button"
          className="set-gallery__open"
          onClick={() => setViewerOpen(true)}
          aria-label={`View photograph ${index + 1} of ${photos.length} fullscreen`}
        >
          <SetPhoto key={photo.id} photo={photo} sizes={previewSizes} className="set-gallery__image" eager={variant === 'page' && index === 0} />
          <span className="set-gallery__expand" aria-hidden="true">
            <Icon name="expand" size={16} />
          </span>
        </button>
        {photos.length > 1 && (
          <div className="set-gallery__steps">
            <button type="button" className="icon-button icon-button--glass" onClick={() => step(-1)} aria-label="Previous photograph">
              <Icon name="arrow-left" />
            </button>
            <span className="set-gallery__count" aria-live="polite">
              {index + 1} / {photos.length}
            </span>
            <button type="button" className="icon-button icon-button--glass" onClick={() => step(1)} aria-label="Next photograph">
              <Icon name="arrow-right" />
            </button>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="set-gallery__strip" ref={strip} role="group" aria-label={`${set.name} photographs`}>
          {photos.map((thumbnail, position) => (
            <button
              key={thumbnail.id}
              type="button"
              className="set-gallery__thumb"
              aria-current={position === index}
              aria-label={`Show photograph ${position + 1}`}
              onClick={() => setIndex(position)}
            >
              <SetPhoto photo={{ ...thumbnail, alt: '' }} sizes="96px" />
            </button>
          ))}
        </div>
      )}

      {viewerOpen && (
        <Lightbox photos={photos} index={index} title={set.name} onIndexChange={setIndex} onClose={() => setViewerOpen(false)} />
      )}
    </div>
  )
}
