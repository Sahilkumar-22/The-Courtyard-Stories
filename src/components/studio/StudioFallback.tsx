import { useRef } from 'react'
import { BRAND } from '@/data/studioContent'
import { useStudioNavigation } from '@/hooks/useStudioNavigation'
import { useStudioStore } from '@/store/studioStore'
import { CategoryFilter } from './CategoryFilter'
import { Icon } from './Icon'
import { SetCard } from './SetCard'
import { SetInformationPanel } from './SetInformationPanel'

/**
 * The explorer for devices without WebGL: every space as a card on a sideways rail,
 * with the same filter, set details, photographs and enquiry routes as the 3D view.
 */
export function StudioFallback() {
  const { filter, setFilter, visibleSets, selectSet } = useStudioNavigation()
  const setHowItWorksOpen = useStudioStore((state) => state.setHowItWorksOpen)
  const rail = useRef<HTMLDivElement>(null)

  const scrollRail = (direction: 1 | -1) => {
    const element = rail.current
    if (!element) return
    element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <main className="fallback">
      <header className="fallback__intro">
        <p className="eyebrow">Explore our creative spaces</p>
        <h1 className="display">{BRAND.tagline}</h1>
        <p className="lede">Discover extraordinary environments designed to bring your vision to life.</p>
        <p className="fallback__note">
          The interactive 3D courtyard is not available on this device, so every space is shown here as a gallery.{' '}
          <button type="button" className="link-button" onClick={() => setHowItWorksOpen(true)}>
            How it works
          </button>
        </p>
        <CategoryFilter value={filter} onChange={setFilter} />
      </header>

      <div className="fallback__rail-wrap">
        <div className="fallback__rail" ref={rail} tabIndex={0} role="group" aria-label="Photography sets">
          {visibleSets.map((set) => (
            <SetCard key={set.id} set={set} onSelect={() => selectSet(set.id)} />
          ))}
        </div>
        <div className="fallback__steps">
          <button type="button" className="icon-button icon-button--outline" onClick={() => scrollRail(-1)} aria-label="Scroll to previous sets">
            <Icon name="arrow-left" />
          </button>
          <button type="button" className="icon-button icon-button--outline" onClick={() => scrollRail(1)} aria-label="Scroll to more sets">
            <Icon name="arrow-right" />
          </button>
        </div>
      </div>

      <SetInformationPanel variant="modal" />
    </main>
  )
}
