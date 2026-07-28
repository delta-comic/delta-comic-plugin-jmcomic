import { spawn } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { rootDir } from './artifacts.mts'

export const npmRegistry = 'https://registry.npmjs.org'
export const githubRegistry = 'https://npm.pkg.github.com'
export const npmPackageName = 'jmcomic-sdk'
export const githubPackageName = '@delta-comic/jmcomic-sdk'

export const sdkDirectory = join(rootDir, 'packages/sdk')
export const sdkReleaseDirectory = join(rootDir, 'dist/release/sdk')

interface PackageManifest {
  name: string
  version: string
  publishConfig?: Record<string, unknown>
  scripts?: Record<string, string>
}

export interface SdkReleasePreparationOptions {
  destination?: string
  runBuild?: () => Promise<void>
  runPack?: PackRunner
  source?: string
}

export type PackRunner = (source: string, tarball: string) => Promise<void>

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

async function packSdk(source: string, tarball: string) {
  await runCommand('pnpm', ['pack', '--out', tarball], { cwd: source })
}
/* v8 ignore stop -- @preserve */

async function createPackageDirectory(
  source: string,
  destination: string,
  manifest: PackageManifest,
  name: string,
  registry: string,
) {
  await mkdir(destination, { recursive: true })
  await Promise.all([
    cp(join(source, 'dist'), join(destination, 'dist'), { recursive: true }),
    cp(join(source, 'LICENSE'), join(destination, 'LICENSE')),
    cp(join(source, 'README.md'), join(destination, 'README.md')),
  ])
  await writeFile(
    join(destination, 'package.json'),
    `${JSON.stringify(
      {
        ...manifest,
        name,
        version: manifest.version,
        publishConfig: { ...manifest.publishConfig, access: 'public', registry },
        scripts: undefined,
      },
      null,
      2,
    )}\n`,
  )
}

export async function prepareSdkReleaseArtifacts(
  version: string,
  {
    destination = sdkReleaseDirectory,
    runBuild = buildSdk,
    runPack = packSdk,
    source = sdkDirectory,
  }: SdkReleasePreparationOptions = {},
) {
  await runBuild()
  const manifest = JSON.parse(
    await readFile(join(source, 'package.json'), 'utf8'),
  ) as PackageManifest
  manifest.version = version

  await rm(destination, { force: true, recursive: true })
  const npmDirectory = join(destination, 'npm')
  const githubDirectory = join(destination, 'github')
  await Promise.all([
    createPackageDirectory(source, npmDirectory, manifest, npmPackageName, npmRegistry),
    createPackageDirectory(source, githubDirectory, manifest, githubPackageName, githubRegistry),
  ])

  const npmTarball = join(destination, 'npm.tgz')
  const githubTarball = join(destination, 'github.tgz')
  await runPack(npmDirectory, npmTarball)
  await runPack(githubDirectory, githubTarball)

  return { githubDirectory, githubTarball, npmDirectory, npmTarball }
}

async function publishPackage(
  name: string,
  version: string,
  directory: string,
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

  await runner(['publish', directory, '--access', 'public', '--tag', tag, ...commonArguments], {
    env,
  })
  return true
}

export async function publishSdkPackages(
  version: string,
  channel?: string | null,
  runner: NpmRunner = defaultNpmRunner,
) {
  const tag = channel ?? 'latest'
  const npmPublished = await publishPackage(
    npmPackageName,
    version,
    join(sdkReleaseDirectory, 'npm.tgz'),
    npmRegistry,
    tag,
    runner,
  )
  const githubPublished = await publishPackage(
    githubPackageName,
    version,
    join(sdkReleaseDirectory, 'github.tgz'),
    githubRegistry,
    tag,
    runner,
    { ...process.env, NODE_AUTH_TOKEN: process.env.GITHUB_TOKEN },
  )
  return { githubPublished, npmPublished, tag }
}