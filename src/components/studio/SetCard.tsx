import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryLabel } from '@/data/studioSets'
import { setPath } from '@/hooks/useStudioNavigation'
import type { StudioSet } from '@/types/studio'
import { SetVisual } from './SetPhoto'

interface SetCardProps {
  set: StudioSet
  /** When given, the card is a button that selects the set; otherwise it links to the set's page. */
  onSelect?: () => void
  sizes?: string
}

export function SetCard({ set, onSelect, sizes = '(max-width: 820px) 80vw, 360px' }: SetCardProps) {
  const content = (
    <>
      <span className="set-card__visual">
        <SetVisual set={set} sizes={sizes} />
      </span>
      <span className="set-card__meta">
        <span className="set-card__number">{set.number}</span>
        <span className="set-card__category">{getCategoryLabel(set.category)}</span>
      </span>
      <span className="set-card__name">{set.name}</span>
      {set.tagline && <span className="set-card__tagline">{set.tagline}</span>}
    </>
  )
  const style = { '--accent': set.environment.accent } as CSSProperties

  return onSelect ? (
    <button type="button" className="set-card" style={style} onClick={onSelect}>
      {content}
    </button>
  ) : (
    <Link to={setPath(set.slug)} className="set-card" style={style}>
      {content}
    </Link>
  )
}
