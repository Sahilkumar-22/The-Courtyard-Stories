import { CatmullRomCurve3, MathUtils, Vector3 } from 'three'
import { getPanelInsets } from '@/components/studio/uiMetrics'
import { STUDIO_SETS } from '@/data/studioSets'
import type { StudioSet } from '@/types/studio'
import { ROOM, type SetSlot, SITE, STUDIO_LAYOUT } from './layout'

export interface OrbitLimits {
  minDistance: number
  maxDistance: number
  minPolar: number
  maxPolar: number
  minAzimuth: number
  maxAzimuth: number
}

export interface CameraPose {
  position: Vector3
  target: Vector3
  /** View shift as a fraction of the viewport, so UI panels never cover the subject. */
  offsetX: number
  offsetY: number
  limits: OrbitLimits
}

const tanHalf = (fov: number) => Math.tan(MathUtils.degToRad(fov) / 2)

const orbit = (target: Vector3, distance: number, azimuth: number, elevation: number) =>
  new Vector3(
    target.x + distance * Math.cos(elevation) * Math.sin(azimuth),
    target.y + distance * Math.sin(elevation),
    target.z + distance * Math.cos(elevation) * Math.cos(azimuth),
  )

const OVERVIEW_AZIMUTH_RANGE = MathUtils.degToRad(100)

/**
 * Screen space the explorer's interface occupies, in CSS pixels: the header, the filter
 * and the name labels that float above the far spaces; and the bottom bar.
 */
interface Chrome {
  top: number
  bottom: number
  left: number
  right: number
}

const OVERVIEW_CHROME: Chrome = { top: 218, bottom: 92, left: 28, right: 28 }

/** Outside the explorer (the homepage story, the welcome view) only the header is in the way. */
const STORY_CHROME: Chrome = { top: 96, bottom: 40, left: 28, right: 28 }

/** Width in CSS pixels below which the interface switches to its compact, phone layout. */
const COMPACT_WIDTH = 820

/** In the story's overview the copy stands on the left of wide screens; the courtyard keeps clear of it. */
const storyOverviewChrome = (width: number): Chrome =>
  width > COMPACT_WIDTH ? { ...STORY_CHROME, left: Math.min(width * 0.36, 560) } : STORY_CHROME

/** Points that must stay in view in the overview: every space up to its label anchor, and the gate. */
const OVERVIEW_POINTS: Vector3[] = (() => {
  const points: Vector3[] = []
  const reach = Math.hypot(ROOM.width, ROOM.depth) / 2
  STUDIO_LAYOUT.slots.forEach((slot, index) => {
    const [x, , z] = slot.position
    for (const dx of [-reach, reach]) {
      for (const dz of [-reach, reach]) {
        points.push(new Vector3(x + dx, 0, z + dz))
      }
    }
    const labelHeight = STUDIO_SETS[index]?.environment.labelHeight ?? ROOM.height
    points.push(new Vector3(x, ROOM.plinth + labelHeight + 0.5, z))
  })
  for (const x of [-SITE.gateWidth / 2, SITE.gateWidth / 2]) {
    points.push(new Vector3(x, 0, SITE.gateZ + 1.5), new Vector3(x, SITE.gateHeight, SITE.gateZ))
  }
  return points
})()

const basisForward = new Vector3()
const basisRight = new Vector3()
const basisUp = new Vector3()
const basisPoint = new Vector3()
const WORLD_UP = new Vector3(0, 1, 0)

/** Screen-space bounds (in NDC) of a set of points seen from a camera position. */
function projectedBounds(position: Vector3, target: Vector3, fov: number, aspect: number, points: Vector3[]) {
  basisForward.subVectors(target, position).normalize()
  basisRight.crossVectors(basisForward, WORLD_UP).normalize()
  basisUp.crossVectors(basisRight, basisForward)
  const scale = tanHalf(fov)
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const point of points) {
    basisPoint.subVectors(point, position)
    const depth = Math.max(basisPoint.dot(basisForward), 0.001)
    const x = basisPoint.dot(basisRight) / (depth * scale * aspect)
    const y = basisPoint.dot(basisUp) / (depth * scale)
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  return { minX, maxX, minY, maxY }
}

/** The default view: the whole courtyard, seen from above the entrance. */
export function overviewPose(width: number, height: number, fov: number, chrome = OVERVIEW_CHROME): CameraPose {
  const aspect = width / Math.max(height, 1)
  if (aspect < 1) {
    // Portrait screens stand in the plaza beside the pool and turn to face each space in
    // sequence: the camera circles the centre, always looking across it at the far side.
    const target = new Vector3(0, 3.4, 0)
    const distance = SITE.plazaRadius - 0.5
    return {
      position: orbit(target, distance, 0, MathUtils.degToRad(6)),
      target,
      offsetX: 0,
      offsetY: 0,
      limits: {
        minDistance: 4.5,
        // Stay inside the plaza, clear of the corridor.
        maxDistance: SITE.plazaRadius + 1.5,
        minPolar: 1.05,
        maxPolar: 1.5,
        minAzimuth: -OVERVIEW_AZIMUTH_RANGE,
        maxAzimuth: OVERVIEW_AZIMUTH_RANGE,
      },
    }
  }

  // Frame the courtyard inside the part of the screen the interface leaves free:
  // find the closest distance at which every space, its label and the gate fit.
  const elevation = MathUtils.degToRad(33)
  const target = new Vector3(0, 1, (SITE.gateZ + 1.5 - STUDIO_LAYOUT.outerRadius) / 2)
  const top = chrome.top / height
  const bottom = chrome.bottom / height
  const freeWidth = 1 - (chrome.left + chrome.right) / width
  const freeHeight = Math.max(1 - top - bottom, 0.4)

  let near = 20
  let far = 400
  for (let step = 0; step < 24; step += 1) {
    const middle = (near + far) / 2
    const bounds = projectedBounds(orbit(target, middle, 0, elevation), target, fov, aspect, OVERVIEW_POINTS)
    const fits = (bounds.maxX - bounds.minX) / 2 <= freeWidth && (bounds.maxY - bounds.minY) / 2 <= freeHeight
    if (fits) far = middle
    else near = middle
  }
  const distance = far
  const position = orbit(target, distance, 0, elevation)
  const bounds = projectedBounds(position, target, fov, aspect, OVERVIEW_POINTS)

  return {
    position,
    target,
    // Centre the framed content in the free area the chrome leaves on each axis.
    // (A positive offset moves the picture left and up; NDC y also points up.)
    offsetX: (chrome.right - chrome.left) / (2 * width),
    offsetY: (bottom - top) / 2 - (bounds.minY + bounds.maxY) / 4,
    limits: {
      minDistance: 24,
      maxDistance: distance * 1.3,
      minPolar: 0.4,
      maxPolar: 1.34,
      minAzimuth: -OVERVIEW_AZIMUTH_RANGE,
      maxAzimuth: OVERVIEW_AZIMUTH_RANGE,
    },
  }
}

/** A lower three-quarter view shown behind the explorer's welcome overlay. */
export function introPose(width: number, height: number, fov: number): CameraPose {
  const overview = overviewPose(width, height, fov, STORY_CHROME)
  const portrait = width < height
  const target = new Vector3(0, portrait ? 3 : 2, -3)
  const distance = portrait ? 44 : overview.position.distanceTo(overview.target) * 0.8
  return {
    ...overview,
    offsetX: 0,
    // On portrait screens the welcome card fills the lower half, so the view moves up.
    offsetY: portrait ? 0.17 : 0,
    target,
    position: orbit(target, distance, portrait ? -0.35 : -0.52, MathUtils.degToRad(portrait ? 16 : 19)),
  }
}

/** The view of one selected space, framed inside the part of the screen the panel leaves free. */
export function focusPose(set: StudioSet, slot: SetSlot, width: number, height: number, fov: number): CameraPose {
  const insets = getPanelInsets(width)
  const compact = insets.bottom > 0
  // Fractions of the viewport covered by the header with the filter beneath it, and the bottom bar.
  const top = (compact ? 116 : 138) / height
  const bottom = compact ? insets.bottom : 92 / height
  const freeWidth = 1 - insets.right
  const freeHeight = Math.max(1 - top - bottom, 0.3)

  const fitWidth = ROOM.width + 2.6
  const fitHeight = set.environment.labelHeight + 0.4
  const aspect = width / height
  const distanceForWidth = fitWidth / 2 / (tanHalf(fov) * aspect * freeWidth)
  const distanceForHeight = fitHeight / 2 / (tanHalf(fov) * freeHeight)
  const distance = Math.max(distanceForWidth, distanceForHeight) * 1.1

  const [x, , z] = slot.position
  const [fx, fz] = slot.facing
  const target = new Vector3(x, fitHeight * 0.46, z)
  const elevation = MathUtils.degToRad(11)
  const position = new Vector3(
    target.x + fx * distance * Math.cos(elevation),
    target.y + distance * Math.sin(elevation),
    target.z + fz * distance * Math.cos(elevation),
  )
  const azimuth = Math.atan2(position.x - target.x, position.z - target.z)

  return {
    position,
    target,
    offsetX: insets.right / 2,
    offsetY: (bottom - top) / 2,
    limits: {
      minDistance: distance * 0.5,
      maxDistance: distance * 1.35,
      minPolar: 0.95,
      maxPolar: 1.5,
      minAzimuth: azimuth - 0.62,
      maxAzimuth: azimuth + 0.62,
    },
  }
}

export interface StoryCurves {
  position: CatmullRomCurve3
  look: CatmullRomCurve3
  /** View shift at each stop of the story, so the scene stays clear of the copy laid over it. */
  offsetX: number[]
  offsetY: number[]
}

/** Linear interpolation through a list of values, one per story stop. */
export function sampleStops(values: number[], t: number): number {
  const clamped = MathUtils.clamp(t, 0, values.length - 1)
  const index = Math.min(Math.floor(clamped), values.length - 2)
  return MathUtils.lerp(values[index], values[index + 1], clamped - index)
}

/** Number of segments in the scroll story: intro, entering, reveal, overview, invitation. */
export const STORY_LENGTH = 4

/**
 * The camera path of the scroll story. Position 0 looks at the gate from outside, 1 is in
 * the corridor, 2 rises over the plaza as the spaces appear, 3 is the full overview and
 * 4 is the closing three-quarter view.
 */
export function storyCurves(width: number, height: number, fov: number): StoryCurves {
  const overview = overviewPose(width, height, fov, storyOverviewChrome(width))
  const portrait = width < height
  const compact = width <= COMPACT_WIDTH
  const gate = SITE.gateZ
  // Wide screens carry the copy at one side, so the picture moves to the other;
  // compact screens carry it at the bottom, so the picture moves up.
  const beside = (copyWidth: number) => Math.min(0.2, (copyWidth / width) * 0.3)
  const offsetX = compact ? [0, 0, 0, overview.offsetX, 0] : [-beside(820), -beside(620), beside(620), overview.offsetX, 0]
  // The opening copy is the tallest (headline, buttons and cue), so the gate is lifted furthest.
  const offsetY = compact ? [0.22, 0.12, 0.12, overview.offsetY + 0.12, 0] : [0, 0, 0, overview.offsetY, 0]
  const finalTarget = new Vector3(0, portrait ? 3 : 2, -3)
  const finalDistance = portrait ? 40 : overview.position.distanceTo(overview.target) * 0.7

  const position = [
    new Vector3(0, portrait ? 2.6 : 2.3, gate + (portrait ? 42 : 27)),
    new Vector3(0, 2.4, gate - 5.5),
    portrait ? new Vector3(0, 3.3, SITE.plazaRadius + 4.5) : new Vector3(0, 8.5, 15),
    overview.position.clone(),
    orbit(finalTarget, finalDistance, portrait ? -0.6 : -0.78, MathUtils.degToRad(portrait ? 15 : 17)),
  ]
  const look = [
    new Vector3(0, portrait ? 6 : 5.2, gate - 6),
    new Vector3(0, 2.8, 0),
    new Vector3(0, portrait ? 3 : 2.4, -14),
    overview.target.clone(),
    finalTarget,
  ]
  return {
    position: new CatmullRomCurve3(position, false, 'centripetal'),
    look: new CatmullRomCurve3(look, false, 'centripetal'),
    offsetX,
    offsetY,
  }
}
