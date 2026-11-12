import { BRAND, ENQUIRY } from '@/data/studioContent'
import type { EnquiryPayload } from '@/types/studio'

export type EnquiryOutcome =
  /** Delivered to the configured endpoint. */
  | 'sent'
  /** The visitor's email app was opened with the enquiry written out. */
  | 'email'
  /** No delivery method is configured: nothing was sent. */
  | 'unconfigured'

/** A date-input value (YYYY-MM-DD) written out in full, so that day and month cannot be confused. */
function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

/** The enquiry as plain text, for email and for copying. */
export function formatEnquiry(payload: EnquiryPayload): string {
  const lines = [
    `Enquiry for ${BRAND.name}`,
    '',
    `Set: ${payload.setName}`,
    `Set category: ${payload.setCategory}`,
    `Shoot type: ${payload.shootType}`,
    `Preferred shoot date: ${payload.preferredDate ? formatDate(payload.preferredDate) : 'Flexible / not decided'}`,
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || 'Not given'}`,
    '',
    'Additional requirements:',
    payload.requirements || 'None given',
  ]
  return lines.join('\n')
}

/**
 * Delivers an enquiry by whichever method the studio has configured. It never pretends:
 * if nothing is configured the caller is told so, and can offer the text to copy instead.
 */
export async function submitEnquiry(payload: EnquiryPayload, subject: string): Promise<EnquiryOutcome> {
  if (ENQUIRY.endpoint) {
    const response = await fetch(ENQUIRY.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ subject, ...payload, message: formatEnquiry(payload) }),
    })
    if (!response.ok) throw new Error(`The enquiry service responded with ${response.status}`)
    return 'sent'
  }

  if (ENQUIRY.email) {
    const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formatEnquiry(payload))}`
    window.location.href = `mailto:${ENQUIRY.email}?${query}`
    return 'email'
  }

  return 'unconfigured'
}
