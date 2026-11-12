import { type CSSProperties, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getSetBySlug } from '@/data/studioSets'
import { useStudioNavigation } from '@/hooks/useStudioNavigation'
import { useStudioStore } from '@/store/studioStore'
import { CategoryFilter } from './CategoryFilter'
import { SetInformationPanel } from './SetInformationPanel'
import { SetLabels } from './SetLabels'
import { StudioFallback } from './StudioFallback'
import { StudioNavigation } from './StudioNavigation'
import { StudioOverlay } from './StudioOverlay'
import { useStage3D } from './StudioStage'
import { PANEL } from './uiMetrics'

const PANEL_VARIABLES = {
  // Matches getPanelInsets, which the camera uses to keep the selected space clear of the panel.
  '--panel-width': `min(${PANEL.desktopWidth}px, 36vw)`,
  '--panel-margin': `${PANEL.desktopMargin}px`,
  '--sheet-height': `${PANEL.sheetHeight * 100}svh`,
} as CSSProperties

/**
 * The interactive explorer: the UI layer over the 3D stage. It talks to the scene only
 * through the store and hooks, and swaps in the image-based experience when 3D is unavailable.
 */
export function StudioExplorer() {
  const available = useStage3D()
  const [searchParams] = useSearchParams()
  const { mode, filter, setFilter, selectedSet, selectSet, selectAdjacent } = useStudioNavigation()
  const setMode = useStudioStore((state) => state.setMode)
  const setIntroSeen = useStudioStore((state) => state.setIntroSeen)
  const setDrawerOpen = useStudioStore((state) => state.setSetsDrawerOpen)
  const linkedSlug = searchParams.get('set')

  // Arriving here: show the welcome once per session, or go straight to a linked set.
  useEffect(() => {
    const linked = getSetBySlug(linkedSlug)
    if (linked) {
      setIntroSeen()
      setMode('explore')
      selectSet(linked.id)
    } else {
      setMode(useStudioStore.getState().introSeen || !available ? 'explore' : 'intro')
    }
  }, [linkedSlug, available, setIntroSeen, setMode, selectSet])

  // The explorer is a fixed, full-screen view: the page behind it must not scroll.
  // (The image-based fallback is an ordinary scrolling page.)
  useEffect(() => {
    if (!available) return
    document.documentElement.classList.add('is-explorer')
    return () => document.documentElement.classList.remove('is-explorer')
  }, [available])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return
      const state = useStudioStore.getState()
      if (event.key === 'Escape') {
        if (state.setsDrawerOpen) setDrawerOpen(false)
        else if (state.selectedSetId) selectSet(null)
      }
      const typing = event.target instanceof HTMLElement && event.target.closest('input, textarea, select')
      if (state.selectedSetId && !typing) {
        if (event.key === 'ArrowRight') selectAdjacent(1)
        if (event.key === 'ArrowLeft') selectAdjacent(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectSet, selectAdjacent, setDrawerOpen])

  if (!available) return <StudioFallback />

  return (
    <main className={`explorer${selectedSet ? ' has-selection' : ''}`} style={PANEL_VARIABLES}>
      {mode !== 'intro' && <h1 className="sr-only">Explore The Courtyard Studio</h1>}
      <SetLabels />
      <StudioOverlay />
      {mode === 'explore' && (
        <>
          <div className="explorer__filter">
            <CategoryFilter value={filter} onChange={setFilter} tone="glass" />
          </div>
          <StudioNavigation />
          <SetInformationPanel />
        </>
      )}
    </main>
  )
}
