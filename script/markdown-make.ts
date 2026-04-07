import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const origin = (await readFile(join(import.meta.dirname, '../README.md'))).toString()

const SDKPart = origin.slice(
  origin.indexOf('<!-- SDK begin -->'),
  origin.indexOf('<!-- SDK end -->')
)
console.log(origin.indexOf('<!-- SDK begin -->'), origin.indexOf('<!-- SDK end -->'))
const SDKFile = (await readFile(join(import.meta.dirname, '../packages/sdk/README.md'))).toString()
const begin = SDKFile.indexOf('<!-- Insert -->') + '<!-- Insert -->'.length
const end = SDKFile.indexOf('<!-- End -->')
const result = SDKFile.slice(0, begin) + '\n' + SDKPart + SDKFile.slice(end)
await writeFile(join(import.meta.dirname, '../packages/sdk/README.md'), result)