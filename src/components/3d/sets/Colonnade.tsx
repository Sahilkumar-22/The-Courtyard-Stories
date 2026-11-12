import { useMemo } from 'react'
import { PALETTE, stone, textured } from '../materials'
import { ArchWall, Block, boxGeometry, cylinderGeometry, Floor, Instances, type InstanceItem } from '../primitives'
import { paversTexture } from '../textures'
import { curve, D, HD, type SetEnvironmentProps, W } from './common'

const ROW_X = 2.2
const SHAFT_HEIGHT = 3.5
const BEAM_Y = 4.14

export function Colonnade({ segments }: SetEnvironmentProps) {
  const limestone = stone('#e8d8c3')
  const pale = stone('#e8d8c3')

  const { shafts, bases, capitals, slats } = useMemo(() => {
    const shaftItems: InstanceItem[] = []
    const baseItems: InstanceItem[] = []
    const capitalItems: InstanceItem[] = []
    for (const x of [-ROW_X, ROW_X]) {
      for (let index = 0; index < 5; index += 1) {
        const z = -2.5 + index * 1.25
        baseItems.push({ position: [x, 0.09, z], scale: [0.64, 0.18, 0.64] })
        shaftItems.push({ position: [x, 0.18 + SHAFT_HEIGHT / 2, z], scale: [0.22, SHAFT_HEIGHT, 0.22] })
        capitalItems.push({ position: [x, 0.18 + SHAFT_HEIGHT + 0.12, z], scale: [0.6, 0.24, 0.6] })
      }
    }
    const slatItems: InstanceItem[] = []
    for (let z = -2.55; z <= 2.56; z += 0.51) {
      slatItems.push({ position: [0, BEAM_Y + 0.3, z], scale: [ROW_X * 2 + 0.9, 0.09, 0.13] })
    }
    return { shafts: shaftItems, bases: baseItems, capitals: capitalItems, slats: slatItems }
  }, [])

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(paversTexture('#e8d8c3', 3.5, 3))} />

      {/* Two rows of columns recede in strict symmetry. */}
      <Instances geometry={boxGeometry()} material={limestone} items={bases} />
      <Instances geometry={cylinderGeometry(0.86, Math.max(10, Math.round(20 * segments)))} material={pale} items={shafts} />
      <Instances geometry={boxGeometry()} material={limestone} items={capitals} />

      {/* Entablature and open slats: the sun draws their rhythm across the floor. */}
      {[-ROW_X, ROW_X].map((x) => (
        <group key={x}>
          <Block size={[0.56, 0.42, D]} position={[x, BEAM_Y, 0]} material={limestone} />
          <Block size={[0.74, 0.1, D + 0.12]} position={[x, BEAM_Y + 0.21, 0]} material={pale} />
        </group>
      ))}
      <Instances geometry={boxGeometry()} material={stone(PALETTE.sand)} items={slats} />

      {/* The vista closes on a single tall arch. */}
      <ArchWall
        width={ROW_X * 2 + 0.56}
        height={BEAM_Y + 0.5}
        thickness={0.34}
        position={[0, 0, -HD + 0.17]}
        openings={[{ x: 0, width: 2.4, height: 3.6, kind: 'round' }]}
        curveSegments={curve(segments, 18)}
        material={limestone}
      />
      <Block size={[ROW_X * 2 + 0.9, 0.14, 0.5]} position={[0, BEAM_Y + 0.57, -HD + 0.17]} material={pale} />
    </group>
  )
}
