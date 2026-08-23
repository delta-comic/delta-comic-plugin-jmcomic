import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import {
  githubPackageName,
  githubRegistry,
  npmPackageName,
  npmRegistry,
  prepareSdkReleaseArtifacts,
  publishSdkPackages,
  type NpmRunner,
} from './sdk-release.mts'

async function createSdkPackage() {
  const directory = await mkdtemp(join(tmpdir(), 'sdk-release-source-'))
  await mkdir(join(directory, 'dist'))
  await Promise.all([
    writeFile(join(directory, 'dist/index.js'), 'export const value = 1\n'),
    writeFile(join(directory, 'LICENSE'), 'MIT\n'),
    writeFile(join(directory, 'README.md'), '# SDK\n'),
    writeFile(
      join(directory, 'package.json'),
      JSON.stringify({
        name: npmPackageName,
        version: '1.0.2',
        files: ['dist'],
        devDependencies: { typescript: 'catalog:' },
        scripts: { build: 'vp pack' },
        publishConfig: { access: 'public' },
      }),
    ),
  ])
  return directory
}

describe('SDK release', () => {
  it('builds the workspace package without staging a second dist', async () => {
    const source = await createSdkPackage()
    const runBuild = vi.fn()

    const result = await prepareSdkReleaseArtifacts('1.2.3-next.4', { runBuild, source })

    expect(runBuild).toHaveBeenCalledOnce()
    expect(result).toEqual({ source, version: '1.2.3-next.4' })
    await expect(readFile(join(source, 'dist/index.js'), 'utf8')).resolves.toBe(
      'export const value = 1\n',
    )
  })

  it('publishes both registries from the workspace package', async () => {
    const source = await createSdkPackage()
    const publishedManifests: unknown[] = []
    const runner = vi.fn<NpmRunner>().mockImplementation(async arguments_ => {
      if (arguments_[0] === 'publish') {
        publishedManifests.push(JSON.parse(await readFile(join(source, 'package.json'), 'utf8')))
      }
      return { status: arguments_[0] === 'view' ? 1 : 0, stdout: '' }
    })

    await expect(publishSdkPackages('1.2.3-next.4', 'next', runner, source)).resolves.toEqual({
      githubPublished: true,
      npmPublished: true,
      tag: 'next',
    })
    expect(runner.mock.calls.map(([arguments_]) => arguments_)).toEqual([
      ['view', `${npmPackageName}@1.2.3-next.4`, 'version', '--registry', npmRegistry],
      ['publish', source, '--access', 'public', '--tag', 'next', '--registry', npmRegistry],
      ['view', `${githubPackageName}@1.2.3-next.4`, 'version', '--registry', githubRegistry],
      ['publish', source, '--access', 'public', '--tag', 'next', '--registry', githubRegistry],
    ])
    expect(runner.mock.calls[3]?.[1]?.env?.NODE_AUTH_TOKEN).toBe(process.env.GITHUB_TOKEN)
    expect(publishedManifests).toEqual([
      expect.objectContaining({
        name: npmPackageName,
        version: '1.2.3-next.4',
        publishConfig: { access: 'public', registry: npmRegistry },
      }),
      expect.objectContaining({
        name: githubPackageName,
        version: '1.2.3-next.4',
        publishConfig: { access: 'public', registry: githubRegistry },
      }),
    ])
    await expect(readFile(join(source, 'package.json'), 'utf8')).resolves.toContain(
      '"version":"1.0.2"',
    )
  })

  it('skips package versions that already exist', async () => {
    const runner = vi.fn<NpmRunner>().mockResolvedValue({ status: 0, stdout: '1.2.3\n' })

    await expect(publishSdkPackages('1.2.3', null, runner)).resolves.toEqual({
      githubPublished: false,
      npmPublished: false,
      tag: 'latest',
    })
    expect(runner).toHaveBeenCalledTimes(2)
  })

  it('restores the package manifest when publishing fails', async () => {
    const source = await createSdkPackage()
    const originalManifest = await readFile(join(source, 'package.json'), 'utf8')
    const runner = vi.fn<NpmRunner>().mockImplementation(async arguments_ => {
      if (arguments_[0] === 'publish') throw new Error('publish failed')
      return { status: 1, stdout: '' }
    })

    await expect(publishSdkPackages('1.2.3', null, runner, source)).rejects.toThrow(
      'publish failed',
    )
    await expect(readFile(join(source, 'package.json'), 'utf8')).resolves.toBe(originalManifest)
  })
})