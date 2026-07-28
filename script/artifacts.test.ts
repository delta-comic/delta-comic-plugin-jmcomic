import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

import {
  parsePluginManifest,
  validatePluginArtifacts,
  validatePublishedAssets,
} from './artifacts.mts'

const manifest = {
  author: 'author',
  description: 'Plugin template',
  entry: { cssPath: 'index.css', jsPath: 'index.js' },
  name: { display: 'Template', id: 'template' },
  require: [{ id: 'core' }],
  version: { plugin: '1.0.0-next.1', supportCore: '>=3.0.0-next.6 <4.0.0' },
}

async function createFixture(
  archiveManifest = manifest,
  includeCss = true,
  entrySource = 'export default {}',
) {
  const directory = await mkdtemp(join(tmpdir(), 'plugin-template-artifacts-'))
  await writeFile(join(directory, 'manifest.json'), JSON.stringify(manifest))
  await writeFile(join(directory, 'index.js'), entrySource)
  await writeFile(join(directory, 'index.css'), 'body{}')

  const archive = new JSZip()
  archive.file('manifest.json', JSON.stringify(archiveManifest))
  archive.file('index.js', entrySource)
  if (includeCss) archive.file('index.css', 'body{}')
  await writeFile(
    join(directory, 'plugin.zip'),
    await archive.generateAsync({ type: 'nodebuffer' }),
  )
  return directory
}

describe('plugin artifacts', () => {
  it('validates the external manifest and archive together', async () => {
    const result = await validatePluginArtifacts(await createFixture())
    expect(result.manifest).toEqual(manifest)
    expect(result.files).toEqual(['index.css', 'index.js', 'manifest.json'])
  })

  it('validates the two published assets without requiring loose entry files', async () => {
    const directory = await createFixture()
    await Promise.all([rm(join(directory, 'index.js')), rm(join(directory, 'index.css'))])
    const result = await validatePublishedAssets(directory)
    expect(result.files).toContain('index.js')
  })

  it('rejects an archive missing an entry file', async () => {
    await expect(validatePluginArtifacts(await createFixture(manifest, false))).rejects.toThrow(
      'plugin.zip is missing index.css',
    )
  })

  it('rejects different external and archived manifests', async () => {
    const other = { ...manifest, version: { ...manifest.version, plugin: '1.0.0-next.2' } }
    await expect(validatePluginArtifacts(await createFixture(other))).rejects.toThrow(
      'external and archived manifests are different',
    )
  })

  it('rejects browser-incompatible and duplicate host runtimes', async () => {
    const source = '//#region node_modules/.pnpm/sharp@1.0.0/node_modules/sharp/index.js'
    await expect(
      validatePluginArtifacts(await createFixture(manifest, true, source)),
    ).rejects.toThrow('forbidden Sharp code')
  })

  it('requires loader-critical fields', () => {
    expect(() => parsePluginManifest({ ...manifest, author: '' })).toThrow('author')
    expect(() => parsePluginManifest(null)).toThrow('must be an object')
    expect(() => parsePluginManifest({ ...manifest, require: null })).toThrow('must be an array')
  })
})