import type { ComponentType } from 'react'
import type { EnvironmentKind } from '@/types/studio'
import { Bedroom } from './Bedroom'
import { Colonnade } from './Colonnade'
import type { SetEnvironmentProps } from './common'
import { FlowerTunnel } from './FlowerTunnel'
import { FrenchKitchen } from './FrenchKitchen'
import { GlassHouse } from './GlassHouse'
import { Italian } from './Italian'
import { Library } from './Library'
import { Moroccan } from './Moroccan'
import { Pavilion } from './Pavilion'
import { RajMahal } from './RajMahal'
import { RoyalJaipur } from './RoyalJaipur'
import { RusticCafe } from './RusticCafe'
import { TreeHouse } from './TreeHouse'

/**
 * Maps the `environment.kind` in the set data to the 3D space that represents it.
 * The scene itself never names a set: it looks its space up here.
 */
export const SET_ENVIRONMENTS: Record<EnvironmentKind, ComponentType<SetEnvironmentProps>> = {
  'royal-jaipur': RoyalJaipur,
  'raj-mahal': RajMahal,
  colonnade: Colonnade,
  moroccan: Moroccan,
  italian: Italian,
  library: Library,
  'rustic-cafe': RusticCafe,
  'french-kitchen': FrenchKitchen,
  'glass-house': GlassHouse,
  'flower-tunnel': FlowerTunnel,
  'tree-house': TreeHouse,
  bedroom: Bedroom,
  pavilion: Pavilion,
}

export type { SetEnvironmentProps }
