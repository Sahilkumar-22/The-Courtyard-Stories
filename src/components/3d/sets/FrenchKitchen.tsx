import { useMemo } from 'react'
import { brass, fabric, glass, mat, PALETTE, plaster, textured, timber } from '../materials'
import { ArchWall, Ball, Block, boxGeometry, Cyl, cylinderGeometry, Floor, Instances, type InstanceItem, Panel, sphereGeometry } from '../primitives'
import { checkerTexture, marbleTexture } from '../textures'
import { D, HD, HW, seeded, type SetEnvironmentProps, W } from './common'
import { Stool } from './furniture'

const WALL_HEIGHT = 3.9
const COUNTER_Z = -HD + 0.62
const COUNTER_Y = 0.9

export function FrenchKitchen({ density }: SetEnvironmentProps) {
  const cream = plaster('#e8d8c3')
  const sage = mat(PALETTE.sage, { roughness: 0.7 })
  const marble = textured(marbleTexture('#e8d8c3', 1, 1), 0.3)
  const copper = mat('#c46b50', { roughness: 0.35, metalness: 0.9 })
  const oak = timber(PALETTE.oak)

  const { doors, knobs, crockery } = useMemo(() => {
    const rand = seeded(53)
    const doorItems: InstanceItem[] = []
    const knobItems: InstanceItem[] = []
    for (let x = -HW + 0.56; x <= HW - 0.55; x += 0.62) {
      if (Math.abs(x + 2.1) < 0.5) continue // the range stands here
      doorItems.push({ position: [x, 0.44, COUNTER_Z + 0.315], scale: [0.54, 0.66, 0.02] })
      knobItems.push({ position: [x + 0.2, 0.62, COUNTER_Z + 0.34], scale: 0.02 })
    }
    // Island doors, facing the visitor.
    for (const x of [-0.75, 0, 0.75]) {
      doorItems.push({ position: [x, 0.43, 1.035], scale: [0.66, 0.64, 0.02] })
      knobItems.push({ position: [x + 0.24, 0.6, 1.06], scale: 0.02 })
    }
    const crockeryItems: InstanceItem[] = []
    const perShelf = Math.max(4, Math.round(9 * density))
    for (const y of [1.78, 2.33]) {
      for (let index = 0; index < perShelf; index += 1) {
        const x = 1.45 + ((index + 0.5) / perShelf) * 1.6
        const plate = rand() < 0.45
        const height = plate ? 0.05 + rand() * 0.06 : 0.13 + rand() * 0.08
        const radius = plate ? 0.1 + rand() * 0.02 : 0.045 + rand() * 0.02
        crockeryItems.push({
          position: [x, y + height / 2, -HD + 0.46],
          scale: [radius, height, radius],
          color: plate ? '#e8d8c3' : ['#e8d8c3', '#e5cea5', '#7c8eb3', '#e8d8c3'][Math.floor(rand() * 4)],
        })
      }
    }
    return { doors: doorItems, knobs: knobItems, crockery: crockeryItems }
  }, [density])

  return (
    <group>
      <Floor
        width={W}
        depth={D}
        position={[0, 0.004, 0]}
        material={textured(checkerTexture('#e8d8c3', '#d3c6b5', 5, 4.3), 0.5)}
      />

      {/* Rear wall with a paned window over the sink. */}
      <ArchWall
        width={W}
        height={WALL_HEIGHT}
        thickness={0.3}
        position={[0, 0, -HD + 0.15]}
        openings={[{ x: 0, width: 1.7, height: 1.5, sill: 1.3, kind: 'rect' }]}
        material={cream}
      />
      <Panel width={1.7} height={1.5} position={[0, 2.05, -HD + 0.15]} material={glass()} receive={false} />
      <Block size={[0.045, 1.5, 0.06]} position={[0, 2.05, -HD + 0.15]} material={cream} />
      <Block size={[1.7, 0.045, 0.06]} position={[0, 2.05, -HD + 0.15]} material={cream} />
      <Block size={[1.9, 0.07, 0.4]} position={[0, 1.27, -HD + 0.2]} material={cream} />
      <Block size={[W + 0.2, 0.14, 0.42]} position={[0, WALL_HEIGHT + 0.07, -HD + 0.15]} material={cream} />

      {/* Side walls: full depth on the left, a shorter return on the right. */}
      <Block size={[0.3, WALL_HEIGHT, D - 0.3]} position={[-HW + 0.15, WALL_HEIGHT / 2, 0.15]} material={cream} />
      <Block size={[0.3, WALL_HEIGHT, 3.2]} position={[HW - 0.15, WALL_HEIGHT / 2, -HD + 1.9]} material={cream} />

      {/* Base cabinets under a marble counter. */}
      <Block size={[W - 0.6, 0.86, 0.62]} position={[0, 0.45, COUNTER_Z]} material={sage} />
      <Block size={[W - 0.6, 0.08, 0.56]} position={[0, 0.04, COUNTER_Z - 0.02]} material={mat(PALETTE.charcoal)} />
      <Block size={[W - 0.5, 0.05, 0.68]} position={[0, COUNTER_Y, COUNTER_Z + 0.01]} material={marble} />
      <Instances geometry={boxGeometry()} material={mat('#7c8eb3', { roughness: 0.7 })} items={doors} cast={false} />
      <Instances geometry={sphereGeometry()} material={brass()} items={knobs} cast={false} />

      {/* Brass tap. */}
      <Cyl radius={0.018} height={0.3} position={[0, COUNTER_Y + 0.17, COUNTER_Z - 0.2]} material={brass()} segments={8} />
      <Cyl radius={0.014} height={0.2} position={[0, COUNTER_Y + 0.31, COUNTER_Z - 0.11]} rotation={[Math.PI / 2, 0, 0]} material={brass()} segments={8} />

      {/* Range and hood. */}
      <Block size={[0.92, 0.9, 0.66]} position={[-2.1, 0.45, COUNTER_Z + 0.01]} material={mat('#17243a', { roughness: 0.5, metalness: 0.4 })} />
      <Cyl radius={0.03} height={0.84} position={[-2.1, 0.74, COUNTER_Z + 0.36]} rotation={[0, 0, Math.PI / 2]} material={brass()} segments={8} />
      <Cyl
        radius={0.72}
        topRadius={0.3}
        height={0.62}
        position={[-2.1, 2.15, COUNTER_Z - 0.06]}
        rotation={[0, Math.PI / 4, 0]}
        material={cream}
        segments={4}
      />
      <Block size={[0.42, 1.44, 0.42]} position={[-2.1, 3.18, COUNTER_Z - 0.06]} material={cream} />
      <Block size={[1.04, 0.05, 1.04]} position={[-2.1, 1.84, COUNTER_Z - 0.06]} material={brass()} />

      {/* Open shelves of crockery. */}
      {[1.75, 2.3].map((y) => (
        <Block key={y} size={[1.8, 0.045, 0.3]} position={[2.25, y, -HD + 0.46]} material={oak} />
      ))}
      <Instances geometry={cylinderGeometry(1, 14)} material={mat('#ffffff', { roughness: 0.4 })} items={crockery} cast={false} />

      {/* Copper pans on a brass rail. */}
      <Cyl radius={0.014} height={1.9} position={[HW - 0.36, 2.05, -HD + 1.9]} rotation={[Math.PI / 2, 0, 0]} material={brass()} segments={6} />
      {[-0.66, -0.22, 0.22, 0.66].map((z, index) => (
        <group key={z} position={[HW - 0.36, 2.05, -HD + 1.9 + z]}>
          <Block size={[0.02, 0.3, 0.03]} position={[0, -0.15, 0]} material={copper} />
          <Cyl
            radius={0.13 + (index % 2) * 0.03}
            height={0.06}
            position={[0, -0.42, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={copper}
            segments={18}
          />
        </group>
      ))}

      {/* Larder cupboard. */}
      <Block size={[0.6, 2.5, 1.3]} position={[-HW + 0.6, 1.25, -HD + 1.7]} material={sage} />
      <Block size={[0.02, 2.2, 0.56]} position={[-HW + 0.91, 1.3, -HD + 1.4]} material={mat('#7c8eb3', { roughness: 0.7 })} />
      <Block size={[0.02, 2.2, 0.56]} position={[-HW + 0.91, 1.3, -HD + 2]} material={mat('#7c8eb3', { roughness: 0.7 })} />

      {/* Island with stools and a bowl of lemons. */}
      <Block size={[2.3, 0.86, 0.95]} position={[0, 0.43, 0.55]} material={sage} />
      <Block size={[2.5, 0.06, 1.12]} position={[0, 0.89, 0.55]} material={marble} />
      <Cyl radius={0.17} topRadius={0.24} height={0.1} position={[0.5, 0.97, 0.5]} material={plaster('#e8d8c3')} segments={18} />
      {[
        [0.45, 1.03, 0.47],
        [0.56, 1.03, 0.54],
        [0.48, 1.04, 0.57],
      ].map(([x, y, z]) => (
        <Ball key={`${x}${z}`} radius={0.05} stretch={[1.15, 0.9, 0.9]} position={[x, y, z]} material={mat('#dcaf4c', { roughness: 0.6 })} cast={false} />
      ))}
      <Stool position={[-0.55, 0, 1.55]} height={0.62} seat={fabric('#e5cea5')} frame={oak} />
      <Stool position={[0.55, 0, 1.55]} height={0.62} seat={fabric('#e5cea5')} frame={oak} />
    </group>
  )
}
