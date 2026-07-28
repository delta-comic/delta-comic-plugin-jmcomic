import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import {
  createImageSegments,
  getImageSegmentCount,
  JMComic,
  needsImageDecoding,
  type ImageDecoder,
} from '../src'
import { BrowserImageDecoder } from '../src/browser'
import { NodeImageDecoder } from '../src/node'

const server = setupServer(
  http.get('https://image.jm.test/page.webp', () =>
    HttpResponse.arrayBuffer(new Uint8Array([1, 2, 3]).buffer, {
      headers: { 'content-type': 'image/webp' },
    }),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

describe('image segmentation', () => {
  test('covers every source and destination pixel once', () => {
    const segments = createImageSegments(101, 8)
    expect(segments.reduce((total, segment) => total + segment.height, 0)).toBe(101)
    expect(segments[0]?.destinationY).toBe(0)
    expect(segments.at(-1)!.destinationY + segments.at(-1)!.height).toBe(101)
    expect(segments.map(segment => segment.sourceY).toSorted((a, b) => a - b)[0]).toBe(0)
  })

  test('validates dimensions and keeps segment count deterministic', () => {
    expect(() => createImageSegments(0, 2)).toThrow(RangeError)
    expect(() => createImageSegments(100, 0)).toThrow(RangeError)
    expect(getImageSegmentCount(350_234, 1)).toBe(getImageSegmentCount(350_234, 1))
    expect(needsImageDecoding('/page.webp', 350_234)).toBe(true)
    expect(needsImageDecoding('/page.gif', 350_234)).toBe(false)
    expect(needsImageDecoding('/page.webp', 1)).toBe(false)
  })

  test('uses the injected decoder and caches the decoded URL', async () => {
    const decode = vi.fn<ImageDecoder['decode']>().mockResolvedValue('data:image/webp;base64,AQID')
    const sdk = new JMComic({ imageDecoder: { decode }, retry: 0 })
    const first = await sdk.image.decryptImage('https://image.jm.test/page.webp', 350_234, 1)
    const second = await sdk.image.decryptImage('https://image.jm.test/page.webp', 350_234, 1)
    expect(first).toEqual(second)
    expect(decode).toHaveBeenCalledOnce()
    expect(decode.mock.calls[0]?.[1]).toBe(getImageSegmentCount(350_234, 1))
  })

  test('returns undecoded images without requiring an adapter', async () => {
    const sdk = new JMComic()
    await expect(sdk.image.decryptImage('/page.gif', 350_234, 1)).resolves.toEqual({
      url: '/page.gif',
    })
  })

  test('runs the browser adapter through an injectable canvas boundary', async () => {
    const drawImage = vi.fn()
    const close = vi.fn()
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 2, height: 4, close }))
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        public getContext() {
          return { drawImage }
        }

        public async convertToBlob() {
          return new Blob(['decoded'], { type: 'image/png' })
        }
      },
    )
    vi.stubGlobal(
      'FileReader',
      class extends EventTarget {
        public error: Error | null = null
        public result: string | null = null

        public readAsDataURL(blob: Blob) {
          void blob.arrayBuffer().then(buffer => {
            this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`
            this.dispatchEvent(new Event('load'))
          })
        }
      },
    )

    await expect(new BrowserImageDecoder().decode(new Blob(['source']), 2)).resolves.toBe(
      'data:image/png;base64,ZGVjb2RlZA==',
    )
    expect(drawImage).toHaveBeenCalledTimes(2)
    expect(close).toHaveBeenCalledOnce()
  })

  test('decodes node images without leaking Sharp into the browser entry', async () => {
    const { default: sharp } = await import('sharp')
    const input = await sharp(Buffer.from([255, 0, 0, 0, 0, 255]), {
      raw: { width: 1, height: 2, channels: 3 },
    })
      .png()
      .toBuffer()
    const url = await new NodeImageDecoder().decode(
      new Blob([Uint8Array.from(input).buffer], { type: 'image/png' }),
      2,
    )
    const decoded = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')
    const raw = await sharp(decoded).raw().toBuffer()
    expect([...raw]).toEqual([0, 0, 255, 255, 0, 0])
  })
})