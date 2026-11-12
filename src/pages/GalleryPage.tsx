import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbox } from '@/components/studio/Lightbox'
import { SetPhoto } from '@/components/studio/SetPhoto'
import { SiteFooter } from '@/components/studio/SiteFooter'
import { STUDIO_SETS } from '@/data/studioSets'
import { usePageTitle } from '@/hooks/usePageTitle'
import { setPath } from '@/hooks/useStudioNavigation'

/** Every studio photograph in one place, filterable by set. */
export default function GalleryPage() {
  usePageTitle('Gallery')
  const setsWithPhotographs = useMemo(() => STUDIO_SETS.filter((set) => set.gallery.length > 0), [])
  const [setId, setSetId] = useState<string>('all')
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const entries = useMemo(
    () =>
      setsWithPhotographs
        .filter((set) => setId === 'all' || set.id === setId)
        .flatMap((set) => set.gallery.map((photo) => ({ photo, set }))),
    [setsWithPhotographs, setId],
  )
  const activeSet = setsWithPhotographs.find((set) => set.id === setId)

  return (
    <>
      <main className="page">
        <header className="page__header">
          <p className="eyebrow">Gallery</p>
          <h1 className="display">Photographs from the studio</h1>
          {setsWithPhotographs.length > 0 ? (
            <p className="lede">Real photographs of our sets. Choose a set to narrow the view, or open any image fullscreen.</p>
          ) : (
            <p className="lede">The gallery is being prepared. Photographs of each set will appear here as they are added.</p>
          )}
        </header>

        {setsWithPhotographs.length > 0 ? (
          <>
            <div className="category-filter category-filter--plain" role="group" aria-label="Filter photographs by set">
              <button type="button" className="category-filter__option" aria-pressed={setId === 'all'} onClick={() => setSetId('all')}>
                All sets
              </button>
              {setsWithPhotographs.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  className="category-filter__option"
                  aria-pressed={setId === set.id}
                  onClick={() => setSetId(set.id)}
                >
                  {set.name}
                </button>
              ))}
            </div>

            {activeSet && (
              <p className="gallery-wall__context">
                <Link to={setPath(activeSet.slug)} className="text-button">
                  About the {activeSet.name} set
                </Link>
              </p>
            )}

            <ul className="gallery-wall">
              {entries.map(({ photo, set }, index) => (
                <li key={photo.id}>
                  <button
                    type="button"
                    className="gallery-wall__item"
                    onClick={() => setViewerIndex(index)}
                    aria-label={`View fullscreen: ${photo.alt}`}
                  >
                    <SetPhoto photo={photo} sizes="(max-width: 820px) 50vw, 33vw" />
                    <span className="gallery-wall__caption">{set.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <aside className="callout">
            <h2 className="display display--small">Meet the sets in the meantime</h2>
            <p>Every set has its own space in the virtual courtyard and its own page.</p>
            <div className="intro-actions">
              <Link to="/explore" className="button button--solid">
                Explore Studio
              </Link>
              <Link to="/sets" className="button button--outline">
                View All Sets
              </Link>
            </div>
          </aside>
        )}

        {viewerIndex !== null && entries[viewerIndex] && (
          <Lightbox
            photos={entries.map((entry) => entry.photo)}
            index={viewerIndex}
            title={entries[viewerIndex].set.name}
            onIndexChange={setViewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        )}
      </main>
      <SiteFooter />
    </>
  )
}
