import type { Material } from 'three'
import { foliage, iron, PALETTE, plaster, timber } from '../materials'
import { Ball, Block, Cyl, type Vec3 } from '../primitives'

/** Furniture and planting shared by several exhibition spaces. */

export function Stool({ position, height = 0.74, seat, frame = iron() }: {
  position: Vec3
  height?: number
  seat: Material
  frame?: Material
}) {
  return (
    <group position={position}>
      <Cyl radius={0.21} height={0.03} position={[0, 0.015, 0]} material={frame} segments={16} />
      <Cyl radius={0.028} height={height} position={[0, height / 2, 0]} material={frame} segments={8} />
      <Cyl radius={0.15} height={0.014} position={[0, height * 0.36, 0]} material={frame} segments={16} />
      <Cyl radius={0.19} height={0.07} position={[0, height + 0.035, 0]} material={seat} segments={18} />
    </group>
  )
}

export function Chair({ position, rotationY = 0, frame, seat }: {
  position: Vec3
  rotationY?: number
  frame: Material
  seat?: Material
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-0.18, 0.18].flatMap((x) =>
        [-0.18, 0.18].map((z) => (
          <Block
            key={`${x}${z}`}
            size={[0.035, z < 0 ? 0.92 : 0.45, 0.035]}
            position={[x, z < 0 ? 0.46 : 0.225, z]}
            material={frame}
          />
        )),
      )}
      <Block size={[0.42, 0.04, 0.42]} position={[0, 0.46, 0]} material={seat ?? frame} />
      <Block size={[0.4, 0.2, 0.03]} position={[0, 0.8, -0.18]} material={frame} />
    </group>
  )
}

export function RoundTable({ position, radius = 0.42, height = 0.74, top, frame = iron() }: {
  position: Vec3
  radius?: number
  height?: number
  top: Material
  frame?: Material
}) {
  return (
    <group position={position}>
      <Cyl radius={radius * 0.6} height={0.03} position={[0, 0.015, 0]} material={frame} segments={18} />
      <Cyl radius={0.03} height={height} position={[0, height / 2, 0]} material={frame} segments={8} />
      <Cyl radius={radius} height={0.04} position={[0, height + 0.02, 0]} material={top} segments={28} />
    </group>
  )
}

export function PottedPlant({ position, scale = 1, leaf = PALETTE.foliage, pot = PALETTE.terracotta }: {
  position: Vec3
  scale?: number
  leaf?: string
  pot?: string
}) {
  const leaves = foliage(leaf)
  return (
    <group position={position} scale={scale}>
      <Cyl radius={0.2} topRadius={0.26} height={0.38} position={[0, 0.19, 0]} material={plaster(pot)} segments={14} />
      <Ball radius={0.34} faceted position={[0, 0.66, 0]} material={leaves} />
      <Ball radius={0.24} faceted position={[0.2, 0.9, 0.08]} material={leaves} />
      <Ball radius={0.22} faceted position={[-0.18, 0.86, -0.1]} material={leaves} />
    </group>
  )
}

/** A slender standard tree in a pot: olive, citrus or bay depending on colour. */
export function StandardTree({ position, height = 2.3, leaf = PALETTE.olive, pot = PALETTE.terracotta }: {
  position: Vec3
  height?: number
  leaf?: string
  pot?: string
}) {
  const leaves = foliage(leaf)
  return (
    <group position={position}>
      <Cyl radius={0.26} topRadius={0.33} height={0.46} position={[0, 0.23, 0]} material={plaster(pot)} segments={14} />
      <Cyl radius={0.045} height={height - 0.5} position={[0, 0.46 + (height - 0.5) / 2, 0]} material={timber(PALETTE.walnut)} segments={7} />
      <Ball radius={0.55} faceted position={[0, height, 0]} material={leaves} />
      <Ball radius={0.4} faceted position={[0.34, height + 0.2, 0.1]} material={leaves} />
      <Ball radius={0.38} faceted position={[-0.3, height + 0.16, -0.16]} material={leaves} />
      <Ball radius={0.34} faceted position={[0.04, height + 0.46, 0.06]} material={leaves} />
    </group>
  )
}

export function Cypress({ position, height = 3 }: { position: Vec3; height?: number }) {
  return (
    <group position={position}>
      <Cyl radius={0.28} topRadius={0.35} height={0.5} position={[0, 0.25, 0]} material={plaster(PALETTE.terracotta)} segments={14} />
      <Cyl radius={0.4} topRadius={0} height={height} position={[0, 0.5 + height / 2, 0]} material={foliage(PALETTE.cypress)} segments={9} />
    </group>
  )
}

export function FloorLamp({ position, height = 1.55, stem, shade }: {
  position: Vec3
  height?: number
  stem: Material
  shade: Material
}) {
  return (
    <group position={position}>
      <Cyl radius={0.16} height={0.03} position={[0, 0.015, 0]} material={stem} segments={16} />
      <Cyl radius={0.016} height={height} position={[0, height / 2, 0]} material={stem} segments={6} />
      <Cyl radius={0.21} topRadius={0.13} height={0.28} position={[0, height + 0.1, 0]} material={shade} segments={18} cast={false} />
    </group>
  )
}
