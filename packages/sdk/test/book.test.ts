import { test } from 'vite-plus/test'

import {
  createListSchema,
  JMComic,
  // sAuthorDetail,
  sBookDetail,
  sBookPages,
  sLessBook
} from '../src'

test.concurrent('Book search', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.book.search({ page: 1 }, signal)
  await createListSchema(sLessBook).parseAsync(result)
})

test.concurrent('Book getBookDetail', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.book.getBookDetail({ id: 67 }, signal)
  console.log(result)
  await sBookDetail.parseAsync(result)
})

test.concurrent('Book getBookPages', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork(undefined, signal)
  const result = await sdk.book.getBookPages({ id: 67 }, signal)
  console.log(result)
  await sBookPages.parseAsync(result)
})

// test.concurrent('Book getAuthorDetail', { timeout: 1000 * 20 }, async ({ signal }) => {
//   const sdk = new JMComic()
//   await sdk.fork.autoPickFork(undefined, signal)
//   const result = await sdk.book.getAuthorDetail({ id: '67' }, signal)
//   console.log(result)
//   await sAuthorDetail.parseAsync(result)
// })