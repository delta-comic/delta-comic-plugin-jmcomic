import { expect, test } from 'vite-plus/test'

import { JMComic } from '../src'

test.concurrent('Comic info get', { timeout: 1000 * 20 }, async () => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const result = await sdk.comic.getComicInfo({ id: 350234 })
  expect(result).toMatchObject({ id: 350234, name: '董卓 上+下', images: [], series_id: '350234' })
})

test.concurrent('Comic images get', { timeout: 1000 * 20 }, async () => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const result = await sdk.comic.getComicPages({ id: 350234 })
  expect(result).toBeInstanceOf(Array)
  expect(result[0]).toMatch(/\/media\/photos\/\d+\/\d+.[a-z]+/)
})

test.concurrent('Comic comments get', { timeout: 1000 * 20 }, async () => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const result = await sdk.comic.getComments({ id: 350234, page: 1 })
  expect(result.list).toBeInstanceOf(Array)
  expect(result.list[0].AID).toMatch(/\d+/)
})

test.concurrent('Like comic', { timeout: 1000 * 20 }, async () => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const result = await sdk.comic.likeComic({ id: 350234 })
  expect(result).toMatchObject({ msg: '评价成功!', status: 'success', code: 200 })
})

test.concurrent('Favorite comic', { timeout: 1000 * 20 }, async () => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  await sdk.auth.login()
  const result = await sdk.comic.favoriteComic({ id: 350234 })
  console.log(result)
  expect(result).toMatchObject({
    status: 'ok',
    msg: expect.toBeOneOf(['漫画添加到您最喜爱的清单!', '已移除收藏']),
    type: expect.toBeOneOf(['add', 'remove'])
  })
})