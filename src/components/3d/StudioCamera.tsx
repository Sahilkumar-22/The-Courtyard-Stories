import { PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

/** A long lens on wide screens keeps the architecture calm; portrait screens get a wider view. */
export const fieldOfView = (aspect: number) => (aspect < 1 ? 50 : 32)

export function StudioCamera() {
  const size = useThree((state) => state.size)
  const aspect = size.width / Math.max(size.height, 1)
  return <PerspectiveCamera makeDefault fov={fieldOfView(aspect)} near={0.5} far={700} position={[0, 30, 90]} />
}
