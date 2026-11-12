import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryFilter } from '@/components/studio/CategoryFilter'
import { SetCard } from '@/components/studio/SetCard'
import { SiteFooter } from '@/components/studio/SiteFooter'
import { matchesFilter, STUDIO_SETS } from '@/data/studioSets'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { CategoryFilterId } from '@/types/studio'

/** Every set as a simple, fast page: the non-3D way to browse the collection. */
export default function SetsPage() {
  usePageTitle('All Sets')
  const [filter, setFilter] = useState<CategoryFilterId>('all')
  const sets = STUDIO_SETS.filter((set) => matchesFilter(set, filter))

  return (
    <>
      <main className="page">
        <header className="page__header">
          <p className="eyebrow">The collection</p>
          <h1 className="display">All sets</h1>
          <p className="lede">
            {STUDIO_SETS.length} distinct worlds in one studio. Choose a set to see its photographs and enquire about it.
          </p>
          <CategoryFilter value={filter} onChange={setFilter} />
        </header>

        <div className="card-grid card-grid--wide">
          {sets.map((set) => (
            <SetCard key={set.id} set={set} sizes="(max-width: 820px) 90vw, 30vw" />
          ))}
        </div>

        <aside className="callout">
          <h2 className="display display--small">Prefer to walk around?</h2>
          <p>See every set in the interactive 3D courtyard.</p>
          <Link to="/explore" className="button button--solid">
            Explore Studio
          </Link>
        </aside>
      </main>
      <SiteFooter />
    </>
  )
}
