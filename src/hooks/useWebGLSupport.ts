import { useState } from 'react'

let cached: boolean | null = null

export function detectWebGL(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return false
  // ?no3d forces the image-based experience, for testing and for visitors who prefer it.
  if (new URLSearchParams(window.location.search).has('no3d')) {
    cached = false
    return cached
  }
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2')
    cached = Boolean(context)
    context?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}

/** Whether the 3D experience can run on this device. */
export function useWebGLSupport(): boolean {
  const [supported] = useState(detectWebGL)
  return supported
}
