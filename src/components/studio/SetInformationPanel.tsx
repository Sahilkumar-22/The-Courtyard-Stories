import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryLabel, getShootTypeLabel } from '@/data/studioSets'
import { enquiryPath, setPath, useStudioNavigation } from '@/hooks/useStudioNavigation'
import { useIsCompact } from '@/hooks/useMediaQuery'
import { Icon } from './Icon'
import { SetGallery } from './SetGallery'

interface SetInformationPanelProps {
  /** 'docked' sits beside the 3D view; 'modal' floats over the image-based explorer. */
  variant?: 'docked' | 'modal'
}

/**
 * Everything about the selected set: what it is, what it suits, its real photographs,
 * and the two ways forward - its dedicated gallery, or an enquiry. On phones it is a
 * bottom sheet that can be pulled up to full height.
 */
export function SetInformationPanel({ variant = 'docked' }: SetInformationPanelProps) {
  const { selectedSet, selectSet, selectAdjacent, visibleSets } = useStudioNavigation()
  const compact = useIsCompact()
  const [expanded, setExpanded] = useState(false)
  const body = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  const setId = selectedSet?.id
  useEffect(() => {
    setExpanded(false)
    body.current?.scrollTo({ top: 0 })
    // Move focus to the panel so keyboard and screen-reader users land on the new content.
    if (setId) heading.current?.focus({ preventScroll: true })
  }, [setId])

  if (!selectedSet) return null
  const set = selectedSet

  return (
    <>
      {variant === 'modal' && <button type="button" className="set-panel__backdrop" aria-label="Close set details" onClick={() => selectSet(null)} />}
      <aside
        key={set.id}
        className={`set-panel set-panel--${variant}${expanded ? ' is-expanded' : ''}`}
        style={{ '--accent': set.environment.accent } as CSSProperties}
        aria-label={`${set.name} details`}
      >
        {compact && (
          <button
            type="button"
            className="set-panel__handle"
            aria-expanded={expanded}
            aria-label={expanded ? 'Show less of the set details' : 'Show more of the set details'}
            onClick={() => setExpanded((value) => !value)}
          >
            <span />
          </button>
        )}

        <header className="set-panel__header">
          <p className="eyebrow">
            <span className="set-panel__number">{set.number}</span>
            {getCategoryLabel(set.category)}
          </p>
          <button type="button" className="icon-button" onClick={() => selectSet(null)} aria-label="Close set details">
            <Icon name="close" />
          </button>
        </header>

        <div className="set-panel__body" ref={body}>
          <h2 className="set-panel__title" ref={heading} tabIndex={-1}>
            {set.name}
          </h2>
          {set.tagline && <p className="set-panel__tagline">{set.tagline}</p>}

          <SetGallery set={set} variant="panel" />

          {set.description && <p className="set-panel__description">{set.description}</p>}

          <div className="set-panel__suits">
            <h3 className="eyebrow">Suited to</h3>
            <ul className="chip-list">
              {set.shootTypes.map((type) => (
                <li key={type} className="chip">
                  {getShootTypeLabel(type)}
                </li>
              ))}
            </ul>
          </div>

          {set.specifications.length > 0 && (
            <dl className="spec-list">
              {set.specifications.map((specification) => (
                <div key={specification.label}>
                  <dt>{specification.label}</dt>
                  <dd>{specification.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <footer className="set-panel__footer">
          <div className="set-panel__actions">
            <Link to={setPath(set.slug)} className="button button--solid">
              Explore this set
            </Link>
            <Link to={enquiryPath(set.slug)} className="button button--outline">
              Enquire about this set
            </Link>
          </div>
          {visibleSets.length > 1 && (
            <div className="set-panel__pager">
              <button type="button" className="text-button" onClick={() => selectAdjacent(-1)}>
                <Icon name="arrow-left" size={16} />
                Previous space
              </button>
              <button type="button" className="text-button" onClick={() => selectAdjacent(1)}>
                Next space
                <Icon name="arrow-right" size={16} />
              </button>
            </div>
          )}
        </footer>
      </aside>
    </>
  )
}
