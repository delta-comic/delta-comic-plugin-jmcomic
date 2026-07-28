import CryptoES from 'crypto-es'

import type { Numeric } from './model/utils'
import type { ImageDecoder, ImageSegment } from './types'
import { JmApiError } from './types'

import type { JMComic } from '.'

const segmentCountCache = new Map<string, number>()
const { MD5 } = CryptoES

export const getImageSegmentCount = (comicId: Numeric, page: Numeric): number => {
  const id = Number(comicId)
  const pageNumber = Number(page)
  const cacheKey = `${id}:${pageNumber}`
  const cached = segmentCountCache.get(cacheKey)
  if (cached !== undefined) return cached
  const paddedPage = String(pageNumber).padStart(5, '0')
  const hash = MD5(`${id}${paddedPage}`).toString()
  const remainder = hash.charCodeAt(hash.length - 1) % (id >= 268_850 && id <= 421_925 ? 10 : 8)
  const count = remainder <= 9 ? remainder * 2 + 2 : 10
  segmentCountCache.set(cacheKey, count)
  return count
}

export const createImageSegments = (height: number, segmentCount: number): ImageSegment[] => {
  if (!Number.isInteger(height) || height <= 0) throw new RangeError('height must be positive')
  if (!Number.isInteger(segmentCount) || segmentCount <= 0)
    throw new RangeError('segmentCount must be positive')

  const segmentHeight = Math.floor(height / segmentCount)
  const remainder = height % segmentCount
  const segments = new Array<ImageSegment>()
  let sourceY = height - segmentHeight - remainder
  let destinationY = 0
  segments.push({ sourceY, destinationY, height: segmentHeight + remainder })
  destinationY += segmentHeight + remainder
  for (let index = 1; index < segmentCount; index += 1) {
    sourceY -= segmentHeight
    segments.push({ sourceY, destinationY, height: segmentHeight })
    destinationY += segmentHeight
  }
  return segments
}

export const needsImageDecoding = (path: string, comicId: Numeric): boolean =>
  !path.toLowerCase().includes('.gif') && Number(comicId) >= 220_980

export class ImageDecryptor {
  private readonly cache = new Map<string, Promise<string>>()

  public constructor(
    private readonly sdk: JMComic,
    private decoder?: ImageDecoder,
  ) {}

  public setDecoder(decoder: ImageDecoder): void {
    this.decoder = decoder
    this.cache.clear()
  }

  public async decryptImage(
    path: string,
    comicId: Numeric,
    page: Numeric,
    signal?: AbortSignal,
  ): Promise<{ url: string }> {
    if (!needsImageDecoding(path, comicId)) return { url: path }
    if (!this.decoder)
      throw new JmApiError('UNSUPPORTED_OPERATION', '当前环境没有配置图片解码器', path)

    const cacheKey = `${path}:${comicId}:${page}`
    const cached = this.cache.get(cacheKey)
    if (cached) return { url: await cached }

    const decoding = this.sdk.requester
      .create()
      .get(path, { signal })
      .blob()
      .then(blob => this.decoder!.decode(blob, getImageSegmentCount(comicId, page)))
    this.cache.set(cacheKey, decoding)
    try {
      return { url: await decoding }
    } catch (error) {
      this.cache.delete(cacheKey)
      throw error
    }
  }
}