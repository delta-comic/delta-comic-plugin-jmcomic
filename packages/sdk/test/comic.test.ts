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
  console.log(result.list.filter(v => v.expinfo.badges.length > 0).map(v => v.expinfo.badges))
  expect(result.list).toBeInstanceOf(Array)
  expect(result.list[0].AID).toMatch(/\d+/)
})