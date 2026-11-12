import type { StudioPhoto } from '@/types/studio'
import { ROOM } from '../layout'
import { PALETTE, stone } from '../materials'
import { Block } from '../primitives'

export const W = ROOM.width
export const D = ROOM.depth
export const H = ROOM.height
/** Half width and half depth: walls sit at x = +/-HW and z = -HD; the open front is at z = +HD. */
export const HW = W / 2
export const HD = D / 2

export interface SetEnvironmentProps {
  /** The set's hero photograph, for spaces that hang it on a wall. */
  heroImage: StudioPhoto | null
  /** 1 on desktop, lower on tablets and phones: scales instanced detail. */
  density: number
  /** Scales curve resolution. */
  segments: number
  /** When true, ambient motion (drifting petals) is switched off. */
  reducedMotion: boolean
}

/** Deterministic random numbers, so every visitor sees the same arrangement. */
export function seeded(seed: number) {
  let state = seed | 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const curve = (segments: number, base = 14) => Math.max(6, Math.round(base * segments))

/** The stone base every exhibition space stands on, with a step down to the walkway. */
export function Plinth() {
  const material = stone(PALETTE.limestone)
  return (
    <group>
      <Block size={[W + 0.7, ROOM.plinth, D + 0.7]} position={[0, -ROOM.plinth / 2, 0]} material={material} />
      <Block size={[W - 1.2, ROOM.plinth / 2, 0.5]} position={[0, -ROOM.plinth * 0.75, HD + 0.55]} material={material} />
    </group>
  )
}
