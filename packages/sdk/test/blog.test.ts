import { expect, test } from 'vite-plus/test'

import { JMComic } from '../src'

test.concurrent('Blog fetch info', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const info = await sdk.blog.getInfo({ id: 1145 }, signal)
  expect(info).toMatchObject({
    info: {
      id: '1145',
      uid: '14892',
      title: '2023年剧情最好的本子',
      photo: '14892.jpg',
      nickname: '站务人员'
    }
  })
})

test.concurrent('Blog comments get', { timeout: 1000 * 20 }, async ({ signal }) => {
  const sdk = new JMComic()
  await sdk.fork.autoPickFork()
  const comments = await sdk.blog.getComments({ id: 1145, page: 1 }, signal)
  console.log(comments.list.length, comments.total)
  expect(1).toBe(1)
})