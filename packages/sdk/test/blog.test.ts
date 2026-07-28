import { test } from 'vite-plus/test'

import { createListSchema, JMComic, sComment } from '../src'
import { sCommonBlog, sFullBlog } from '../src/model/blog'
import { sRecommendComic } from '../src/model/comic'

test.concurrent('Blog fetch info', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const info = await sdk.blog.getInfo({ id: 1145 }, signal)
  await Promise.all([
    sFullBlog.parseAsync(info.info),
    sRecommendComic.array().nullable().parseAsync(info.related_comics),
    sCommonBlog.array().nullable().parseAsync(info.related_blogs),
  ])
})

test.concurrent('Blog comments get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const comments = await sdk.blog.getComments({ id: 1145, page: 1 }, signal)
  await createListSchema(sComment).parseAsync(comments)
})