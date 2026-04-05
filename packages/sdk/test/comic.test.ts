import { expect, test } from 'vite-plus/test'

import { JMComic } from '../src'

test.concurrent('Comic info get', { timeout: 1000 * 20 }, async () => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const result = await sdk.comic.getComicInfo({ id: '350234' })
  expect(result).toMatchObject({ id: 350234, name: '董卓 上+下', images: [], series_id: '350234' })
})