import { create } from 'zustand'
import type { CategoryFilterId, SetCategoryId, StudioMode } from '@/types/studio'

interface StudioState {
  /** 'story' = scroll-driven homepage, 'intro' = explorer welcome overlay, 'explore' = free navigation. */
  mode: StudioMode
  hoveredSetId: string | null
  selectedSetId: string | null
  filter: CategoryFilterId
  /** Category highlighted by the scroll story (homepage section 4). */
  storyCategory: SetCategoryId | null
  /** True while the camera is flying between views. */
  isTransitioning: boolean
  /** True once the 3D scene has rendered its first frame. */
  sceneReady: boolean
  /** Incremented to ask the camera to return to the overview. */
  resetToken: number
  setsDrawerOpen: boolean
  howItWorksOpen: boolean
  /** True once the visitor has dismissed the explorer's welcome overlay this session. */
  introSeen: boolean
  /** True while opaque page content completely covers the 3D stage. */
  stageCovered: boolean
  /** True if the WebGL context was lost or the 3D scene failed to load. */
  webglFailed: boolean

  setIntroSeen: () => void
  setStageCovered: (covered: boolean) => void
  setWebglFailed: () => void
  setMode: (mode: StudioMode) => void
  hoverSet: (id: string | null) => void
  selectSet: (id: string | null) => void
  setFilter: (filter: CategoryFilterId) => void
  setStoryCategory: (category: SetCategoryId | null) => void
  setTransitioning: (value: boolean) => void
  setSceneReady: (value: boolean) => void
  resetView: () => void
  setSetsDrawerOpen: (open: boolean) => void
  setHowItWorksOpen: (open: boolean) => void
}

export const useStudioStore = create<StudioState>((set) => ({
  mode: 'story',
  hoveredSetId: null,
  selectedSetId: null,
  filter: 'all',
  storyCategory: null,
  isTransitioning: false,
  sceneReady: false,
  resetToken: 0,
  setsDrawerOpen: false,
  howItWorksOpen: false,
  introSeen: false,
  stageCovered: false,
  webglFailed: false,

  setIntroSeen: () => set({ introSeen: true }),
  setStageCovered: (covered) => set((state) => (state.stageCovered === covered ? state : { stageCovered: covered })),
  setWebglFailed: () => set({ webglFailed: true, sceneReady: false }),
  setMode: (mode) =>
    set((state) =>
      state.mode === mode
        ? state
        : {
            mode,
            hoveredSetId: null,
            // Leaving free navigation always clears the selection.
            selectedSetId: mode === 'explore' ? state.selectedSetId : null,
            storyCategory: mode === 'story' ? state.storyCategory : null,
            setsDrawerOpen: false,
          },
    ),
  hoverSet: (id) => set((state) => (state.hoveredSetId === id ? state : { hoveredSetId: id })),
  selectSet: (id) =>
    set((state) => (state.selectedSetId === id ? state : { selectedSetId: id, hoveredSetId: null, setsDrawerOpen: false })),
  setFilter: (filter) => set({ filter }),
  setStoryCategory: (category) =>
    set((state) => (state.storyCategory === category ? state : { storyCategory: category })),
  setTransitioning: (value) => set((state) => (state.isTransitioning === value ? state : { isTransitioning: value })),
  setSceneReady: (value) => set({ sceneReady: value }),
  resetView: () => set((state) => ({ selectedSetId: null, hoveredSetId: null, resetToken: state.resetToken + 1 })),
  setSetsDrawerOpen: (open) => set({ setsDrawerOpen: open }),
  setHowItWorksOpen: (open) => set({ howItWorksOpen: open }),
}))

/**
 * Per-frame values shared between the DOM (scroll position) and the 3D scene.
 * Kept outside React state so scrolling never triggers re-renders.
 */
export const studioRuntime = {
  /** Position along the scroll story: 0 intro, 1 entering, 2 reveal, 3 overview, 4 final invitation. */
  storyT: 0,
  /** Timestamp until which the static shadow map should keep refreshing. */
  shadowsDirtyUntil: 0,
}

/**
 * The name labels are ordinary DOM elements owned by the interface layer. They register
 * here so the 3D layer can move them to follow their spaces without knowing what they contain.
 */
export const setLabelElements = new Map<string, HTMLElement>()

export const requestShadowUpdate = (durationMs = 250) => {
  studioRuntime.shadowsDirtyUntil = Math.max(studioRuntime.shadowsDirtyUntil, performance.now() + durationMs)
}
