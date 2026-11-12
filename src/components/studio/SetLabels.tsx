import { useCallback } from 'react'
import { matchesFilter, STUDIO_SETS } from '@/data/studioSets'
import { setLabelElements, useStudioStore } from '@/store/studioStore'
import type { StudioSet } from '@/types/studio'

function SetLabel({ set }: { set: StudioSet }) {
  const isHovered = useStudioStore((state) => state.hoveredSetId === set.id)
  const isSelected = useStudioStore((state) => state.selectedSetId === set.id)
  const hasSelection = useStudioStore((state) => state.selectedSetId !== null)
  const visible = useStudioStore((state) => state.mode === 'explore' && matchesFilter(set, state.filter))

  // Registering the element lets the 3D scene keep it pinned above the set's space.
  const register = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) setLabelElements.set(set.id, element)
      else setLabelElements.delete(set.id)
    },
    [set.id],
  )

  const shown = visible && (!hasSelection || isHovered) && !isSelected

  return (
    <div className="set-labels__anchor" ref={register}>
      <div className={`set-label${shown ? ' is-visible' : ''}${isHovered ? ' is-hovered' : ''}`}>
        <span className="set-label__number">{set.number}</span>
        <span className="set-label__name">{set.name}</span>
      </div>
    </div>
  )
}

/**
 * The name of each space, floating above it in the 3D view. Purely visual: the same
 * names are available to keyboard and screen-reader users in the list of sets.
 */
export function SetLabels() {
  return (
    <div className="set-labels" aria-hidden="true">
      {STUDIO_SETS.map((set) => (
        <SetLabel key={set.id} set={set} />
      ))}
    </div>
  )
}
