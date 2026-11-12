import { Link } from 'react-router-dom'
import { HowItWorksSteps } from '@/components/studio/HowItWorksDialog'
import { SiteFooter } from '@/components/studio/SiteFooter'
import { BRAND, ENQUIRY, FACILITIES, SERVICES } from '@/data/studioContent'
import { ACTIVE_CATEGORIES, STUDIO_SETS } from '@/data/studioSets'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function AboutPage() {
  usePageTitle('About')
  const first = STUDIO_SETS[0]
  const last = STUDIO_SETS[STUDIO_SETS.length - 1]

  return (
    <>
      <main className="page about">
        <header className="page__header">
          <p className="eyebrow">About</p>
          <h1 className="display display--hero">
            One studio.
            <br />
            <em>Endless worlds</em> to create in.
          </h1>
          <p className="lede">
            {BRAND.name} is a creative location for photography with a collection of {STUDIO_SETS.length} distinct sets, from{' '}
            {first.name} to {last.name}. Each one is a world of its own.
          </p>
        </header>

        <section className="about__section" aria-labelledby="about-collection">
          <h2 id="about-collection" className="display display--small">
            The collection
          </h2>
          <ul className="about__list">
            {ACTIVE_CATEGORIES.map((category) => (
              <li key={category.id}>
                <h3>{category.label}</h3>
                <p>{category.description}</p>
                <p className="about__sets">
                  {STUDIO_SETS.filter((set) => set.category === category.id)
                    .map((set) => set.name)
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="about__section" aria-labelledby="about-services">
          <h2 id="about-services" className="display display--small">
            What the studio is for
          </h2>
          <ul className="about__list about__list--compact">
            {SERVICES.map((service) => (
              <li key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {FACILITIES.length > 0 && (
          <section className="about__section" aria-labelledby="about-facilities">
            <h2 id="about-facilities" className="display display--small">
              Facilities
            </h2>
            <ul className="about__list about__list--compact">
              {FACILITIES.map((facility) => (
                <li key={facility.title}>
                  <h3>{facility.title}</h3>
                  <p>{facility.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="about__section" aria-labelledby="about-how" id="how-it-works">
          <h2 id="about-how" className="display display--small">
            How it works
          </h2>
          <HowItWorksSteps />
          <p className="about__note">{ENQUIRY.disclaimer}</p>
        </section>

        <section className="about__section" aria-labelledby="about-virtual">
          <h2 id="about-virtual" className="display display--small">
            About the virtual courtyard
          </h2>
          <p className="lede">{BRAND.conceptualNote}</p>
        </section>

        <aside className="callout">
          <h2 className="display">Make this space your next story.</h2>
          <div className="intro-actions">
            <Link to="/enquire" className="button button--solid">
              Book your shoot
            </Link>
            <Link to="/explore" className="button button--outline">
              Explore Studio
            </Link>
          </div>
        </aside>
      </main>
      <SiteFooter />
    </>
  )
}
