import { brass, fabric, glow, mat, PALETTE, plaster, polished, textured, timber } from '../materials'
import { ArchBand, ArchWall, Ball, Block, Cyl, Dome, Floor } from '../primitives'
import { checkerTexture, rugTexture } from '../textures'
import { curve, D, HD, HW, type SetEnvironmentProps, W } from './common'

const ARCADE_HEIGHT = 3.95
const ARCADE_Z = -HD + 1.55

export function RajMahal({ segments }: SetEnvironmentProps) {
  const marble = polished('#e8d8c3')
  const ivory = plaster('#e8d8c3')
  const gilded = mat('#e2c487', { roughness: 0.5, metalness: 0.45 })
  const cs = curve(segments)
  const velvet = fabric(PALETTE.burgundy)

  return (
    <group>
      <Floor
        width={W}
        depth={D}
        position={[0, 0.004, 0]}
        material={textured(checkerTexture('#e8d8c3', '#d3c6b5', 3.5, 3), 0.4)}
      />

      {/* Rear wall with gilded niches set behind an ivory face. */}
      <Block size={[W, 4.6, 0.2]} position={[0, 2.3, -HD + 0.1]} material={gilded} />
      <ArchWall
        width={W}
        height={4.6}
        thickness={0.24}
        position={[0, 0, -HD + 0.32]}
        openings={[
          { x: 0, width: 1.5, height: 3.2, kind: 'pointed' },
          { x: -2.3, width: 1.1, height: 2.6, kind: 'pointed' },
          { x: 2.3, width: 1.1, height: 2.6, kind: 'pointed' },
        ]}
        curveSegments={cs}
        material={ivory}
      />
      <ArchBand
        kind="pointed"
        width={1.5}
        height={3.2}
        band={0.07}
        depth={0.06}
        position={[0, 0, -HD + 0.46]}
        curveSegments={cs}
        material={brass()}
      />
      <Block size={[W + 0.3, 0.2, 0.6]} position={[0, 4.7, -HD + 0.25]} material={ivory} />

      {/* A slender arcade stands free of the wall, giving the palace its depth. */}
      <ArchWall
        width={W}
        height={ARCADE_HEIGHT}
        thickness={0.3}
        position={[0, 0, ARCADE_Z]}
        openings={[-2.64, -1.32, 0, 1.32, 2.64].map((x) => ({ x, width: 1.04, height: 3.3, kind: 'pointed' as const }))}
        curveSegments={cs}
        material={marble}
      />
      <Block size={[W + 0.2, 0.16, 0.46]} position={[0, ARCADE_HEIGHT + 0.08, ARCADE_Z]} material={marble} />
      <Cyl radius={0.78} height={0.34} position={[0, ARCADE_HEIGHT + 0.33, ARCADE_Z]} material={marble} segments={28} />
      <Dome radius={0.82} height={0.9} position={[0, ARCADE_HEIGHT + 0.5, ARCADE_Z]} material={marble} />
      <Ball radius={0.1} position={[0, ARCADE_HEIGHT + 1.47, ARCADE_Z]} material={brass()} />
      <Cyl radius={0.04} topRadius={0} height={0.34} position={[0, ARCADE_HEIGHT + 1.7, ARCADE_Z]} material={brass()} segments={8} />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (HW - 0.4), ARCADE_HEIGHT + 0.16, ARCADE_Z]}>
          <Dome radius={0.32} height={0.38} material={marble} />
          <Ball radius={0.05} position={[0, 0.42, 0]} material={brass()} />
        </group>
      ))}

      {/* Side walls return part of the way forward, each with an open arch. */}
      {[-1, 1].map((side) => (
        <ArchWall
          key={side}
          width={3.3}
          height={ARCADE_HEIGHT}
          thickness={0.3}
          position={[side * (HW - 0.15), 0, -HD + 1.85]}
          rotation={[0, Math.PI / 2, 0]}
          openings={[{ x: side * -0.1, width: 1.3, height: 2.9, kind: 'pointed' }]}
          curveSegments={cs}
          material={ivory}
        />
      ))}

      {/* Dais with a low divan. */}
      <Block size={[3.2, 0.18, 1.7]} position={[0, 0.09, 0.15]} material={marble} />
      <Block size={[2.2, 0.26, 0.9]} position={[0, 0.31, 0.05]} material={timber(PALETTE.walnut)} />
      <Block size={[2.1, 0.16, 0.84]} position={[0, 0.52, 0.05]} material={velvet} />
      <Block size={[1.5, 0.42, 0.16]} position={[0, 0.8, -0.3]} rotation={[-0.14, 0, 0]} material={fabric('#e2c487')} />
      {[-1, 1].map((side) => (
        <Cyl
          key={side}
          radius={0.15}
          height={0.84}
          position={[side * 0.92, 0.74, 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
          material={velvet}
          segments={14}
        />
      ))}
      <Floor
        width={3.4}
        depth={1.5}
        position={[0, 0.014, 1.95]}
        material={textured(rugTexture(PALETTE.burgundy, '#e5cea5', '#dfb96a'), 1)}
      />

      {/* Brass candelabra. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 2.35, 0, 0.55]}>
          <Cyl radius={0.2} height={0.06} position={[0, 0.03, 0]} material={brass()} />
          <Cyl radius={0.035} height={1.7} position={[0, 0.88, 0]} material={brass()} segments={8} />
          <Block size={[0.5, 0.03, 0.03]} position={[0, 1.7, 0]} material={brass()} />
          {[-0.24, 0, 0.24].map((x) => (
            <Ball key={x} radius={0.07} position={[x, 1.8 + (x === 0 ? 0.08 : 0), 0]} material={glow('#e2c487')} cast={false} />
          ))}
        </group>
      ))}
    </group>
  )
}
