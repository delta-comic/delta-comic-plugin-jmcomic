import { test } from 'vite-plus/test'

import { createListSchema, JMComic, sCommonNovel } from '../src'

test.concurrent('Novel list get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.novel.getNovelList({ page: 1 }, signal)
  await createListSchema(sCommonNovel).parseAsync(result)
})