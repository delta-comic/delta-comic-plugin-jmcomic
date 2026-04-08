import { assert, test } from 'vite-plus/test'

import { JMComic, sUserMe } from '../src'

test.concurrent('Auth login', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(await sdk.fork.getForks(), signal)
  const result = await sdk.auth.login(undefined, signal)
  await sUserMe.parseAsync(result.user)
  assert(result.user.jwttoken, 'Not found jwttoken')
})

test.concurrent('Forget password', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(await sdk.fork.getForks(), signal)
  // const result = await sdk.auth.forgetPassword({ email: 'wenxinguo12@gmail.com' }, signal)
  // console.log(result)
})