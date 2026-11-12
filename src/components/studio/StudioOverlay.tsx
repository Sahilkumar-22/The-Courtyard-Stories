import { Link } from 'react-router-dom'
import { BRAND } from '@/data/studioContent'
import { useStudioNavigation } from '@/hooks/useStudioNavigation'
import { useStudioStore } from '@/store/studioStore'

/** The three ways in, shared by the homepage hero and the explorer's welcome overlay. */
export function IntroActions({ onExplore }: { onExplore: () => void }) {
  const setHowItWorksOpen = useStudioStore((state) => state.setHowItWorksOpen)
  return (
    <div className="intro-actions">
      <button type="button" className="button button--solid" onClick={onExplore}>
        Explore Studio
      </button>
      <Link to="/sets" className="button button--outline">
        View All Sets
      </Link>
      <button type="button" className="button button--ghost" onClick={() => setHowItWorksOpen(true)}>
        How It Works
      </button>
    </div>
  )
}

/**
 * Text that floats over the 3D view: the welcome shown on arrival, and the quiet
 * section indicator at the left edge once the visitor is exploring.
 */
export function StudioOverlay() {
  const { mode, enterExplore } = useStudioNavigation()
  const setIntroSeen = useStudioStore((state) => state.setIntroSeen)
  const hasSelection = useStudioStore((state) => state.selectedSetId !== null)

  if (mode === 'intro') {
    return (
      <section className="studio-intro" aria-labelledby="studio-intro-title">
        <div className="studio-intro__card">
          <p className="eyebrow">{BRAND.name}</p>
          <h1 id="studio-intro-title" className="studio-intro__title">
            Explore our creative spaces
          </h1>
          <p className="studio-intro__text">Discover extraordinary environments designed to bring your vision to life.</p>
          <IntroActions
            onExplore={() => {
              setIntroSeen()
              enterExplore()
            }}
          />
          <p className="studio-intro__note">{BRAND.conceptualNote}</p>
        </div>
      </section>
    )
  }

  return (
    <aside className={`studio-indicator${hasSelection ? ' is-muted' : ''}`} aria-label="About this view">
      <p className="studio-indicator__name">{BRAND.name}</p>
      <p className="studio-indicator__line">{BRAND.strapline}</p>
      <p className="studio-indicator__note">{BRAND.conceptualNote}</p>
    </aside>
  )
}
