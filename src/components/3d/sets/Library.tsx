import { useMemo } from 'react'
import { brass, fabric, glow, mat, PALETTE, textured, timber } from '../materials'
import { Block, boxGeometry, Cyl, Floor, Instances, type InstanceItem, type Vec3 } from '../primitives'
import { herringboneTexture, rugTexture } from '../textures'
import { D, HD, HW, seeded, type SetEnvironmentProps, W } from './common'
import { Chair, FloorLamp } from './furniture'

const SHELF_HEIGHT = 4.3
const SHELF_DEPTH = 0.34
const ROW_SPACING = 0.5
const BOOK_COLOURS = ['#7f4f47', '#c46b50', '#17243a', '#28467c', '#345da8', '#d9a52e', '#8b7133', '#d3c6b5', '#5c4043', '#e8d8c3']

/** A wall of bookshelves, centred on x and facing local +z. Every book is one instance. */
function ShelfWall({ width, seed, density, position, rotation }: {
  width: number
  seed: number
  density: number
  position: Vec3
  rotation?: Vec3
}) {
  const carcass = timber(PALETTE.walnut)

  const { boards, books } = useMemo(() => {
    const rand = seeded(seed)
    const boardItems: InstanceItem[] = []
    const bookItems: InstanceItem[] = []
    const bays = Math.max(2, Math.round(width / 1.15))
    const bayWidth = width / bays
    // Fewer, broader volumes on smaller devices.
    const girth = 1 / (0.35 + 0.65 * density)

    for (let bay = 0; bay <= bays; bay += 1) {
      boardItems.push({
        position: [-width / 2 + bay * bayWidth, SHELF_HEIGHT / 2, 0.02],
        scale: [0.05, SHELF_HEIGHT, SHELF_DEPTH - 0.04],
      })
    }
    for (let y = 0.1; y < SHELF_HEIGHT - 0.2; y += ROW_SPACING) {
      boardItems.push({ position: [0, y, 0.02], scale: [width, 0.04, SHELF_DEPTH - 0.04] })
      for (let bay = 0; bay < bays; bay += 1) {
        const end = -width / 2 + (bay + 1) * bayWidth - 0.06
        let cursor = -width / 2 + bay * bayWidth + 0.05
        while (cursor < end - 0.08) {
          if (rand() < 0.07) {
            cursor += 0.1 + rand() * 0.22
            continue
          }
          const thickness = Math.min((0.034 + rand() * 0.05) * girth, end - cursor)
          const height = 0.25 + rand() * 0.15
          bookItems.push({
            position: [cursor + thickness / 2, y + 0.02 + height / 2, 0.03 + rand() * 0.02],
            scale: [thickness, height, 0.2],
            color: BOOK_COLOURS[Math.floor(rand() * BOOK_COLOURS.length)],
          })
          cursor += thickness + 0.004
        }
      }
    }
    return { boards: boardItems, books: bookItems }
  }, [width, seed, density])

  return (
    <group position={position} rotation={rotation}>
      <Block size={[width, SHELF_HEIGHT, 0.05]} position={[0, SHELF_HEIGHT / 2, -SHELF_DEPTH / 2 + 0.025]} material={timber(PALETTE.espresso)} />
      <Instances geometry={boxGeometry()} material={carcass} items={boards} />
      <Instances geometry={boxGeometry()} material={mat('#ffffff', { roughness: 0.8 })} items={books} cast={false} />
      <Block size={[width + 0.1, 0.16, SHELF_DEPTH + 0.1]} position={[0, SHELF_HEIGHT + 0.08, 0]} material={carcass} />
    </group>
  )
}

export function Library({ density }: SetEnvironmentProps) {
  const walnut = timber(PALETTE.walnut)
  const leather = fabric('#7f4f47')
  const sideLength = 3.7

  const rungs = useMemo<InstanceItem[]>(
    () => Array.from({ length: 9 }, (_, index) => ({ position: [0, 0.35 + index * 0.36, 0] as Vec3, scale: [0.46, 0.035, 0.05] as Vec3 })),
    [],
  )

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(herringboneTexture('#8b7133', 3.5, 3), 0.6)} />
      <Floor width={3.6} depth={2.7} position={[0, 0.014, 0.75]} material={textured(rugTexture('#5c4043', '#e5cea5', '#8b7133'), 1)} />

      {/* Floor-to-ceiling shelves on three sides. */}
      <ShelfWall width={W - 0.1} seed={11} density={density} position={[0, 0, -HD + SHELF_DEPTH / 2]} />
      <ShelfWall
        width={sideLength}
        seed={23}
        density={density}
        position={[-HW + SHELF_DEPTH / 2, 0, -HD + SHELF_DEPTH + sideLength / 2]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <ShelfWall
        width={sideLength}
        seed={37}
        density={density}
        position={[HW - SHELF_DEPTH / 2, 0, -HD + SHELF_DEPTH + sideLength / 2]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* Brass rail and rolling ladder. */}
      <Cyl radius={0.018} height={W - 0.9} position={[0, 3.42, -HD + SHELF_DEPTH + 0.1]} rotation={[0, 0, Math.PI / 2]} material={brass()} segments={8} />
      <group position={[1.75, 0, -HD + SHELF_DEPTH + 0.66]} rotation={[-0.16, 0, 0]}>
        {[-0.25, 0.25].map((x) => (
          <Block key={x} size={[0.045, 3.55, 0.06]} position={[x, 1.775, 0]} material={walnut} />
        ))}
        <Instances geometry={boxGeometry()} material={walnut} items={rungs} />
      </group>

      {/* Reading corner: a leather wing chair, footstool and lamp. */}
      <group position={[-1.55, 0, 0.55]} rotation={[0, 0.55, 0]}>
        <Block size={[0.78, 0.26, 0.74]} position={[0, 0.33, 0]} material={leather} />
        <Block size={[0.78, 0.95, 0.16]} position={[0, 0.9, -0.32]} rotation={[-0.1, 0, 0]} material={leather} />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Block size={[0.14, 0.34, 0.7]} position={[side * 0.4, 0.58, 0]} material={leather} />
            <Block size={[0.1, 0.42, 0.26]} position={[side * 0.42, 1.12, -0.2]} material={leather} />
          </group>
        ))}
        {[-0.32, 0.32].flatMap((x) =>
          [-0.3, 0.3].map((z) => <Block key={`${x}${z}`} size={[0.05, 0.2, 0.05]} position={[x, 0.1, z]} material={walnut} />),
        )}
        <Block size={[0.6, 0.3, 0.46]} position={[0.05, 0.19, 0.85]} material={leather} />
      </group>
      <FloorLamp position={[-2.45, 0, -0.35]} stem={brass()} shade={glow('#e5cea5')} />

      {/* Writing desk with a banker's lamp. */}
      <group position={[1.45, 0, 0.95]} rotation={[0, -0.35, 0]}>
        <Block size={[1.55, 0.06, 0.78]} position={[0, 0.76, 0]} material={walnut} />
        {[-0.7, 0.7].flatMap((x) =>
          [-0.32, 0.32].map((z) => <Block key={`${x}${z}`} size={[0.06, 0.74, 0.06]} position={[x, 0.37, z]} material={walnut} />),
        )}
        <Cyl radius={0.07} height={0.02} position={[0.45, 0.8, -0.15]} material={brass()} segments={12} />
        <Cyl radius={0.012} height={0.26} position={[0.45, 0.92, -0.15]} material={brass()} segments={6} />
        <Block size={[0.3, 0.07, 0.12]} position={[0.45, 1.07, -0.12]} material={glow('#345da8')} cast={false} />
        <Block size={[0.3, 0.05, 0.22]} position={[-0.35, 0.815, 0.02]} rotation={[0, 0.2, 0]} material={mat('#7f4f47', { roughness: 0.8 })} />
        <Block size={[0.27, 0.04, 0.2]} position={[-0.35, 0.86, 0.02]} rotation={[0, -0.1, 0]} material={mat('#d3c6b5', { roughness: 0.8 })} />
        <Chair position={[0, 0, 0.62]} rotationY={Math.PI} frame={walnut} seat={leather} />
      </group>
    </group>
  )
}
