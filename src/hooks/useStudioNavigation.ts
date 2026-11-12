import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdjacentSet, getSetById, matchesFilter, STUDIO_SETS } from '@/data/studioSets'
import { useStudioStore } from '@/store/studioStore'
import type { CategoryFilterId } from '@/types/studio'

export const enquiryPath = (setSlug?: string | null) => (setSlug ? `/enquire?set=${encodeURIComponent(setSlug)}` : '/enquire')

export const setPath = (setSlug: string) => `/sets/${setSlug}`

/** Everything the UI needs to move around the studio: selection, filtering and page navigation. */
export function useStudioNavigation() {
  const navigate = useNavigate()
  const mode = useStudioStore((state) => state.mode)
  const selectedSetId = useStudioStore((state) => state.selectedSetId)
  const hoveredSetId = useStudioStore((state) => state.hoveredSetId)
  const filter = useStudioStore((state) => state.filter)
  const selectSet = useStudioStore((state) => state.selectSet)
  const setFilterState = useStudioStore((state) => state.setFilter)
  const setMode = useStudioStore((state) => state.setMode)
  const resetView = useStudioStore((state) => state.resetView)

  const selectedSet = getSetById(selectedSetId)
  const hoveredSet = getSetById(hoveredSetId)

  const visibleSets = useMemo(() => STUDIO_SETS.filter((set) => matchesFilter(set, filter)), [filter])

  const setFilter = useCallback(
    (next: CategoryFilterId) => {
      setFilterState(next)
      // A selected set that the new filter hides is deselected.
      const current = getSetById(useStudioStore.getState().selectedSetId)
      if (current && !matchesFilter(current, next)) selectSet(null)
    },
    [selectSet, setFilterState],
  )

  const selectAdjacent = useCallback(
    (direction: 1 | -1) => {
      const { selectedSetId: currentId, filter: currentFilter } = useStudioStore.getState()
      if (!currentId) return
      let candidate = getAdjacentSet(currentId, direction)
      for (let i = 0; i < STUDIO_SETS.length && !matchesFilter(candidate, currentFilter); i += 1) {
        candidate = getAdjacentSet(candidate.id, direction)
      }
      selectSet(candidate.id)
    },
    [selectSet],
  )

  const enterExplore = useCallback(() => setMode('explore'), [setMode])

  const openSet = useCallback((slug: string) => navigate(setPath(slug)), [navigate])
  const enquireAboutSet = useCallback((slug?: string | null) => navigate(enquiryPath(slug)), [navigate])

  return {
    mode,
    filter,
    selectedSet,
    hoveredSet,
    visibleSets,
    selectSet,
    selectAdjacent,
    setFilter,
    enterExplore,
    resetView,
    openSet,
    enquireAboutSet,
  }
}
