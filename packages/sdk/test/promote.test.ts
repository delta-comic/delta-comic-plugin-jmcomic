import { test } from 'vite-plus/test'
import z from 'zod'

import { createListSchema, JMComic, sCommonComic, sPromoteItem, sWeekBest } from '../src'

test.concurrent('Promote cates', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.promote.getPromotes(signal)

  await sPromoteItem.array().parseAsync(result)
})

test.concurrent('Promote list', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)

  const result = await sdk.promote.getWeekBestList({ id: 999, type: 'category_id' }, signal)
  await createListSchema(sCommonComic).parseAsync(result)
})

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

test.concurrent('Promote get hot tags', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.promote.getHotTags(signal)
  await z.string().array().parseAsync(result)
})

test.concurrent('Promote get random', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.promote.getRandomProvide(signal)
  await sCommonComic.array().parseAsync(result)
})

test.concurrent('Promote get latest', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.promote.getLatest({ page: 1 }, signal)
  await sCommonComic.array().parseAsync(result)
})