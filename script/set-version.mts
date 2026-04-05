import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const packageJsonPaths = ['../package.json', '../packages/sdk/package.json']

export async function setVersion(version: string) {
  for (const p of packageJsonPaths) {
    const path = join(import.meta.dirname, p)
    const pkg: { version: string } = JSON.parse(await readFile(path, { encoding: 'utf-8' }))
    pkg.version = version
    await writeFile(path, JSON.stringify(pkg, null, 2), { encoding: 'utf-8' })
  }
}

const version = process.argv[2]
if (version) await setVersion(version)