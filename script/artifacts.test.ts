import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

import { parsePluginManifest, validatePluginArtifacts } from './artifacts.mts'

const manifest = {
  author: 'author',
  description: 'Plugin template',
  entry: { cssPath: 'index.css', jsPath: 'index.js' },
  name: { display: 'Template', id: 'template' },
  require: [{ id: 'core' }],
  version: { plugin: '1.0.0-next.1', supportCore: '>=3.0.0-next.6 <4.0.0' },
}

async function createFixture(archiveManifest = manifest, includeCss = true) {
  const directory = await mkdtemp(join(tmpdir(), 'plugin-template-artifacts-'))
  await writeFile(join(directory, 'manifest.json'), JSON.stringify(manifest))
  await writeFile(join(directory, 'index.js'), 'export default {}')
  await writeFile(join(directory, 'index.css'), 'body{}')

  const archive = new JSZip()
  archive.file('manifest.json', JSON.stringify(archiveManifest))
  archive.file('index.js', 'export default {}')
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

  it('requires loader-critical fields', () => {
    expect(() => parsePluginManifest({ ...manifest, author: '' })).toThrow('author')
    expect(() => parsePluginManifest(null)).toThrow('must be an object')
    expect(() => parsePluginManifest({ ...manifest, require: null })).toThrow('must be an array')
  })
})