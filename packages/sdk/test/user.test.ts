import { test } from 'vite-plus/test'

import { createListSchema, JMComic, sCommonComic } from '../src'
import { sBadgeItem, sUserEdit } from '../src/model/user'

test.concurrent('Show all badges', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  await sdk.auth.login(undefined, signal)
  const badges = await sdk.user.getAllBadges(signal)

  await sBadgeItem.array().parseAsync(badges)
})

test.concurrent('Get my user edit', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const user = await sdk.auth.login(undefined, signal)
  const useredit = await sdk.user.getUser({ uid: user.user.uid }, signal)

  await sUserEdit.parseAsync(useredit)
})

test.concurrent('Get history', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  await sdk.auth.login(undefined, signal)

  const history = await sdk.user.getHistory({ page: 1 }, signal)

  await createListSchema(sCommonComic).parseAsync(history)
})