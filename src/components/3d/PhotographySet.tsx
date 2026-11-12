import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { type Group, MathUtils, MeshBasicMaterial, RingGeometry } from 'three'
import { BRAND_COLOURS } from '@/data/brandColours'
import { matchesFilter } from '@/data/studioSets'
import type { QualitySettings } from '@/hooks/useQualityTier'
import { requestShadowUpdate, studioRuntime, useStudioStore } from '@/store/studioStore'
import type { StudioSet } from '@/types/studio'
import { ROOM, type SetSlot } from './layout'
import { brass, stone } from './materials'
import { Block, Cyl, Disc, Panel, sharedGeometry } from './primitives'
import { SetInteraction } from './SetInteraction'
import { SET_ENVIRONMENTS } from './sets'
import { Plinth } from './sets/common'
import { usePhotoTexture } from './usePhotoTexture'

const HALF_DEPTH = ROOM.depth / 2

/** A brass easel on the walkway showing one of the set's real photographs. */
function PhotoEasel({ set }: { set: StudioSet }) {
  const photo = set.heroImage
  const texture = usePhotoTexture(photo, 480)
  const material = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), [])
  useEffect(() => {
    material.map = texture
    // Until the photograph arrives the frame shows the palette's beige.
    material.color.set(texture ? '#ffffff' : BRAND_COLOURS.beige)
    material.needsUpdate = true
  }, [material, texture, photo])
  useEffect(() => () => material.dispose(), [material])

  if (!photo) return null
  const aspect = photo.width / photo.height
  const width = aspect >= 1 ? 1.15 : 1.15 * aspect
  const height = width / aspect

  return (
    <group position={[ROOM.width / 2 - 0.35, 0, HALF_DEPTH + 1.45]} rotation={[0, -0.3, 0]}>
      <Cyl radius={0.24} height={0.04} position={[0, 0.02, 0]} material={brass()} segments={18} />
      <Cyl radius={0.022} height={1.05} position={[0, 0.55, 0]} material={brass()} segments={8} />
      <group position={[0, 1.05 + height / 2, 0]} rotation={[-0.1, 0, 0]}>
        <Block size={[width + 0.08, height + 0.08, 0.035]} material={brass()} />
        <Panel width={width} height={height} position={[0, 0, 0.02]} material={material} receive={false} />
      </group>
    </group>
  )
}

const RING_REST_OPACITY = 0.45

/** The paved medallion in front of each space: where the visitor stands to view it. */
function ViewingZone({ set }: { set: StudioSet }) {
  const ring = useRef<MeshBasicMaterial>(null)
  const ringGeometry = sharedGeometry('viewing-ring', () => new RingGeometry(0.78, 0.9, 48))

  // The ring is the set's accent, unlit so it is exactly that palette colour. It rests as a
  // faint wash over the paving and comes up to full strength when its space is highlighted.
  useFrame((_, delta) => {
    const material = ring.current
    if (!material) return
    const { hoveredSetId, selectedSetId, mode, filter } = useStudioStore.getState()
    const highlighted = hoveredSetId === set.id || selectedSetId === set.id
    const emphasised = mode === 'explore' && filter !== 'all' && matchesFilter(set, filter)
    const goal = highlighted ? 1 : emphasised ? 0.75 : RING_REST_OPACITY
    material.opacity = MathUtils.damp(material.opacity, goal, 7, delta)
  })

  return (
    <group position={[0, 0, HALF_DEPTH + 1.75]}>
      <Disc radius={1} position={[0, 0.062, 0]} material={stone()} segments={40} />
      <mesh geometry={ringGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.066, 0]}>
        <meshBasicMaterial ref={ring} color={set.environment.accent} toneMapped={false} transparent opacity={RING_REST_OPACITY} depthWrite={false} />
      </mesh>
    </group>
  )
}

interface PhotographySetProps {
  set: StudioSet
  slot: SetSlot
  quality: QualitySettings
  reducedMotion: boolean
}

/**
 * One photography set in the courtyard. The set's data decides which 3D space is built;
 * this component adds what every space shares: its place on the horseshoe, the plinth,
 * the viewing zone, the photograph easel, and the rise-and-sink animation used by the
 * scroll story and the category filter.
 */
export function PhotographySet({ set, slot, quality, reducedMotion }: PhotographySetProps) {
  const Space = SET_ENVIRONMENTS[set.environment.kind]
  const lift = useRef<Group>(null)
  const height = useRef<number | null>(null)
  const buried = -(set.environment.labelHeight + 1.2)

  useFrame((_, delta) => {
    const group = lift.current
    if (!group) return
    const { mode, filter, storyCategory } = useStudioStore.getState()

    // During the story the spaces rise from the ground, centre first; a category
    // filter lowers the spaces it excludes.
    let reveal = 1
    if (mode === 'story' && !reducedMotion) {
      const start = 1.42 + slot.rank * 0.55
      reveal = MathUtils.smootherstep(studioRuntime.storyT, start, start + 0.55)
    }
    const activeFilter = mode === 'story' ? (storyCategory ?? 'all') : mode === 'explore' ? filter : 'all'
    const shown = matchesFilter(set, activeFilter)
    const goal = shown ? ROOM.plinth + (1 - reveal) * (buried - ROOM.plinth) : buried

    const current = height.current
    const next = current === null ? goal : MathUtils.damp(current, goal, 4.5, Math.min(delta, 0.1))
    if (current === null || Math.abs(next - current) > 0.0004) {
      height.current = next
      group.position.y = next
      group.visible = next > buried + 0.05
      requestShadowUpdate(160)
    }
  })

  return (
    <group position={slot.position} rotation={[0, slot.rotationY, 0]}>
      <group ref={lift} position={[0, ROOM.plinth, 0]}>
        <Plinth />
        <Space
          heroImage={set.heroImage}
          density={quality.density}
          segments={quality.segments}
          reducedMotion={reducedMotion}
        />
        <SetInteraction set={set} />
      </group>
      <ViewingZone set={set} />
      <PhotoEasel set={set} />
    </group>
  )
}
