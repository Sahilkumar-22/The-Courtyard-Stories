import { type CSSProperties, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryLabel } from '@/data/studioSets'
import { useCameraController } from '@/hooks/useCameraController'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useStudioNavigation } from '@/hooks/useStudioNavigation'
import { useStudioStore } from '@/store/studioStore'
import { Icon } from './Icon'

/** The list of spaces: a keyboard- and screen-reader-friendly way to go to any set. */
function SetsDrawer() {
  const { visibleSets, selectSet, selectedSet } = useStudioNavigation()
  const open = useStudioStore((state) => state.setsDrawerOpen)
  const setOpen = useStudioStore((state) => state.setSetsDrawerOpen)
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>('button')?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="sets-drawer glass" id="sets-drawer" ref={list}>
      <header className="sets-drawer__header">
        <h2 className="eyebrow">
          {visibleSets.length} {visibleSets.length === 1 ? 'space' : 'spaces'}
        </h2>
        <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close the list of sets">
          <Icon name="close" />
        </button>
      </header>
      <ul className="sets-drawer__list">
        {visibleSets.map((set) => (
          <li key={set.id}>
            <button
              type="button"
              className="sets-drawer__item"
              aria-current={selectedSet?.id === set.id}
              style={{ '--accent': set.environment.accent } as CSSProperties}
              onClick={() => selectSet(set.id)}
            >
              <span className="sets-drawer__number">{set.number}</span>
              <span className="sets-drawer__name">{set.name}</span>
              <span className="sets-drawer__category">{getCategoryLabel(set.category)}</span>
            </button>
          </li>
        ))}
      </ul>
      <Link to="/sets" className="text-button sets-drawer__link">
        View all sets as a page
        <Icon name="arrow-up-right" size={16} />
      </Link>
    </div>
  )
}

/** Bottom controls of the explorer: the set list, reset, zoom, and how to move around. */
export function StudioNavigation() {
  const { zoomIn, zoomOut, resetView, isTransitioning } = useCameraController()
  const drawerOpen = useStudioStore((state) => state.setsDrawerOpen)
  const setDrawerOpen = useStudioStore((state) => state.setSetsDrawerOpen)
  const hasSelection = useStudioStore((state) => state.selectedSetId !== null)
  const touch = useMediaQuery('(pointer: coarse)')

  return (
    <div className={`studio-nav${hasSelection ? ' has-selection' : ''}`}>
      <SetsDrawer />
      <div className="studio-nav__bar">
        <button
          type="button"
          className="pill-button glass"
          aria-expanded={drawerOpen}
          aria-controls="sets-drawer"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <Icon name="grid" size={16} />
          Explore all sets
        </button>

        <p className="studio-nav__guide">
          {touch ? 'Swipe to look around · Pinch to zoom · Tap a space' : 'Drag to look around · Scroll to zoom · Select a space'}
        </p>

        <div className="studio-nav__tools glass" role="group" aria-label="View controls">
          <button type="button" className="icon-button" onClick={zoomOut} disabled={isTransitioning} aria-label="Zoom out">
            <Icon name="minus" />
          </button>
          <button type="button" className="icon-button" onClick={zoomIn} disabled={isTransitioning} aria-label="Zoom in">
            <Icon name="plus" />
          </button>
          <span className="studio-nav__divider" aria-hidden="true" />
          <button type="button" className="studio-nav__reset" onClick={resetView}>
            <Icon name="reset" size={16} />
            <span className="studio-nav__reset-text">Reset view</span>
          </button>
        </div>
      </div>
    </div>
  )
}
