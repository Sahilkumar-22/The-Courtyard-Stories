import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NeutralToneMapping } from 'three'
import { STUDIO_SETS } from '@/data/studioSets'
import { useQualityTier } from '@/hooks/useQualityTier'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useStudioStore } from '@/store/studioStore'
import { CameraController } from './CameraController'
import { STUDIO_LAYOUT } from './layout'
import { disposeMaterials } from './materials'
import { PhotographySet } from './PhotographySet'
import { SetLabelAnchors } from './SetLabelAnchors'
import { disposeGeometries } from './primitives'
import { StudioArchitecture } from './StudioArchitecture'
import { StudioCamera } from './StudioCamera'
import { StudioControls } from './StudioControls'
import { StudioEnvironment } from './StudioEnvironment'
import { StudioLighting } from './StudioLighting'
import { disposeTextures, setTextureResolution } from './textures'

const IDLE_AFTER_MS = 12000

/**
 * Renders continuously while the visitor is active and falls back to on-demand
 * rendering once they have been idle, so a tab left open costs almost nothing.
 */
function useIdle(): boolean {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    let last = performance.now()
    let isIdle = false
    const wake = () => {
      last = performance.now()
      if (isIdle) {
        isIdle = false
        setIdle(false)
      }
    }
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((name) => window.addEventListener(name, wake, { passive: true }))
    // Anything that changes what the scene should show (a selection made by assistive
    // technology, a filter, a route change) also counts as activity, so animations always play out.
    const unsubscribe = useStudioStore.subscribe(wake)
    const timer = window.setInterval(() => {
      if (!isIdle && performance.now() - last > IDLE_AFTER_MS) {
        isIdle = true
        setIdle(true)
      }
    }, 2000)
    return () => {
      events.forEach((name) => window.removeEventListener(name, wake))
      unsubscribe()
      window.clearInterval(timer)
    }
  }, [])

  return idle
}

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return visible
}

/**
 * Reports readiness and context loss, exposes a debug handle in development, and frees
 * shared resources on unmount.
 */
function SceneLifecycle({ onContextLost }: { onContextLost: () => void }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const invalidate = useThree((state) => state.invalidate)
  const setSceneReady = useStudioStore((state) => state.setSceneReady)

  // Listen only while this canvas is mounted: the renderer deliberately drops its own
  // context shortly after unmounting, and that must not be mistaken for a failure.
  useEffect(() => {
    const canvas = gl.domElement
    const handleLost = (event: Event) => {
      event.preventDefault()
      onContextLost()
    }
    canvas.addEventListener('webglcontextlost', handleLost)
    return () => canvas.removeEventListener('webglcontextlost', handleLost)
  }, [gl, onContextLost])

  useEffect(() => {
    // Wait for the first rendered frame before revealing the canvas.
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setSceneReady(true)))
    if (import.meta.env.DEV) {
      ;(window as unknown as { __studio?: unknown }).__studio = { gl, scene }
    }
    return () => {
      cancelAnimationFrame(frame)
      setSceneReady(false)
      // Shared geometry, materials and textures live in module caches rather than in
      // the React tree, so they are released explicitly when the canvas goes away.
      disposeGeometries()
      disposeMaterials()
      disposeTextures()
      if (import.meta.env.DEV) delete (window as unknown as { __studio?: unknown }).__studio
    }
  }, [gl, scene, setSceneReady])

  // Any change of intent (selection, filter, mode) needs a fresh frame when rendering on demand.
  useEffect(() => useStudioStore.subscribe(() => invalidate()), [invalidate])

  return null
}

interface StudioCanvasProps {
  /** False while the canvas is entirely covered by page content. */
  active: boolean
  onContextLost: () => void
}

export default function StudioCanvas({ active, onContextLost }: StudioCanvasProps) {
  const quality = useQualityTier()
  const reducedMotion = useReducedMotion()
  const idle = useIdle()
  const pageVisible = usePageVisible()
  const mode = useStudioStore((state) => state.mode)
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, quality.dpr[1]))
  const [generation, setGeneration] = useState(0)
  const losses = useRef(0)

  setTextureResolution(quality.textureSize)

  // A lost context is rebuilt once with a fresh canvas. If the graphics driver drops it
  // again, the visitor is moved to the image-based experience instead.
  const handleContextLost = useCallback(() => {
    losses.current += 1
    if (losses.current > 1) onContextLost()
    else setGeneration((value) => value + 1)
  }, [onContextLost])

  const frameloop = !active || !pageVisible ? 'never' : idle && mode === 'explore' ? 'demand' : 'always'

  return (
    <Canvas
      key={`${quality.tier}-${generation}`}
      shadows={quality.shadows ? 'percentage' : false}
      dpr={dpr}
      frameloop={frameloop}
      gl={{ antialias: quality.antialias, powerPreference: 'high-performance', stencil: false }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 80 } }}
      onCreated={({ gl }) => {
        // Neutral tone mapping keeps the palette true: beige stays beige and terracotta stays
        // terracotta in full sun, where a filmic curve would wash both towards white.
        gl.toneMapping = NeutralToneMapping
        gl.toneMappingExposure = 1
      }}
    >
      {/* Drop resolution when frames get slow, restore it when there is headroom. */}
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(quality.dpr[0])}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, quality.dpr[1]))}
        onFallback={() => setDpr(quality.dpr[0])}
      />
      <StudioCamera />
      <StudioEnvironment />
      <StudioLighting quality={quality} />
      <StudioArchitecture quality={quality} />
      {STUDIO_SETS.map((set, index) => (
        <PhotographySet key={set.id} set={set} slot={STUDIO_LAYOUT.slots[index]} quality={quality} reducedMotion={reducedMotion} />
      ))}
      <StudioControls />
      <CameraController reducedMotion={reducedMotion} />
      <SetLabelAnchors />
      <SceneLifecycle onContextLost={handleContextLost} />
    </Canvas>
  )
}
