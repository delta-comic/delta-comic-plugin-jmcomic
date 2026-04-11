import { test } from 'vite-plus/test'

import { createListSchema, JMComic, sCommonNovel, sFullNovel } from '../src'

test.concurrent('Novel list get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.novel.getPromoteList({ page: 1 }, signal)
  await createListSchema(sCommonNovel).parseAsync(result)
})

test.concurrent('Novel info get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.novel.getInfo({ id: '4' }, signal)
  // const comment = result.comment_total.find(v => (v.replys?.length ?? 0) > 0)
  // delete result.comment_total
  // const s = result.series[0]
  // delete result.series
  // console.log(result, comment, s)
  await sFullNovel.parseAsync(result)
})