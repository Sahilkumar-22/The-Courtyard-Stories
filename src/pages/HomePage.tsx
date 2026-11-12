import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HowItWorksSteps } from '@/components/studio/HowItWorksDialog'
import { SetCard } from '@/components/studio/SetCard'
import { SiteFooter } from '@/components/studio/SiteFooter'
import { IntroActions } from '@/components/studio/StudioOverlay'
import { ENQUIRY, FACILITIES, SERVICES } from '@/data/studioContent'
import { ACTIVE_CATEGORIES, STUDIO_SETS, TOTAL_PHOTOGRAPHS } from '@/data/studioSets'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { studioRuntime, useStudioStore } from '@/store/studioStore'

gsap.registerPlugin(ScrollTrigger)

const FEATURED_LIMIT = 6

/**
 * The homepage: a scroll-driven story told over the 3D courtyard. Scrolling moves the
 * camera from the gate, down the corridor and up over the spaces; the page then
 * continues with galleries, services and the invitation to book. Visitors who would
 * rather explore freely can leave the story from its very first screen.
 */
export default function HomePage() {
  const root = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const setMode = useStudioStore((state) => state.setMode)
  const setStoryCategory = useStudioStore((state) => state.setStoryCategory)
  const setStageCovered = useStudioStore((state) => state.setStageCovered)
  const setIntroSeen = useStudioStore((state) => state.setIntroSeen)
  const [activeCategory, setActiveCategory] = useState(-1)

  useEffect(() => {
    studioRuntime.storyT = 0
    setMode('story')
    return () => {
      setStoryCategory(null)
      setStageCovered(false)
    }
  }, [setMode, setStoryCategory, setStageCovered])

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('.story-section')
      const invitation = root.current?.querySelector<HTMLElement>('.invitation')

      // Camera: three sections carry it from the gate to the overview; the invitation
      // carries it on to the closing view. Their progress is summed so the position
      // is always right, whichever trigger fired last.
      let finale: ScrollTrigger | undefined
      const travel: ScrollTrigger[] = []
      const updateStory = () => {
        const journey = travel.slice(0, 3).reduce((total, trigger) => total + trigger.progress, 0)
        studioRuntime.storyT = Math.min(3, journey) + (finale?.progress ?? 0)
      }
      sections.forEach((section) => {
        travel.push(
          ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom top', onUpdate: updateStory, onRefresh: updateStory }),
        )
      })
      if (invitation) {
        finale = ScrollTrigger.create({
          trigger: invitation,
          start: 'top bottom',
          end: 'bottom bottom',
          onUpdate: updateStory,
          onRefresh: updateStory,
        })
      }

      // Section 4: each category takes its turn while the section is pinned.
      const categories = root.current?.querySelector<HTMLElement>('.story-section--categories')
      if (categories && ACTIVE_CATEGORIES.length > 0) {
        const show = (index: number) => {
          setActiveCategory(index)
          setStoryCategory(index >= 0 ? ACTIVE_CATEGORIES[index].id : null)
        }
        ScrollTrigger.create({
          trigger: categories,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => show(Math.min(ACTIVE_CATEGORIES.length - 1, Math.floor(self.progress * ACTIVE_CATEGORIES.length))),
          onLeave: () => show(-1),
          onLeaveBack: () => show(-1),
        })
      }

      // While opaque sections fill the screen, the 3D stage stops rendering.
      const cover = root.current?.querySelector<HTMLElement>('.story-cover')
      if (cover) {
        ScrollTrigger.create({
          trigger: cover,
          start: 'top top',
          end: 'bottom bottom',
          onToggle: (self) => setStageCovered(self.isActive),
        })
      }

      if (reducedMotion) return

      // Story copy fades in as its section arrives and out as it leaves.
      sections.forEach((section, index) => {
        const copy = section.querySelector('.story-copy')
        if (!copy) return
        if (index === 0) {
          gsap.to(copy, {
            autoAlpha: 0,
            y: -50,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: section, start: '12% top', end: '62% top', scrub: true },
          })
          return
        }
        gsap
          .timeline({ scrollTrigger: { trigger: section, start: 'top 72%', end: 'bottom 28%', scrub: true } })
          .fromTo(copy, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'none' })
          .to(copy, { autoAlpha: 1, duration: 2.4 })
          .to(copy, { autoAlpha: 0, y: -46, duration: 1, ease: 'none' })
      })

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 28,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        })
      })
    }, root)

    return () => context.revert()
  }, [reducedMotion, setStageCovered, setStoryCategory])

  const exploreStudio = () => {
    setIntroSeen()
    navigate('/explore')
  }

  const withPhotographs = STUDIO_SETS.filter((set) => set.gallery.length > 0)
  const featured = (withPhotographs.length > 0 ? withPhotographs : STUDIO_SETS).slice(0, FEATURED_LIMIT)

  return (
    <main className="story" ref={root}>
      {/* 1. Cinematic introduction */}
      <section className="story-section story-section--intro" aria-labelledby="story-title">
        <div className="story-copy story-copy--hero">
          <p className="eyebrow">Explore our creative spaces</p>
          <h1 id="story-title" className="display display--hero">
            One studio.
            <br />
            <em>Endless worlds</em> to create in.
          </h1>
          <p className="lede">Discover extraordinary environments designed to bring your vision to life.</p>
          <IntroActions onExplore={exploreStudio} />
          <p className="story-cue" aria-hidden="true">
            <span className="story-cue__line" />
            Scroll to step inside
          </p>
        </div>
      </section>

      {/* 2. The camera enters the courtyard */}
      <section className="story-section" aria-labelledby="story-enter">
        <div className="story-copy story-copy--left">
          <p className="eyebrow">The entrance</p>
          <h2 id="story-enter" className="display">
            Step through the gate.
          </h2>
          <p className="lede">A virtual courtyard gathers every set in our collection in one place. Walk in and look around.</p>
        </div>
      </section>

      {/* 3. The worlds reveal themselves */}
      <section className="story-section" aria-labelledby="story-reveal">
        <div className="story-copy story-copy--right">
          <p className="eyebrow">The worlds</p>
          <h2 id="story-reveal" className="display">
            {STUDIO_SETS.length} sets rise around you.
          </h2>
          <p className="lede">From palace arches to a tunnel of blossom, each space stands for a real backdrop you can enquire about.</p>
        </div>
      </section>

      {/* 4. The backdrop categories */}
      <section className="story-section story-section--categories" aria-labelledby="story-categories">
        <div className="story-copy story-copy--left">
          <p className="eyebrow">The collection</p>
          <h2 id="story-categories" className="display">
            Find the world that fits your story.
          </h2>
          <ul className="category-roll">
            {ACTIVE_CATEGORIES.map((category, index) => (
              <li key={category.id} className={`category-roll__item${index === activeCategory ? ' is-active' : ''}`}>
                <span className="category-roll__label">{category.label}</span>
                <span className="category-roll__text">{category.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="story-cover">
        {/* 5. Featured photography galleries */}
        <section className="band band--light" aria-labelledby="featured-title">
          <div className="band__inner">
            <header className="band__header reveal">
              <p className="eyebrow">Featured galleries</p>
              <h2 id="featured-title" className="display">
                Photographs from the sets.
              </h2>
              <p className="lede">
                {TOTAL_PHOTOGRAPHS > 0
                  ? 'Every image here was made in the studio. Open a set to see its full gallery.'
                  : 'Photographs are being added to the collection. Until then, open any set to read about it and enquire.'}
              </p>
            </header>
            <div className="card-grid reveal">
              {featured.map((set) => (
                <SetCard key={set.id} set={set} sizes="(max-width: 820px) 90vw, 30vw" />
              ))}
            </div>
            <p className="band__more reveal">
              <Link to="/sets" className="button button--outline">
                View all {STUDIO_SETS.length} sets
              </Link>
              {TOTAL_PHOTOGRAPHS > 0 && (
                <Link to="/gallery" className="button button--ghost">
                  Open the gallery
                </Link>
              )}
            </p>
          </div>
        </section>

        {/* 6. Studio facilities and services */}
        <section className="band band--dark" aria-labelledby="services-title">
          <div className="band__inner">
            <header className="band__header reveal">
              <p className="eyebrow">Services</p>
              <h2 id="services-title" className="display">
                What the studio is for.
              </h2>
            </header>
            <ul className="service-grid reveal">
              {SERVICES.map((service) => (
                <li key={service.title} className="service-grid__item">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </li>
              ))}
            </ul>

            {FACILITIES.length > 0 && (
              <div className="reveal">
                <h3 className="eyebrow band__subhead">Facilities</h3>
                <ul className="service-grid">
                  {FACILITIES.map((facility) => (
                    <li key={facility.title} className="service-grid__item">
                      <h3>{facility.title}</h3>
                      <p>{facility.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="reveal" id="how-it-works">
              <h3 className="eyebrow band__subhead">How it works</h3>
              <HowItWorksSteps />
            </div>
          </div>
        </section>
      </div>

      {/* 7. The booking invitation */}
      <section className="invitation" aria-labelledby="invitation-title">
        <div className="invitation__copy">
          <p className="eyebrow">Book your shoot</p>
          <h2 id="invitation-title" className="display display--hero">
            Make this space
            <br />
            <em>your next story.</em>
          </h2>
          <p className="lede">{ENQUIRY.disclaimer}</p>
          <div className="intro-actions">
            <Link to="/enquire" className="button button--solid">
              Book your shoot
            </Link>
            <button type="button" className="button button--outline" onClick={exploreStudio}>
              Explore Studio
            </button>
          </div>
        </div>
        <SiteFooter tone="overlay" />
      </section>
    </main>
  )
}
