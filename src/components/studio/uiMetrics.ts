/**
 * Sizes of the selected-set panel, shared by the stylesheet (through CSS variables set in
 * StudioExplorer) and the camera, which shifts its view so the panel never covers the
 * selected space.
 */
export const COMPACT_BREAKPOINT = 820

export const PANEL = {
  desktopWidth: 430,
  desktopMargin: 24,
  /** Height of the mobile bottom sheet as a fraction of the viewport. */
  sheetHeight: 0.47,
} as const

export interface PanelInsets {
  /** Fraction of the viewport width covered on the right. */
  right: number
  /** Fraction of the viewport height covered at the bottom. */
  bottom: number
}

export function getPanelInsets(width: number): PanelInsets {
  if (width <= COMPACT_BREAKPOINT) return { right: 0, bottom: PANEL.sheetHeight }
  const panelWidth = Math.min(PANEL.desktopWidth, width * 0.36)
  return { right: (panelWidth + PANEL.desktopMargin * 2) / width, bottom: 0 }
}
