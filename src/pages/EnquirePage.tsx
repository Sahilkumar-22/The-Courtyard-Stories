import { type CSSProperties, type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SetVisual } from '@/components/studio/SetPhoto'
import { SiteFooter } from '@/components/studio/SiteFooter'
import { ENQUIRY } from '@/data/studioContent'
import { getCategoryLabel, getSetBySlug, getShootTypeLabel, SHOOT_TYPES, STUDIO_SETS } from '@/data/studioSets'
import { usePageTitle } from '@/hooks/usePageTitle'
import { setPath } from '@/hooks/useStudioNavigation'
import { type EnquiryOutcome, formatEnquiry, submitEnquiry } from '@/lib/enquiry'
import type { EnquiryPayload } from '@/types/studio'

const UNDECIDED = ''
const OTHER_SHOOT = 'Other'

type Status = { kind: 'editing' } | { kind: 'sending' } | { kind: 'done'; outcome: EnquiryOutcome } | { kind: 'failed' }

type Errors = Partial<Record<'name' | 'email' | 'shootType' | 'preferredDate', string>>

const today = () => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/**
 * The enquiry form. Arriving from a set (?set=slug) pre-selects that set and its category
 * travels with the enquiry. An enquiry is a request, not a booking, and the page says so.
 */
export default function EnquirePage() {
  usePageTitle('Book your shoot')
  const [searchParams, setSearchParams] = useSearchParams()
  const linkedSet = getSetBySlug(searchParams.get('set'))

  const [setSlug, setSetSlug] = useState(linkedSet?.slug ?? UNDECIDED)
  const [shootType, setShootType] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [requirements, setRequirements] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ kind: 'editing' })
  const [copied, setCopied] = useState(false)
  const result = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)

  // Following a different "enquire about this set" link updates the selection.
  const linkedSlug = linkedSet?.slug
  useEffect(() => {
    if (linkedSlug) setSetSlug(linkedSlug)
  }, [linkedSlug])

  useEffect(() => {
    if (status.kind === 'done' || status.kind === 'failed') result.current?.focus()
  }, [status])

  const set = getSetBySlug(setSlug)

  const payload: EnquiryPayload = {
    setSlug: set?.slug ?? null,
    setName: set?.name ?? 'Not decided yet',
    setCategory: set ? getCategoryLabel(set.category) : 'Not applicable',
    preferredDate,
    shootType,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    requirements: requirements.trim(),
  }
  const subject = set?.enquiry.subject ?? 'Enquiry: studio booking'

  const chooseSet = (slug: string) => {
    setSetSlug(slug)
    setSearchParams(slug ? { set: slug } : {}, { replace: true })
  }

  const validate = (): Errors => {
    const next: Errors = {}
    if (!payload.name) next.name = 'Please tell us your name.'
    if (!payload.email) next.email = 'Please give an email address we can reply to.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) next.email = 'That email address does not look complete.'
    if (!shootType) next.shootType = 'Please choose the type of shoot.'
    if (preferredDate && preferredDate < today()) next.preferredDate = 'Please choose a date that is not in the past.'
    return next
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    // Focus the first invalid field in the order they appear on the page.
    const firstInvalid = (['shootType', 'preferredDate', 'name', 'email'] as const).find((field) => found[field])
    if (firstInvalid) {
      form.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    setStatus({ kind: 'sending' })
    try {
      setStatus({ kind: 'done', outcome: await submitEnquiry(payload, subject) })
    } catch {
      setStatus({ kind: 'failed' })
    }
  }

  const copyEnquiry = async () => {
    try {
      await navigator.clipboard.writeText(formatEnquiry(payload))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const finished = status.kind === 'done' || status.kind === 'failed'
  // Offer the set's suggested shoot types first, then the rest.
  const suggested = set?.enquiry.suggestedShootTypes ?? []
  const shootOptions = [...SHOOT_TYPES].sort((a, b) => Number(suggested.includes(b.id)) - Number(suggested.includes(a.id)))

  return (
    <>
      <main className="page enquire">
        <header className="page__header">
          <p className="eyebrow">Book your shoot</p>
          <h1 className="display">{set ? 'Make this space your next story.' : 'Tell us about your shoot.'}</h1>
          <p className="lede">{ENQUIRY.disclaimer}</p>
        </header>

        <div className="enquire__layout">
          <aside className="enquire__set" style={{ '--accent': set?.environment.accent ?? 'var(--terracotta)' } as CSSProperties} aria-live="polite">
            {set ? (
              <>
                <div className="enquire__visual">
                  <SetVisual set={set} sizes="(max-width: 820px) 100vw, 380px" />
                </div>
                <p className="eyebrow">
                  <span className="set-panel__number">{set.number}</span>
                  {getCategoryLabel(set.category)}
                </p>
                <h2 className="display display--small">{set.name}</h2>
                {set.tagline && <p>{set.tagline}</p>}
                <Link to={setPath(set.slug)} className="text-button">
                  About this set
                </Link>
              </>
            ) : (
              <>
                <h2 className="display display--small">No set chosen yet</h2>
                <p>That is fine. Tell us about the shoot and the studio team can suggest sets, or pick one yourself.</p>
                <Link to="/sets" className="text-button">
                  Browse all sets
                </Link>
              </>
            )}
          </aside>

          {finished ? (
            <div className="enquire__result" ref={result} tabIndex={-1} role="status">
              {status.kind === 'done' && status.outcome === 'sent' && (
                <>
                  <h2 className="display display--small">Your enquiry has been sent.</h2>
                  <p>Thank you, {payload.name}. The studio team will reply to {payload.email}.</p>
                  <p>{ENQUIRY.disclaimer}</p>
                </>
              )}
              {status.kind === 'done' && status.outcome === 'email' && (
                <>
                  <h2 className="display display--small">One more step: send the email.</h2>
                  <p>
                    Your email app should have opened with the enquiry written out. It reaches the studio only once you press send
                    there. If nothing opened, copy the enquiry below and email it to {ENQUIRY.email}.
                  </p>
                  <p>{ENQUIRY.disclaimer}</p>
                </>
              )}
              {status.kind === 'done' && status.outcome === 'unconfigured' && (
                <>
                  <h2 className="display display--small">Your enquiry has not been sent.</h2>
                  <p>
                    Online enquiries are not switched on for this website yet, so nothing has reached the studio. Your details are
                    below: copy them and send them to the studio directly.
                  </p>
                </>
              )}
              {status.kind === 'failed' && (
                <>
                  <h2 className="display display--small">Your enquiry could not be sent.</h2>
                  <p>Something went wrong on the way and nothing has reached the studio. You can try again, or copy the enquiry and send it directly.</p>
                </>
              )}

              {!(status.kind === 'done' && status.outcome === 'sent') && (
                <>
                  <pre className="enquire__summary">{formatEnquiry(payload)}</pre>
                  <p className="enquire__copy-status" aria-live="polite">
                    {copied ? 'Copied to your clipboard.' : ''}
                  </p>
                </>
              )}

              <div className="intro-actions">
                {!(status.kind === 'done' && status.outcome === 'sent') && (
                  <button type="button" className="button button--solid" onClick={copyEnquiry}>
                    Copy enquiry
                  </button>
                )}
                <button
                  type="button"
                  className="button button--outline"
                  onClick={() => {
                    setCopied(false)
                    setStatus({ kind: 'editing' })
                  }}
                >
                  {status.kind === 'failed' ? 'Try again' : 'Edit enquiry'}
                </button>
                <Link to="/explore" className="button button--ghost">
                  Back to the studio
                </Link>
              </div>
            </div>
          ) : (
            <form className="enquire__form" ref={form} onSubmit={handleSubmit} noValidate>
              <fieldset className="field-group">
                <legend className="eyebrow">The shoot</legend>

                <label className="field">
                  <span className="field__label">Set</span>
                  <select name="set" value={setSlug} onChange={(event) => chooseSet(event.target.value)}>
                    <option value={UNDECIDED}>Not decided yet</option>
                    {STUDIO_SETS.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.number} · {option.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field">
                  <span className="field__label">Set category</span>
                  <output className="field__static">{set ? getCategoryLabel(set.category) : 'Chosen with the set'}</output>
                </div>

                <label className="field">
                  <span className="field__label">Shoot type</span>
                  <select
                    name="shootType"
                    value={shootType}
                    onChange={(event) => setShootType(event.target.value)}
                    aria-invalid={Boolean(errors.shootType)}
                    aria-describedby={errors.shootType ? 'error-shootType' : undefined}
                    required
                  >
                    <option value="" disabled>
                      Choose a shoot type
                    </option>
                    {shootOptions.map((type) => (
                      <option key={type.id} value={getShootTypeLabel(type.id)}>
                        {type.label}
                      </option>
                    ))}
                    <option value={OTHER_SHOOT}>Something else</option>
                  </select>
                  {errors.shootType && (
                    <span className="field__error" id="error-shootType">
                      {errors.shootType}
                    </span>
                  )}
                </label>

                <label className="field">
                  <span className="field__label">
                    Preferred shoot date <span className="field__optional">optional</span>
                  </span>
                  <input
                    type="date"
                    name="preferredDate"
                    value={preferredDate}
                    min={today()}
                    onChange={(event) => setPreferredDate(event.target.value)}
                    aria-invalid={Boolean(errors.preferredDate)}
                    aria-describedby={errors.preferredDate ? 'error-preferredDate' : 'hint-preferredDate'}
                  />
                  {errors.preferredDate ? (
                    <span className="field__error" id="error-preferredDate">
                      {errors.preferredDate}
                    </span>
                  ) : (
                    <span className="field__hint" id="hint-preferredDate">
                      The studio team will confirm whether this date is available.
                    </span>
                  )}
                </label>
              </fieldset>

              <fieldset className="field-group">
                <legend className="eyebrow">Your details</legend>

                <label className="field">
                  <span className="field__label">Name</span>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    autoComplete="name"
                    onChange={(event) => setName(event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                    required
                  />
                  {errors.name && (
                    <span className="field__error" id="error-name">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label className="field">
                  <span className="field__label">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    autoComplete="email"
                    inputMode="email"
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'error-email' : undefined}
                    required
                  />
                  {errors.email && (
                    <span className="field__error" id="error-email">
                      {errors.email}
                    </span>
                  )}
                </label>

                <label className="field">
                  <span className="field__label">
                    Phone <span className="field__optional">optional</span>
                  </span>
                  <input type="tel" name="phone" value={phone} autoComplete="tel" inputMode="tel" onChange={(event) => setPhone(event.target.value)} />
                </label>
              </fieldset>

              <label className="field field--wide">
                <span className="field__label">
                  Additional requirements <span className="field__optional">optional</span>
                </span>
                <textarea
                  name="requirements"
                  rows={5}
                  value={requirements}
                  onChange={(event) => setRequirements(event.target.value)}
                  aria-describedby="hint-requirements"
                />
                <span className="field__hint" id="hint-requirements">
                  Team size, timings, other sets you are considering, anything the studio should know.
                </span>
              </label>

              <div className="enquire__submit">
                <button type="submit" className="button button--solid" disabled={status.kind === 'sending'}>
                  {status.kind === 'sending' ? 'Sending…' : 'Send enquiry'}
                </button>
                <p className="field__hint">{ENQUIRY.disclaimer}</p>
              </div>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
