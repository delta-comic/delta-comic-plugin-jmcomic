import { assert, test } from 'vite-plus/test'

import { JMComic } from '../src'

test.concurrent('Auth login', async () => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(await sdk.fork.getForks())
  const result = await sdk.auth.login()
  assert(result.user.jwttoken, 'Not found jwttoken')
})