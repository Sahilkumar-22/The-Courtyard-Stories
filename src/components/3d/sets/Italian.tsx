import { useMemo } from 'react'
import { iron, mat, PALETTE, plaster, polished, stone, textured } from '../materials'
import { ArchWall, Ball, Block, Cyl, cylinderGeometry, Floor, Gable, Instances, type InstanceItem } from '../primitives'
import { checkerTexture } from '../textures'
import { curve, D, HD, HW, type SetEnvironmentProps, W } from './common'
import { Chair, Cypress, RoundTable, StandardTree } from './furniture'

const WALL_HEIGHT = 4.3

export function Italian({ segments }: SetEnvironmentProps) {
  const stucco = plaster(PALETTE.ochre)
  const trim = stone('#e8d8c3')
  const shutter = mat('#345da8', { roughness: 0.75 })
  const cs = curve(segments, 18)

  const balusters = useMemo<InstanceItem[]>(() => {
    const items: InstanceItem[] = []
    for (const side of [-1, 1]) {
      for (let z = -HD + 0.75; z <= HD - 0.55; z += 0.3) {
        items.push({ position: [side * (HW - 0.2), 0.52, z], scale: [0.07, 0.76, 0.07] })
      }
    }
    return items
  }, [])

  return (
    <group>
      <Floor
        width={W}
        depth={D}
        position={[0, 0.004, 0]}
        material={textured(checkerTexture('#d2977e', '#d2977e', 5, 4.3), 0.75)}
      />

      {/* Rear facade: a doorway between two shuttered windows, ordered by pilasters. */}
      <ArchWall
        width={W}
        height={WALL_HEIGHT}
        thickness={0.34}
        position={[0, 0, -HD + 0.17]}
        openings={[
          { x: 0, width: 1.7, height: 3.35, kind: 'round' },
          { x: -2.35, width: 1.1, height: 2.2, sill: 0.95, kind: 'round' },
          { x: 2.35, width: 1.1, height: 2.2, sill: 0.95, kind: 'round' },
        ]}
        curveSegments={cs}
        material={stucco}
      />
      {[-3.28, -1.22, 1.22, 3.28].map((x) => (
        <group key={x} position={[x, 0, -HD + 0.38]}>
          <Block size={[0.34, 0.2, 0.14]} position={[0, 0.1, 0]} material={trim} />
          <Block size={[0.26, WALL_HEIGHT - 0.42, 0.09]} position={[0, WALL_HEIGHT / 2 - 0.01, 0]} material={trim} />
          <Block size={[0.36, 0.2, 0.15]} position={[0, WALL_HEIGHT - 0.1, 0]} material={trim} />
        </group>
      ))}
      <Block size={[W + 0.3, 0.3, 0.62]} position={[0, WALL_HEIGHT + 0.15, -HD + 0.2]} material={trim} />
      <Gable width={3.1} height={0.78} depth={0.5} position={[0, WALL_HEIGHT + 0.3, -HD + 0.2]} material={trim} />
      {[-2.35, 2.35].flatMap((x) =>
        [-1, 1].map((side) => (
          <Block
            key={`${x}${side}`}
            size={[0.46, 1.66, 0.05]}
            position={[x + side * 0.8, 1.78, -HD + 0.37]}
            material={shutter}
          />
        )),
      )}
      {[-2.35, 2.35].map((x) => (
        <Block key={x} size={[1.36, 0.08, 0.2]} position={[x, 0.93, -HD + 0.4]} material={trim} />
      ))}

      {/* Stone balustrades in place of side walls keep the room open to the light. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (HW - 0.2), 0, 0.1]}>
          <Block size={[0.3, 0.14, D - 1.1]} position={[0, 0.07, 0]} material={trim} />
          <Block size={[0.26, 0.1, D - 1.1]} position={[0, 0.95, 0]} material={trim} />
          {[-1, 1].map((end) => (
            <group key={end} position={[0, 0, end * (D / 2 - 0.5)]}>
              <Block size={[0.34, 1.08, 0.34]} position={[0, 0.54, 0]} material={trim} />
              <Ball radius={0.14} position={[0, 1.2, 0]} material={trim} />
            </group>
          ))}
        </group>
      ))}
      <Instances geometry={cylinderGeometry(0.7, 8)} material={trim} items={balusters} />

      <Cypress position={[-2.75, 0, 2.2]} height={3.1} />
      <Cypress position={[2.75, 0, 2.2]} height={3.1} />
      <StandardTree position={[2.1, 0, -1.55]} height={1.9} leaf="#b28b30" />

      {/* A marble bistro table. */}
      <RoundTable position={[-0.95, 0, 0.75]} top={polished()} />
      <Chair position={[-1.65, 0, 0.6]} rotationY={Math.PI / 2 + 0.2} frame={iron()} />
      <Chair position={[-0.3, 0, 1.05]} rotationY={-Math.PI / 2 - 0.3} frame={iron()} />

      {/* A stone urn on a pedestal. */}
      <group position={[-2.3, 0, -1.6]}>
        <Block size={[0.5, 0.85, 0.5]} position={[0, 0.425, 0]} material={trim} />
        <Cyl radius={0.1} topRadius={0.2} height={0.16} position={[0, 0.93, 0]} material={trim} />
        <Ball radius={0.26} stretch={[1, 0.8, 1]} position={[0, 1.2, 0]} material={trim} />
        <Cyl radius={0.2} topRadius={0.27} height={0.1} position={[0, 1.43, 0]} material={trim} />
      </group>
    </group>
  )
}
