import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { getSetById } from '@/data/studioSets'
import { enquiryPath } from '@/hooks/useStudioNavigation'
import { useStudioStore } from '@/store/studioStore'
import { Icon } from './Icon'
import { Logo } from './Logo'

const LINKS = [
  { to: '/explore', label: 'Explore' },
  { to: '/sets', label: 'All Sets' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
]

/** Site header: logo, primary navigation, and the booking call to action. */
export function StudioHeader() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const selectedSet = useStudioStore((state) => getSetById(state.selectedSetId))
  // Over the 3D stage the header is transparent; on content pages it has a surface.
  const overStage = pathname === '/' || pathname === '/explore'

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className={`site-header${overStage ? ' site-header--overlay' : ''}${menuOpen ? ' is-open' : ''}`}>
      <Link to="/" className="site-header__logo" aria-label="The Courtyard Studio, home">
        <Logo />
      </Link>

      <nav className="site-header__nav" aria-label="Primary">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="site-header__link">
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="site-header__actions">
        {/* If a set is selected in the explorer, the enquiry opens with it already chosen. */}
        <Link to={enquiryPath(overStage ? selectedSet?.slug : null)} className="button button--solid button--small site-header__cta">
          Book your shoot
        </Link>
        <button
          type="button"
          className="icon-button site-header__menu"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      {menuOpen && (
        <nav className="site-menu" id="site-menu" aria-label="Menu">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className="site-menu__link">
              {link.label}
            </NavLink>
          ))}
          <Link to={enquiryPath(overStage ? selectedSet?.slug : null)} className="button button--solid">
            Book your shoot
          </Link>
        </nav>
      )}
    </header>
  )
}
