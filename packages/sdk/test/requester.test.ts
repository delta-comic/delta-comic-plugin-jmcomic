import CryptoES from 'crypto-es'
import { delay, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

import { JmApiError, JMComic } from '../src'

const baseUrl = 'https://contract.jm.test'
const now = 1_700_000_000_000
let headers = new Headers()

const server = setupServer(
  http.get(`${baseUrl}/hot_tags`, ({ request }) => {
    headers = request.headers
    return HttpResponse.json({ data: ['tag'] })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('request protocol contract', () => {
  test('keeps the production validation headers byte-for-byte compatible', async () => {
    const sdk = new JMComic({ baseUrl, now: () => now, retry: 0 })
    await expect(sdk.promote.getHotTags()).resolves.toEqual(['tag'])
    expect(headers.get('Jm-Key')).toBe(String(now))
    expect(headers.get('Token')).toBe(CryptoES.MD5(`${now}185Hcomic3PAPP7R`).toString())
    expect(headers.get('Tokenparam')).toBe(`${now},1.7.9`)
    expect(headers.get('Version')).toBe('v1.2.9')
    expect(headers.has('Authorization')).toBe(false)
  })

  test('adds only the bearer session header after session restoration', async () => {
    const sdk = new JMComic({ baseUrl, now: () => now, retry: 0 })
    sdk.auth.restoreSession({ username: 'tester', token: 'session-token' })
    await sdk.promote.getHotTags()
    expect(headers.get('Authorization')).toBe('Bearer session-token')
    expect(headers.get('Tokenparam')).toBe(`${now},1.7.9`)
  })

  test('decrypts the encrypted production response envelope', async () => {
    const dynamicKey = CryptoES.MD5(`${now}18comicAPPContent`).toString()
    const encrypted = CryptoES.AES.encrypt(
      JSON.stringify(['encrypted-tag']),
      CryptoES.enc.Utf8.parse(dynamicKey),
      { mode: CryptoES.mode.ECB },
    ).toString()
    server.use(http.get(`${baseUrl}/hot_tags`, () => HttpResponse.json({ data: encrypted })))
    const sdk = new JMComic({ baseUrl, now: () => now, retry: 0 })
    await expect(sdk.promote.getHotTags()).resolves.toEqual(['encrypted-tag'])
  })

  test('surfaces malformed public responses through JmApiError', async () => {
    server.use(http.get(`${baseUrl}/hot_tags`, () => HttpResponse.json({ data: { tag: 1 } })))
    const sdk = new JMComic({ baseUrl, retry: 0 })
    await expect(sdk.promote.getHotTags()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      endpoint: '/hot_tags',
    })
  })

  test('preserves caller aborts instead of wrapping them as network errors', async () => {
    server.use(
      http.get(`${baseUrl}/hot_tags`, async () => {
        await delay(1_000)
        return HttpResponse.json({ data: [] })
      }),
    )
    const sdk = new JMComic({ baseUrl, retry: 0 })
    const controller = new AbortController()
    const request = sdk.promote.getHotTags(controller.signal)
    controller.abort()
    await expect(request).rejects.not.toBeInstanceOf(JmApiError)
  })
})