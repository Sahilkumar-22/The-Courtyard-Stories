// Builds the photography manifest from the studio's own photographs.
//
//   photography/<set folder>/*.jpg|jpeg|png|webp|avif|tif|tiff     (originals, never shipped)
//        -> public/photography/<set-slug>/<name>-<width>.webp      (web-optimised copies)
//        -> src/data/photoManifest.generated.json                  (read by src/data/studioSets.ts)
//
// A folder whose name matches a catalogue set (e.g. "Royal Jaipur" or "royal-jaipur")
// fills that set's gallery. Any other folder becomes an additional set, named after the
// folder; an optional set.json inside it can supply { name, tagline, description, category }.
// A file named hero.* or cover.* is used as the set's hero image.

import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(root, 'photography')
const outputDir = path.join(root, 'public', 'photography')
const manifestPath = path.join(root, 'src', 'data', 'photoManifest.generated.json')

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff'])
const WIDTHS = [480, 1280, 2400]
const HERO_NAMES = new Set(['hero', 'cover'])

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const naturalCompare = (a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })

const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')

async function writeManifest(manifest) {
  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
}

async function readSetMeta(folderPath) {
  const metaPath = path.join(folderPath, 'set.json')
  if (!existsSync(metaPath)) return null
  try {
    const meta = JSON.parse(await readFile(metaPath, 'utf8'))
    const pick = (key) => (typeof meta[key] === 'string' && meta[key].trim() ? meta[key].trim() : undefined)
    return {
      name: pick('name'),
      tagline: pick('tagline'),
      description: pick('description'),
      category: pick('category'),
    }
  } catch (error) {
    console.warn(`  ! Could not read ${path.relative(root, metaPath)}: ${error.message}`)
    return null
  }
}

async function isFresh(outputPath, sourceMtime) {
  try {
    return (await stat(outputPath)).mtimeMs >= sourceMtime
  } catch {
    return false
  }
}

async function main() {
  const manifest = { sets: {} }

  if (!existsSync(sourceDir)) {
    await mkdir(sourceDir, { recursive: true })
  }

  const folders = (await readdir(sourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_'))
    .sort((a, b) => naturalCompare(a.name, b.name))

  let sharp = null
  const expectedOutputs = new Set()
  let photoCount = 0
  let processedCount = 0

  for (const folder of folders) {
    const slug = slugify(folder.name)
    if (!slug) continue
    const folderPath = path.join(sourceDir, folder.name)

    const files = (await readdir(folderPath, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => {
        const aHero = HERO_NAMES.has(path.parse(a).name.toLowerCase())
        const bHero = HERO_NAMES.has(path.parse(b).name.toLowerCase())
        if (aHero !== bHero) return aHero ? -1 : 1
        return naturalCompare(a, b)
      })

    if (files.length === 0) continue
    if (manifest.sets[slug]) {
      console.warn(`  ! Skipping "${folder.name}": another folder already maps to "${slug}".`)
      continue
    }

    if (!sharp) sharp = (await import('sharp')).default

    const images = []
    const usedNames = new Set()
    for (const file of files) {
      const sourcePath = path.join(folderPath, file)
      let baseName = slugify(path.parse(file).name) || 'photo'
      while (usedNames.has(baseName)) baseName += '-b'
      usedNames.add(baseName)

      try {
        const sourceMtime = (await stat(sourcePath)).mtimeMs
        // .rotate() with no arguments applies the EXIF orientation, so portrait
        // photographs taken with a rotated camera come out upright.
        const open = () => sharp(sourcePath, { failOn: 'none' }).rotate()
        const metadata = await sharp(sourcePath, { failOn: 'none' }).metadata()
        const swapped = (metadata.orientation ?? 1) >= 5
        const width = swapped ? metadata.height : metadata.width
        const height = swapped ? metadata.width : metadata.height
        if (!width || !height) throw new Error('could not read image dimensions')

        const { data, info } = await open()
          .resize(8, 8, { fit: 'cover' })
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true })

        const sum = { r: 0, g: 0, b: 0 }
        const pixels = info.width * info.height
        for (let i = 0; i < pixels; i += 1) {
          sum.r += data[i * info.channels]
          sum.g += data[i * info.channels + 1]
          sum.b += data[i * info.channels + 2]
        }
        const color = toHex({ r: sum.r / pixels, g: sum.g / pixels, b: sum.b / pixels })

        const targetWidths = WIDTHS.filter((target) => target < width)
        if (targetWidths.length < WIDTHS.length) targetWidths.push(Math.min(width, WIDTHS[WIDTHS.length - 1]))
        const uniqueWidths = [...new Set(targetWidths)].sort((a, b) => a - b)

        const variants = []
        for (const targetWidth of uniqueWidths) {
          const outputName = `${baseName}-${targetWidth}.webp`
          const outputPath = path.join(outputDir, slug, outputName)
          expectedOutputs.add(path.normalize(outputPath))
          if (!(await isFresh(outputPath, sourceMtime))) {
            await mkdir(path.dirname(outputPath), { recursive: true })
            await open()
              .resize({ width: targetWidth, withoutEnlargement: true })
              .webp({ quality: targetWidth <= 480 ? 72 : 80 })
              .toFile(outputPath)
            processedCount += 1
          }
          variants.push({ width: targetWidth, src: `/photography/${slug}/${outputName}` })
        }

        images.push({ id: `${slug}/${baseName}`, width, height, color, variants })
        photoCount += 1
      } catch (error) {
        console.warn(`  ! Skipped ${path.relative(root, sourcePath)}: ${error.message}`)
      }
    }

    if (images.length > 0) {
      manifest.sets[slug] = {
        folderName: folder.name.trim(),
        meta: await readSetMeta(folderPath),
        images,
      }
    }
  }

  // Remove optimised copies whose originals no longer exist.
  if (existsSync(outputDir)) {
    for (const entry of await readdir(outputDir, { withFileTypes: true, recursive: true })) {
      if (!entry.isFile()) continue
      const filePath = path.normalize(path.join(entry.parentPath ?? entry.path, entry.name))
      if (!expectedOutputs.has(filePath)) await rm(filePath)
    }
    for (const entry of await readdir(outputDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dirPath = path.join(outputDir, entry.name)
      if ((await readdir(dirPath)).length === 0) await rm(dirPath, { recursive: true })
    }
  }

  await writeManifest(manifest)

  const setCount = Object.keys(manifest.sets).length
  if (photoCount === 0) {
    console.log(
      '[photos] No studio photographs found. Add them to photography/<set name>/ ' +
        '(for example photography/royal-jaipur/01.jpg) and run "npm run photos".',
    )
  } else {
    console.log(
      `[photos] ${photoCount} photograph${photoCount === 1 ? '' : 's'} across ${setCount} set${
        setCount === 1 ? '' : 's'
      } (${processedCount} file${processedCount === 1 ? '' : 's'} optimised this run).`,
    )
  }
}

main().catch(async (error) => {
  console.error('[photos] Failed to build the photography manifest:', error)
  if (!existsSync(manifestPath)) await writeManifest({ sets: {} })
  process.exitCode = 1
})
