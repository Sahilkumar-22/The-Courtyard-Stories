import { useMemo } from 'react'
import { useStudioStore } from '@/store/studioStore'

/** Imperative camera operations, implemented by components/3d/CameraController. */
export interface CameraApi {
  /** Multiply the camera distance; values below 1 zoom in. */
  zoomBy: (factor: number) => void
}

let cameraApi: CameraApi | null = null

export const registerCameraApi = (api: CameraApi | null) => {
  cameraApi = api
}

/**
 * UI-side handle on the 3D camera. The UI never touches three.js objects directly:
 * it asks for zooms and resets, and the 3D layer carries them out.
 */
export function useCameraController() {
  const resetView = useStudioStore((state) => state.resetView)
  const isTransitioning = useStudioStore((state) => state.isTransitioning)

  return useMemo(
    () => ({
      zoomIn: () => cameraApi?.zoomBy(0.78),
      zoomOut: () => cameraApi?.zoomBy(1.28),
      resetView,
      isTransitioning,
    }),
    [resetView, isTransitioning],
  )
}
