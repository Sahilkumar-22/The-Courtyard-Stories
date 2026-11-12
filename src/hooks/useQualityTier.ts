import { useMemo } from 'react'
import type { QualityTier } from '@/types/studio'
import { useMediaQuery } from './useMediaQuery'

export interface QualitySettings {
  tier: QualityTier
  /** Multiplier for instanced detail (books, blossoms, leaves...). */
  density: number
  /** Device pixel ratio range the renderer may move within. */
  dpr: [number, number]
  shadows: boolean
  shadowMapSize: number
  /** Segment multiplier for curved geometry. */
  segments: number
  antialias: boolean
  textureSize: number
}

const SETTINGS: Record<QualityTier, QualitySettings> = {
  high: {
    tier: 'high',
    density: 1,
    dpr: [1, 2],
    shadows: true,
    shadowMapSize: 4096,
    segments: 1,
    antialias: true,
    textureSize: 512,
  },
  medium: {
    tier: 'medium',
    density: 0.6,
    dpr: [1, 1.5],
    shadows: true,
    shadowMapSize: 2048,
    segments: 0.7,
    antialias: true,
    textureSize: 512,
  },
  low: {
    tier: 'low',
    density: 0.38,
    dpr: [1, 1.5],
    shadows: true,
    shadowMapSize: 1024,
    segments: 0.5,
    antialias: true,
    textureSize: 256,
  },
}

/**
 * Desktop gets the full environment, tablets a reduced one, phones a simplified one.
 * Based on viewport and input type rather than user-agent sniffing.
 */
export function useQualityTier(): QualitySettings {
  const isPhone = useMediaQuery('(max-width: 820px)')
  const isTablet = useMediaQuery('(max-width: 1180px)')
  const isTouch = useMediaQuery('(pointer: coarse)')

  return useMemo(() => {
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8
    const memory =
      typeof navigator !== 'undefined' ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) : 8
    let tier: QualityTier = 'high'
    if (isPhone) tier = 'low'
    else if (isTablet || isTouch) tier = 'medium'
    if (tier === 'high' && (cores <= 4 || memory <= 4)) tier = 'medium'
    return SETTINGS[tier]
  }, [isPhone, isTablet, isTouch])
}
