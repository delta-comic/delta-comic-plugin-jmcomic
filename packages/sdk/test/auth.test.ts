import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { expect, test } from 'vite-plus/test'

import { JMComic } from '../src'

const password = (await readFile(join(import.meta.dirname, './mock/.local/pwd.txt'))).toString()

test('Auth login', async () => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(await sdk.fork.getForks())
  console.log(await sdk.auth.login({ password, username: 'wenxig' }))

  expect(1).toBe(1)
})