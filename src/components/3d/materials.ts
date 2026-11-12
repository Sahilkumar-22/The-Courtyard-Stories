import { DoubleSide, MeshStandardMaterial, type Side, type Texture } from 'three'
import { BRAND_COLOURS, shadeOf, tintOf, toBrand } from '@/data/brandColours'

const { navy, beige, terracotta, gold, blue } = BRAND_COLOURS

/**
 * The studio's five colours as they appear in the 3D world. Each material name is one
 * of the codes, a shade of it (towards the navy) or a tint of it (towards the beige).
 */
export const PALETTE = {
  ivory: beige,
  plaster: beige,
  champagne: shadeOf(beige, 0.1),
  sand: shadeOf(beige, 0.1),
  limestone: beige,
  sandstone: tintOf(terracotta, 0.4),
  rose: tintOf(terracotta, 0.2),
  terracotta,
  ochre: tintOf(gold, 0.4),
  oak: shadeOf(terracotta, 0.2),
  wood: shadeOf(terracotta, 0.4),
  walnut: shadeOf(terracotta, 0.6),
  espresso: shadeOf(terracotta, 0.8),
  charcoal: navy,
  brass: gold,
  marble: beige,
  sage: tintOf(blue, 0.6),
  olive: gold,
  foliage: shadeOf(gold, 0.2),
  cypress: shadeOf(blue, 0.4),
  linen: beige,
  burgundy: shadeOf(terracotta, 0.4),
  water: navy,
} as const

/**
 * White and black are not colours here but multipliers. White leaves a texture, or the
 * colours given to individual instances, exactly as they are; black switches a surface's
 * lit colour off so that only its glow shows. Everything else is drawn from the palette.
 */
const IDENTITY = '#ffffff'
const UNLIT = '#000000'
const fromPalette = (colour: string) => {
  const key = colour.toLowerCase()
  return key === IDENTITY || key === UNLIT ? key : toBrand(colour)
}

interface MaterialOptions {
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  map?: Texture | null
  transparent?: boolean
  opacity?: number
  side?: Side
  alphaTest?: number
  depthWrite?: boolean
  envMapIntensity?: number
  flatShading?: boolean
}

const cache = new Map<string, MeshStandardMaterial>()

/** Returns a shared material: identical requests reuse one instance, keeping draw state small. */
export function mat(requested: string, options: MaterialOptions = {}): MeshStandardMaterial {
  const { map, ...rest } = options
  const color = fromPalette(requested)
  if (rest.emissive) rest.emissive = fromPalette(rest.emissive)
  const key = `${color}|${map?.uuid ?? ''}|${JSON.stringify(rest)}`
  let material = cache.get(key)
  if (!material) {
    material = new MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...rest, map: map ?? null })
    cache.set(key, material)
  }
  return material
}

/** Frees the GPU programs behind the shared materials. The objects stay reusable. */
export function disposeMaterials() {
  cache.forEach((material) => material.dispose())
}

export const plaster = (color: string = PALETTE.plaster) => mat(color, { roughness: 0.95 })
export const stone = (color: string = PALETTE.limestone) => mat(color, { roughness: 0.82 })
export const timber = (color: string = PALETTE.wood) => mat(color, { roughness: 0.68 })
export const fabric = (color: string = PALETTE.linen) => mat(color, { roughness: 1 })
export const foliage = (color: string = PALETTE.foliage) => mat(color, { roughness: 0.95, flatShading: true })
export const brass = () => mat(PALETTE.brass, { roughness: 0.34, metalness: 1, envMapIntensity: 1.3 })
export const iron = () => mat(PALETTE.charcoal, { roughness: 0.55, metalness: 0.6 })
export const polished = (color: string = PALETTE.marble) => mat(color, { roughness: 0.28, envMapIntensity: 0.9 })
export const textured = (map: Texture, roughness = 0.85) => mat(IDENTITY, { map, roughness })

/**
 * A surface that glows: lamp shades, bulbs, lit windows. It shows its palette colour at
 * full strength whatever the light, never brighter, so a glow stays a palette colour.
 */
export const glow = (color: string) =>
  mat(UNLIT, { emissive: color, emissiveIntensity: 1, roughness: 1, envMapIntensity: 0 })

export const glass = () =>
  mat(tintOf(blue, 0.6), {
    roughness: 0.06,
    metalness: 0.1,
    transparent: true,
    opacity: 0.2,
    side: DoubleSide,
    depthWrite: false,
    envMapIntensity: 1.6,
  })
