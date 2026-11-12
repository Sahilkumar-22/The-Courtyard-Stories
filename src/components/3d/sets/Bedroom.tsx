import { useMemo } from 'react'
import { DoubleSide } from 'three'
import { brass, fabric, glow, mat, PALETTE, plaster, textured, timber } from '../materials'
import { ArchWall, Ball, Block, Cyl, cylinderGeometry, Floor, Hoop, Instances, type InstanceItem, Panel } from '../primitives'
import { planksTexture, rugTexture } from '../textures'
import { D, HD, HW, type SetEnvironmentProps, W } from './common'
import { PottedPlant } from './furniture'

const WALL_HEIGHT = 4.2
const BED_Z = -HD + 1.62

export function Bedroom(_props: SetEnvironmentProps) {
  const wall = plaster('#e8d8c3')
  const moulding = plaster('#e8d8c3')
  const taupe = fabric('#beb4a8')
  const linen = fabric()
  const walnut = timber(PALETTE.walnut)
  const sheer = mat('#e8d8c3', { roughness: 1, transparent: true, opacity: 0.62, side: DoubleSide, depthWrite: false })
  const lampShade = glow('#e5cea5')

  const channels = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 9 }, (_, index) => ({
        position: [-1.04 + index * 0.26, 0.95, -HD + 0.47],
        scale: [0.13, 1.2, 0.09],
      })),
    [],
  )

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(planksTexture('#daac95', 2, 3), 0.6)} />
      <Floor width={4} depth={3} position={[0, 0.014, -0.35]} material={textured(rugTexture('#e8d8c3', '#d3c6b5', '#beb4a8'), 1)} />

      {/* Panelled rear wall. */}
      <Block size={[W, WALL_HEIGHT, 0.3]} position={[0, WALL_HEIGHT / 2, -HD + 0.15]} material={wall} />
      {[-2.32, 0, 2.32].map((x) => (
        <group key={x}>
          <Block size={[1.9, 2.55, 0.035]} position={[x, 2.5, -HD + 0.31]} material={moulding} />
          <Block size={[1.9, 0.68, 0.035]} position={[x, 0.52, -HD + 0.31]} material={moulding} />
        </group>
      ))}
      <Block size={[W, 0.07, 0.06]} position={[0, 1.02, -HD + 0.33]} material={moulding} />
      <Block size={[W + 0.2, 0.16, 0.44]} position={[0, WALL_HEIGHT + 0.08, -HD + 0.15]} material={moulding} />

      {/* Left wall with a tall window and sheer curtains. */}
      <ArchWall
        width={D - 0.3}
        height={WALL_HEIGHT}
        thickness={0.3}
        position={[-HW + 0.15, 0, 0.15]}
        rotation={[0, Math.PI / 2, 0]}
        openings={[{ x: 0, width: 1.8, height: 2.8, sill: 0.4, kind: 'rect' }]}
        material={wall}
      />
      <Block size={[0.06, 2.8, 0.05]} position={[-HW + 0.15, 1.8, 0.15]} material={moulding} />
      <Block size={[0.06, 0.05, 1.8]} position={[-HW + 0.15, 2.2, 0.15]} material={moulding} />
      <Cyl radius={0.016} height={2.7} position={[-HW + 0.42, 3.42, 0.15]} rotation={[Math.PI / 2, 0, 0]} material={brass()} segments={6} />
      {[-1, 1].map((side) => (
        <Panel
          key={side}
          width={0.75}
          height={3.3}
          position={[-HW + 0.42, 1.75, 0.15 + side * 0.95]}
          rotation={[0, Math.PI / 2, 0]}
          material={sheer}
          receive={false}
        />
      ))}

      {/* Right wall: a shorter return with a round mirror over a chest. */}
      <Block size={[0.3, WALL_HEIGHT, 3.3]} position={[HW - 0.15, WALL_HEIGHT / 2, -HD + 1.95]} material={wall} />
      <group position={[HW - 0.33, 2.05, -HD + 2.1]} rotation={[0, -Math.PI / 2, 0]}>
        <Hoop radius={0.46} tube={0.028} segments={36} material={brass()} />
        <Cyl radius={0.45} height={0.012} rotation={[Math.PI / 2, 0, 0]} material={mat('#e8d8c3', { roughness: 0.04, metalness: 1, envMapIntensity: 1.4 })} segments={36} cast={false} />
      </group>
      <Block size={[0.46, 0.82, 1.3]} position={[HW - 0.55, 0.47, -HD + 2.1]} material={walnut} />
      {[-0.3, 0.3].map((z) => (
        <Ball key={z} radius={0.022} position={[HW - 0.8, 0.6, -HD + 2.1 + z]} material={brass()} cast={false} />
      ))}

      {/* Bed with a channelled headboard. */}
      <Block size={[2.36, 1.3, 0.12]} position={[0, 0.95, -HD + 0.38]} material={taupe} />
      <Instances geometry={cylinderGeometry(1, 10)} material={taupe} items={channels} />
      <Block size={[2.12, 0.3, 2.3]} position={[0, 0.27, BED_Z]} material={taupe} />
      <Block size={[2.02, 0.24, 2.2]} position={[0, 0.54, BED_Z]} material={fabric('#e8d8c3')} />
      <Block size={[2.1, 0.13, 1.5]} position={[0, 0.7, BED_Z + 0.36]} material={linen} />
      <Block size={[2.12, 0.05, 0.52]} position={[0, 0.79, BED_Z + 0.78]} material={fabric('#d2977e')} />
      {[-0.52, 0.52].map((x) => (
        <group key={x}>
          <Ball radius={1} stretch={[0.42, 0.15, 0.27]} position={[x, 0.78, BED_Z - 0.78]} rotation={[0.35, 0, 0]} material={fabric('#e8d8c3')} />
          <Ball radius={1} stretch={[0.3, 0.13, 0.21]} position={[x * 0.75, 0.82, BED_Z - 0.5]} rotation={[0.5, 0, 0]} material={fabric(x < 0 ? '#d3c6b5' : '#d2977e')} />
        </group>
      ))}

      {/* Bedside tables and lamps. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.58, 0, -HD + 0.62]}>
          <Block size={[0.56, 0.5, 0.44]} position={[0, 0.27, 0]} material={walnut} />
          <Ball radius={0.02} position={[0, 0.3, 0.23]} material={brass()} cast={false} />
          <Cyl radius={0.07} height={0.26} position={[0, 0.65, 0]} material={brass()} segments={12} />
          <Cyl radius={0.16} topRadius={0.11} height={0.2} position={[0, 0.88, 0]} material={lampShade} segments={18} cast={false} />
        </group>
      ))}

      {/* Bench at the foot of the bed. */}
      <Block size={[1.55, 0.16, 0.44]} position={[0, 0.42, BED_Z + 1.5]} material={fabric('#e8d8c3')} />
      {[-0.68, 0.68].flatMap((x) =>
        [-0.16, 0.16].map((z) => (
          <Cyl key={`${x}${z}`} radius={0.018} height={0.34} position={[x, 0.17, BED_Z + 1.5 + z]} material={brass()} segments={6} />
        )),
      )}

      {/* Armchair and a plant by the entrance. */}
      <group position={[2.25, 0, 1.2]} rotation={[0, -0.7, 0]}>
        <Block size={[0.82, 0.3, 0.78]} position={[0, 0.3, 0]} material={fabric('#e8d8c3')} />
        <Block size={[0.82, 0.55, 0.18]} position={[0, 0.68, -0.32]} rotation={[-0.12, 0, 0]} material={fabric('#e8d8c3')} />
        {[-1, 1].map((side) => (
          <Block key={side} size={[0.14, 0.26, 0.74]} position={[side * 0.42, 0.52, 0]} material={fabric('#e8d8c3')} />
        ))}
        {[-0.33, 0.33].flatMap((x) =>
          [-0.3, 0.3].map((z) => <Cyl key={`${x}${z}`} radius={0.02} height={0.16} position={[x, 0.08, z]} material={brass()} segments={6} />),
        )}
      </group>
      <PottedPlant position={[2.85, 0, 2.3]} scale={1.2} pot="#d3c6b5" />
    </group>
  )
}
