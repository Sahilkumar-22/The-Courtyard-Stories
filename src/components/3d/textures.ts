import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { BRAND_COLOURS, channelsOf, shadeOf, tintOf, toBrand } from '@/data/brandColours'

/**
 * Small procedural surface textures drawn on canvases. Nothing is downloaded, the
 * resolution follows the device tier, and every texture is created once and shared.
 */

type Draw = (ctx: CanvasRenderingContext2D, size: number, rand: () => number) => void

let resolution = 512
const baseCache = new Map<string, CanvasTexture>()
const repeatCache = new Map<string, CanvasTexture>()

export function setTextureResolution(size: number) {
  if (size === resolution) return
  resolution = size
  // Textures drawn at the old resolution are discarded and redrawn on demand.
  disposeTextures()
  baseCache.clear()
  repeatCache.clear()
}

/** Frees the GPU copies of the shared textures. The canvases stay, so they can be reused. */
export function disposeTextures() {
  baseCache.forEach((texture) => texture.dispose())
  repeatCache.forEach((texture) => texture.dispose())
}

const mulberry = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const hashString = (value: string) => {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619)
  return hash
}

/** Channels of the two ends of the palette, for translucent canvas strokes. */
const NAVY = channelsOf(BRAND_COLOURS.navy)
const BEIGE = channelsOf(BRAND_COLOURS.beige)

/**
 * Lighten (positive) or darken (negative) a colour while staying inside the palette:
 * darker is a shade towards the navy, lighter is a tint towards the beige.
 */
const shade = (hex: string, amount: number) => (amount < 0 ? shadeOf(hex, -amount * 1.6) : tintOf(hex, amount * 1.6))

function speckle(ctx: CanvasRenderingContext2D, size: number, rand: () => number, count: number, alpha: number) {
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = `rgba(${rand() > 0.5 ? BEIGE : NAVY},${alpha})`
    const dot = 1 + rand() * 2
    ctx.fillRect(rand() * size, rand() * size, dot, dot)
  }
}

function base(key: string, draw: Draw, scale = 1): CanvasTexture {
  const cached = baseCache.get(key)
  if (cached) return cached
  const size = Math.round(resolution * scale)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  draw(ctx, size, mulberry(hashString(key)))
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.anisotropy = 8
  baseCache.set(key, texture)
  return texture
}

/** A shared texture tiled `repeatX` x `repeatY` times across the surface it is applied to. */
function tiled(key: string, draw: Draw, repeatX: number, repeatY: number, scale = 1): CanvasTexture {
  const id = `${key}|${repeatX}|${repeatY}`
  const cached = repeatCache.get(id)
  if (cached) return cached
  const texture = base(key, draw, scale).clone()
  texture.repeat.set(repeatX, repeatY)
  texture.needsUpdate = true
  repeatCache.set(id, texture)
  return texture
}

export const paversTexture = (stone: string, repeatX: number, repeatY: number) =>
  tiled(
    `pavers-${stone}`,
    (ctx, size, rand) => {
      const cells = 4
      const cell = size / cells
      ctx.fillStyle = shade(stone, -0.09)
      ctx.fillRect(0, 0, size, size)
      for (let x = 0; x < cells; x += 1) {
        for (let y = 0; y < cells; y += 1) {
          ctx.fillStyle = shade(stone, (rand() - 0.5) * 0.045)
          ctx.fillRect(x * cell + 1.5, y * cell + 1.5, cell - 3, cell - 3)
        }
      }
      speckle(ctx, size, rand, size * 5, 0.035)
    },
    repeatX,
    repeatY,
  )

export const planksTexture = (wood: string, repeatX: number, repeatY: number) =>
  tiled(
    `planks-${wood}`,
    (ctx, size, rand) => {
      const rows = 8
      const row = size / rows
      for (let y = 0; y < rows; y += 1) {
        const offset = rand() * size
        for (let segment = 0; segment < 3; segment += 1) {
          const start = offset + (segment * size) / 2.4
          const length = size / 2.4
          ctx.fillStyle = shade(wood, (rand() - 0.5) * 0.09)
          ctx.fillRect(start % size, y * row, length, row)
          ctx.fillRect((start % size) - size, y * row, length, row)
        }
        ctx.fillStyle = `rgba(${NAVY},0.3)`
        ctx.fillRect(0, y * row, size, 1.5)
        for (let grain = 0; grain < 5; grain += 1) {
          ctx.fillStyle = `rgba(${NAVY},${0.03 + rand() * 0.05})`
          ctx.fillRect(0, y * row + rand() * row, size, 1)
        }
      }
    },
    repeatX,
    repeatY,
  )

export const herringboneTexture = (wood: string, repeatX: number, repeatY: number) =>
  tiled(
    `herringbone-${wood}`,
    (ctx, size, rand) => {
      const cells = 8
      const cell = size / cells
      ctx.fillStyle = shade(wood, -0.12)
      ctx.fillRect(0, 0, size, size)
      for (let i = -1; i < cells + 1; i += 1) {
        for (let j = -1; j < cells + 1; j += 1) {
          const residue = (((i - j) % 4) + 4) % 4
          if (residue !== 0 && residue !== 3) continue
          ctx.fillStyle = shade(wood, (rand() - 0.5) * 0.1)
          const draw = (x: number, y: number) => {
            if (residue === 0) ctx.fillRect(x * cell + 1, y * cell + 1, cell * 2 - 2, cell - 2)
            else ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell * 2 - 2)
          }
          // Draw wrapped copies so the pattern tiles seamlessly.
          draw(i, j)
          if (i === -1) draw(i + cells, j)
          if (j === -1) draw(i, j + cells)
        }
      }
      speckle(ctx, size, rand, size * 3, 0.03)
    },
    repeatX,
    repeatY,
  )

export const brickTexture = (brick: string, repeatX: number, repeatY: number) =>
  tiled(
    `brick-${brick}`,
    (ctx, size, rand) => {
      const rows = 8
      const perRow = 4
      const rowHeight = size / rows
      const brickWidth = size / perRow
      ctx.fillStyle = shadeOf(BRAND_COLOURS.beige, 0.2)
      ctx.fillRect(0, 0, size, size)
      for (let y = 0; y < rows; y += 1) {
        const offset = y % 2 === 0 ? 0 : brickWidth / 2
        for (let x = -1; x < perRow; x += 1) {
          ctx.fillStyle = shade(brick, (rand() - 0.5) * 0.12)
          ctx.fillRect(x * brickWidth + offset + 2, y * rowHeight + 2, brickWidth - 4, rowHeight - 4)
        }
      }
      speckle(ctx, size, rand, size * 6, 0.05)
    },
    repeatX,
    repeatY,
  )

export const checkerTexture = (light: string, dark: string, repeatX: number, repeatY: number) =>
  tiled(
    `checker-${light}-${dark}`,
    (ctx, size, rand) => {
      const half = size / 2
      for (let x = 0; x < 2; x += 1) {
        for (let y = 0; y < 2; y += 1) {
          ctx.fillStyle = toBrand((x + y) % 2 === 0 ? light : dark)
          ctx.fillRect(x * half, y * half, half, half)
        }
      }
      ctx.fillStyle = `rgba(${NAVY},0.14)`
      ctx.fillRect(0, 0, size, 1.5)
      ctx.fillRect(0, half, size, 1.5)
      ctx.fillRect(0, 0, 1.5, size)
      ctx.fillRect(half, 0, 1.5, size)
      speckle(ctx, size, rand, size * 3, 0.03)
    },
    repeatX,
    repeatY,
  )

export const zelligeTexture = (repeatX: number, repeatY: number) =>
  tiled(
    'zellige',
    (ctx, size, rand) => {
      const cells = 4
      const cell = size / cells
      ctx.fillStyle = BRAND_COLOURS.beige
      ctx.fillRect(0, 0, size, size)
      for (let x = 0; x < cells; x += 1) {
        for (let y = 0; y < cells; y += 1) {
          const cx = x * cell + cell / 2
          const cy = y * cell + cell / 2
          const star = cell * 0.33
          ctx.fillStyle = shade(BRAND_COLOURS.blue, (rand() - 0.5) * 0.06)
          for (let turn = 0; turn < 2; turn += 1) {
            ctx.save()
            ctx.translate(cx, cy)
            ctx.rotate((turn * Math.PI) / 4)
            ctx.fillRect(-star, -star, star * 2, star * 2)
            ctx.restore()
          }
          ctx.fillStyle = BRAND_COLOURS.beige
          ctx.beginPath()
          ctx.arc(cx, cy, cell * 0.16, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = BRAND_COLOURS.terracotta
          ctx.beginPath()
          ctx.arc(cx, cy, cell * 0.08, 0, Math.PI * 2)
          ctx.fill()
          // Small gold diamonds where four tiles meet.
          ctx.fillStyle = BRAND_COLOURS.gold
          for (const [dx, dy] of [
            [0, 0],
            [cell, 0],
            [0, cell],
            [cell, cell],
          ]) {
            ctx.save()
            ctx.translate(x * cell + dx, y * cell + dy)
            ctx.rotate(Math.PI / 4)
            ctx.fillRect(-cell * 0.07, -cell * 0.07, cell * 0.14, cell * 0.14)
            ctx.restore()
          }
        }
      }
      speckle(ctx, size, rand, size * 2, 0.03)
    },
    repeatX,
    repeatY,
  )

/** A pierced stone lattice. Use with alphaTest so the openings are see-through. */
export const jaliTexture = (stone: string, repeatX: number, repeatY: number) =>
  tiled(
    `jali-${stone}`,
    (ctx, size) => {
      const cells = 4
      const cell = size / cells
      ctx.fillStyle = toBrand(stone)
      ctx.fillRect(0, 0, size, size)
      ctx.globalCompositeOperation = 'destination-out'
      for (let x = 0; x < cells; x += 1) {
        for (let y = 0; y < cells; y += 1) {
          const cx = x * cell + cell / 2
          const cy = y * cell + cell / 2
          for (let turn = 0; turn < 2; turn += 1) {
            ctx.save()
            ctx.translate(cx, cy)
            ctx.rotate((turn * Math.PI) / 4)
            ctx.fillRect(-cell * 0.27, -cell * 0.27, cell * 0.54, cell * 0.54)
            ctx.restore()
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over'
    },
    repeatX,
    repeatY,
  )

export const grainTexture = (tone: string, repeatX: number, repeatY: number) =>
  tiled(
    `grain-${tone}`,
    (ctx, size, rand) => {
      ctx.fillStyle = toBrand(tone)
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 26; i += 1) {
        ctx.fillStyle = `rgba(${rand() > 0.5 ? BEIGE : NAVY},0.03)`
        ctx.beginPath()
        ctx.arc(rand() * size, rand() * size, size * (0.05 + rand() * 0.12), 0, Math.PI * 2)
        ctx.fill()
      }
      speckle(ctx, size, rand, size * 14, 0.05)
    },
    repeatX,
    repeatY,
  )

export const marbleTexture = (stone: string, repeatX: number, repeatY: number) =>
  tiled(
    `marble-${stone}`,
    (ctx, size, rand) => {
      ctx.fillStyle = toBrand(stone)
      ctx.fillRect(0, 0, size, size)
      ctx.lineCap = 'round'
      for (let i = 0; i < 9; i += 1) {
        ctx.strokeStyle = `rgba(${NAVY},${0.05 + rand() * 0.07})`
        ctx.lineWidth = 0.6 + rand() * 1.6
        ctx.beginPath()
        let x = rand() * size
        let y = -10
        ctx.moveTo(x, y)
        while (y < size + 10) {
          x += (rand() - 0.5) * size * 0.16
          y += size * (0.06 + rand() * 0.08)
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      speckle(ctx, size, rand, size * 2, 0.02)
    },
    repeatX,
    repeatY,
  )

/** A bordered rug with a central medallion. Not tiled. */
export const rugTexture = (field: string, border: string, motif: string) =>
  base(`rug-${field}-${border}-${motif}`, (ctx, size, rand) => {
    ctx.fillStyle = toBrand(border)
    ctx.fillRect(0, 0, size, size)
    const inset = size * 0.07
    ctx.fillStyle = toBrand(motif)
    ctx.fillRect(inset, inset, size - inset * 2, size - inset * 2)
    const inner = size * 0.1
    ctx.fillStyle = toBrand(field)
    ctx.fillRect(inner, inner, size - inner * 2, size - inner * 2)
    ctx.strokeStyle = toBrand(motif)
    ctx.lineWidth = size * 0.012
    ctx.save()
    ctx.translate(size / 2, size / 2)
    for (const scale of [0.3, 0.2, 0.1]) {
      ctx.beginPath()
      ctx.moveTo(0, -size * scale)
      ctx.lineTo(size * scale * 0.72, 0)
      ctx.lineTo(0, size * scale)
      ctx.lineTo(-size * scale * 0.72, 0)
      ctx.closePath()
      ctx.stroke()
    }
    ctx.restore()
    speckle(ctx, size, rand, size * 8, 0.04)
  })

/** Circular paving for the central plaza: concentric courses, radial joints and a compass rose. */
export const plazaTexture = (stone: string, inlay: string) =>
  base(
    `plaza-${stone}-${inlay}`,
    (ctx, size, rand) => {
      const centre = size / 2
      ctx.fillStyle = toBrand(stone)
      ctx.fillRect(0, 0, size, size)
      const courses = 9
      for (let ring = courses; ring >= 1; ring -= 1) {
        const outer = (centre * ring) / courses
        ctx.fillStyle = shade(stone, (rand() - 0.5) * 0.03 - (ring % 2) * 0.012)
        ctx.beginPath()
        ctx.arc(centre, centre, outer, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = `rgba(${NAVY},0.14)`
        ctx.lineWidth = size / 512
        ctx.stroke()
        const joints = Math.max(8, ring * 8)
        const inner = (centre * (ring - 1)) / courses
        for (let joint = 0; joint < joints; joint += 1) {
          const angle = (joint / joints) * Math.PI * 2 + ring * 0.2
          ctx.beginPath()
          ctx.moveTo(centre + Math.cos(angle) * inner, centre + Math.sin(angle) * inner)
          ctx.lineTo(centre + Math.cos(angle) * outer, centre + Math.sin(angle) * outer)
          ctx.stroke()
        }
      }
      // Compass rose: the courtyard's point of orientation.
      ctx.save()
      ctx.translate(centre, centre)
      for (let point = 0; point < 8; point += 1) {
        const long = point % 2 === 0
        const reach = centre * (long ? 0.86 : 0.62)
        const half = centre * (long ? 0.045 : 0.03)
        ctx.fillStyle = long ? toBrand(inlay) : shade(inlay, 0.12)
        ctx.beginPath()
        ctx.moveTo(0, -reach)
        ctx.lineTo(half, -centre * 0.34)
        ctx.lineTo(-half, -centre * 0.34)
        ctx.closePath()
        ctx.fill()
        ctx.rotate(Math.PI / 4)
      }
      ctx.restore()
      ctx.strokeStyle = toBrand(inlay)
      ctx.lineWidth = size / 170
      for (const radius of [0.9, 0.34]) {
        ctx.beginPath()
        ctx.arc(centre, centre, centre * radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      speckle(ctx, size, rand, size * 6, 0.03)
    },
    2,
  )
