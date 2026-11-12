import type {
  CategoryFilterId,
  PhotoManifest,
  SetCategory,
  SetCategoryId,
  ShootType,
  ShootTypeId,
  StudioPhoto,
  StudioSet,
} from '@/types/studio'
import { BRAND_COLOURS } from './brandColours'
import manifestJson from './photoManifest.generated.json'

const manifest = manifestJson as PhotoManifest

// Each set carries one of the palette's three accent colours.
const { terracotta, gold, blue } = BRAND_COLOURS

export const SET_CATEGORIES: SetCategory[] = [
  {
    id: 'royal-traditional',
    label: 'Royal & Traditional',
    description: 'Palace arches, sandstone and ornament for stories with heritage.',
  },
  {
    id: 'european',
    label: 'European',
    description: 'Classical columns, Mediterranean colour and continental kitchens.',
  },
  {
    id: 'modern-interiors',
    label: 'Modern Interiors',
    description: 'Glass, books and clean lines for a contemporary frame.',
  },
  {
    id: 'nature-floral',
    label: 'Nature & Floral',
    description: 'Blossom, timber and greenery for soft, organic settings.',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Lived-in rooms with warmth, texture and character.',
  },
]

export const SHOOT_TYPES: ShootType[] = [
  { id: 'pre-wedding', label: 'Pre-wedding' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'creative-content', label: 'Creative content' },
]

const ALL_SHOOT_TYPES: ShootTypeId[] = SHOOT_TYPES.map((type) => type.id)

type CatalogueEntry = Omit<StudioSet, 'id' | 'number' | 'heroImage' | 'gallery' | 'enquiry' | 'source'>

/**
 * The set catalogue. Names and visual direction come from the studio's brief;
 * photographs are attached from the photography manifest. Specifications stay
 * empty until the studio supplies real figures - nothing here is invented.
 */
const CATALOGUE: CatalogueEntry[] = [
  {
    slug: 'royal-jaipur',
    name: 'Royal Jaipur',
    tagline: 'Sandstone, ornament and royal light',
    description:
      'Royal Indian architecture in warm sandstone, with ornamental detailing and traditional elements under rich, considered light.',
    category: 'royal-traditional',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'royal-jaipur', accent: terracotta, labelHeight: 7.2 },
  },
  {
    slug: 'raj-mahal',
    name: 'Raj Mahal',
    tagline: 'A palace interior of elegant arches',
    description:
      'Palace-inspired architecture with elegant arches and royal interiors, composed for a refined traditional aesthetic.',
    category: 'royal-traditional',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'raj-mahal', accent: gold, labelHeight: 6.4 },
  },
  {
    slug: 'the-colonnade',
    name: 'The Colonnade',
    tagline: 'Symmetry, depth and dramatic sun',
    description:
      'Repeating columns in strict symmetry, drawing the eye into deep perspective and catching dramatic sunlight.',
    category: 'european',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'colonnade', accent: blue, labelHeight: 6.6 },
  },
  {
    slug: 'moroccan',
    name: 'Moroccan',
    tagline: 'Pattern, arches and earthen warmth',
    description:
      'Moroccan-inspired patterns and decorative arches in warm, earthy textures, with an elegant atmospheric glow.',
    category: 'royal-traditional',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'moroccan', accent: terracotta, labelHeight: 6.2 },
  },
  {
    slug: 'italian',
    name: 'Italian',
    tagline: 'Mediterranean colour, composed with care',
    description:
      'European-inspired interiors with refined architectural detailing and a Mediterranean palette, elegantly composed.',
    category: 'european',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'italian', accent: gold, labelHeight: 6.6 },
  },
  {
    slug: 'library',
    name: 'Library',
    tagline: 'Floor-to-ceiling books and warm wood',
    description:
      'Floor-to-ceiling bookshelves in warm wood, with quiet reading corners in an elegant indoor setting.',
    category: 'modern-interiors',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'library', accent: blue, labelHeight: 6.2 },
  },
  {
    slug: 'rustic-cafe-bar',
    name: 'Rustic Cafe & Bar',
    tagline: 'Vintage character in timber and lamplight',
    description:
      'A vintage-inspired cafe and bar of wooden textures, atmospheric lighting and distinctive furniture and styling.',
    category: 'lifestyle',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'rustic-cafe', accent: terracotta, labelHeight: 6.2 },
  },
  {
    slug: 'french-kitchen',
    name: 'French Kitchen',
    tagline: 'European cabinetry in soft daylight',
    description:
      'An elegant European kitchen with sophisticated cabinetry and natural textures, washed in soft daylight.',
    category: 'european',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'french-kitchen', accent: blue, labelHeight: 6.2 },
  },
  {
    slug: 'glass-house',
    name: 'Glass House',
    tagline: 'Transparent structure, natural light',
    description:
      'Glass architectural elements and transparent structure filled with natural light, blurring indoors and outdoors.',
    category: 'modern-interiors',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'glass-house', accent: blue, labelHeight: 6.8 },
  },
  {
    slug: 'japanese-flower-tunnel',
    name: 'Japanese Flower Tunnel',
    tagline: 'An immersive tunnel of blossom',
    description:
      'An immersive floral tunnel with Japanese-inspired elements, composed in beautiful colour and soft cinematic light.',
    category: 'nature-floral',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'flower-tunnel', accent: terracotta, labelHeight: 6.2 },
  },
  {
    slug: 'tree-house',
    name: 'Tree House',
    tagline: 'Natural wood among the greenery',
    description:
      'Organic architectural elements in natural wood, wrapped in greenery for a nature-inspired setting.',
    category: 'nature-floral',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'tree-house', accent: gold, labelHeight: 8.6 },
  },
  {
    slug: 'bedroom',
    name: 'Bedroom',
    tagline: 'Soft textiles and warm ambient light',
    description:
      'An elegant bedroom with sophisticated furniture and soft textiles, held in warm ambient light.',
    category: 'lifestyle',
    shootTypes: ALL_SHOOT_TYPES,
    specifications: [],
    environment: { kind: 'bedroom', accent: gold, labelHeight: 6.2 },
  },
]

const isCategoryId = (value: string | undefined): value is SetCategoryId =>
  SET_CATEGORIES.some((category) => category.id === value)

function photosFor(slug: string, setName: string): StudioPhoto[] {
  const entry = manifest.sets[slug]
  if (!entry) return []
  return entry.images.map((image, index) => ({
    ...image,
    alt: `${setName} set at The Courtyard Studio, photograph ${index + 1} of ${entry.images.length}`,
  }))
}

function buildSets(): StudioSet[] {
  const catalogueSlugs = new Set(CATALOGUE.map((entry) => entry.slug))

  // Sets that exist in the client's photo folders but not in the catalogue above.
  // They are named after their folder (or set.json) and shown in a neutral gallery pavilion.
  const discovered: CatalogueEntry[] = Object.entries(manifest.sets)
    .filter(([slug]) => !catalogueSlugs.has(slug))
    .map(([slug, entry]) => ({
      slug,
      name: entry.meta?.name ?? entry.folderName,
      tagline: entry.meta?.tagline ?? '',
      description: entry.meta?.description ?? '',
      category: isCategoryId(entry.meta?.category) ? entry.meta.category : null,
      shootTypes: ALL_SHOOT_TYPES,
      specifications: [],
      environment: { kind: 'pavilion' as const, accent: gold, labelHeight: 6.2 },
    }))

  return [...CATALOGUE, ...discovered].map((entry, index) => {
    const gallery = photosFor(entry.slug, entry.name)
    return {
      ...entry,
      id: entry.slug,
      number: String(index + 1).padStart(2, '0'),
      heroImage: gallery[0] ?? null,
      gallery,
      enquiry: {
        subject: `Enquiry: ${entry.name} set`,
        suggestedShootTypes: entry.shootTypes,
      },
      source: catalogueSlugs.has(entry.slug) ? 'catalogue' : 'asset-collection',
    }
  })
}

export const STUDIO_SETS: StudioSet[] = buildSets()

export const TOTAL_PHOTOGRAPHS = STUDIO_SETS.reduce((total, set) => total + set.gallery.length, 0)

const setsById = new Map(STUDIO_SETS.map((set) => [set.id, set]))

export const getSetById = (id: string | null | undefined): StudioSet | undefined =>
  id ? setsById.get(id) : undefined

export const getSetBySlug = getSetById

export const getCategory = (id: SetCategoryId | null): SetCategory | undefined =>
  SET_CATEGORIES.find((category) => category.id === id)

export const getCategoryLabel = (id: SetCategoryId | null): string => getCategory(id)?.label ?? 'Studio set'

export const getShootTypeLabel = (id: ShootTypeId): string =>
  SHOOT_TYPES.find((type) => type.id === id)?.label ?? id

export const matchesFilter = (set: StudioSet, filter: CategoryFilterId): boolean =>
  filter === 'all' || set.category === filter

/** Only categories that at least one real set belongs to are offered as filters. */
export const ACTIVE_CATEGORIES: SetCategory[] = SET_CATEGORIES.filter((category) =>
  STUDIO_SETS.some((set) => set.category === category.id),
)

export const getAdjacentSet = (id: string, direction: 1 | -1): StudioSet => {
  const index = STUDIO_SETS.findIndex((set) => set.id === id)
  const next = (index + direction + STUDIO_SETS.length) % STUDIO_SETS.length
  return STUDIO_SETS[next]
}
