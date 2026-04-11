import { test } from 'vite-plus/test'

import { createListSchema, JMComic, sCommonNovel, sFullNovel, sNovelContent } from '../src'

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
  await sFullNovel.parseAsync(result)
})

test.concurrent('Novel content get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.novel.getContent({ chapterId: 114, lang: 'cn' }, signal)
  await sNovelContent.parseAsync(result)
})

test.concurrent('Novel search', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.novel.search({ keyword: '女', page: 1 }, signal)

  await createListSchema(sCommonNovel).parseAsync(result)
})