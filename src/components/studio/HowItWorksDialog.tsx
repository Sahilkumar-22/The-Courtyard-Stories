import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ENQUIRY, HOW_IT_WORKS } from '@/data/studioContent'
import { useStudioStore } from '@/store/studioStore'
import { Icon } from './Icon'
import { useStage3D } from './StudioStage'

const EXPLORE_WITHOUT_3D = 'Browse the spaces, filter them by style, and select any one.'

export function HowItWorksSteps() {
  // Without WebGL the spaces are browsed as a gallery, so the first step reads differently.
  const has3D = useStage3D()
  return (
    <ol className="steps">
      {HOW_IT_WORKS.map((step, index) => (
        <li key={step.title} className="steps__item">
          <span className="steps__number">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="steps__title">{step.title}</h3>
          <p>{index === 0 && !has3D ? EXPLORE_WITHOUT_3D : step.description}</p>
        </li>
      ))}
    </ol>
  )
}

/** "How It Works": opened from the hero, the explorer's welcome, or anywhere else. */
export function HowItWorksDialog() {
  const open = useStudioStore((state) => state.howItWorksOpen)
  const setOpen = useStudioStore((state) => state.setHowItWorksOpen)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="how-it-works-title"
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
    >
      <div className="modal__content">
        <header className="modal__header">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 id="how-it-works-title" className="modal__title">
              From first look to your shoot
            </h2>
          </div>
          <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close">
            <Icon name="close" />
          </button>
        </header>
        <HowItWorksSteps />
        <p className="modal__note">{ENQUIRY.disclaimer}</p>
        <div className="modal__actions">
          <Link to="/explore" className="button button--solid" onClick={() => setOpen(false)}>
            Explore Studio
          </Link>
          <Link to="/enquire" className="button button--outline" onClick={() => setOpen(false)}>
            Make an enquiry
          </Link>
        </div>
      </div>
    </dialog>
  )
}
