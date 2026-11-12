import { Component, lazy, type ReactNode, Suspense } from 'react'
import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { useStudioStore } from '@/store/studioStore'

// The 3D scene and three.js load only when a visitor reaches a page that shows them.
const StudioCanvas = lazy(() => import('@/components/3d/StudioCanvas'))

class StageBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** True when the 3D world can be shown: WebGL exists and has not failed this session. */
export function useStage3D(): boolean {
  const supported = useWebGLSupport()
  const failed = useStudioStore((state) => state.webglFailed)
  return supported && !failed
}

/**
 * The fixed backdrop behind the homepage story and the explorer. It holds the WebGL
 * canvas when 3D is available, and a calm static backdrop when it is not.
 */
export function StudioStage() {
  const available = useStage3D()
  const mode = useStudioStore((state) => state.mode)
  const ready = useStudioStore((state) => state.sceneReady)
  const covered = useStudioStore((state) => state.stageCovered)
  const setWebglFailed = useStudioStore((state) => state.setWebglFailed)

  if (!available) return <div className="stage stage--static" aria-hidden="true" />

  return (
    <div className={`stage${mode === 'explore' ? ' stage--interactive' : ''}${ready ? ' is-ready' : ''}`}>
      <div
        className="stage__canvas"
        role="img"
        aria-label="A 3D view of a virtual courtyard with an exhibition space for each photography set. Use the list of sets to visit any of them."
      >
        <StageBoundary onError={setWebglFailed}>
          <Suspense fallback={null}>
            <StudioCanvas active={!covered} onContextLost={setWebglFailed} />
          </Suspense>
        </StageBoundary>
      </div>
      <div className="stage__vignette" aria-hidden="true" />
      <div className="stage__loader" role="status" aria-live="polite">
        {!ready && (
          <>
            <span className="stage__loader-line" aria-hidden="true" />
            <span>Opening the courtyard</span>
          </>
        )}
      </div>
    </div>
  )
}
