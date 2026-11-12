import { STUDIO_SETS } from '@/data/studioSets'

/** Footprint of one exhibition space, in metres. Local +z opens towards the courtyard. */
export const ROOM = {
  width: 7,
  depth: 6,
  height: 4.4,
  plinth: 0.24,
} as const

const ARC_SPAN = (200 * Math.PI) / 180
const SLOT_GAP = 0.9

export interface SetSlot {
  /** Angle around the courtyard, 0 = north (far side), positive = east. */
  angle: number
  position: [number, number, number]
  rotationY: number
  /** Unit vector on the ground from the space towards the courtyard centre. */
  facing: [number, number]
  /** 0 for the central spaces, 1 for the two ends: the order in which spaces are revealed. */
  rank: number
}

export interface StudioLayout {
  /** Radius of the open fronts of the spaces. */
  frontRadius: number
  /** Radius of the centres of the spaces. */
  centreRadius: number
  outerRadius: number
  slotAngle: number
  slots: SetSlot[]
}

/** Arranges the spaces in a horseshoe that opens towards the entrance gate. */
export function computeLayout(count: number): StudioLayout {
  const safeCount = Math.max(count, 1)
  const slotAngle = ARC_SPAN / Math.max(safeCount, 6)
  const frontRadius = Math.max((ROOM.width + SLOT_GAP) / (2 * Math.sin(slotAngle / 2)), 16)
  const centreRadius = frontRadius + ROOM.depth / 2
  const start = (-slotAngle * (safeCount - 1)) / 2
  const middle = (safeCount - 1) / 2

  const slots: SetSlot[] = Array.from({ length: safeCount }, (_, index) => {
    const angle = start + slotAngle * index
    return {
      angle,
      position: [centreRadius * Math.sin(angle), 0, -centreRadius * Math.cos(angle)],
      rotationY: -angle,
      facing: [-Math.sin(angle), Math.cos(angle)],
      rank: middle === 0 ? 0 : Math.abs(index - middle) / middle,
    }
  })

  return { frontRadius, centreRadius, outerRadius: frontRadius + ROOM.depth, slotAngle, slots }
}

export const STUDIO_LAYOUT = computeLayout(STUDIO_SETS.length)

const slotIndexById = new Map(STUDIO_SETS.map((set, index) => [set.id, index]))

export const getSlotForSet = (setId: string): SetSlot | undefined => {
  const index = slotIndexById.get(setId)
  return index === undefined ? undefined : STUDIO_LAYOUT.slots[index]
}

/** Fixed architecture around the horseshoe. */
export const SITE = {
  plazaRadius: 9,
  poolRadius: 2.6,
  /** z of the entrance gate, south of the courtyard. */
  gateZ: STUDIO_LAYOUT.frontRadius,
  gateWidth: 16,
  gateHeight: 8.2,
  corridorHalfWidth: 2.6,
  /** Radius of the walkway that runs past every space. */
  walkInner: STUDIO_LAYOUT.frontRadius - 3.4,
  walkOuter: STUDIO_LAYOUT.frontRadius - 0.15,
} as const
