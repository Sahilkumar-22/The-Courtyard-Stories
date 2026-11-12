import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  type BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  IcosahedronGeometry,
  type InstancedMesh,
  type Material,
  Object3D,
  Path,
  PlaneGeometry,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three'
import { BRAND_COLOURS, toBrand } from '@/data/brandColours'

/**
 * Building blocks for the procedural architecture. Geometry is shared wherever the same
 * shape repeats, so the whole courtyard uses a few dozen geometries rather than thousands.
 */

export type Vec3 = [number, number, number]

const geometryCache = new Map<string, BufferGeometry>()

export function sharedGeometry<T extends BufferGeometry>(key: string, create: () => T): T {
  let geometry = geometryCache.get(key)
  if (!geometry) {
    geometry = create()
    geometryCache.set(key, geometry)
  }
  return geometry as T
}

/** Frees GPU memory held by shared geometry. The objects stay reusable. */
export function disposeGeometries() {
  geometryCache.forEach((geometry) => geometry.dispose())
}

/** A geometry owned by one component, disposed when that component unmounts. */
export function useOwnedGeometry<T extends BufferGeometry>(create: () => T, deps: unknown[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geometry = useMemo(create, deps)
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

export const boxGeometry = () => sharedGeometry('box', () => new BoxGeometry(1, 1, 1))
export const planeGeometry = () => sharedGeometry('plane', () => new PlaneGeometry(1, 1))
export const sphereGeometry = () => sharedGeometry('sphere', () => new SphereGeometry(1, 20, 14))
export const facetedGeometry = (detail = 1) =>
  sharedGeometry(`faceted-${detail}`, () => new IcosahedronGeometry(1, detail))
export const domeGeometry = () =>
  sharedGeometry('dome', () => new SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2))
export const discGeometry = (segments = 40) =>
  sharedGeometry(`disc-${segments}`, () => new CircleGeometry(1, segments))
export const cylinderGeometry = (topRatio = 1, segments = 20) =>
  sharedGeometry(`cyl-${topRatio.toFixed(3)}-${segments}`, () => new CylinderGeometry(topRatio, 1, 1, segments))

interface MeshProps {
  position?: Vec3
  rotation?: Vec3
  material: Material
  cast?: boolean
  receive?: boolean
}

export function Block({ size, position, rotation, material, cast = true, receive = true }: MeshProps & { size: Vec3 }) {
  return (
    <mesh
      geometry={boxGeometry()}
      material={material}
      position={position}
      rotation={rotation}
      scale={size}
      castShadow={cast}
      receiveShadow={receive}
    />
  )
}

interface CylProps extends MeshProps {
  radius: number
  height: number
  /** Radius at the top; defaults to the bottom radius. 0 makes a cone. */
  topRadius?: number
  segments?: number
}

export function Cyl({ radius, height, topRadius, segments = 20, position, rotation, material, cast = true, receive = true }: CylProps) {
  const ratio = topRadius === undefined ? 1 : topRadius / radius
  return (
    <mesh
      geometry={cylinderGeometry(ratio, segments)}
      material={material}
      position={position}
      rotation={rotation}
      scale={[radius, height, radius]}
      castShadow={cast}
      receiveShadow={receive}
    />
  )
}

const UP = new Vector3(0, 1, 0)

/** A cylinder between two points: branches, braces, ropes. */
export function Limb({ from, to, radius, topRadius, segments = 8, material, cast = true }: {
  from: Vec3
  to: Vec3
  radius: number
  topRadius?: number
  segments?: number
  material: Material
  cast?: boolean
}) {
  const { position, quaternion, length } = useMemo(() => {
    const start = new Vector3(...from)
    const end = new Vector3(...to)
    const direction = end.clone().sub(start)
    const span = direction.length()
    return {
      position: start.clone().add(end).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(UP, direction.normalize()),
      length: span,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from.join(','), to.join(',')])
  const ratio = topRadius === undefined ? 1 : topRadius / radius
  return (
    <mesh
      geometry={cylinderGeometry(ratio, segments)}
      material={material}
      position={position}
      quaternion={quaternion}
      scale={[radius, length, radius]}
      castShadow={cast}
      receiveShadow
    />
  )
}

interface BallProps extends MeshProps {
  radius: number
  /** Non-uniform stretch applied on top of the radius. */
  stretch?: Vec3
  faceted?: boolean
}

export function Ball({ radius, stretch = [1, 1, 1], faceted = false, position, rotation, material, cast = true, receive = true }: BallProps) {
  return (
    <mesh
      geometry={faceted ? facetedGeometry(1) : sphereGeometry()}
      material={material}
      position={position}
      rotation={rotation}
      scale={[radius * stretch[0], radius * stretch[1], radius * stretch[2]]}
      castShadow={cast}
      receiveShadow={receive}
    />
  )
}

export function Dome({ radius, height, position, material }: MeshProps & { radius: number; height?: number }) {
  return (
    <mesh
      geometry={domeGeometry()}
      material={material}
      position={position}
      scale={[radius, height ?? radius, radius]}
      castShadow
      receiveShadow
    />
  )
}

/** A horizontal surface (floor, rug, water) facing up. */
export function Floor({ width, depth, position, rotationY = 0, material, receive = true }: {
  width: number
  depth: number
  position?: Vec3
  rotationY?: number
  material: Material
  receive?: boolean
}) {
  return (
    <mesh
      geometry={planeGeometry()}
      material={material}
      position={position}
      rotation={[-Math.PI / 2, 0, rotationY]}
      scale={[width, depth, 1]}
      receiveShadow={receive}
    />
  )
}

/** A vertical surface (tile panel, screen, pane) facing local +z. */
export function Panel({ width, height, position, rotation, material, cast = false, receive = true }: MeshProps & {
  width: number
  height: number
}) {
  return (
    <mesh
      geometry={planeGeometry()}
      material={material}
      position={position}
      rotation={rotation}
      scale={[width, height, 1]}
      castShadow={cast}
      receiveShadow={receive}
    />
  )
}

export function Disc({ radius, position, material, segments = 40, receive = true }: {
  radius: number
  position?: Vec3
  material: Material
  segments?: number
  receive?: boolean
}) {
  return (
    <mesh
      geometry={discGeometry(segments)}
      material={material}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[radius, radius, 1]}
      receiveShadow={receive}
    />
  )
}

export function Hoop({ radius, tube, arc = Math.PI * 2, segments = 48, position, rotation, material, cast = true }: MeshProps & {
  radius: number
  tube: number
  arc?: number
  segments?: number
}) {
  const geometry = sharedGeometry(
    `hoop-${radius}-${tube}-${arc.toFixed(3)}-${segments}`,
    () => new TorusGeometry(radius, tube, 8, segments, arc),
  )
  return <mesh geometry={geometry} material={material} position={position} rotation={rotation} castShadow={cast} receiveShadow />
}

// ---------------------------------------------------------------------------
// Instancing
// ---------------------------------------------------------------------------

export interface InstanceItem {
  position: Vec3
  rotation?: Vec3
  scale?: number | Vec3
  color?: string
}

const dummy = new Object3D()
const tint = new Color()

/** Draws many copies of one geometry in a single draw call. */
export function Instances({ geometry, material, items, cast = true, receive = true }: {
  geometry: BufferGeometry
  material: Material
  items: InstanceItem[]
  cast?: boolean
  receive?: boolean
}) {
  const ref = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    // Instance colours come from the palette too; in a coloured batch, an item without
    // a colour of its own takes the beige.
    const coloured = items.some((item) => item.color)
    items.forEach((item, index) => {
      dummy.position.set(...item.position)
      dummy.rotation.set(...(item.rotation ?? [0, 0, 0]))
      if (typeof item.scale === 'number') dummy.scale.setScalar(item.scale)
      else dummy.scale.set(...(item.scale ?? [1, 1, 1]))
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
      if (coloured) mesh.setColorAt(index, tint.set(toBrand(item.color ?? BRAND_COLOURS.beige)))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])

  if (items.length === 0) return null
  return (
    <instancedMesh
      key={items.length}
      ref={ref}
      args={[geometry, material, items.length]}
      castShadow={cast}
      receiveShadow={receive}
    />
  )
}

// ---------------------------------------------------------------------------
// Arches
// ---------------------------------------------------------------------------

export type ArchKind = 'rect' | 'round' | 'pointed' | 'horseshoe' | 'cusped'

export interface Opening {
  /** Centre of the opening along the wall. */
  x: number
  width: number
  /** Height from sill to apex. */
  height: number
  kind: ArchKind
  /** Height of the bottom of the opening above the floor. */
  sill?: number
}

/** Traces the outline of an arched opening onto a path, starting bottom-left. */
function traceArch(path: Path, kind: ArchKind, x: number, sill: number, width: number, height: number) {
  const half = width / 2
  const left = x - half
  const right = x + half
  const top = sill + height
  path.moveTo(left, sill)

  if (kind === 'rect') {
    path.lineTo(left, top)
    path.lineTo(right, top)
  } else if (kind === 'round') {
    const spring = Math.max(top - half, sill)
    path.lineTo(left, spring)
    path.absarc(x, spring, half, Math.PI, 0, true)
  } else if (kind === 'pointed') {
    // Two arcs struck from the quarter points meet in a point.
    const radius = width * 0.75
    const spring = Math.max(top - width * 0.7071, sill)
    path.lineTo(left, spring)
    path.absarc(x + width / 4, spring, radius, Math.PI, Math.acos(-1 / 3), true)
    path.absarc(x - width / 4, spring, radius, Math.acos(1 / 3), 0, true)
  } else if (kind === 'horseshoe') {
    // The arc continues past the semicircle and returns in to the jambs.
    const radius = half * 1.14
    const tuck = Math.acos(half / radius)
    const centre = top - radius
    path.lineTo(left, centre - radius * Math.sin(tuck))
    path.absarc(x, centre, radius, Math.PI + tuck, -tuck, true)
  } else {
    // Cusped (multifoil) arch: scalloped lobes rising to a pointed crown.
    const lobes = 7
    const spring = Math.max(top - half * 1.24, sill)
    path.lineTo(left, spring)
    for (let lobe = 0; lobe < lobes; lobe += 1) {
      const middle = Math.PI - ((lobe + 0.5) * Math.PI) / lobes
      const end = Math.PI - ((lobe + 1) * Math.PI) / lobes
      const reach = half * (lobe === (lobes - 1) / 2 ? 1.5 : 1.22)
      path.quadraticCurveTo(
        x + Math.cos(middle) * reach,
        spring + Math.sin(middle) * reach,
        x + Math.cos(end) * half,
        spring + Math.sin(end) * half,
      )
    }
  }

  path.lineTo(right, sill)
  path.closePath()
}

interface ArchWallProps extends MeshProps {
  width: number
  height: number
  thickness: number
  openings: Opening[]
  /** Curve resolution; lower on phones. */
  curveSegments?: number
}

/** A wall standing on the floor, centred on x, pierced by arched openings. */
export function ArchWall({ width, height, thickness, openings, curveSegments = 14, position, rotation, material, cast = true, receive = true }: ArchWallProps) {
  const signature = JSON.stringify(openings)
  const geometry = useOwnedGeometry(() => {
    const shape = new Shape()
    shape.moveTo(-width / 2, 0)
    shape.lineTo(-width / 2, height)
    shape.lineTo(width / 2, height)
    shape.lineTo(width / 2, 0)
    shape.closePath()
    for (const opening of openings) {
      const hole = new Path()
      traceArch(hole, opening.kind, opening.x, opening.sill ?? 0, opening.width, opening.height)
      shape.holes.push(hole)
    }
    const extruded = new ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments })
    extruded.translate(0, 0, -thickness / 2)
    return extruded
  }, [width, height, thickness, signature, curveSegments])

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      castShadow={cast}
      receiveShadow={receive}
    />
  )
}

interface ArchBandProps extends MeshProps {
  kind: ArchKind
  /** Clear width of the opening the band frames. */
  width: number
  /** Height of the opening the band frames. */
  height: number
  /** Width of the moulding. */
  band: number
  depth: number
  sill?: number
  curveSegments?: number
}

/** A moulding that frames an arched opening. */
export function ArchBand({ kind, width, height, band, depth, sill = 0, curveSegments = 14, position, rotation, material }: ArchBandProps) {
  const geometry = useOwnedGeometry(() => {
    const shape = new Shape()
    traceArch(shape, kind, 0, sill, width + band * 2, height + band)
    // The hole stops just short of the sill so it stays strictly inside the outline.
    const hole = new Path()
    traceArch(hole, kind, 0, sill + 0.03, width, height - 0.03)
    shape.holes.push(hole)
    const extruded = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments })
    extruded.translate(0, 0, -depth / 2)
    return extruded
  }, [kind, width, height, band, depth, sill, curveSegments])

  return <mesh geometry={geometry} material={material} position={position} rotation={rotation} castShadow receiveShadow />
}

/** A triangular prism: pediments and pitched roofs. The ridge runs along local z. */
export function Gable({ width, height, depth, position, rotation, material, cast = true, receive = true }: MeshProps & {
  width: number
  height: number
  depth: number
}) {
  const geometry = useOwnedGeometry(() => {
    const shape = new Shape()
    shape.moveTo(-width / 2, 0)
    shape.lineTo(0, height)
    shape.lineTo(width / 2, 0)
    shape.closePath()
    const extruded = new ExtrudeGeometry(shape, { depth, bevelEnabled: false })
    extruded.translate(0, 0, -depth / 2)
    return extruded
  }, [width, height, depth])

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      castShadow={cast}
      receiveShadow={receive}
    />
  )
}
