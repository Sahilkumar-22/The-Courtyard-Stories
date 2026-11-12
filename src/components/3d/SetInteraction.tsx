import type { ThreeEvent } from '@react-three/fiber'
import { useEffect } from 'react'
import { matchesFilter } from '@/data/studioSets'
import { useStudioStore } from '@/store/studioStore'
import type { StudioSet } from '@/types/studio'
import { ROOM } from './layout'
import { boxGeometry } from './primitives'

/**
 * Makes one exhibition space selectable: an invisible volume that receives hover and
 * click. It holds no knowledge of any particular set. (The floating name label is part
 * of the interface layer; see SetLabelAnchors for how it follows the space.)
 */
export function SetInteraction({ set }: { set: StudioSet }) {
  const mode = useStudioStore((state) => state.mode)
  const isHovered = useStudioStore((state) => state.hoveredSetId === set.id)
  const isTransitioning = useStudioStore((state) => state.isTransitioning)
  const matches = useStudioStore((state) => matchesFilter(set, state.filter))
  const hoverSet = useStudioStore((state) => state.hoverSet)
  const selectSet = useStudioStore((state) => state.selectSet)

  const interactive = mode === 'explore' && matches
  const height = set.environment.labelHeight

  useEffect(() => {
    if (!isHovered) return
    document.body.style.cursor = 'pointer'
    return () => {
      document.body.style.cursor = ''
    }
  }, [isHovered])

  // Leaving explore mode (or filtering the space away) must not leave it highlighted.
  useEffect(() => {
    if (!interactive && useStudioStore.getState().hoveredSetId === set.id) hoverSet(null)
  }, [interactive, hoverSet, set.id])

  if (!interactive) return null

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    // Touch has no hover: a finger resting on a space while dragging should not highlight it.
    if (event.pointerType !== 'mouse') return
    hoverSet(set.id)
  }
  const handleOut = () => {
    if (useStudioStore.getState().hoveredSetId === set.id) hoverSet(null)
  }
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    // A drag that happens to end on a space is navigation, not selection.
    if (event.delta > 6 || isTransitioning) return
    selectSet(set.id)
  }

  return (
    <mesh
      geometry={boxGeometry()}
      position={[0, height / 2 - 0.4, 0]}
      scale={[ROOM.width + 0.5, height - 0.6, ROOM.depth + 0.5]}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  )
}
