import { spawn } from 'node:child_process'
import { copyFile, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

import { rootDir, validatePluginArtifacts } from './artifacts.mts'
import { prereleaseWarning } from './release-notes.mts'
import { prepareSdkReleaseArtifacts, publishSdkPackages } from './sdk-release.mts'

export const releaseAssetNames = ['manifest.json', 'plugin.zip'] as const
export const releaseDirectory = join(rootDir, 'dist/release')

interface ReleaseContext {
  nextRelease: { channel?: string | null; version: string }
}

export type BuildRunner = (version: string) => Promise<void>

export interface ReleasePreparationOptions {
  destination?: string
  pluginDist?: string
  runBuild?: BuildRunner
}

const semanticVersion =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/

export function assertVersion(version: string) {
  if (!semanticVersion.test(version)) throw new Error(`Invalid semantic version: ${version}`)
}

/* v8 ignore start -- @preserve: full plugin builds are covered by the integration gate */
async function buildPlugin(version: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn('vp', ['run', 'build'], {
      cwd: rootDir,
      env: { ...process.env, DELTA_PLUGIN_VERSION: version },
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('close', status => {
      if (status === 0) resolve()
      else reject(new Error(`Plugin build failed with status ${String(status ?? 1)}`))
    })
  })
}
/* v8 ignore stop -- @preserve */

export async function prepareReleaseArtifacts(
  version: string,
  {
    destination = releaseDirectory,
    pluginDist = join(rootDir, 'packages/app/dist'),
    runBuild = buildPlugin,
  }: ReleasePreparationOptions = {},
) {
  assertVersion(version)
  await runBuild(version)

  const validated = await validatePluginArtifacts(pluginDist)
  if (validated.manifest.version.plugin !== version) {
    throw new Error(
      `Built manifest version ${validated.manifest.version.plugin} does not match release ${version}`,
    )
  }

  await rm(destination, { force: true, recursive: true })
  await mkdir(destination, { recursive: true })
  await Promise.all(
    releaseAssetNames.map(name => copyFile(join(pluginDist, name), join(destination, name))),
  )
  return validated
}

export async function verifyRelease(_pluginConfig: unknown, { nextRelease }: ReleaseContext) {
  assertVersion(nextRelease.version)
}

/* v8 ignore next -- @preserve: semantic-release delegates to tested prepareReleaseArtifacts */
export async function prepare(_pluginConfig: unknown, { nextRelease }: ReleaseContext) {
  await prepareReleaseArtifacts(nextRelease.version)
  await prepareSdkReleaseArtifacts(nextRelease.version)
}

/* v8 ignore next -- @preserve: semantic-release delegates to tested publishSdkPackages */
export async function publish(_pluginConfig: unknown, { nextRelease }: ReleaseContext) {
  await publishSdkPackages(nextRelease.version, nextRelease.channel)
}

export async function generateNotes(_pluginConfig: unknown, { nextRelease }: ReleaseContext) {
  return nextRelease.channel ? prereleaseWarning : ''
}