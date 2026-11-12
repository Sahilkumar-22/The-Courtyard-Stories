import { Link } from 'react-router-dom'
import { SiteFooter } from '@/components/studio/SiteFooter'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('Page not found')
  return (
    <>
      <main className="page page--centred">
        <p className="eyebrow">Page not found</p>
        <h1 className="display">This door does not open onto a set.</h1>
        <p className="lede">The page you were looking for is not here. The collection is.</p>
        <div className="intro-actions">
          <Link to="/sets" className="button button--solid">
            View All Sets
          </Link>
          <Link to="/" className="button button--outline">
            Go to the homepage
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
