import { access, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import JSZip from 'jszip'

export const rootDir = join(import.meta.dirname, '..')

export interface PluginManifest {
  author: string
  description: string
  entry: { cssPath: string; jsPath: string }
  name: { display: string; id: string }
  require: { id: string }[]
  version: { plugin: string; supportCore: string }
}

const requiredString = (value: unknown, label: string) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Plugin manifest field ${label} must be a non-empty string`)
  }
}

export const parsePluginManifest = (value: unknown): PluginManifest => {
  if (!value || typeof value !== 'object') throw new Error('Plugin manifest must be an object')
  const manifest = value as Partial<PluginManifest>

  requiredString(manifest.author, 'author')
  requiredString(manifest.description, 'description')
  requiredString(manifest.name?.display, 'name.display')
  requiredString(manifest.name?.id, 'name.id')
  requiredString(manifest.entry?.cssPath, 'entry.cssPath')
  requiredString(manifest.entry?.jsPath, 'entry.jsPath')
  requiredString(manifest.version?.plugin, 'version.plugin')
  requiredString(manifest.version?.supportCore, 'version.supportCore')
  if (!Array.isArray(manifest.require)) {
    throw new Error('Plugin manifest field require must be an array')
  }

  return manifest as PluginManifest
}

export async function validatePublishedAssets(distDirectory = resolve('packages/app/dist')) {
  const manifestPath = join(distDirectory, 'manifest.json')
  const archivePath = join(distDirectory, 'plugin.zip')
  const manifest = parsePluginManifest(JSON.parse(await readFile(manifestPath, 'utf8')))

  const archive = await JSZip.loadAsync(await readFile(archivePath))
  const files = Object.values(archive.files)
    .filter(file => !file.dir)
    .map(file => file.name)
    .toSorted()
  const requiredFiles = ['manifest.json', manifest.entry.cssPath, manifest.entry.jsPath]
  for (const file of requiredFiles) {
    if (!archive.file(file)) throw new Error(`plugin.zip is missing ${file}`)
  }

  const archivedManifestFile = archive.file('manifest.json')
  if (!archivedManifestFile) throw new Error('plugin.zip is missing manifest.json')
  const archivedManifest = parsePluginManifest(
    JSON.parse(await archivedManifestFile.async('string')),
  )
  if (JSON.stringify(archivedManifest) !== JSON.stringify(manifest)) {
    throw new Error('The external and archived manifests are different')
  }

  const entryFile = archive.file(manifest.entry.jsPath)
  if (!entryFile) throw new Error(`plugin.zip is missing ${manifest.entry.jsPath}`)
  const entrySource = await entryFile.async('string')
  const forbiddenBundles = [
    ['Vant', /node_modules[/\\]\.pnpm[/\\]vant@/i],
    ['Sharp', /node_modules[/\\]\.pnpm[/\\]sharp@/i],
    ['Vue host runtime', /node_modules[/\\]\.pnpm[/\\]vue@/i],
    ['Delta Comic host runtime', /node_modules[/\\]\.pnpm[/\\]@delta-comic\+/i],
  ] as const
  for (const [name, pattern] of forbiddenBundles) {
    if (pattern.test(entrySource)) throw new Error(`plugin.zip contains forbidden ${name} code`)
  }

  return { files, manifest }
}

export async function validatePluginArtifacts(distDirectory = resolve('packages/app/dist')) {
  const validated = await validatePublishedAssets(distDirectory)
  await Promise.all([
    access(join(distDirectory, validated.manifest.entry.cssPath)),
    access(join(distDirectory, validated.manifest.entry.jsPath)),
  ])
  return validated
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
/* v8 ignore start -- @preserve: exercised by the build artifact integration check */
if (isCli) {
  const releaseAssetsOnly = process.argv.includes('--release-assets')
  const directory = process.argv.slice(2).find(argument => !argument.startsWith('-'))
  const validate = releaseAssetsOnly ? validatePublishedAssets : validatePluginArtifacts
  const { files, manifest } = await validate(directory ? resolve(directory) : undefined)
  console.log(`Validated ${manifest.name.id}@${manifest.version.plugin}: ${files.join(', ')}`)
}
/* v8 ignore stop -- @preserve */