import { useMemo } from 'react'
import { RingGeometry, Shape, ShapeGeometry } from 'three'
import { BRAND_COLOURS, shadeOf, tintOf } from '@/data/brandColours'
import type { QualitySettings } from '@/hooks/useQualityTier'
import { SITE, STUDIO_LAYOUT } from './layout'
import { brass, foliage, glow, mat, PALETTE, plaster, stone, textured, timber } from './materials'
import {
  ArchWall,
  Ball,
  Block,
  boxGeometry,
  Cyl,
  cylinderGeometry,
  Disc,
  facetedGeometry,
  Instances,
  type InstanceItem,
  sharedGeometry,
  type Vec3,
} from './primitives'
import { seeded } from './sets/common'
import { paversTexture, plazaTexture } from './textures'

const GATE_THICKNESS = 1.5
const COLUMN_HEIGHT = 3.9
const PAVING = BRAND_COLOURS.beige

/**
 * The fixed architecture of the virtual courtyard: the entrance gate, the colonnaded
 * corridor, the central plaza that orients the visitor, and the paths that lead from it
 * to every exhibition space.
 */
export function StudioArchitecture({ quality }: { quality: QualitySettings }) {
  const limestone = stone()
  const pale = stone()
  const curveSegments = Math.max(10, Math.round(26 * quality.segments))
  const { frontRadius, slots } = STUDIO_LAYOUT
  const gateZ = SITE.gateZ
  const corridorStart = SITE.plazaRadius + 2.4
  const corridorEnd = gateZ - 2.4

  const instanced = useMemo(() => {
    // Paths radiating from the plaza to the walkway in front of each space.
    const pathLength = SITE.walkInner - SITE.plazaRadius + 0.6
    const pathRadius = (SITE.walkInner + SITE.plazaRadius) / 2
    const paths: InstanceItem[] = slots.map((slot) => ({
      position: [pathRadius * Math.sin(slot.angle), 0.025, -pathRadius * Math.cos(slot.angle)],
      rotation: [0, slot.rotationY, 0],
      scale: [1.5, 0.05, pathLength],
    }))

    // Corridor: paired columns under an open timber canopy.
    const bases: InstanceItem[] = []
    const shafts: InstanceItem[] = []
    const capitals: InstanceItem[] = []
    const pairs = Math.max(2, Math.round((corridorEnd - corridorStart) / 2.6))
    const spacing = (corridorEnd - corridorStart) / pairs
    for (let index = 0; index <= pairs; index += 1) {
      const z = corridorStart + index * spacing
      for (const x of [-SITE.corridorHalfWidth, SITE.corridorHalfWidth]) {
        bases.push({ position: [x, 0.11, z], scale: [0.76, 0.22, 0.76] })
        shafts.push({ position: [x, 0.22 + COLUMN_HEIGHT / 2, z], scale: [0.26, COLUMN_HEIGHT, 0.26] })
        capitals.push({ position: [x, 0.22 + COLUMN_HEIGHT + 0.13, z], scale: [0.7, 0.26, 0.7] })
      }
    }
    const slats: InstanceItem[] = []
    for (let z = corridorStart - 0.3; z <= corridorEnd + 0.31; z += 0.62) {
      slats.push({ position: [0, COLUMN_HEIGHT + 0.98, z], scale: [SITE.corridorHalfWidth * 2 + 1.3, 0.1, 0.15] })
    }

    // Boundary walls close the horseshoe between the gate and the outermost spaces.
    const first = slots[0]
    const tangentReach = 4.4
    const endX = Math.abs(first.position[0])
    const endZ = first.position[2] + tangentReach
    const walls: { position: Vec3; rotationY: number; length: number }[] = []
    const cypressTrunks: InstanceItem[] = []
    const cypressCrowns: InstanceItem[] = []
    for (const side of [-1, 1]) {
      const from = { x: side * (SITE.gateWidth / 2), z: gateZ }
      const to = { x: side * endX, z: endZ }
      const dx = to.x - from.x
      const dz = to.z - from.z
      const length = Math.hypot(dx, dz)
      walls.push({ position: [(from.x + to.x) / 2, 0, (from.z + to.z) / 2], rotationY: -Math.atan2(dz, dx), length })
      // A row of cypress stands just inside each wall.
      const inwardX = (-dz / length) * side * -1
      const inwardZ = (dx / length) * side * -1
      for (let step = 1; step <= 5; step += 1) {
        const t = step / 6
        const x = from.x + dx * t + inwardX * 2.2
        const z = from.z + dz * t + inwardZ * 2.2
        const height = 4.4 + (step % 2) * 0.7
        cypressTrunks.push({ position: [x, 0.3, z], scale: [0.09, 0.6, 0.09] })
        cypressCrowns.push({ position: [x, 0.5 + height / 2, z], scale: [0.62, height, 0.62] })
      }
    }

    // Olive trees in stone planters mark the beds between the paths.
    const rand = seeded(88)
    const planters: InstanceItem[] = []
    const trunks: InstanceItem[] = []
    const crowns: InstanceItem[] = []
    const bedRadius = (SITE.plazaRadius + SITE.walkInner) / 2 + 1
    // The trees carry the palette's gold; the cypress along the walls its blue.
    const olive = [BRAND_COLOURS.gold, shadeOf(BRAND_COLOURS.gold, 0.2), tintOf(BRAND_COLOURS.gold, 0.2)]
    for (let index = 1; index < slots.length; index += 2) {
      const angle = (slots[index - 1].angle + slots[index].angle) / 2
      const x = bedRadius * Math.sin(angle)
      const z = -bedRadius * Math.cos(angle)
      planters.push({ position: [x, 0.17, z], scale: [0.95, 0.34, 0.95] })
      trunks.push({ position: [x, 1.05, z], scale: [0.1, 1.5, 0.1] })
      for (let puff = 0; puff < 4; puff += 1) {
        crowns.push({
          position: [x + (rand() - 0.5) * 0.9, 2.1 + rand() * 0.7, z + (rand() - 0.5) * 0.9],
          rotation: [rand() * 3, rand() * 3, 0],
          scale: 0.55 + rand() * 0.35,
          color: olive[Math.floor(rand() * olive.length)],
        })
      }
    }

    return { paths, bases, shafts, capitals, slats, walls, cypressTrunks, cypressCrowns, planters, trunks, crowns }
  }, [slots, corridorStart, corridorEnd, gateZ])

  // The walkway that runs past every space, as a ring sector.
  const walkGeometry = useMemo(() => {
    const reach = Math.abs(slots[0].angle) + STUDIO_LAYOUT.slotAngle / 2 + 0.03
    return sharedGeometry(
      `walk-${frontRadius.toFixed(2)}-${reach.toFixed(3)}`,
      () => new RingGeometry(SITE.walkInner, SITE.walkOuter, Math.round(120 * quality.segments), 1, Math.PI / 2 - reach, reach * 2),
    )
  }, [slots, frontRadius, quality.segments])
  const plazaRim = sharedGeometry('plaza-rim', () => new RingGeometry(SITE.plazaRadius, SITE.plazaRadius + 0.45, 96))

  // The courtyard floor: the area enclosed by the spaces, the boundary walls and the gate,
  // paved a shade lighter than the ground outside so the plan reads at a glance.
  const floorGeometry = useMemo(() => {
    const first = slots[0]
    const last = slots[slots.length - 1]
    const radius = frontRadius + 0.3
    const reach = STUDIO_LAYOUT.slotAngle / 2
    return sharedGeometry(`floor-${frontRadius.toFixed(2)}-${slots.length}`, () => {
      // Shape coordinates are (x, -z): north is +y.
      const shape = new Shape()
      shape.moveTo(-SITE.gateWidth / 2, -gateZ)
      shape.lineTo(-Math.abs(first.position[0]), -(first.position[2] + 4.4))
      shape.absarc(0, 0, radius, Math.PI / 2 - (first.angle - reach), Math.PI / 2 - (last.angle + reach), true)
      shape.lineTo(Math.abs(last.position[0]), -(last.position[2] + 4.4))
      shape.lineTo(SITE.gateWidth / 2, -gateZ)
      shape.closePath()
      return new ShapeGeometry(shape, Math.round(96 * quality.segments))
    })
  }, [slots, frontRadius, gateZ, quality.segments])

  const tiles = SITE.walkOuter / 0.9
  const beamLength = corridorEnd - corridorStart + 1.2
  const corridorMid = (corridorStart + corridorEnd) / 2

  return (
    <group>
      {/* Ground: a shade of the beige outside the walls, the beige itself within them. */}
      <Disc radius={320} material={stone(shadeOf(BRAND_COLOURS.beige, 0.1))} segments={48} />
      <mesh geometry={floorGeometry} material={stone()} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow />

      {/* Central plaza, the point of orientation, with a compass rose and a reflecting pool. */}
      <Disc radius={SITE.plazaRadius} position={[0, 0.03, 0]} material={textured(plazaTexture(PAVING, BRAND_COLOURS.gold), 0.75)} segments={72} />
      <mesh geometry={plazaRim} material={limestone} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]} receiveShadow />
      <Cyl radius={SITE.poolRadius + 0.32} height={0.36} position={[0, 0.18, 0]} material={pale} segments={Math.round(56 * quality.segments)} />
      <Disc
        radius={SITE.poolRadius}
        position={[0, 0.365, 0]}
        material={mat(PALETTE.water, { roughness: 0.05, metalness: 0.55, envMapIntensity: 1.5 })}
        segments={48}
      />
      <Cyl radius={0.2} topRadius={0.14} height={0.7} position={[0, 0.7, 0]} material={pale} segments={14} />
      <Cyl radius={0.5} topRadius={0.86} height={0.14} position={[0, 1.1, 0]} material={pale} segments={28} />
      <Ball radius={0.2} position={[0, 1.34, 0]} material={brass()} />

      {/* Walkway and radial paths. */}
      <mesh
        geometry={walkGeometry}
        material={textured(paversTexture(PAVING, tiles, tiles), 0.85)}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        receiveShadow
      />
      <Instances geometry={boxGeometry()} material={stone(PAVING)} items={instanced.paths} cast={false} />

      {/* Corridor from the gate to the plaza. */}
      <Block
        size={[SITE.corridorHalfWidth * 2 + 1.6, 0.06, gateZ - SITE.plazaRadius + 0.4]}
        position={[0, 0.03, (gateZ + SITE.plazaRadius) / 2]}
        material={stone(PAVING)}
        cast={false}
      />
      <Instances geometry={boxGeometry()} material={limestone} items={instanced.bases} />
      <Instances geometry={cylinderGeometry(0.86, Math.max(10, Math.round(22 * quality.segments)))} material={pale} items={instanced.shafts} />
      <Instances geometry={boxGeometry()} material={limestone} items={instanced.capitals} />
      {[-1, 1].map((side) => (
        <Block
          key={side}
          size={[0.62, 0.46, beamLength]}
          position={[side * SITE.corridorHalfWidth, COLUMN_HEIGHT + 0.7, corridorMid]}
          material={limestone}
        />
      ))}
      <Instances geometry={boxGeometry()} material={timber(PALETTE.oak)} items={instanced.slats} />

      {/* The grand entrance. */}
      <group position={[0, 0, gateZ]}>
        <ArchWall
          width={SITE.gateWidth}
          height={SITE.gateHeight}
          thickness={GATE_THICKNESS}
          openings={[
            { x: 0, width: 4.6, height: 6.6, kind: 'round' },
            { x: -5.4, width: 2, height: 4.1, kind: 'round' },
            { x: 5.4, width: 2, height: 4.1, kind: 'round' },
          ]}
          curveSegments={curveSegments}
          material={limestone}
        />
        <Block size={[SITE.gateWidth + 0.9, 0.42, GATE_THICKNESS + 0.6]} position={[0, SITE.gateHeight + 0.21, 0]} material={pale} />
        <Block size={[9.2, 1, GATE_THICKNESS - 0.1]} position={[0, SITE.gateHeight + 0.92, 0]} material={limestone} />
        <Block size={[9.9, 0.24, GATE_THICKNESS + 0.4]} position={[0, SITE.gateHeight + 1.54, 0]} material={pale} />
        {[-7.55, -3.25, 3.25, 7.55].flatMap((x) =>
          [-1, 1].map((face) => (
            <group key={`${x}${face}`} position={[x, 0, face * (GATE_THICKNESS / 2 + 0.09)]}>
              <Block size={[0.72, 0.5, 0.26]} position={[0, 0.25, 0]} material={pale} />
              <Block size={[0.54, SITE.gateHeight - 1, 0.18]} position={[0, SITE.gateHeight / 2, 0]} material={pale} />
              <Block size={[0.74, 0.44, 0.28]} position={[0, SITE.gateHeight - 0.22, 0]} material={pale} />
            </group>
          )),
        )}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 5.4, 4.5, 0]}>
            <Cyl radius={0.012} height={0.9} position={[0, -0.25, 0]} material={brass()} segments={5} cast={false} />
            <Cyl radius={0.2} topRadius={0.07} height={0.2} position={[0, -0.78, 0]} material={brass()} segments={6} />
            <Cyl radius={0.2} height={0.4} position={[0, -1.08, 0]} material={glow(tintOf(BRAND_COLOURS.gold, 0.4))} segments={6} cast={false} />
            <Cyl radius={0.07} topRadius={0.2} height={0.16} position={[0, -1.36, 0]} material={brass()} segments={6} />
          </group>
        ))}
      </group>

      {/* Boundary walls and cypress. */}
      {instanced.walls.map((wall, index) => (
        <group key={index} position={wall.position} rotation={[0, wall.rotationY, 0]}>
          <Block size={[wall.length, 1.3, 0.45]} position={[0, 0.65, 0]} material={plaster()} />
          <Block size={[wall.length + 0.1, 0.12, 0.62]} position={[0, 1.36, 0]} material={pale} />
        </group>
      ))}
      <Instances geometry={cylinderGeometry(1, 6)} material={timber(PALETTE.walnut)} items={instanced.cypressTrunks} />
      <Instances geometry={cylinderGeometry(0, 9)} material={foliage(PALETTE.cypress)} items={instanced.cypressCrowns} />

      {/* Olive trees. */}
      <Instances geometry={cylinderGeometry(1, 20)} material={pale} items={instanced.planters} />
      <Instances geometry={cylinderGeometry(0.7, 7)} material={timber(PALETTE.walnut)} items={instanced.trunks} />
      <Instances geometry={facetedGeometry(1)} material={foliage('#ffffff')} items={instanced.crowns} />
    </group>
  )
}
