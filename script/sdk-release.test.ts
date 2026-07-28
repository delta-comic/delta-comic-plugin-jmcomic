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
        scripts: { build: 'vp pack' },
        publishConfig: { access: 'public' },
      }),
    ),
  ])
  return directory
}

describe('SDK release', () => {
  it('stages versioned packages for npm and GitHub Packages', async () => {
    const source = await createSdkPackage()
    const destination = await mkdtemp(join(tmpdir(), 'sdk-release-destination-'))
    const runBuild = vi.fn()
    const runPack = vi.fn()

    const directories = await prepareSdkReleaseArtifacts('1.2.3-next.4', {
      destination,
      runBuild,
      runPack,
      source,
    })

    expect(runBuild).toHaveBeenCalledOnce()
    expect(runPack).toHaveBeenCalledTimes(2)
    expect(runPack).toHaveBeenNthCalledWith(1, directories.npmDirectory, directories.npmTarball)
    expect(runPack).toHaveBeenNthCalledWith(
      2,
      directories.githubDirectory,
      directories.githubTarball,
    )
    const npmManifest = JSON.parse(
      await readFile(join(directories.npmDirectory, 'package.json'), 'utf8'),
    )
    const githubManifest = JSON.parse(
      await readFile(join(directories.githubDirectory, 'package.json'), 'utf8'),
    )
    expect(npmManifest).toMatchObject({
      name: npmPackageName,
      version: '1.2.3-next.4',
      publishConfig: { access: 'public', registry: npmRegistry },
    })
    expect(githubManifest).toMatchObject({
      name: githubPackageName,
      version: '1.2.3-next.4',
      publishConfig: { access: 'public', registry: githubRegistry },
    })
    expect(npmManifest).not.toHaveProperty('scripts')
    await expect(
      readFile(join(directories.githubDirectory, 'dist/index.js'), 'utf8'),
    ).resolves.toBe('export const value = 1\n')
  })

  it('publishes both registries with the semantic-release channel', async () => {
    const runner = vi
      .fn<NpmRunner>()
      .mockImplementation(async arguments_ => ({
        status: arguments_[0] === 'view' ? 1 : 0,
        stdout: '',
      }))

    await expect(publishSdkPackages('1.2.3-next.4', 'next', runner)).resolves.toEqual({
      githubPublished: true,
      npmPublished: true,
      tag: 'next',
    })
    expect(runner.mock.calls.map(([arguments_]) => arguments_)).toEqual([
      ['view', `${npmPackageName}@1.2.3-next.4`, 'version', '--registry', npmRegistry],
      [
        'publish',
        expect.stringContaining('/dist/release/sdk/npm.tgz'),
        '--access',
        'public',
        '--tag',
        'next',
        '--registry',
        npmRegistry,
      ],
      ['view', `${githubPackageName}@1.2.3-next.4`, 'version', '--registry', githubRegistry],
      [
        'publish',
        expect.stringContaining('/dist/release/sdk/github.tgz'),
        '--access',
        'public',
        '--tag',
        'next',
        '--registry',
        githubRegistry,
      ],
    ])
    expect(runner.mock.calls[3]?.[1]?.env?.NODE_AUTH_TOKEN).toBe(process.env.GITHUB_TOKEN)
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
})