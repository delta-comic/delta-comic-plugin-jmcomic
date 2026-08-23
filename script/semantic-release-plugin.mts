import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { rootDir } from './paths.mts'
import { prereleaseWarning } from './release-notes.mts'
import { prepareSdkReleaseArtifacts, publishSdkPackages } from './sdk-release.mts'

export const releaseAssetNames = ['manifest.json', 'plugin.zip'] as const

interface PluginManifest {
  version: { plugin: string }
}

interface ReleaseContext {
  nextRelease: { channel?: string | null; version: string }
}

export type BuildRunner = (version: string) => Promise<void>

export interface ReleasePreparationOptions {
  pluginDist?: string
  runBuild?: BuildRunner
}

const semanticVersion =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/

export function assertVersion(version: string) {
  if (!semanticVersion.test(version)) throw new Error(`Invalid semantic version: ${version}`)
}

function parsePluginManifest(value: unknown): PluginManifest {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('version' in value) ||
    typeof value.version !== 'object' ||
    value.version === null ||
    !('plugin' in value.version) ||
    typeof value.version.plugin !== 'string'
  ) {
    throw new Error('Invalid plugin manifest')
  }
  return { version: { plugin: value.version.plugin } }
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
    pluginDist = join(rootDir, 'packages/app/dist'),
    runBuild = buildPlugin,
  }: ReleasePreparationOptions = {},
) {
  assertVersion(version)
  await runBuild(version)

  const parsedManifest: unknown = JSON.parse(
    await readFile(join(pluginDist, 'manifest.json'), 'utf8'),
  )
  const manifest = parsePluginManifest(parsedManifest)
  if (manifest.version.plugin !== version) {
    throw new Error(
      `Built manifest version ${manifest.version.plugin} does not match release ${version}`,
    )
  }

  return { manifest, pluginDist }
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