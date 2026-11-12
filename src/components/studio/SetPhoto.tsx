import type { CSSProperties } from 'react'
import type { StudioPhoto, StudioSet } from '@/types/studio'

interface SetPhotoProps {
  photo: StudioPhoto
  /** The CSS width the image is displayed at, so the browser picks the right file. */
  sizes: string
  className?: string
  eager?: boolean
}

/** A genuine studio photograph, served at the smallest size that looks sharp. */
export function SetPhoto({ photo, sizes, className, eager = false }: SetPhotoProps) {
  const largest = photo.variants[photo.variants.length - 1]
  return (
    <img
      className={className}
      src={largest.src}
      srcSet={photo.variants.map((variant) => `${variant.src} ${variant.width}w`).join(', ')}
      sizes={sizes}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

/**
 * Shown where a set has no photographs yet. It is deliberately abstract: an arch in the
 * set's accent colour, never an image that could be mistaken for the real backdrop.
 */
export function SetArtwork({ set, note = true, className = '' }: { set: StudioSet; note?: boolean; className?: string }) {
  return (
    <div
      className={`set-artwork ${className}`}
      style={{ '--accent': set.environment.accent } as CSSProperties}
      role="img"
      aria-label={`${set.name}. Photographs to follow.`}
    >
      <svg className="set-artwork__arch" viewBox="0 0 120 150" fill="none" aria-hidden="true" focusable="false">
        <path d="M14 150V62a46 46 0 0 1 92 0v88" stroke="currentColor" strokeWidth="1" />
        <path d="M34 150V66a26 26 0 0 1 52 0v84" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="set-artwork__number">{set.number}</span>
      {note && <span className="set-artwork__note">Photographs to follow</span>}
    </div>
  )
}

/** The set's hero photograph when there is one, otherwise the abstract plate. */
export function SetVisual({ set, sizes, className, eager }: { set: StudioSet; sizes: string; className?: string; eager?: boolean }) {
  if (set.heroImage) return <SetPhoto photo={set.heroImage} sizes={sizes} className={className} eager={eager} />
  return <SetArtwork set={set} className={className} />
}
