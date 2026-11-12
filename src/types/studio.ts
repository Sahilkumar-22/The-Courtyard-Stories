export type SetCategoryId = 'royal-traditional' | 'european' | 'modern-interiors' | 'nature-floral' | 'lifestyle'

export type CategoryFilterId = SetCategoryId | 'all'

export type ShootTypeId = 'pre-wedding' | 'fashion' | 'commercial' | 'creative-content'

/** Which procedural 3D exhibition space represents the set. */
export type EnvironmentKind =
  | 'royal-jaipur'
  | 'raj-mahal'
  | 'colonnade'
  | 'moroccan'
  | 'italian'
  | 'library'
  | 'rustic-cafe'
  | 'french-kitchen'
  | 'glass-house'
  | 'flower-tunnel'
  | 'tree-house'
  | 'bedroom'
  | 'pavilion'

export interface PhotoVariant {
  width: number
  src: string
}

/** One genuine studio photograph, in several web-optimised widths. */
export interface StudioPhoto {
  id: string
  alt: string
  width: number
  height: number
  /** Average colour, shown while the photograph loads. */
  color: string
  variants: PhotoVariant[]
}

export interface SetSpecification {
  label: string
  value: string
}

export interface SetEnvironmentConfig {
  kind: EnvironmentKind
  /** Accent colour used for the set's marker, label and highlight light. */
  accent: string
  /** Height in metres of the tallest element, used to place the floating label. */
  labelHeight: number
}

export interface SetEnquiryInfo {
  /** Subject line used when an enquiry is raised from this set. */
  subject: string
  /** Shoot types offered first in the enquiry form for this set. */
  suggestedShootTypes: ShootTypeId[]
}

export interface StudioSet {
  id: string
  slug: string
  /** Display number in the exhibition, e.g. "07". */
  number: string
  name: string
  tagline: string
  description: string
  /** Null when the client has not yet classified an additional set. */
  category: SetCategoryId | null
  shootTypes: ShootTypeId[]
  heroImage: StudioPhoto | null
  gallery: StudioPhoto[]
  /** Only real, client-confirmed specifications. Empty until supplied. */
  specifications: SetSpecification[]
  environment: SetEnvironmentConfig
  enquiry: SetEnquiryInfo
  /** 'catalogue' sets come from the brief; 'asset-collection' sets were discovered in the photo folders. */
  source: 'catalogue' | 'asset-collection'
}

export interface SetCategory {
  id: SetCategoryId
  label: string
  description: string
}

export interface ShootType {
  id: ShootTypeId
  label: string
}

export interface PhotoManifestImage {
  id: string
  width: number
  height: number
  color: string
  variants: PhotoVariant[]
}

export interface PhotoManifestSet {
  folderName: string
  meta: {
    name?: string
    tagline?: string
    description?: string
    category?: string
  } | null
  images: PhotoManifestImage[]
}

export interface PhotoManifest {
  sets: Record<string, PhotoManifestSet>
}

export type QualityTier = 'high' | 'medium' | 'low'

export type StudioMode = 'story' | 'intro' | 'explore'

export interface EnquiryPayload {
  setSlug: string | null
  setName: string
  setCategory: string
  preferredDate: string
  shootType: string
  name: string
  email: string
  phone: string
  requirements: string
}
