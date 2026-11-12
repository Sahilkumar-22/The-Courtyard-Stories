import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { STUDIO_SETS } from '@/data/studioSets'
import { setLabelElements } from '@/store/studioStore'
import { ROOM, STUDIO_LAYOUT } from './layout'

const anchor = new Vector3()

/** Space kept between two labels, in CSS pixels. */
const LABEL_GAP = 6
/** How often the label sizes are read again, in frames. */
const MEASURE_EVERY = 90

interface LabelState {
  id: string
  element: HTMLElement
  /** Placement order: labels placed earlier keep their position. */
  order: number
  x: number
  y: number
  width: number
  height: number
  /** How far the label is currently raised above its anchor to clear its neighbours. */
  lift: number
  goal: number
  shown: boolean
  behind: boolean
  applied: string
}

/**
 * Keeps each set's name label (a DOM element owned by the interface) pinned above its
 * space as the camera moves, and raises labels that would otherwise cover a neighbour.
 * It writes positions directly, so nothing re-renders.
 * Mount it after the camera controller so it sees this frame's camera.
 */
export function SetLabelAnchors() {
  const labels = useRef(new Map<string, LabelState>())
  const frame = useRef(0)

  useEffect(() => {
    const cache = labels.current
    return () => cache.clear()
  }, [])

  useFrame(({ camera, size, invalidate }, delta) => {
    if (setLabelElements.size === 0) return
    camera.updateMatrixWorld()
    const measure = frame.current % MEASURE_EVERY === 0
    frame.current += 1

    const active: LabelState[] = []
    STUDIO_SETS.forEach((set, index) => {
      const element = setLabelElements.get(set.id)
      const slot = STUDIO_LAYOUT.slots[index]
      if (!element || !slot) return

      // The interface can re-create a label; a new element always starts afresh.
      let label = labels.current.get(set.id)
      if (!label || label.element !== element) {
        label = {
          id: set.id,
          element,
          // Every second position is placed first, then the ones between them;
          // within each group the nearer spaces (lower on the screen) go first.
          order: index % 2,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          lift: 0,
          goal: 0,
          shown: false,
          behind: false,
          applied: '',
        }
        labels.current.set(set.id, label)
      }
      const pill = element.firstElementChild as HTMLElement | null
      if (pill && (measure || label.width === 0)) {
        label.width = pill.offsetWidth
        label.height = pill.offsetHeight
      }

      anchor.set(slot.position[0], ROOM.plinth + set.environment.labelHeight + 0.5, slot.position[2]).project(camera)
      label.behind = anchor.z > 1
      label.x = ((anchor.x + 1) / 2) * size.width
      label.y = ((1 - anchor.y) / 2) * size.height
      label.shown = !label.behind && Boolean(pill?.classList.contains('is-visible'))
      label.goal = 0
      active.push(label)
    })

    // Every second space keeps its label in place; the labels between them are then
    // raised by the least amount that clears their neighbours, which gives two tidy rows.
    const placedLabels: LabelState[] = []
    const collides = (label: LabelState, lift: number) =>
      placedLabels.some((other) => {
        const bottom = label.y - lift
        const otherBottom = other.y - other.goal
        const overlapX = Math.abs(label.x - other.x) < (label.width + other.width) / 2 + LABEL_GAP
        const overlapY = bottom - label.height < otherBottom + LABEL_GAP && bottom > otherBottom - other.height - LABEL_GAP
        return overlapX && overlapY
      })
    active
      .filter((label) => label.shown)
      .sort((a, b) => a.order - b.order || b.y - a.y)
      .forEach((label) => {
        const candidates = placedLabels
          .map((other) => label.y - (other.y - other.goal - other.height - LABEL_GAP) + 0.01)
          .filter((lift) => lift > 0)
          .sort((a, b) => a - b)
        label.goal = [0, ...candidates].find((lift) => !collides(label, lift)) ?? 0
        placedLabels.push(label)
      })

    const ease = 1 - Math.exp(-Math.min(delta, 0.1) * 12)
    let settling = false
    active.forEach((label) => {
      const first = label.applied === ''
      label.lift = first ? label.goal : label.lift + (label.goal - label.lift) * ease
      if (Math.abs(label.goal - label.lift) < 0.25) label.lift = label.goal
      else settling = true

      const next = label.behind ? 'hidden' : `translate3d(${label.x.toFixed(1)}px, ${(label.y - label.lift).toFixed(1)}px, 0)`
      if (label.applied === next) return
      label.applied = next
      label.element.dataset.placed = '1'
      label.element.style.visibility = label.behind ? 'hidden' : ''
      if (!label.behind) label.element.style.transform = next
    })

    // When rendering on demand, keep going until every label has settled.
    if (settling) invalidate()
  })

  return null
}
