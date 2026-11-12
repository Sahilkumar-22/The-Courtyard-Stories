import { OrbitControls } from '@react-three/drei'
import { MOUSE, TOUCH } from 'three'
import { useStudioStore } from '@/store/studioStore'

/**
 * Orbit, zoom and touch navigation. Panning is disabled and CameraController sets
 * distance and angle limits for each view, so a visitor can look around freely
 * without ever losing the courtyard.
 */
export function StudioControls() {
  const mode = useStudioStore((state) => state.mode)
  const isTransitioning = useStudioStore((state) => state.isTransitioning)

  return (
    <OrbitControls
      makeDefault
      enabled={mode === 'explore' && !isTransitioning}
      enablePan={false}
      enableDamping
      dampingFactor={0.075}
      rotateSpeed={0.55}
      zoomSpeed={0.75}
      mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
    />
  )
}
