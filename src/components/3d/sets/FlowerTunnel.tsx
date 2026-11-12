import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { type InstancedMesh, Object3D } from 'three'
import { foliage, glow, iron, mat, stone, textured } from '../materials'
import { Ball, Block, Cyl, cylinderGeometry, facetedGeometry, Floor, Hoop, Instances, type InstanceItem } from '../primitives'
import { grainTexture } from '../textures'
import { D, seeded, type SetEnvironmentProps, W } from './common'

const RADIUS = 2.35
const SPRING = 0.35
const HOOPS = [-2.7, -1.8, -0.9, 0, 0.9, 1.8, 2.7]
// Blossom runs from the beige through tints of the terracotta; leaves are tones of the gold.
const BLOSSOM = ['#e8d8c3', '#e8d8c3', '#e1c2ac', '#e1c2ac', '#daac95', '#daac95', '#d2977e', '#d2977e', '#cb8167', '#c46b50']
const LEAF = ['#b28b30', '#dcaf4c', '#8b7133']

const petalDummy = new Object3D()

/** A few petals drifting down through the tunnel. Skipped when motion is reduced. */
function Petals({ count }: { count: number }) {
  const ref = useRef<InstancedMesh>(null)
  const petals = useMemo(() => {
    const rand = seeded(907)
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 3.6,
      y: rand() * 2.6,
      z: (rand() - 0.5) * 5.2,
      speed: 0.12 + rand() * 0.16,
      sway: rand() * Math.PI * 2,
      spin: rand() * Math.PI * 2,
    }))
  }, [count])

  useFrame((state, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const step = Math.min(delta, 0.05)
    const time = state.clock.elapsedTime
    petals.forEach((petal, index) => {
      petal.y -= petal.speed * step
      if (petal.y < 0.03) petal.y = 2.5
      petalDummy.position.set(petal.x + Math.sin(time * 0.7 + petal.sway) * 0.18, petal.y, petal.z)
      petalDummy.rotation.set(time * 0.6 + petal.spin, petal.spin, time * 0.4)
      petalDummy.scale.set(0.045, 0.008, 0.032)
      petalDummy.updateMatrix()
      mesh.setMatrixAt(index, petalDummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={ref}
      args={[facetedGeometry(0), mat('#e1c2ac', { roughness: 0.9 }), count]}
      frustumCulled={false}
    />
  )
}

export function FlowerTunnel({ density, segments, reducedMotion }: SetEnvironmentProps) {
  const bronze = iron()
  const vermilion = mat('#c46b50', { roughness: 0.7 })
  const granite = stone('#beb4a8')

  const { blossoms, stones } = useMemo(() => {
    const rand = seeded(311)
    const items: InstanceItem[] = []
    const canopy = Math.round(2400 * density)
    for (let index = 0; index < canopy; index += 1) {
      const angle = 0.1 + rand() * (Math.PI - 0.2)
      const reach = RADIUS + (rand() - 0.42) * 0.55
      const leaf = rand() < 0.13
      items.push({
        position: [Math.cos(angle) * reach, SPRING + Math.sin(angle) * reach, (rand() - 0.5) * 5.7],
        rotation: [rand() * 3, rand() * 3, 0],
        scale: 0.07 + rand() * 0.09,
        color: leaf ? LEAF[Math.floor(rand() * LEAF.length)] : BLOSSOM[Math.floor(rand() * BLOSSOM.length)],
      })
    }
    // Hanging racemes, wisteria-fashion, tapering as they fall.
    const racemes = Math.round(170 * density)
    for (let index = 0; index < racemes; index += 1) {
      const angle = 0.45 + rand() * (Math.PI - 0.9)
      const x = Math.cos(angle) * (RADIUS - 0.12)
      const top = SPRING + Math.sin(angle) * (RADIUS - 0.12)
      const z = (rand() - 0.5) * 5.6
      const length = 5 + Math.floor(rand() * 5)
      const color = BLOSSOM[Math.floor(rand() * BLOSSOM.length)]
      for (let step = 0; step < length; step += 1) {
        items.push({
          position: [x + (rand() - 0.5) * 0.04, top - step * 0.105, z + (rand() - 0.5) * 0.04],
          rotation: [rand() * 3, rand() * 3, 0],
          scale: 0.085 - (step / length) * 0.05,
          color,
        })
      }
    }
    const stoneItems: InstanceItem[] = []
    for (let index = 0; index < 8; index += 1) {
      const radius = 0.3 + rand() * 0.12
      stoneItems.push({
        position: [(index % 2 === 0 ? -0.22 : 0.22) + (rand() - 0.5) * 0.1, 0.03, -2.6 + index * 0.74],
        scale: [radius, 0.06, radius * (0.8 + rand() * 0.2)],
      })
    }
    return { blossoms: items, stones: stoneItems }
  }, [density])

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(grainTexture('#e5cea5', 2, 2), 1)} />
      <Floor width={1.9} depth={D} position={[0, 0.008, 0]} material={textured(grainTexture('#d3c6b5', 1, 3), 1)} />
      <Instances geometry={cylinderGeometry(1, 12)} material={granite} items={stones} />

      {/* Seven hoops and five rods carry the blossom. */}
      {HOOPS.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Hoop radius={RADIUS} tube={0.045} arc={Math.PI} segments={Math.max(16, Math.round(40 * segments))} position={[0, SPRING, 0]} material={bronze} />
          {[-1, 1].map((side) => (
            <Cyl key={side} radius={0.045} height={SPRING} position={[side * RADIUS, SPRING / 2, 0]} material={bronze} segments={8} />
          ))}
        </group>
      ))}
      {[30, 60, 90, 120, 150].map((degrees) => {
        const angle = (degrees * Math.PI) / 180
        return (
          <Cyl
            key={degrees}
            radius={0.02}
            height={5.4}
            position={[Math.cos(angle) * RADIUS, SPRING + Math.sin(angle) * RADIUS, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={bronze}
            segments={6}
          />
        )
      })}
      <Instances geometry={facetedGeometry(0)} material={mat('#ffffff', { roughness: 0.9, flatShading: true })} items={blossoms} />
      {!reducedMotion && <Petals count={Math.round(46 * density)} />}

      {/* A small torii closes the far end of the tunnel. */}
      <group position={[0, 0, -2.78]}>
        {[-0.95, 0.95].map((x) => (
          <Cyl key={x} radius={0.09} height={2.1} position={[x, 1.05, 0]} material={vermilion} segments={12} />
        ))}
        <Block size={[2.3, 0.1, 0.12]} position={[0, 1.66, 0]} material={vermilion} />
        <Block size={[2.6, 0.13, 0.22]} position={[0, 2.08, 0]} material={vermilion} />
        <Block size={[2.74, 0.05, 0.28]} position={[0, 2.17, 0]} material={mat('#17243a', { roughness: 0.8 })} />
      </group>

      {/* Stone lantern and moss by the entrance. */}
      <group position={[-2.85, 0, 2.35]}>
        <Block size={[0.42, 0.12, 0.42]} position={[0, 0.06, 0]} material={granite} />
        <Cyl radius={0.08} height={0.7} position={[0, 0.47, 0]} material={granite} segments={8} />
        <Block size={[0.46, 0.06, 0.46]} position={[0, 0.85, 0]} material={granite} />
        <Block size={[0.3, 0.26, 0.3]} position={[0, 1.01, 0]} material={glow('#e2c487')} cast={false} />
        <Cyl radius={0.4} topRadius={0.05} height={0.24} position={[0, 1.26, 0]} rotation={[0, Math.PI / 4, 0]} material={granite} segments={4} />
        <Ball radius={0.06} position={[0, 1.42, 0]} material={granite} />
      </group>
      {[
        [2.9, 2.2, 0.5],
        [3, -0.6, 0.38],
        [-3, -1.5, 0.44],
        [-2.95, 0.6, 0.3],
      ].map(([x, z, radius]) => (
        <Ball key={`${x}${z}`} radius={radius} faceted stretch={[1, 0.42, 1]} position={[x, 0.05, z]} material={foliage('#b28b30')} />
      ))}
    </group>
  )
}
