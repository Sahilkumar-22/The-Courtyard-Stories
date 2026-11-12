import { useMemo } from 'react'
import { fabric, foliage, glass, iron, PALETTE, stone, textured, timber } from '../materials'
import { Ball, Block, boxGeometry, Cyl, Floor, Gable, Instances, type InstanceItem, Panel } from '../primitives'
import { paversTexture } from '../textures'
import { D, type SetEnvironmentProps, W } from './common'
import { PottedPlant, StandardTree } from './furniture'

const HALF = 3
const BACK = -2.6
const FRONT = 2.4
const LENGTH = FRONT - BACK
const MID_Z = (FRONT + BACK) / 2
const BASE = 0.45
const EAVE = 2.7
const RIDGE = 4.3
const RISE = RIDGE - EAVE
const SLOPE = Math.hypot(HALF, RISE)
const PITCH = Math.atan2(RISE, HALF)
const BAYS = [BACK, -1.35, -0.1, 1.15, FRONT]
const DOOR_HALF = 0.85

/** Height of the roof line above a point x metres from the centre. */
const roofAt = (x: number) => EAVE + ((HALF - Math.abs(x)) / HALF) * RISE

export function GlassHouse(_props: SetEnvironmentProps) {
  const steel = iron()
  const pane = glass()
  const base = stone('#d3c6b5')

  const frame = useMemo<InstanceItem[]>(() => {
    const items: InstanceItem[] = []
    const member = 0.07
    for (const z of BAYS) {
      for (const side of [-1, 1]) {
        items.push({ position: [side * HALF, (EAVE + BASE) / 2, z], scale: [member, EAVE - BASE, member] })
        items.push({
          position: [(side * HALF) / 2, (EAVE + RIDGE) / 2, z],
          rotation: [0, 0, -side * PITCH],
          scale: [SLOPE, member, member],
        })
      }
    }
    for (const side of [-1, 1]) {
      items.push({ position: [side * HALF, EAVE, MID_Z], scale: [0.08, 0.08, LENGTH] })
      items.push({ position: [side * HALF, 1.6, MID_Z], scale: [0.05, 0.05, LENGTH] })
      items.push({ position: [(side * HALF) / 2, (EAVE + RIDGE) / 2, MID_Z], rotation: [0, 0, -side * PITCH], scale: [0.05, 0.05, LENGTH] })
    }
    items.push({ position: [0, RIDGE, MID_Z], scale: [0.09, 0.09, LENGTH + 0.1] })
    // Gable ends.
    for (const z of [BACK, FRONT]) {
      items.push({ position: [0, EAVE, z], scale: [HALF * 2, member, member] })
      items.push({ position: [0, (EAVE + RIDGE) / 2, z], scale: [member, RISE, member] })
    }
    for (const x of [-1.5, 0, 1.5]) {
      const top = x === 0 ? EAVE : roofAt(x)
      items.push({ position: [x, (BASE + top) / 2, BACK], scale: [0.05, top - BASE, 0.05] })
    }
    items.push({ position: [0, 1.6, BACK], scale: [HALF * 2, 0.05, 0.05] })
    // Doorway.
    for (const side of [-1, 1]) {
      items.push({ position: [side * DOOR_HALF, EAVE / 2, FRONT], scale: [member, EAVE, member] })
      items.push({ position: [side * 1.92, (BASE + EAVE) / 2, FRONT], scale: [0.05, EAVE - BASE, 0.05] })
    }
    items.push({ position: [0, 2.2, FRONT], scale: [DOOR_HALF * 2, 0.06, 0.06] })
    return items
  }, [])

  const sideWidth = HALF - DOOR_HALF

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(paversTexture('#e8d8c3', 3.5, 3))} />

      {/* Low masonry base. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block size={[0.24, BASE, LENGTH]} position={[side * HALF, BASE / 2, MID_Z]} material={base} />
          <Block size={[sideWidth, BASE, 0.24]} position={[side * (DOOR_HALF + sideWidth / 2), BASE / 2, FRONT]} material={base} />
        </group>
      ))}
      <Block size={[HALF * 2 + 0.24, BASE, 0.24]} position={[0, BASE / 2, BACK]} material={base} />

      {/* Steel frame. */}
      <Instances geometry={boxGeometry()} material={steel} items={frame} />

      {/* Glazing. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Panel
            width={LENGTH}
            height={EAVE - BASE}
            position={[side * HALF, (EAVE + BASE) / 2, MID_Z]}
            rotation={[0, Math.PI / 2, 0]}
            material={pane}
            receive={false}
          />
          <group position={[(side * HALF) / 2, (EAVE + RIDGE) / 2, MID_Z]} rotation={[0, 0, -side * PITCH]}>
            <Floor width={SLOPE} depth={LENGTH} material={pane} receive={false} />
          </group>
          <Panel
            width={sideWidth}
            height={EAVE - BASE}
            position={[side * (DOOR_HALF + sideWidth / 2), (EAVE + BASE) / 2, FRONT]}
            material={pane}
            receive={false}
          />
        </group>
      ))}
      <Panel width={HALF * 2} height={EAVE - BASE} position={[0, (EAVE + BASE) / 2, BACK]} material={pane} receive={false} />
      {[BACK, FRONT].map((z) => (
        <Gable key={z} width={HALF * 2} height={RISE} depth={0.012} position={[0, EAVE, z]} material={pane} cast={false} receive={false} />
      ))}

      {/* Planting and a daybed. */}
      <StandardTree position={[2.1, 0, -1.7]} height={1.75} />
      <PottedPlant position={[-2.4, 0, -1.9]} scale={1.25} />
      <PottedPlant position={[-2.45, 0, 0.9]} scale={0.95} leaf="#b28b30" />
      <PottedPlant position={[2.4, 0, 1.2]} scale={1.1} leaf="#8b7133" />
      <PottedPlant position={[1.4, 0, -2.1]} scale={0.75} leaf="#8b7133" pot="#d3c6b5" />
      {[-1.1, 1.3].map((z, index) => (
        <group key={z} position={[index === 0 ? 0.9 : -0.8, RIDGE - 0.05, z]}>
          <Cyl radius={0.008} height={0.8} position={[0, -0.4, 0]} material={steel} segments={5} cast={false} />
          <Cyl radius={0.12} topRadius={0.17} height={0.16} position={[0, -0.88, 0]} material={timber(PALETTE.oak)} segments={12} />
          <Ball radius={0.26} faceted stretch={[1, 0.8, 1]} position={[0, -0.84, 0]} material={foliage('#b28b30')} />
          <Ball radius={0.16} faceted position={[0.1, -1.08, 0.05]} material={foliage('#b28b30')} />
        </group>
      ))}
      <group position={[-0.5, 0, -1.45]}>
        <Block size={[2, 0.26, 0.85]} position={[0, 0.27, 0]} material={timber(PALETTE.oak)} />
        {[-0.9, 0.9].flatMap((x) =>
          [-0.35, 0.35].map((z) => <Block key={`${x}${z}`} size={[0.06, 0.16, 0.06]} position={[x, 0.08, z]} material={timber(PALETTE.oak)} />),
        )}
        <Block size={[1.94, 0.14, 0.8]} position={[0, 0.47, 0]} material={fabric()} />
        <Block size={[0.5, 0.36, 0.14]} position={[-0.6, 0.7, -0.3]} rotation={[-0.2, 0, 0]} material={fabric('#d3c6b5')} />
        <Block size={[0.5, 0.36, 0.14]} position={[0.05, 0.7, -0.3]} rotation={[-0.2, 0, 0]} material={fabric(PALETTE.sage)} />
      </group>
    </group>
  )
}
