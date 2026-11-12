import { useMemo } from 'react'
import { DoubleSide } from 'three'
import { brass, glow, mat, PALETTE, plaster, textured } from '../materials'
import { ArchWall, Ball, Block, boxGeometry, Cyl, Dome, Floor, Instances, type InstanceItem, Panel } from '../primitives'
import { jaliTexture, paversTexture, rugTexture } from '../textures'
import { curve, D, HD, HW, type SetEnvironmentProps, W } from './common'

const WALL_HEIGHT = 4.7

/** A small domed kiosk that crowns each corner of the rear wall. */
function Chhatri({ x }: { x: number }) {
  const trim = plaster('#e8d8c3')
  const y = WALL_HEIGHT + 0.22
  return (
    <group position={[x, y, -HD + 0.75]}>
      <Block size={[1.5, 0.14, 1.5]} position={[0, 0.07, 0]} material={trim} />
      {[-0.55, 0.55].flatMap((cx) =>
        [-0.55, 0.55].map((cz) => (
          <Cyl key={`${cx}${cz}`} radius={0.07} height={1} position={[cx, 0.64, cz]} material={trim} segments={10} />
        )),
      )}
      <Block size={[1.62, 0.12, 1.62]} position={[0, 1.2, 0]} material={trim} />
      <Dome radius={0.68} height={0.66} position={[0, 1.26, 0]} material={plaster(PALETTE.sandstone)} />
      <Ball radius={0.09} position={[0, 2, 0]} material={brass()} />
      <Cyl radius={0.035} topRadius={0} height={0.3} position={[0, 2.2, 0]} material={brass()} segments={8} />
    </group>
  )
}

export function RoyalJaipur({ segments }: SetEnvironmentProps) {
  const wall = plaster(PALETTE.sandstone)
  const recess = plaster('#cb8167')
  const trim = plaster('#e8d8c3')
  const lattice = mat('#ffffff', { map: jaliTexture('#e1c2ac', 3, 6), alphaTest: 0.5, side: DoubleSide, roughness: 0.9 })
  const cs = curve(segments)

  const merlons = useMemo<InstanceItem[]>(() => {
    const items: InstanceItem[] = []
    for (let x = -1.95; x <= 1.951; x += 0.65) {
      items.push({ position: [x, WALL_HEIGHT + 0.39, -HD + 0.18], scale: [0.36, 0.34, 0.24] })
    }
    return items
  }, [])

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(paversTexture('#daac95', 3.5, 3))} />
      <Floor
        width={2.9}
        depth={3.7}
        position={[0, 0.014, 0.3]}
        material={textured(rugTexture('#c46b50', '#e8d8c3', '#dfb96a'), 1)}
      />

      {/* Rear wall: three cusped arches, the outer two screened with pierced stone. */}
      <ArchWall
        width={W}
        height={WALL_HEIGHT}
        thickness={0.4}
        position={[0, 0, -HD + 0.2]}
        openings={[
          { x: 0, width: 2.1, height: 3.5, kind: 'cusped' },
          { x: -2.35, width: 1.25, height: 2.7, kind: 'cusped' },
          { x: 2.35, width: 1.25, height: 2.7, kind: 'cusped' },
        ]}
        curveSegments={cs}
        material={wall}
      />
      <Block size={[2.5, 3.8, 0.08]} position={[0, 1.9, -HD - 0.04]} material={recess} />
      {[-2.35, 2.35].map((x) => (
        <Panel key={x} width={1.4} height={2.8} position={[x, 1.4, -HD + 0.12]} material={lattice} cast />
      ))}
      <Block size={[W + 0.3, 0.22, 0.56]} position={[0, WALL_HEIGHT + 0.11, -HD + 0.2]} material={trim} />
      <Instances geometry={boxGeometry()} material={wall} items={merlons} />
      <Chhatri x={-HW + 0.8} />
      <Chhatri x={HW - 0.8} />

      {/* Side walls, each opened by a single arch so sunlight crosses the floor. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <ArchWall
            width={D - 0.4}
            height={3.9}
            thickness={0.36}
            position={[side * (HW - 0.18), 0, 0.2]}
            rotation={[0, Math.PI / 2, 0]}
            openings={[{ x: 0, width: 2.3, height: 3.05, kind: 'cusped' }]}
            curveSegments={cs}
            material={wall}
          />
          <Block size={[0.5, 0.18, D - 0.3]} position={[side * (HW - 0.18), 3.99, 0.2]} material={trim} />
        </group>
      ))}

      {/* Sandstone pedestals with brass urns and standing lamps flank the central arch. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.62, 0, -HD + 0.95]}>
          <Block size={[0.5, 0.7, 0.5]} position={[0, 0.35, 0]} material={trim} />
          <Cyl radius={0.2} topRadius={0.12} height={0.36} position={[0, 0.88, 0]} material={brass()} />
          <Ball radius={0.2} stretch={[1, 0.7, 1]} position={[0, 1.12, 0]} material={brass()} />
          <group position={[side * 0.62, 0, 0.55]}>
            <Cyl radius={0.17} height={0.05} position={[0, 0.025, 0]} material={brass()} />
            <Cyl radius={0.035} height={1.5} position={[0, 0.78, 0]} material={brass()} segments={8} />
            <Cyl radius={0.06} topRadius={0.16} height={0.12} position={[0, 1.58, 0]} material={brass()} />
            <Ball radius={0.09} position={[0, 1.7, 0]} material={glow('#e2c487')} cast={false} />
          </group>
        </group>
      ))}
    </group>
  )
}
