import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '@/components/studio/Icon'
import { SetGallery } from '@/components/studio/SetGallery'
import { SiteFooter } from '@/components/studio/SiteFooter'
import { ENQUIRY } from '@/data/studioContent'
import { getAdjacentSet, getCategoryLabel, getSetBySlug, getShootTypeLabel } from '@/data/studioSets'
import { usePageTitle } from '@/hooks/usePageTitle'
import { enquiryPath, setPath } from '@/hooks/useStudioNavigation'
import NotFoundPage from './NotFoundPage'

/** A set's dedicated page: its description, its full gallery, and the enquiry call to action. */
export default function SetDetailPage() {
  const { slug } = useParams()
  const set = getSetBySlug(slug)
  usePageTitle(set?.name)

  if (!set) return <NotFoundPage />

  const previous = getAdjacentSet(set.id, -1)
  const next = getAdjacentSet(set.id, 1)

  return (
    <>
      <main className="page set-page" style={{ '--accent': set.environment.accent } as CSSProperties}>
        <Link to="/sets" className="text-button set-page__back">
          <Icon name="arrow-left" size={16} />
          All sets
        </Link>

        <header className="set-page__header">
          <div>
            <p className="eyebrow">
              <span className="set-panel__number">{set.number}</span>
              {getCategoryLabel(set.category)}
            </p>
            <h1 className="display display--hero">{set.name}</h1>
            {set.tagline && <p className="set-page__tagline">{set.tagline}</p>}
          </div>
          <div className="set-page__summary">
            {set.description && <p className="lede">{set.description}</p>}
            <div>
              <h2 className="eyebrow">Suited to</h2>
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
            <div className="intro-actions">
              <Link to={enquiryPath(set.slug)} className="button button--solid">
                Enquire about this set
              </Link>
              <Link to={`/explore?set=${set.slug}`} className="button button--outline">
                See it in the 3D studio
              </Link>
            </div>
          </div>
        </header>

        <section aria-label={`${set.name} photographs`}>
          <SetGallery set={set} variant="page" />
        </section>

        <aside className="callout callout--accent">
          <p className="eyebrow">{set.name}</p>
          <h2 className="display">Make this space your next story.</h2>
          <p>{ENQUIRY.disclaimer}</p>
          <Link to={enquiryPath(set.slug)} className="button button--solid">
            Enquire about {set.name}
          </Link>
        </aside>

        <nav className="set-page__pager" aria-label="More sets">
          <Link to={setPath(previous.slug)} className="set-page__pager-link">
            <span className="eyebrow">Previous set</span>
            <span className="display display--small">{previous.name}</span>
          </Link>
          <Link to={setPath(next.slug)} className="set-page__pager-link set-page__pager-link--next">
            <span className="eyebrow">Next set</span>
            <span className="display display--small">{next.name}</span>
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  )
}
