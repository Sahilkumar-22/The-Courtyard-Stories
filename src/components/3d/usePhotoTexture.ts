import { useThree } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { SRGBColorSpace, type Texture, TextureLoader } from 'three'
import type { StudioPhoto } from '@/types/studio'

/**
 * Loads a small rendition of a studio photograph for display inside the 3D world.
 * Loading never blocks the scene, and the texture is released when no longer shown.
 */
export function usePhotoTexture(photo: StudioPhoto | null, maxWidth = 1280): Texture | null {
  const invalidate = useThree((state) => state.invalidate)
  const [texture, setTexture] = useState<Texture | null>(null)

  // The largest rendition that fits the budget, or the smallest one available.
  const src = photo
    ? (photo.variants.filter((variant) => variant.width <= maxWidth).at(-1) ?? photo.variants[0])?.src
    : undefined

  useEffect(() => {
    if (!src) {
      setTexture(null)
      return
    }
    let cancelled = false
    let loaded: Texture | null = null
    new TextureLoader().load(
      src,
      (result) => {
        if (cancelled) {
          result.dispose()
          return
        }
        result.colorSpace = SRGBColorSpace
        result.anisotropy = 4
        loaded = result
        setTexture(result)
        invalidate()
      },
      undefined,
      () => {
        // A missing photograph simply leaves the frame empty.
      },
    )
    return () => {
      cancelled = true
      loaded?.dispose()
      setTexture(null)
    }
  }, [src, invalidate])

  return texture
}
