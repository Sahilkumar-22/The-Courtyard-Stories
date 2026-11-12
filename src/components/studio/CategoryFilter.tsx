import { ACTIVE_CATEGORIES, matchesFilter, STUDIO_SETS } from '@/data/studioSets'
import type { CategoryFilterId } from '@/types/studio'

interface CategoryFilterProps {
  value: CategoryFilterId
  onChange: (filter: CategoryFilterId) => void
  /** 'glass' floats over the 3D view; 'plain' sits on a page. */
  tone?: 'glass' | 'plain'
}

/** Category chips. Only categories that real sets belong to are offered. */
export function CategoryFilter({ value, onChange, tone = 'plain' }: CategoryFilterProps) {
  const options: { id: CategoryFilterId; label: string }[] = [{ id: 'all', label: 'All Sets' }, ...ACTIVE_CATEGORIES]

  return (
    <div className={`category-filter category-filter--${tone}`} role="group" aria-label="Filter sets by category">
      {options.map((option) => {
        const count = STUDIO_SETS.filter((set) => matchesFilter(set, option.id)).length
        return (
          <button
            key={option.id}
            type="button"
            className="category-filter__option"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            <span className="category-filter__count" aria-label={`${count} sets`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
