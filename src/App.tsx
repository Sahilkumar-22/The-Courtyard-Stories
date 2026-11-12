import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { HowItWorksDialog } from '@/components/studio/HowItWorksDialog'
import { StudioHeader } from '@/components/studio/StudioHeader'
import { StudioStage } from '@/components/studio/StudioStage'
import ExplorePage from '@/pages/ExplorePage'
import HomePage from '@/pages/HomePage'

// Content pages load on demand; the homepage and explorer are the entry points.
const SetsPage = lazy(() => import('@/pages/SetsPage'))
const SetDetailPage = lazy(() => import('@/pages/SetDetailPage'))
const GalleryPage = lazy(() => import('@/pages/GalleryPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const EnquirePage = lazy(() => import('@/pages/EnquirePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

/** Each new page starts at the top (or at its #anchor). */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  // The 3D stage stays mounted across the homepage and the explorer, so moving
  // between them is a camera move rather than a reload.
  const showStage = pathname === '/' || pathname === '/explore'

  return (
    <>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <ScrollManager />
      {showStage && <StudioStage />}
      <StudioHeader />
      <div id="content">
        <Suspense fallback={<div className="page-loading" role="status">Loading</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/sets" element={<SetsPage />} />
            <Route path="/sets/:slug" element={<SetDetailPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/enquire" element={<EnquirePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      <HowItWorksDialog />
    </>
  )
}
