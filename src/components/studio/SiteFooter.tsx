import { Link } from 'react-router-dom'
import { BRAND } from '@/data/studioContent'
import { Logo } from './Logo'

/** Footer. 'overlay' sits over the 3D stage at the end of the homepage; 'page' closes a content page. */
export function SiteFooter({ tone = 'page' }: { tone?: 'page' | 'overlay' }) {
  return (
    <footer className={`site-footer site-footer--${tone}`}>
      <div className="site-footer__brand">
        <Logo />
        <p>{BRAND.tagline}</p>
      </div>
      <nav className="site-footer__nav" aria-label="Footer">
        <Link to="/explore">Explore</Link>
        <Link to="/sets">All Sets</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/about">About</Link>
        <Link to="/enquire">Book your shoot</Link>
      </nav>
      <p className="site-footer__note">{BRAND.conceptualNote}</p>
      <p className="site-footer__legal">
        © {new Date().getFullYear()} {BRAND.name}
      </p>
    </footer>
  )
}
