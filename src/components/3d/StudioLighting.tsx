import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Object3D, type SpotLight } from 'three'
import { BRAND_COLOURS } from '@/data/brandColours'
import type { QualitySettings } from '@/hooks/useQualityTier'
import { getSetById } from '@/data/studioSets'
import { requestShadowUpdate, studioRuntime, useStudioStore } from '@/store/studioStore'
import { getSlotForSet, STUDIO_LAYOUT } from './layout'

const SUN_POSITION: [number, number, number] = [-34, 60, 42]
const ACCENT_INTENSITY = 240
// Lights are white, so that each surface shows its own palette colour unaltered.
const WHITE = new Color('#ffffff')

/**
 * An architectural spotlight that swings onto whichever space is hovered or selected,
 * lifting its illumination above the rest of the courtyard.
 */
function AccentLight() {
  const light = useRef<SpotLight>(null)
  const target = useMemo(() => new Object3D(), [])
  const placed = useRef<string | null>(null)

  useFrame((_, delta) => {
    const spot = light.current
    if (!spot) return
    const { hoveredSetId, selectedSetId, mode } = useStudioStore.getState()
    const activeId = mode === 'explore' ? (hoveredSetId ?? selectedSetId) : null
    const slot = activeId ? getSlotForSet(activeId) : undefined
    const set = getSetById(activeId)

    if (slot && set && placed.current !== activeId) {
      const [x, , z] = slot.position
      const [fx, fz] = slot.facing
      // When moving between spaces, dip the light first so it never sweeps across the scene.
      if (placed.current !== null && spot.intensity > 4) {
        spot.intensity = Math.max(0, spot.intensity - delta * ACCENT_INTENSITY * 8)
        return
      }
      spot.position.set(x + fx * 7.5, 11, z + fz * 7.5)
      target.position.set(x, 1.6, z)
      target.updateMatrixWorld()
      // The light stays white, like every light here, so the set keeps its palette colours.
      spot.color.copy(WHITE)
      placed.current = activeId
    }

    const goal = slot ? ACCENT_INTENSITY : 0
    spot.intensity += (goal - spot.intensity) * (1 - Math.exp(-delta * 6))
    if (!slot && spot.intensity < 1) {
      spot.intensity = 0
      placed.current = null
    }
  })

  return (
    <>
      <spotLight ref={light} target={target} intensity={0} angle={0.52} penumbra={0.85} decay={2} distance={34} />
      <primitive object={target} />
    </>
  )
}

/** Directional sun with soft shadows, sky fill, and the accent spotlight. */
export function StudioLighting({ quality }: { quality: QualitySettings }) {
  const gl = useThree((state) => state.gl)
  const reach = STUDIO_LAYOUT.outerRadius + 14

  // The architecture is static, so the shadow map is rendered once and refreshed only
  // while something moves (spaces rising during the story, or sinking under a filter).
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    requestShadowUpdate(1200)
    return () => {
      gl.shadowMap.autoUpdate = true
    }
  }, [gl])

  useFrame(() => {
    if (performance.now() < studioRuntime.shadowsDirtyUntil) gl.shadowMap.needsUpdate = true
  })

  return (
    <>
      <hemisphereLight args={['#ffffff', BRAND_COLOURS.beige, 1]} />
      <directionalLight
        position={SUN_POSITION}
        intensity={3.1}
        color="#ffffff"
        castShadow={quality.shadows}
        shadow-mapSize={[quality.shadowMapSize, quality.shadowMapSize]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.06}
      >
        <orthographicCamera attach="shadow-camera" args={[-reach, reach, reach, -reach, 1, 240]} />
      </directionalLight>
      <AccentLight />
    </>
  )
}
