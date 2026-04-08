import { test } from 'vite-plus/test'

import { JMComic } from '../src'
import { sBadgeItem } from '../src/model/user'

test.concurrent('Show all badges', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  await sdk.auth.login(undefined, signal)
  const badges = await sdk.user.getAllBadges(signal)

  await sBadgeItem.array().parseAsync(badges)
})