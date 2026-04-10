import { test } from 'vite-plus/test'

import { createListSchema, JMComic, sCommonComic, sWeekBest } from '../src'

test.concurrent('Week best total', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.promote.getWeekBestCate(signal)
  await sWeekBest.parseAsync(result)
})

test.concurrent('Week best content', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.promote.getWeekBestList({ id: 235, type: 'manga' }, signal)
  await createListSchema(sCommonComic).parseAsync(result)
})