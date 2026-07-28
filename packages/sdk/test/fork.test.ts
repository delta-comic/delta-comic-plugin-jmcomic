import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { delay, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'vite-plus/test'

import { JMComic } from '../src'

const rawForks = (await readFile(join(import.meta.dirname, './mock/api/fork.txt'))).toString()
export const restHandlers = [
  http.get('https://rup4a04-c01.tos-ap-southeast-1.bytepluses.com/newsvr-2025.txt', () => {
    return HttpResponse.text(rawForks)
  }),
  http.get('https://rup4a04-c02.tos-cn-hongkong.bytepluses.com/newsvr-2025.txt', () => {
    return HttpResponse.text(rawForks)
  }),
  http.get('https://www.cdnhth.club/promote_list', () => {
    return HttpResponse.json({ data: [], code: 200, message: 'hello' })
  }),
  http.get('https://*/promote_list', async () => {
    await delay(1000)
    return HttpResponse.json({ data: [], code: 200, message: 'hello' })
  }),
]
const server = setupServer(...restHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

test.concurrent('Fork decrypted', async () => {
  const sdk = new JMComic()
  const forks = await sdk.fork.getForks()
  expect(forks).toMatchObject({
    Setting: expect.any(Array),
    Server: expect.any(Array),
    jm3_Server: expect.any(Array),
  })
})

test.concurrent('Fork auto select by array', async ({ signal }) => {
  const sdk = new JMComic()
  const forks = ['https://www.cdnhth.club', 'https://www.cdngwc.cc']
  const autoPicked = await sdk.fork.autoPickFork(forks, signal)
  expect(autoPicked).toBe('https://www.cdnhth.club')
})

test.concurrent('Fork auto select by pipeline', async ({ signal }) => {
  const sdk = new JMComic()
  const forks = await sdk.fork.getForks()
  const autoPicked = await sdk.fork.autoPickFork(forks, signal)
  expect(autoPicked).toBe('https://www.cdnhth.club')
})

test.concurrent('Fork auto select by once call', async ({ signal }) => {
  const sdk = new JMComic()
  const autoPicked = await sdk.fork.autoPickFork(undefined, signal)
  expect(autoPicked).toBe('https://www.cdnhth.club')
})