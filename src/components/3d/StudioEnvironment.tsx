import { Environment, Lightformer } from '@react-three/drei'
import { BRAND_COLOURS } from '@/data/brandColours'

/** The sky is the palette's beige, the same colour as the page behind the scene. */
export const SKY_COLOUR = BRAND_COLOURS.beige

/**
 * Atmosphere: a beige sky, haze that softens the distance, and a small procedural light
 * studio that gives the gold, the glass and the water something to reflect. The lights
 * are plain white so that every surface shows its own palette colour. Nothing is downloaded.
 */
export function StudioEnvironment() {
  return (
    <>
      <color attach="background" args={[SKY_COLOUR]} />
      <fog attach="fog" args={[SKY_COLOUR, 70, 330]} />
      <Environment resolution={64} frames={1} environmentIntensity={0.22}>
        <color attach="background" args={[BRAND_COLOURS.beige]} />
        <Lightformer form="rect" intensity={4} color="#ffffff" position={[-6, 7, 6]} scale={[12, 7, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[8, 3, -5]} scale={[9, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="circle" intensity={2.6} color="#ffffff" position={[0, 10, 0]} scale={9} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color={BRAND_COLOURS.beige} position={[0, -6, 0]} scale={[20, 20, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  )
}
