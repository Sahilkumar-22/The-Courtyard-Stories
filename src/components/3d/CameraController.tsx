import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MathUtils, type PerspectiveCamera, Vector3 } from 'three'
import { getSetById } from '@/data/studioSets'
import { registerCameraApi } from '@/hooks/useCameraController'
import { studioRuntime, useStudioStore } from '@/store/studioStore'
import {
  type CameraPose,
  focusPose,
  introPose,
  type OrbitLimits,
  overviewPose,
  sampleStops,
  STORY_LENGTH,
  storyCurves,
} from './cameraPoses'
import { getSlotForSet } from './layout'

/** The part of OrbitControls this controller drives. */
interface OrbitLike {
  target: Vector3
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
  minAzimuthAngle: number
  maxAzimuthAngle: number
  update: () => void
}

const scratchPosition = new Vector3()
const scratchLook = new Vector3()
const scratchDirection = new Vector3()

function applyLimits(controls: OrbitLike, limits: OrbitLimits) {
  controls.minDistance = limits.minDistance
  controls.maxDistance = limits.maxDistance
  controls.minPolarAngle = limits.minPolar
  controls.maxPolarAngle = limits.maxPolar
  controls.minAzimuthAngle = limits.minAzimuth
  controls.maxAzimuthAngle = limits.maxAzimuth
}

/**
 * Owns every camera movement: the scroll-driven story path, the flights between the
 * overview and a selected space, the orbit limits for each view, and the zoom buttons.
 * It reads intent from the store and never renders anything itself.
 */
export function CameraController({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const controls = useThree((state) => state.controls) as OrbitLike | null
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  const mode = useStudioStore((state) => state.mode)
  const selectedSetId = useStudioStore((state) => state.selectedSetId)
  const resetToken = useStudioStore((state) => state.resetToken)
  const setTransitioning = useStudioStore((state) => state.setTransitioning)

  const controlsRef = useRef(controls)
  controlsRef.current = controls
  const look = useRef(new Vector3(0, 2, 0))
  const offset = useRef({ x: 0, y: 0 })
  const appliedOffset = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const flight = useRef<gsap.core.Tween | null>(null)
  const zoomTween = useRef<gsap.core.Tween | null>(null)
  const placed = useRef(false)
  const introBase = useRef<CameraPose | null>(null)
  const restingLimits = useRef<OrbitLimits | null>(null)

  const fov = camera.fov
  const curves = useMemo(() => storyCurves(size.width, size.height, fov), [size.width, size.height, fov])

  const flyTo = useCallback(
    (pose: CameraPose, duration: number) => {
      flight.current?.kill()
      zoomTween.current?.kill()
      const fromPosition = camera.position.clone()
      const fromLook = look.current.clone()
      const fromOffset = { ...offset.current }

      const place = (t: number) => {
        camera.position.lerpVectors(fromPosition, pose.position, t)
        look.current.lerpVectors(fromLook, pose.target, t)
        offset.current.x = MathUtils.lerp(fromOffset.x, pose.offsetX, t)
        offset.current.y = MathUtils.lerp(fromOffset.y, pose.offsetY, t)
        camera.lookAt(look.current)
        invalidate()
      }
      const finish = () => {
        place(1)
        flight.current = null
        restingLimits.current = pose.limits
        const orbit = controlsRef.current
        if (orbit) {
          applyLimits(orbit, pose.limits)
          orbit.target.copy(pose.target)
          orbit.update()
        }
        setTransitioning(false)
      }

      if (duration <= 0.05) {
        finish()
        return
      }
      setTransitioning(true)
      const progress = { t: 0 }
      flight.current = gsap.to(progress, {
        t: 1,
        duration,
        ease: 'power3.inOut',
        onUpdate: () => place(progress.t),
        onComplete: finish,
      })
    },
    [camera, invalidate, setTransitioning],
  )

  // The orbit controls register themselves after the first render. When they appear,
  // hand them the view that is already in place.
  useEffect(() => {
    if (!controls || flight.current) return
    if (restingLimits.current) applyLimits(controls, restingLimits.current)
    controls.target.copy(look.current)
    controls.update()
  }, [controls])

  // Every view is framed for the viewport (interface panels cover parts of it), so a
  // meaningful change of size re-frames the current view.
  const selectedSet = getSetById(selectedSetId)
  const viewKey = `${Math.round(size.width / 48)}x${Math.round(size.height / 48)}`

  useEffect(() => {
    if (mode === 'story') {
      flight.current?.kill()
      flight.current = null
      introBase.current = null
      setTransitioning(false)
      return
    }

    let pose: CameraPose
    const slot = selectedSetId ? getSlotForSet(selectedSetId) : undefined
    if (mode === 'intro') pose = introPose(size.width, size.height, fov)
    else if (selectedSet && slot) pose = focusPose(selectedSet, slot, size.width, size.height, fov)
    else pose = overviewPose(size.width, size.height, fov)
    introBase.current = mode === 'intro' ? pose : null

    const distance = camera.position.distanceTo(pose.position)
    const instant = !placed.current || reducedMotion
    placed.current = true
    flyTo(pose, instant ? 0 : MathUtils.clamp(1 + distance / 55, 1.15, 2.6))
    // The pose is derived from mode, selection and viewport; viewKey stands in for the viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedSetId, resetToken, viewKey, fov, reducedMotion, flyTo])

  // Zoom buttons.
  useEffect(() => {
    registerCameraApi({
      zoomBy: (factor) => {
        const orbit = controlsRef.current
        const state = useStudioStore.getState()
        if (!orbit || state.mode !== 'explore' || state.isTransitioning) return
        zoomTween.current?.kill()
        const current = camera.position.distanceTo(orbit.target)
        const goal = MathUtils.clamp(current * factor, orbit.minDistance, orbit.maxDistance)
        const proxy = { distance: current }
        zoomTween.current = gsap.to(proxy, {
          distance: goal,
          duration: reducedMotion ? 0.01 : 0.55,
          ease: 'power2.out',
          onUpdate: () => {
            scratchDirection.copy(camera.position).sub(orbit.target).normalize()
            camera.position.copy(orbit.target).addScaledVector(scratchDirection, proxy.distance)
            orbit.update()
            invalidate()
          },
        })
      },
    })
    return () => {
      registerCameraApi(null)
      zoomTween.current?.kill()
      flight.current?.kill()
    }
  }, [camera, invalidate, reducedMotion])

  useFrame((state, delta) => {
    if (mode === 'story') {
      // Follow the scroll position along the story path, with a little easing so the
      // camera glides rather than tracking the scrollbar rigidly.
      const t = reducedMotion ? 3 : studioRuntime.storyT
      const u = MathUtils.clamp(t / STORY_LENGTH, 0, 1)
      curves.position.getPoint(u, scratchPosition)
      curves.look.getPoint(u, scratchLook)
      scratchPosition.y = Math.max(scratchPosition.y, 1.7)
      const ease = !placed.current || reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 4.2)
      placed.current = true
      camera.position.lerp(scratchPosition, ease)
      look.current.lerp(scratchLook, ease)
      offset.current.x = MathUtils.lerp(offset.current.x, sampleStops(curves.offsetX, t), ease)
      offset.current.y = MathUtils.lerp(offset.current.y, sampleStops(curves.offsetY, t), ease)
      camera.lookAt(look.current)
    } else if (mode === 'intro' && !flight.current && introBase.current && !reducedMotion) {
      // A slow drift keeps the welcome view alive.
      const base = introBase.current
      const angle = Math.sin(state.clock.elapsedTime * 0.11) * 0.09
      scratchPosition.copy(base.position).sub(base.target).applyAxisAngle(camera.up, angle).add(base.target)
      camera.position.copy(scratchPosition)
      look.current.copy(base.target)
      camera.lookAt(base.target)
    }

    // Shift the view so the selected-set panel never covers the subject.
    const x = Math.round(offset.current.x * size.width)
    const y = Math.round(offset.current.y * size.height)
    const applied = appliedOffset.current
    if (x !== applied.x || y !== applied.y || size.width !== applied.width || size.height !== applied.height) {
      if (x === 0 && y === 0) camera.clearViewOffset()
      else camera.setViewOffset(size.width, size.height, x, y, size.width, size.height)
      appliedOffset.current = { x, y, width: size.width, height: size.height }
    }
  })

  useEffect(
    () => () => {
      camera.clearViewOffset()
    },
    [camera],
  )

  return null
}
