import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import JSZip from 'jszip'
import { describe, expect, it, vi } from 'vitest'

import { createReleaseNameTemplate, prereleaseWarning } from './release-notes.mts'
import {
  assertVersion,
  generateNotes,
  prepareReleaseArtifacts,
  releaseAssetNames,
  verifyRelease,
} from './semantic-release-plugin.mts'

async function createPluginDist(version: string) {
  const pluginDist = await mkdtemp(join(tmpdir(), 'plugin-template-dist-'))
  const manifest = {
    author: 'author',
    description: 'Plugin template',
    entry: { cssPath: 'index.css', jsPath: 'index.js' },
    name: { display: 'Template', id: 'template' },
    require: [{ id: 'core' }],
    version: { plugin: version, supportCore: '>=3.0.0-next.6 <4.0.0' },
  }
  const archive = new JSZip()
  archive.file('manifest.json', JSON.stringify(manifest))
  archive.file('index.css', 'body{}')
  archive.file('index.js', 'export default {}')
  await Promise.all([
    writeFile(join(pluginDist, 'manifest.json'), JSON.stringify(manifest)),
    writeFile(join(pluginDist, 'index.css'), 'body{}'),
    writeFile(join(pluginDist, 'index.js'), 'export default {}'),
    writeFile(join(pluginDist, 'plugin.zip'), await archive.generateAsync({ type: 'nodebuffer' })),
  ])
  return pluginDist
}

describe('semantic release plugin', () => {
  it.each(['1.0.0', '1.2.3-next.4', '1.2.3+build.5'])('accepts semantic version %s', version => {
    expect(() => assertVersion(version)).not.toThrow()
  })

  it.each(['v1.0.0', '1.0', '01.0.0', '1.0.0-next_1'])('rejects invalid version %s', version => {
    expect(() => assertVersion(version)).toThrow('Invalid semantic version')
  })

  it('publishes only the loader artifacts', () => {
    expect(releaseAssetNames).toEqual(['manifest.json', 'plugin.zip'])
  })

  it('builds, validates and stages the release assets', async () => {
    const version = '1.2.3-next.4'
    const pluginDist = await createPluginDist(version)
    const destination = await mkdtemp(join(tmpdir(), 'plugin-template-release-'))
    const runBuild = vi.fn()

    const result = await prepareReleaseArtifacts(version, { destination, pluginDist, runBuild })

    expect(runBuild).toHaveBeenCalledWith(version)
    expect(result.manifest.version.plugin).toBe(version)
    await expect(readFile(join(destination, 'manifest.json'), 'utf8')).resolves.toContain(version)
    await expect(readFile(join(destination, 'plugin.zip'))).resolves.not.toHaveLength(0)
  })

  it('refuses artifacts built for another version', async () => {
    await expect(
      prepareReleaseArtifacts('1.2.3-next.4', {
        destination: await mkdtemp(join(tmpdir(), 'plugin-template-release-')),
        pluginDist: await createPluginDist('1.2.3-next.3'),
        runBuild: vi.fn(),
      }),
    ).rejects.toThrow('does not match release')
  })

  it('adds a warning only to prerelease notes', async () => {
    await expect(
      generateNotes({}, { nextRelease: { channel: 'next', version: '1.2.3-next.4' } }),
    ).resolves.toBe(prereleaseWarning)
    await expect(
      generateNotes({}, { nextRelease: { channel: null, version: '1.2.3' } }),
    ).resolves.toBe('')
    expect(createReleaseNameTemplate('Example')).toContain('Example')
  })

  it('verifies the semantic-release version', async () => {
    await expect(
      verifyRelease({}, { nextRelease: { version: '1.2.3-next.4' } }),
    ).resolves.toBeUndefined()
    await expect(verifyRelease({}, { nextRelease: { version: 'next' } })).rejects.toThrow(
      'Invalid semantic version',
    )
  })
})