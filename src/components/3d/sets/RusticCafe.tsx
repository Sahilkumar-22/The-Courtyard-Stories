import { useMemo } from 'react'
import { brass, fabric, glow, iron, mat, PALETTE, textured, timber } from '../materials'
import { Ball, Block, boxGeometry, Cyl, cylinderGeometry, Floor, Instances, type InstanceItem, Panel } from '../primitives'
import { brickTexture, planksTexture } from '../textures'
import { D, HD, HW, seeded, type SetEnvironmentProps, W } from './common'
import { Chair, RoundTable, Stool } from './furniture'

const WALL_HEIGHT = 4.2
const BAR_X = -1.15
const BAR_Z = -HD + 1.75
const PIPE_Y = 3.85
const BOTTLE_COLOURS = ['#17243a', '#28467c', '#345da8', '#d9a52e', '#a15d4c', '#d3c6b5']

function Pendant({ x }: { x: number }) {
  const drop = 1.25
  return (
    <group position={[x, PIPE_Y, BAR_Z]}>
      <Cyl radius={0.01} height={drop} position={[0, -drop / 2, 0]} material={iron()} segments={5} cast={false} />
      <Cyl radius={0.2} topRadius={0.05} height={0.2} position={[0, -drop - 0.1, 0]} material={iron()} segments={18} />
      <Ball radius={0.065} position={[0, -drop - 0.22, 0]} material={glow('#dcaf4c')} cast={false} />
    </group>
  )
}

export function RusticCafe({ density }: SetEnvironmentProps) {
  const dark = timber(PALETTE.espresso)
  const walnut = timber(PALETTE.walnut)
  const oak = timber('#8b7133')
  const leather = fabric('#7f4f47')
  const brick = textured(brickTexture('#a15d4c', 5, 7), 0.95)
  const sideBrick = textured(brickTexture('#a15d4c', 2.4, 7), 0.95)

  const { bottles, necks, battens } = useMemo(() => {
    const rand = seeded(71)
    const bottleItems: InstanceItem[] = []
    const neckItems: InstanceItem[] = []
    const perShelf = Math.max(6, Math.round(17 * density))
    for (const y of [1.52, 2.07, 2.62]) {
      for (let index = 0; index < perShelf; index += 1) {
        const x = BAR_X - 1.75 + ((index + 0.5 + (rand() - 0.5) * 0.4) / perShelf) * 3.5
        const height = 0.2 + rand() * 0.1
        const radius = 0.038 + rand() * 0.016
        const color = BOTTLE_COLOURS[Math.floor(rand() * BOTTLE_COLOURS.length)]
        bottleItems.push({ position: [x, y + height / 2, -HD + 0.45], scale: [radius, height, radius], color })
        neckItems.push({ position: [x, y + height + 0.05, -HD + 0.45], scale: [radius * 0.36, 0.1, radius * 0.36], color })
      }
    }
    const battenItems: InstanceItem[] = []
    for (let x = -1.8; x <= 1.81; x += 0.3) {
      battenItems.push({ position: [BAR_X + x, 0.5, BAR_Z + 0.32], scale: [0.05, 0.92, 0.025] })
    }
    return { bottles: bottleItems, necks: neckItems, battens: battenItems }
  }, [density])

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(planksTexture('#5c4043', 2, 3), 0.7)} />

      {/* Brick rear wall, timber-panelled left wall, a shorter brick return on the right. */}
      <Block size={[W, WALL_HEIGHT, 0.3]} position={[0, WALL_HEIGHT / 2, -HD + 0.15]} material={mat('#a15d4c', { roughness: 0.95 })} />
      <Panel width={W} height={WALL_HEIGHT} position={[0, WALL_HEIGHT / 2, -HD + 0.305]} material={brick} />
      <Block size={[0.3, WALL_HEIGHT, D - 0.3]} position={[-HW + 0.15, WALL_HEIGHT / 2, 0.15]} material={dark} />
      <Block size={[0.3, WALL_HEIGHT, 3.3]} position={[HW - 0.15, WALL_HEIGHT / 2, -HD + 1.95]} material={mat('#a15d4c', { roughness: 0.95 })} />
      <Panel
        width={3.3}
        height={WALL_HEIGHT}
        position={[HW - 0.305, WALL_HEIGHT / 2, -HD + 1.95]}
        rotation={[0, -Math.PI / 2, 0]}
        material={sideBrick}
      />
      <Block size={[W + 0.1, 0.14, 0.4]} position={[0, WALL_HEIGHT + 0.07, -HD + 0.15]} material={dark} />

      {/* The bar: battened front, walnut top, brass foot rail. */}
      <Block size={[3.8, 1.02, 0.62]} position={[BAR_X, 0.51, BAR_Z]} material={dark} />
      <Instances geometry={boxGeometry()} material={walnut} items={battens} />
      <Block size={[4, 0.07, 0.82]} position={[BAR_X, 1.055, BAR_Z + 0.04]} material={walnut} />
      <Cyl radius={0.025} height={3.7} position={[BAR_X, 0.2, BAR_Z + 0.42]} rotation={[0, 0, Math.PI / 2]} material={brass()} segments={8} />
      {[-1.25, 0, 1.25].map((x) => (
        <Stool key={x} position={[BAR_X + x, 0, BAR_Z + 0.95]} seat={leather} />
      ))}

      {/* Back bar: three shelves of bottles. */}
      {[1.5, 2.05, 2.6].map((y) => (
        <Block key={y} size={[3.8, 0.045, 0.28]} position={[BAR_X, y, -HD + 0.45]} material={walnut} />
      ))}
      <Instances geometry={cylinderGeometry(1, 10)} material={mat('#ffffff', { roughness: 0.25, metalness: 0.1 })} items={bottles} cast={false} />
      <Instances geometry={cylinderGeometry(1, 6)} material={mat('#ffffff', { roughness: 0.25, metalness: 0.1 })} items={necks} cast={false} />

      {/* Iron pipe with three pendant lamps over the bar. */}
      <Cyl radius={0.03} height={W - 0.4} position={[0, PIPE_Y, BAR_Z]} rotation={[0, 0, Math.PI / 2]} material={iron()} segments={8} />
      {[-2.3, -1.15, 0].map((x) => (
        <Pendant key={x} x={x} />
      ))}

      {/* A blank slate board, framed in oak. */}
      <Block size={[1.5, 1.05, 0.05]} position={[2.2, 2.25, -HD + 0.33]} material={oak} />
      <Block size={[1.36, 0.91, 0.06]} position={[2.2, 2.25, -HD + 0.335]} material={mat('#17243a', { roughness: 0.95 })} />

      {/* Cafe table and chairs. */}
      <RoundTable position={[1.75, 0, 1.15]} top={oak} />
      <Chair position={[1.1, 0, 0.95]} rotationY={Math.PI / 2 + 0.25} frame={walnut} />
      <Chair position={[2.35, 0, 1.5]} rotationY={-Math.PI / 2 - 0.4} frame={walnut} />

      {/* A cask stands by the entrance. */}
      <group position={[-2.75, 0, 2.2]}>
        <Cyl radius={0.3} height={0.82} position={[0, 0.41, 0]} material={oak} segments={16} />
        <Cyl radius={0.34} height={0.3} position={[0, 0.41, 0]} material={oak} segments={16} />
        {[0.2, 0.62].map((y) => (
          <Cyl key={y} radius={0.325} height={0.04} position={[0, y, 0]} material={iron()} segments={16} />
        ))}
      </group>
    </group>
  )
}
