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
  })
]

test('Fork decrypted', async () => {
  const sdk = new JMComic()
  const forks = await sdk.fork.getForks()
  expect(forks).toStrictEqual({
    Setting: ['www.cdnhth.club', 'www.cdngwc.cc', 'www.cdngwc.net', 'www.cdngwc.club'],
    Server: [
      'www.cdnhth.club',
      'www.cdngwc.cc',
      'www.cdngwc.net',
      'www.cdngwc.club',
      'www.cdnhjk.cc'
    ],
    jm3_Server: [
      ['www.cdnhth.club', '線路1'],
      ['www.cdngwc.cc', '線路2'],
      ['www.cdngwc.net', '線路3'],
      ['www.cdngwc.club', '線路4'],
      ['www.cdnhjk.cc', '線路5']
    ]
  })
})

test('Fork auto select by array', async () => {
  const sdk = new JMComic()
  const forks = ['https://www.cdnhth.club', 'https://www.cdngwc.cc']
  const autoPicked = await sdk.fork.autoPickFork(forks)
  expect(autoPicked).toBe('https://www.cdnhth.club')
})

test('Fork auto select by pipeline', async () => {
  const sdk = new JMComic()
  const forks = await sdk.fork.getForks()
  const autoPicked = await sdk.fork.autoPickFork(forks)
  expect(autoPicked).toBe('https://www.cdnhth.club')
})

const server = setupServer(...restHandlers)

// 在所有测试开始前启动服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// 在所有测试结束后关闭服务器
afterAll(() => server.close())

// 在每次测试后重置处理器以实现测试隔离
afterEach(() => server.resetHandlers())