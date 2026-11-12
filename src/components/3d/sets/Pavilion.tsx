import { MeshBasicMaterial } from 'three'
import { useEffect, useMemo } from 'react'
import { BRAND_COLOURS } from '@/data/brandColours'
import { brass, fabric, plaster, stone, textured, timber } from '../materials'
import { Block, Floor, Panel } from '../primitives'
import { paversTexture } from '../textures'
import { usePhotoTexture } from '../usePhotoTexture'
import { D, HD, HW, type SetEnvironmentProps, W } from './common'

const WALL_HEIGHT = 4.3
const MAX_WIDTH = 4.6
const MAX_HEIGHT = 2.9

/**
 * A neutral gallery room for sets that exist in the studio's photo collection but have
 * no bespoke 3D concept yet. It makes no claim about what the set looks like: it simply
 * hangs the set's own photograph on the wall.
 */
export function Pavilion({ heroImage }: SetEnvironmentProps) {
  const wall = plaster()
  // A navy rear wall, so the photograph and its gold frame stand out.
  const rearWall = plaster(BRAND_COLOURS.navy)
  const texture = usePhotoTexture(heroImage, 1280)

  const aspect = heroImage ? heroImage.width / heroImage.height : 1.5
  const width = Math.min(MAX_WIDTH, MAX_HEIGHT * aspect)
  const height = width / aspect

  // The photograph is shown unlit so its colours stay true.
  const photoMaterial = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), [])
  useEffect(() => {
    photoMaterial.map = texture
    photoMaterial.color.set(texture ? '#ffffff' : BRAND_COLOURS.beige)
    photoMaterial.needsUpdate = true
  }, [photoMaterial, texture, heroImage])
  useEffect(() => () => photoMaterial.dispose(), [photoMaterial])

  return (
    <group>
      <Floor width={W} depth={D} position={[0, 0.004, 0]} material={textured(paversTexture('#e8d8c3', 3.5, 3))} />
      <Block size={[W, WALL_HEIGHT, 0.3]} position={[0, WALL_HEIGHT / 2, -HD + 0.15]} material={rearWall} />
      <Block size={[W + 0.2, 0.16, 0.44]} position={[0, WALL_HEIGHT + 0.08, -HD + 0.15]} material={stone()} />
      {[-1, 1].map((side) => (
        <Block key={side} size={[0.3, WALL_HEIGHT, 3]} position={[side * (HW - 0.15), WALL_HEIGHT / 2, -HD + 1.8]} material={wall} />
      ))}

      {/* The set's own photograph, framed in gold. */}
      <Block size={[width + 0.14, height + 0.14, 0.06]} position={[0, 2.3, -HD + 0.33]} material={brass()} />
      <Panel width={width} height={height} position={[0, 2.3, -HD + 0.365]} material={photoMaterial} receive={false} />

      {/* Gallery bench. */}
      <Block size={[2.2, 0.12, 0.6]} position={[0, 0.44, 0.9]} material={fabric('#e8d8c3')} />
      {[-0.95, 0.95].map((x) => (
        <Block key={x} size={[0.08, 0.38, 0.5]} position={[x, 0.19, 0.9]} material={timber()} />
      ))}
    </group>
  )
}
