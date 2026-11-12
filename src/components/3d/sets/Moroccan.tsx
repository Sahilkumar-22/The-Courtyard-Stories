import { useMemo } from 'react'
import { brass, fabric, glow, mat, PALETTE, plaster, textured, timber } from '../materials'
import { ArchBand, ArchWall, Block, boxGeometry, Cyl, Disc, Floor, Instances, type InstanceItem, Panel } from '../primitives'
import { checkerTexture, zelligeTexture } from '../textures'
import { curve, D, HD, HW, type SetEnvironmentProps, W } from './common'

const WALL_HEIGHT = 4.5
const SIDE_HEIGHT = 3.7
const DADO = 1.15

function Lantern({ x, drop }: { x: number; drop: number }) {
  return (
    <group position={[x, SIDE_HEIGHT - 0.1, 0.6]}>
      <Cyl radius={0.012} height={drop} position={[0, -drop / 2, 0]} material={brass()} segments={6} cast={false} />
      <group position={[0, -drop, 0]}>
        <Cyl radius={0.05} topRadius={0.02} height={0.12} position={[0, 0.02, 0]} material={brass()} segments={6} />
        <Cyl radius={0.17} topRadius={0.06} height={0.2} position={[0, -0.14, 0]} material={brass()} segments={6} />
        <Cyl radius={0.17} height={0.34} position={[0, -0.41, 0]} material={glow('#dcaf4c')} segments={6} cast={false} />
        <Cyl radius={0.06} topRadius={0.17} height={0.16} position={[0, -0.66, 0]} material={brass()} segments={6} />
      </group>
    </group>
  )
}

export function Moroccan({ segments }: SetEnvironmentProps) {
  const wall = plaster('#daac95')
  const pale = plaster('#e8d8c3')
  const cs = curve(segments, 16)
  const tileBack = textured(zelligeTexture(2.2, 1), 0.45)
  const tileSide = textured(zelligeTexture(5, 1), 0.45)

  const merlons = useMemo<InstanceItem[]>(() => {
    const items: InstanceItem[] = []
    for (const side of [-1, 1]) {
      for (let z = -HD + 0.45; z <= HD - 0.3; z += 0.62) {
        items.push({ position: [side * (HW - 0.15), SIDE_HEIGHT + 0.17, z], scale: [0.3, 0.34, 0.34] })
      }
    }
    for (let x = -HW + 0.3; x <= HW - 0.29; x += 0.64) {
      items.push({ position: [x, WALL_HEIGHT + 0.17, -HD + 0.17], scale: [0.34, 0.34, 0.34] })
    }
    return items
  }, [])

  return (
    <group>
      <Floor
        width={W}
        depth={D}
        position={[0, 0.004, 0]}
        material={textured(checkerTexture('#cb8167', '#e8d8c3', 5, 4.3), 0.6)}
      />

      {/* Rear wall: a horseshoe arch between two small windows. */}
      <ArchWall
        width={W}
        height={WALL_HEIGHT}
        thickness={0.34}
        position={[0, 0, -HD + 0.17]}
        openings={[
          { x: 0, width: 1.9, height: 3.3, kind: 'horseshoe' },
          { x: -2.4, width: 0.8, height: 1.35, sill: 1.75, kind: 'horseshoe' },
          { x: 2.4, width: 0.8, height: 1.35, sill: 1.75, kind: 'horseshoe' },
        ]}
        curveSegments={cs}
        material={wall}
      />
      <Block size={[2.6, 3.7, 0.08]} position={[0, 1.85, -HD - 0.04]} material={mat('#28467c', { roughness: 0.7 })} />
      <ArchBand
        kind="horseshoe"
        width={1.9}
        height={3.3}
        band={0.14}
        depth={0.08}
        position={[0, 0, -HD + 0.37]}
        curveSegments={cs}
        material={pale}
      />
      {[-1, 1].map((side) => (
        <Panel key={side} width={2.2} height={DADO} position={[side * 2.38, DADO / 2, -HD + 0.345]} material={tileBack} />
      ))}

      {/* Side walls with a tiled dado. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block size={[0.3, SIDE_HEIGHT, D - 0.34]} position={[side * (HW - 0.15), SIDE_HEIGHT / 2, 0.17]} material={wall} />
          <Panel
            width={D - 0.4}
            height={DADO}
            position={[side * (HW - 0.305), DADO / 2, 0.17]}
            rotation={[0, (-side * Math.PI) / 2, 0]}
            material={tileSide}
          />
          <Block size={[0.05, 0.06, D - 0.4]} position={[side * (HW - 0.32), DADO + 0.03, 0.17]} material={pale} />
        </group>
      ))}
      <Instances geometry={boxGeometry()} material={pale} items={merlons} />

      {/* A timber beam carries three pierced-brass lanterns. */}
      <Block size={[W - 0.3, 0.16, 0.16]} position={[0, SIDE_HEIGHT - 0.1, 0.6]} material={timber(PALETTE.walnut)} />
      <Lantern x={-1.5} drop={0.75} />
      <Lantern x={0} drop={1.05} />
      <Lantern x={1.5} drop={0.75} />

      {/* Tiled fountain. */}
      <group position={[0, 0, 0.5]}>
        <Cyl radius={0.95} height={0.34} position={[0, 0.17, 0]} material={mat('#345da8', { roughness: 0.4 })} segments={8} />
        <Cyl radius={1.02} height={0.06} position={[0, 0.36, 0]} material={pale} segments={8} />
        <Disc radius={0.8} position={[0, 0.395, 0]} material={mat(PALETTE.water, { roughness: 0.08, metalness: 0.5 })} segments={8} />
        <Cyl radius={0.1} height={0.5} position={[0, 0.45, 0]} material={pale} segments={8} />
        <Cyl radius={0.3} topRadius={0.34} height={0.07} position={[0, 0.72, 0]} material={brass()} segments={12} />
      </group>

      {/* Leather poufs and a brass tray table. */}
      <Cyl radius={0.36} height={0.34} position={[-2.2, 0.17, 1.5]} material={fabric('#cb8167')} segments={16} />
      <Cyl radius={0.32} height={0.3} position={[-1.5, 0.15, 2.2]} material={fabric('#a15d4c')} segments={16} />
      <group position={[2.1, 0, 1.7]}>
        <Cyl radius={0.03} height={0.42} position={[0, 0.21, 0]} material={timber(PALETTE.walnut)} segments={6} />
        <Cyl radius={0.42} height={0.03} position={[0, 0.44, 0]} material={brass()} segments={24} />
      </group>
    </group>
  )
}
