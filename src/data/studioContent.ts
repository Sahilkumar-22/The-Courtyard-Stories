/**
 * Site-wide copy and configuration.
 *
 * Everything here is either taken from the studio's brief or is a neutral description
 * of how the website works. Real-world facts about the premises (facilities, address,
 * opening hours, prices, dimensions) are deliberately absent: add them to FACILITIES
 * and CONTACT once the studio confirms them.
 */

export const BRAND = {
  name: 'The Courtyard Studio',
  tagline: 'One studio. Endless worlds to create in.',
  strapline: 'A world of creative possibilities',
  conceptualNote:
    'This 3D exhibition is an artistic concept of our set collection, not a scale model of the premises. Only the photographs show the real sets.',
} as const

export const ENQUIRY = {
  /** HTTPS endpoint that accepts the enquiry as JSON. Set VITE_ENQUIRY_ENDPOINT. */
  endpoint: (import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined)?.trim() || null,
  /** Studio inbox for the email fallback. Set VITE_ENQUIRY_EMAIL. */
  email: (import.meta.env.VITE_ENQUIRY_EMAIL as string | undefined)?.trim() || null,
  disclaimer:
    'An enquiry is not a confirmed booking. Only the studio team can confirm availability and rental terms.',
} as const

export interface Facility {
  title: string
  description: string
}

/** Real studio facilities, as confirmed by the studio. Rendered only when not empty. */
export const FACILITIES: Facility[] = []

export const SERVICES = [
  {
    title: 'Pre-wedding',
    description: 'Settings that range from palace arches to blossom, for a story that is yours.',
  },
  {
    title: 'Fashion',
    description: 'Architectural backdrops with distinct character for editorials and lookbooks.',
  },
  {
    title: 'Commercial',
    description: 'Styled interiors for campaigns and brand imagery.',
  },
  {
    title: 'Creative content',
    description: 'A different setting for every idea, all in one location.',
  },
] as const

export const HOW_IT_WORKS = [
  {
    title: 'Explore',
    description: 'Drag to look around the virtual courtyard, scroll or pinch to zoom, and select any space.',
  },
  {
    title: 'Discover',
    description: 'Open a set to see its photographs and what it is suited to.',
  },
  {
    title: 'Enquire',
    description: 'Send an enquiry for the set you like, with your preferred date and shoot type.',
  },
  {
    title: 'Confirm',
    description: 'The studio team replies to confirm availability and rental terms.',
  },
] as const
