/**
 * The Courtyard Studio's colour palette, as supplied by the studio. These five codes are
 * the only colours the website uses. Where a surface needs to be darker or lighter than
 * a code (a shadowed wall, a pale blossom), it is a shade of that code towards the navy
 * or a tint of it towards the beige, so every tone on the site is built from the five.
 *
 * The same values are declared for the interface in src/styles/base.css.
 */
export const BRAND_COLOURS = {
  navy: '#17243a',
  beige: '#e8d8c3',
  terracotta: '#c46b50',
  gold: '#d9a52e',
  blue: '#345da8',
} as const

type RGB = [number, number, number]
type Lab = [number, number, number]
type Family = 'neutral' | 'terracotta' | 'gold' | 'blue'

function parse(colour: string): RGB | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(colour.trim())
  if (!match) return null
  const hex = match[1].length === 3 ? match[1].replace(/./g, '$&$&') : match[1]
  const value = parseInt(hex, 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

const toHex = (rgb: RGB) => `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`

const NAVY = parse(BRAND_COLOURS.navy)!
const BEIGE = parse(BRAND_COLOURS.beige)!

const blend = (from: RGB, to: RGB, amount: number): RGB => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
  from[2] + (to[2] - from[2]) * amount,
]

function toLab([r, g, b]: RGB): Lab {
  const linear = (channel: number) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const [lr, lg, lb] = [linear(r), linear(g), linear(b)]
  const curve = (value: number) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116)
  const x = curve((0.4124 * lr + 0.3576 * lg + 0.1805 * lb) / 0.95047)
  const y = curve(0.2126 * lr + 0.7152 * lg + 0.0722 * lb)
  const z = curve((0.0193 * lr + 0.1192 * lg + 0.9505 * lb) / 1.08883)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

interface Tone {
  hex: string
  lab: Lab
  family: Family
  /** One of the five codes exactly. */
  pure: boolean
}

/** Every tone the 3D world may use: the five codes, their shades and their tints. */
const TONES: Tone[] = (() => {
  const tones: Tone[] = []
  const add = (rgb: RGB, family: Family, pure = false) => tones.push({ hex: toHex(rgb), lab: toLab(rgb), family, pure })

  // Neutrals run from the beige to the navy.
  for (let step = 0; step <= 10; step += 1) add(blend(BEIGE, NAVY, step / 10), 'neutral', step === 0 || step === 10)

  for (const family of ['terracotta', 'gold', 'blue'] as const) {
    const code = parse(BRAND_COLOURS[family])!
    add(code, family, true)
    for (const amount of [0.2, 0.4, 0.6, 0.8]) {
      add(blend(code, NAVY, amount), family)
      add(blend(code, BEIGE, amount), family)
    }
  }
  return tones
})()

const approved = new Set(TONES.map((tone) => tone.hex))
const cache = new Map<string, string>()

/** Which of the palette's colour families a colour may be drawn from, by its hue. */
function familiesFor([r, g, b]: RGB): Family[] {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const chroma = max - min
  if (max === 0 || chroma / max < 0.18) return ['neutral']

  let hue: number
  if (max === r) hue = ((g - b) / chroma) % 6
  else if (max === g) hue = (b - r) / chroma + 2
  else hue = (r - g) / chroma + 4
  hue = (hue * 60 + 360) % 360

  if (hue >= 320 || hue < 75) return ['terracotta', 'gold', 'neutral']
  if (hue < 170) return ['gold']
  return ['blue', 'neutral']
}

/**
 * The palette tone that stands in for any colour: the closest shade or tint of the code
 * with the nearest hue. A colour that is already a palette tone is returned unchanged.
 */
export function toBrand(colour: string): string {
  const key = colour.trim().toLowerCase()
  if (approved.has(key)) return key
  const cached = cache.get(key)
  if (cached) return cached

  const rgb = parse(key)
  if (!rgb) return colour
  const lab = toLab(rgb)
  const families = familiesFor(rgb)

  let best = TONES[0]
  let bestDistance = Infinity
  for (const tone of TONES) {
    if (!families.includes(tone.family)) continue
    const distance = Math.hypot(lab[0] - tone.lab[0], lab[1] - tone.lab[1], lab[2] - tone.lab[2]) * (tone.pure ? 0.8 : 1)
    if (distance < bestDistance) {
      best = tone
      bestDistance = distance
    }
  }
  cache.set(key, best.hex)
  return best.hex
}

/** A shade of a colour: `amount` of the way towards the navy. */
export function shadeOf(colour: string, amount: number): string {
  const rgb = parse(toBrand(colour))
  if (!rgb) return colour
  const hex = toHex(blend(rgb, NAVY, Math.min(Math.max(amount, 0), 1)))
  approved.add(hex)
  return hex
}

/** A tint of a colour: `amount` of the way towards the beige. */
export function tintOf(colour: string, amount: number): string {
  const rgb = parse(toBrand(colour))
  if (!rgb) return colour
  const hex = toHex(blend(rgb, BEIGE, Math.min(Math.max(amount, 0), 1)))
  approved.add(hex)
  return hex
}

/** The red, green and blue channels of a palette colour, for canvas `rgba()` strings. */
export function channelsOf(colour: string): string {
  const rgb = parse(colour) ?? BEIGE
  return rgb.map((channel) => Math.round(channel)).join(',')
}
