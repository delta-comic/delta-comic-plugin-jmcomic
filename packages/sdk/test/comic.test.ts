import { expect, test } from 'vite-plus/test'
import z from 'zod'

import { JMComic } from '../src'
import { sFullComic } from '../src/model/comic'

test.concurrent('Comic info get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.comic.getComicInfo({ id: 350234 }, signal)
  await sFullComic.parseAsync(result)
})

test.concurrent('Comic images get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.comic.getComicPages({ id: 350234 }, signal)
  await z.string().array().parseAsync(result)
})

test.concurrent('Comic comments get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.comic.getComments({ id: 350234, page: 1 }, signal)

  expect(result.list).toBeInstanceOf(Array)
  expect(result.list[0].AID).toMatch(/\d+/)
})

test.concurrent('Like comic', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.comic.likeComic({ id: 350234 }, signal)
  expect(result).toMatchObject({ msg: '评价成功!', status: 'success', code: 200 })
})

test.concurrent('Favorite comic', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  await sdk.auth.login(undefined, signal)
  const result = await sdk.comic.favoriteComic({ id: 350234 }, signal)
  expect(result).toMatchObject({
    status: 'ok',
    msg: expect.any(String),
    type: expect.toBeOneOf(['add', 'remove'])
  })
})