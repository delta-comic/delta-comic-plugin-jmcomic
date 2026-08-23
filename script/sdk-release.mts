import { spawn } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { rootDir } from './paths.mts'

export const npmRegistry = 'https://registry.npmjs.org'
export const githubRegistry = 'https://npm.pkg.github.com'
export const npmPackageName = 'jmcomic-sdk'
export const githubPackageName = '@delta-comic/jmcomic-sdk'

export const sdkDirectory = join(rootDir, 'packages/sdk')

export interface SdkReleasePreparationOptions {
  runBuild?: () => Promise<void>
  source?: string
}

export interface CommandResult {
  status: number
  stdout: string
}

export type NpmRunner = (
  arguments_: readonly string[],
  options?: { allowFailure?: boolean; env?: NodeJS.ProcessEnv },
) => Promise<CommandResult>

/* v8 ignore start -- @preserve: real package commands are covered by the release integration gate */
async function runCommand(
  command: string,
  arguments_: readonly string[],
  {
    allowFailure = false,
    cwd = rootDir,
    env = process.env,
  }: { allowFailure?: boolean; cwd?: string; env?: NodeJS.ProcessEnv } = {},
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, { cwd, env, stdio: ['inherit', 'pipe', 'inherit'] })
    let stdout = ''
    child.stdout.on('data', chunk => {
      const text = String(chunk)
      stdout += text
      process.stdout.write(text)
    })
    child.on('error', reject)
    child.on('close', status => {
      const exitStatus = status ?? 1
      if (exitStatus === 0 || allowFailure) resolve({ status: exitStatus, stdout })
      else reject(new Error(`${command} ${arguments_.join(' ')} failed with status ${exitStatus}`))
    })
  })
}

const defaultNpmRunner: NpmRunner = (arguments_, options) => runCommand('npm', arguments_, options)

async function buildSdk() {
  await runCommand('vp', ['run', '-t', 'jmcomic-sdk#build'])
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parsePackageManifest(value: unknown) {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.version !== 'string') {
    throw new Error('Invalid SDK package manifest')
  }
  return value
}

async function updatePackageManifest(
  source: string,
  manifest: Record<string, unknown>,
  name: string,
  version: string,
  registry: string,
) {
  await writeFile(
    join(source, 'package.json'),
    `${JSON.stringify(
      {
        ...manifest,
        devDependencies: undefined,
        name,
        publishConfig: {
          ...(isRecord(manifest.publishConfig) ? manifest.publishConfig : {}),
          access: 'public',
          registry,
        },
        scripts: undefined,
        version,
      },
      null,
      2,
    )}\n`,
  )
}

async function publishPackage(
  name: string,
  version: string,
  source: string,
  registry: string,
  tag: string,
  runner: NpmRunner,
  env?: NodeJS.ProcessEnv,
) {
  const commonArguments = ['--registry', registry]
  const existing = await runner(['view', `${name}@${version}`, 'version', ...commonArguments], {
    allowFailure: true,
    env,
  })
  if (existing.status === 0 && existing.stdout.trim() === version) {
    console.log(`${name}@${version} already exists in ${registry}; skipping publish`)
    return false
  }

  const manifestPath = join(source, 'package.json')
  const originalManifest = await readFile(manifestPath, 'utf8')
  const parsedManifest: unknown = JSON.parse(originalManifest)
  const manifest = parsePackageManifest(parsedManifest)
  try {
    await updatePackageManifest(source, manifest, name, version, registry)
    await runner(['publish', source, '--access', 'public', '--tag', tag, ...commonArguments], {
      env,
    })
  } finally {
    await writeFile(manifestPath, originalManifest)
  }
  return true
}

export async function prepareSdkReleaseArtifacts(
  version: string,
  { runBuild = buildSdk, source = sdkDirectory }: SdkReleasePreparationOptions = {},
) {
  await runBuild()
  return { source, version }
}

export async function publishSdkPackages(
  version: string,
  channel?: string | null,
  runner: NpmRunner = defaultNpmRunner,
  source = sdkDirectory,
) {
  const tag = channel ?? 'latest'
  const npmPublished = await publishPackage(
    npmPackageName,
    version,
    source,
    npmRegistry,
    tag,
    runner,
  )
  const githubPublished = await publishPackage(
    githubPackageName,
    version,
    source,
    githubRegistry,
    tag,
    runner,
    { ...process.env, NODE_AUTH_TOKEN: process.env.GITHUB_TOKEN },
  )
  return { githubPublished, npmPublished, tag }
}