import { useMemo } from 'react'
import { brass, foliage, glow, mat, stone, textured, timber } from '../materials'
import { Ball, Block, boxGeometry, Cyl, cylinderGeometry, facetedGeometry, Floor, Gable, Hoop, Instances, type InstanceItem, Limb, sphereGeometry, type Vec3 } from '../primitives'
import { grainTexture, planksTexture } from '../textures'
import { D, seeded, type SetEnvironmentProps, W } from './common'

const TRUNK: Vec3 = [0.3, 0, -0.6]
const DECK_Y = 2.4
const DECK = { x: 0.3, z: -0.5, width: 4.4, depth: 3.4 }
const RAIL = 0.9
// The canopy is the palette's gold with its shades and a tint.
const CANOPY_COLOURS = ['#d9a52e', '#b28b30', '#dcaf4c', '#8b7133']

export function TreeHouse({ density }: SetEnvironmentProps) {
  const bark = mat('#7f4f47', { roughness: 1 })
  const cedar = timber('#8b7133')
  const deckBoards = textured(planksTexture('#8b7133', 2, 2), 0.8)
  const rope = mat('#daac95', { roughness: 1 })

  const { canopy, railPosts, rungs, lights, stones } = useMemo(() => {
    const rand = seeded(401)
    const canopyItems: InstanceItem[] = []
    const clusters = Math.round(26 + 30 * density)
    for (let index = 0; index < clusters; index += 1) {
      const angle = rand() * Math.PI * 2
      const lift = rand() * 2 - 1
      const spread = Math.cbrt(rand())
      const ring = Math.sqrt(1 - lift * lift) * spread
      canopyItems.push({
        position: [TRUNK[0] + Math.cos(angle) * ring * 3.1, 6.3 + lift * spread * 1.5, TRUNK[2] + Math.sin(angle) * ring * 2.7],
        rotation: [rand() * 3, rand() * 3, rand() * 3],
        scale: 0.75 + rand() * 0.6,
        color: CANOPY_COLOURS[Math.floor(rand() * CANOPY_COLOURS.length)],
      })
    }

    const left = DECK.x - DECK.width / 2 + 0.05
    const right = DECK.x + DECK.width / 2 - 0.05
    const back = DECK.z - DECK.depth / 2 + 0.05
    const front = DECK.z + DECK.depth / 2 - 0.05
    const postItems: InstanceItem[] = []
    const post = (x: number, z: number) =>
      postItems.push({ position: [x, DECK_Y + RAIL / 2, z], scale: [0.07, RAIL, 0.07] })
    for (let x = left; x <= right + 0.01; x += (right - left) / 6) {
      post(x, back)
      // The front rail stops short on the right, where the ladder arrives.
      if (x < 1.4) post(x, front)
    }
    for (let z = back + (front - back) / 4; z < front - 0.01; z += (front - back) / 4) {
      post(left, z)
      post(right, z)
    }
    post(right, front)

    const rungItems: InstanceItem[] = Array.from({ length: 8 }, (_, index) => ({
      position: [0, 0.3 + index * 0.33, 0] as Vec3,
      scale: [0.5, 0.045, 0.06] as Vec3,
    }))

    // Festoon lights slung from the cabin to the corner of the deck.
    const lightItems: InstanceItem[] = Array.from({ length: 11 }, (_, index) => {
      const t = index / 10
      return {
        position: [0.65 + t * 1.8, 4.35 - t * 1.05 - Math.sin(t * Math.PI) * 0.32, -0.3 + t * 1.45] as Vec3,
        scale: 0.045,
      }
    })

    const stoneItems: InstanceItem[] = [0, 1, 2, 3].map((index) => ({
      position: [1.9 + (index % 2) * 0.25, 0.03, 2.7 - index * 0.2 + (index > 1 ? -0.1 : 0.2)] as Vec3,
      scale: [0.26, 0.05, 0.22] as Vec3,
    }))

    return { canopy: canopyItems, railPosts: postItems, rungs: rungItems, lights: lightItems, stones: stoneItems }
  }, [density])

  const railY = DECK_Y + RAIL
  const cabin: Vec3 = [-0.6, DECK_Y, -1.2]

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(grainTexture('#e5cea5', 2, 2), 1)} />
      <Instances geometry={cylinderGeometry(1, 10)} material={stone('#d3c6b5')} items={stones} />

      {/* The tree. */}
      <Cyl radius={0.52} topRadius={0.33} height={5.5} position={[TRUNK[0], 2.75, TRUNK[2]]} material={bark} segments={10} />
      <Cyl radius={0.85} topRadius={0.5} height={0.5} position={[TRUNK[0], 0.25, TRUNK[2]]} material={bark} segments={10} />
      <Limb from={[0.3, 4.3, -0.6]} to={[2.6, 5.7, -0.2]} radius={0.2} topRadius={0.09} material={bark} />
      <Limb from={[0.3, 4.7, -0.6]} to={[-1.9, 6, -1.5]} radius={0.19} topRadius={0.08} material={bark} />
      <Limb from={[0.3, 5.1, -0.6]} to={[0.8, 6.6, 1]} radius={0.17} topRadius={0.07} material={bark} />
      <Limb from={[0.3, 3.75, -0.6]} to={[-2.6, 4.2, 1.5]} radius={0.17} topRadius={0.09} material={bark} />
      <Instances geometry={facetedGeometry(1)} material={foliage('#ffffff')} items={canopy} />

      {/* Deck on posts, braced to the trunk. */}
      <Block size={[DECK.width, 0.14, DECK.depth]} position={[DECK.x, DECK_Y - 0.07, DECK.z]} material={deckBoards} />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Cyl
            key={`${sx}${sz}`}
            radius={0.085}
            height={DECK_Y - 0.14}
            position={[DECK.x + sx * (DECK.width / 2 - 0.25), (DECK_Y - 0.14) / 2, DECK.z + sz * (DECK.depth / 2 - 0.25)]}
            material={cedar}
            segments={8}
          />
        )),
      )}
      <Limb from={[0.3, 1.3, -0.6]} to={[1.9, DECK_Y - 0.14, 0.7]} radius={0.06} material={cedar} />
      <Limb from={[0.3, 1.3, -0.6]} to={[-1.3, DECK_Y - 0.14, 0.7]} radius={0.06} material={cedar} />

      {/* Railing. */}
      <Instances geometry={boxGeometry()} material={cedar} items={railPosts} />
      <Block size={[DECK.width, 0.07, 0.08]} position={[DECK.x, railY, DECK.z - DECK.depth / 2 + 0.05]} material={cedar} />
      <Block size={[3.35, 0.07, 0.08]} position={[-0.27, railY, DECK.z + DECK.depth / 2 - 0.05]} material={cedar} />
      {[-1, 1].map((side) => (
        <Block key={side} size={[0.08, 0.07, DECK.depth]} position={[DECK.x + side * (DECK.width / 2 - 0.05), railY, DECK.z]} material={cedar} />
      ))}

      {/* Cabin with a pitched roof, built around the trunk. */}
      <group position={cabin}>
        <Block size={[2.3, 1.75, 1.7]} position={[0, 0.875, 0]} material={textured(planksTexture('#d2977e', 1, 2), 0.85)} />
        <Gable width={2.9} height={1} depth={2.1} position={[0, 1.75, 0]} material={mat('#5c4043', { roughness: 0.9 })} />
        <Block size={[0.62, 1.3, 0.04]} position={[-0.5, 0.65, 0.86]} material={mat('#3e3e38', { roughness: 0.9 })} />
        <Hoop radius={0.27} tube={0.03} segments={28} position={[0.55, 1.05, 0.87]} material={brass()} />
        <Cyl radius={0.25} height={0.02} position={[0.55, 1.05, 0.86]} rotation={[Math.PI / 2, 0, 0]} material={glow('#e2c487')} cast={false} />
      </group>
      <Instances geometry={sphereGeometry()} material={glow('#dcaf4c')} items={lights} cast={false} />

      {/* Ladder. */}
      <group position={[1.95, 0, 2.05]} rotation={[-0.3, 0, 0]}>
        {[-0.27, 0.27].map((x) => (
          <Block key={x} size={[0.06, 2.75, 0.07]} position={[x, 1.3, 0]} material={cedar} />
        ))}
        <Instances geometry={boxGeometry()} material={cedar} items={rungs} />
      </group>

      {/* Rope swing. */}
      {[-0.26, 0.26].map((offset) => (
        <Limb key={offset} from={[-2.25 + offset, 4.12, 1.2]} to={[-2.25 + offset, 0.78, 1.2]} radius={0.014} segments={5} material={rope} cast={false} />
      ))}
      <Block size={[0.68, 0.045, 0.24]} position={[-2.25, 0.76, 1.2]} material={cedar} />

      {/* Undergrowth. */}
      <Ball radius={0.55} faceted stretch={[1, 0.6, 1]} position={[-2.9, 0.2, -2.3]} material={foliage('#b28b30')} />
      <Ball radius={0.42} faceted stretch={[1, 0.6, 1]} position={[2.95, 0.15, -2.4]} material={foliage('#d9a52e')} />
      <Ball radius={0.36} faceted stretch={[1, 0.6, 1]} position={[2.95, 0.12, 0.6]} material={foliage('#8b7133')} />
    </group>
  )
}
